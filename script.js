// Discord API endpoint
const DISCORD_API_URL = 'https://discord.com/api/guilds/1463579200630820886/widget.json';

// Particle system for interactive background
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        // Create initial particles
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
        
        // Mouse movement effect
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 100;
            this.mouseY = (e.clientY / window.innerHeight) * 100;
            document.body.style.setProperty('--mouse-x', `${this.mouseX}%`);
            document.body.style.setProperty('--mouse-y', `${this.mouseY}%`);
        });

        // Create new particles periodically
        setInterval(() => {
            if (this.particles.length < 100) {
                this.createParticle();
            }
        }, 500);
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        // Random animation duration and delay
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        
        // Random size
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random color variation
        const colors = ['#00ffff', '#00ccff', '#0099ff', '#00ffcc'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                this.particles = this.particles.filter(p => p !== particle);
            }
        }, (duration + delay) * 1000);
    }
}

// Discord member count functionality
class DiscordMemberCounter {
    constructor() {
        this.memberCountElement = document.getElementById('memberCount');
        this.updateInterval = 10000; // Update every 10 seconds
        this.init();
    }

    async init() {
        await this.updateMemberCount();
        
        // Update member count periodically
        setInterval(() => {
            this.updateMemberCount();
        }, this.updateInterval);
    }

    async updateMemberCount() {
        try {
            const response = await fetch('https://discord.com/api/guilds/1463579200630820886/widget.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.presence_count) {
                this.animateNumberUpdate(data.presence_count);
                this.memberCountElement.textContent = data.presence_count.toLocaleString();
            } else {
                this.memberCountElement.textContent = 'N/A';
            }
        } catch (error) {
            this.memberCountElement.textContent = 'Error';
        }
    }

    animateNumberUpdate(newCount) {
        const currentText = this.memberCountElement.textContent;
        const currentCount = parseInt(currentText.replace(/[^0-9]/g, '')) || 0;
        
        if (currentCount === newCount) return;
        
        // Animate the number change
        const duration = 1000;
        const steps = 20;
        const increment = (newCount - currentCount) / steps;
        let step = 0;
        
        const animation = setInterval(() => {
            step++;
            const displayCount = Math.round(currentCount + (increment * step));
            this.memberCountElement.textContent = displayCount.toLocaleString();
            
            if (step >= steps) {
                clearInterval(animation);
                this.memberCountElement.textContent = newCount.toLocaleString();
                
                // Add pulse effect on update
                this.memberCountElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.memberCountElement.style.transform = 'scale(1)';
                }, 200);
            }
        }, duration / steps);
    }
}

// Interactive background effects
class InteractiveBackground {
    constructor() {
        this.init();
    }

    init() {
        // Add parallax effect on mouse move
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
            }
        });

        // Add click effect
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });
    }

    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.position = 'fixed';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.width = '10px';
        effect.style.height = '10px';
        effect.style.background = '#00ffff';
        effect.style.borderRadius = '50%';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        effect.style.animation = 'clickRipple 1s ease-out forwards';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }
}

// Add click ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes clickRipple {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    new DiscordMemberCounter();
    new InteractiveBackground();
    
    // Add loading animation removal
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add page visibility API to pause updates when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden, we could pause updates here
        console.log('Tab hidden - pausing updates');
    } else {
        // Tab is visible again, resume updates
        console.log('Tab visible - resuming updates');
        // Force an immediate update when tab becomes visible
        const counter = new DiscordMemberCounter();
        counter.updateMemberCount();
    }
});
