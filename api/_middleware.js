import { NextResponse } from 'next/server';

const rateLimit = new Map();
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 100; // per minute

export function middleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Clean old entries
  for (const [key, data] of rateLimit.entries()) {
    if (now - data.lastReset > 60000) {
      rateLimit.delete(key);
    }
  }
  
  const ipData = rateLimit.get(ip) || { count: 0, lastReset: now, blocked: false };
  
  // Check if IP is blocked
  if (ipData.blocked && now - ipData.blockedAt < BLOCK_DURATION) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '300',
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(now + BLOCK_DURATION).toISOString()
      }
    });
  }
  
  // Reset counter if minute passed
  if (now - ipData.lastReset > 60000) {
    ipData.count = 0;
    ipData.lastReset = now;
  }
  
  // Increment counter
  ipData.count++;
  
  // Block if exceeded
  if (ipData.count > MAX_REQUESTS) {
    ipData.blocked = true;
    ipData.blockedAt = now;
    rateLimit.set(ip, ipData);
    
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '300',
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(now + BLOCK_DURATION).toISOString()
      }
    });
  }
  
  rateLimit.set(ip, ipData);
  
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - ipData.count).toString());
  response.headers.set('X-RateLimit-Reset', new Date(ipData.lastReset + 60000).toISOString());
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
