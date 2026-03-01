// Security and DDOS Protection
class SecurityProtection {
    constructor() {
        this.rateLimit = new Map();
        this.blockedIPs = new Set();
        this.requestCounts = new Map();
        this.init();
    }

    init() {
        // Rate limiting
        this.setupRateLimiting();
        
        // DDOS protection
        this.setupDDOSProtection();
        
        // Hide sensitive information
        this.hideSensitiveData();
        
        // Prevent common attacks
        this.preventAttacks();
    }

    setupRateLimiting() {
        const maxRequests = 10; // Max requests per minute
        const windowMs = 60000; // 1 minute window

        setInterval(() => {
            this.rateLimit.clear();
        }, windowMs);
    }

    checkRateLimit(ip) {
        const now = Date.now();
        const requests = this.rateLimit.get(ip) || [];
        
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < 60000);
        
        if (validRequests.length >= 10) {
            this.blockIP(ip);
            return false;
        }
        
        validRequests.push(now);
        this.rateLimit.set(ip, validRequests);
        return true;
    }

    blockIP(ip) {
        this.blockedIPs.add(ip);
        setTimeout(() => {
            this.blockedIPs.delete(ip);
        }, 300000); // Unblock after 5 minutes
    }

    setupDDOSProtection() {
        // Monitor for suspicious activity
        let requestCount = 0;
        setInterval(() => {
            if (requestCount > 100) { // More than 100 requests per second
                this.activateEmergencyMode();
            }
            requestCount = 0;
        }, 1000);

        // Intercept requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            requestCount++;
            return originalFetch(...args);
        };
    }

    activateEmergencyMode() {
        // Slow down all requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(originalFetch(...args));
                }, 2000); // 2 second delay
            });
        };
    }

    hideSensitiveData() {
        // Remove console logs in production
        if (window.location.hostname !== 'localhost') {
            console.log = () => {};
            console.error = () => {};
            console.warn = () => {};
            console.info = () => {};
        }

        // Remove any sensitive data from DOM
        const sensitiveElements = document.querySelectorAll('[data-sensitive]');
        sensitiveElements.forEach(el => el.remove());
    }

    preventAttacks() {
        // Prevent XSS
        const sanitizeHTML = (str) => {
            return str.replace(/[&<>"']/g, (match) => {
                const escape = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                };
                return escape[match];
            });
        };

        // Monitor for suspicious patterns
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\(/i,
            /document\./i,
            /window\./i
        ];

        // Validate all inputs
        document.addEventListener('input', (e) => {
            const value = e.target.value;
            if (suspiciousPatterns.some(pattern => pattern.test(value))) {
                e.preventDefault();
                e.target.value = '';
            }
        });
    }

    // CORS protection
    setupCORSProtection() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://discord.com;";
        document.head.appendChild(meta);
    }
}

// Initialize security
const security = new SecurityProtection();

// Additional DDOS protection for API calls
const originalXMLHttpRequest = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXMLHttpRequest();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
        // Add rate limiting to API calls
        if (url.includes('discord.com')) {
            const now = Date.now();
            const lastCall = window.lastDiscordAPICall || 0;
            
            if (now - lastCall < 1000) { // Max 1 call per second
                throw new Error('Rate limit exceeded');
            }
            
            window.lastDiscordAPICall = now;
        }
        
        return originalOpen.call(this, method, url, ...args);
    };
    
    return xhr;
};

// Prevent right-click and developer tools (optional)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});
