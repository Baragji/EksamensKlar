/**
 * Advanced UI/UX Interactions Manager
 * Handles modern interactive components and animations
 */

class UIInteractionsManager {
    constructor() {
        this.observers = new Map();
        this.activeModals = new Set();
        this.activeDropdowns = new Set();
        this.rippleElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupRippleEffects();
        this.setupModals();
        this.setupDropdowns();
        this.setupTabs();
        this.setupAccordions();
        this.setupTooltips();
        this.setupToggleSwitches();
        this.setupProgressBars();
        this.setupFormInteractions();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupLazyLoading();
        this.setupSmoothScrolling();
        this.setupThemeToggle();
        this.setupNotifications();
        this.setupChips();
        this.setupSkeletonLoading();
        
        console.log('UI Interactions Manager initialized');
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observers.set('animation', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.classList.remove('animate-out');
                } else {
                    entry.target.classList.remove('animate-in');
                    entry.target.classList.add('animate-out');
                }
            });
        }, options));

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in, .zoom-in, .bounce-in').forEach(el => {
            this.observers.get('animation').observe(el);
        });
    }

    // Ripple effect for buttons and interactive elements
    setupRippleEffects() {
        document.addEventListener('click', (e) => {
            const rippleElement = e.target.closest('.ripple, .btn-interactive, .card-interactive');
            if (!rippleElement) return;

            this.createRipple(e, rippleElement);
        });
    }

    createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Modal management
    setupModals() {
        document.addEventListener('click', (e) => {
            // Open modal
            if (e.target.matches('[data-modal-target]')) {
                const modalId = e.target.getAttribute('data-modal-target');
                this.openModal(modalId);
            }

            // Close modal
            if (e.target.matches('.modal-close, .modal-overlay')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.closeModal(modal);
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const lastModal = Array.from(this.activeModals).pop();
                this.closeModal(lastModal);
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');
        this.activeModals.add(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();

        // Trap focus within modal
        this.trapFocus(modal);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        this.activeModals.delete(modal);
        
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Dropdown management
    setupDropdowns() {
        document.addEventListener('click', (e) => {
            // Toggle dropdown
            if (e.target.closest('.dropdown-toggle')) {
                const dropdown = e.target.closest('.dropdown');
                this.toggleDropdown(dropdown);
                e.stopPropagation();
            }
            // Close dropdowns when clicking outside
            else {
                this.closeAllDropdowns();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        this.closeAllDropdowns();
        
        if (!isActive) {
            dropdown.classList.add('active');
            this.activeDropdowns.add(dropdown);
        }
    }

    closeAllDropdowns() {
        this.activeDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        this.activeDropdowns.clear();
    }

    // Tab management
    setupTabs() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab')) {
                const tabContainer = e.target.closest('.tabs').parentElement;
                const tabId = e.target.getAttribute('data-tab');
                
                // Remove active class from all tabs and content
                tabContainer.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                tabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                e.target.classList.add('active');
                const content = tabContainer.querySelector(`[data-tab-content="${tabId}"]`);
                if (content) content.classList.add('active');
            }
        });
    }

    // Accordion management
    setupAccordions() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.accordion-header')) {
                const item = e.target.closest('.accordion-item');
                const accordion = item.closest('.accordion');
                const isMultiple = accordion.hasAttribute('data-multiple');
                
                if (!isMultiple) {
                    // Close other items
                    accordion.querySelectorAll('.accordion-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                }
                
                item.classList.toggle('active');
            }
        });
    }

    // Tooltip management
    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-content';
            tooltip.textContent = tooltipText;
            
            element.classList.add('tooltip');
            element.appendChild(tooltip);
        });
    }

    // Toggle switch management
    setupToggleSwitches() {
        document.addEventListener('change', (e) => {
            if (e.target.matches('.toggle-switch input')) {
                const callback = e.target.getAttribute('data-callback');
                if (callback && window[callback]) {
                    window[callback](e.target.checked);
                }
            }
        });
    }

    // Progress bar animations
    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressFill = entry.target.querySelector('.progress-fill');
                    const targetWidth = progressFill.getAttribute('data-progress') || '0';
                    
                    setTimeout(() => {
                        progressFill.style.width = targetWidth + '%';
                    }, 100);
                }
            });
        });

        progressBars.forEach(bar => progressObserver.observe(bar));
    }

    // Enhanced form interactions
    setupFormInteractions() {
        // Floating labels
        document.querySelectorAll('.input-interactive input, .input-interactive textarea').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });

        // Form validation
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.hasAttribute('data-validate')) {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            }
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Dette felt er påkrævet');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });
        
        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('error');
        let errorElement = input.parentElement.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            input.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = input.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Arrow key navigation for tabs
            if (e.target.matches('.tab')) {
                const tabs = Array.from(e.target.parentElement.querySelectorAll('.tab'));
                const currentIndex = tabs.indexOf(e.target);
                
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    const nextIndex = (currentIndex + 1) % tabs.length;
                    tabs[nextIndex].focus();
                    tabs[nextIndex].click();
                    e.preventDefault();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    tabs[prevIndex].focus();
                    tabs[prevIndex].click();
                    e.preventDefault();
                }
            }
        });
    }

    // Touch gestures
    setupTouchGestures() {
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Swipe detection
            if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.handleSwipe(e.target, direction);
            }
        });
    }

    handleSwipe(element, direction) {
        // Handle swipe for modals (close on swipe down)
        const modal = element.closest('.modal');
        if (modal && direction === 'down') {
            this.closeModal(modal.closest('.modal-overlay'));
        }
        
        // Handle swipe for tabs
        const tabContainer = element.closest('.tabs');
        if (tabContainer) {
            const tabs = Array.from(tabContainer.querySelectorAll('.tab'));
            const activeTab = tabContainer.querySelector('.tab.active');
            const currentIndex = tabs.indexOf(activeTab);
            
            if (direction === 'left' && currentIndex < tabs.length - 1) {
                tabs[currentIndex + 1].click();
            } else if (direction === 'right' && currentIndex > 0) {
                tabs[currentIndex - 1].click();
            }
        }
    }

    // Scroll animations
    setupScrollAnimations() {
        let ticking = false;
        
        const updateScrollAnimations = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax elements
            document.querySelectorAll('.parallax').forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        });
    }

    // Parallax effects
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;
        
        const parallaxObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', this.updateParallax);
                } else {
                    window.removeEventListener('scroll', this.updateParallax);
                }
            });
        });
        
        parallaxElements.forEach(el => parallaxObserver.observe(el));
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        document.querySelectorAll('.parallax').forEach(element => {
            const rate = scrolled * -0.3;
            element.style.transform = `translateY(${rate}px)`;
        });
    }

    // Lazy loading
    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Smooth scrolling
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // Theme toggle
    setupThemeToggle() {
        const themeToggle = document.querySelector('[data-theme-toggle]');
        if (!themeToggle) return;
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Notification system
    setupNotifications() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: var(--spacing-lg);
            right: var(--spacing-lg);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        `;
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            padding: var(--spacing-md);
            background: var(--background-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            max-width: 300px;
            transform: translateX(100%);
            transition: transform var(--transition-normal);
        `;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Chip management
    setupChips() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.chip-remove')) {
                const chip = e.target.closest('.chip');
                chip.style.transform = 'scale(0)';
                chip.style.opacity = '0';
                
                setTimeout(() => {
                    chip.remove();
                }, 200);
            }
        });
    }

    // Skeleton loading
    setupSkeletonLoading() {
        // Replace skeleton elements with actual content when loaded
        document.addEventListener('contentLoaded', (e) => {
            const skeletons = document.querySelectorAll('.skeleton');
            skeletons.forEach(skeleton => {
                skeleton.classList.add('loaded');
                setTimeout(() => {
                    skeleton.classList.remove('skeleton');
                }, 300);
            });
        });
    }

    // Public methods for external use
    addRippleEffect(element) {
        element.classList.add('ripple');
        this.rippleElements.add(element);
    }

    removeRippleEffect(element) {
        element.classList.remove('ripple');
        this.rippleElements.delete(element);
    }

    updateProgressBar(progressBar, percentage) {
        const fill = progressBar.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = percentage + '%';
            fill.setAttribute('data-progress', percentage);
        }
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.activeModals.clear();
        this.activeDropdowns.clear();
        this.rippleElements.clear();
        
        if (this.notificationContainer) {
            this.notificationContainer.remove();
        }
    }
}

// CSS for ripple animation
const rippleCSS = `
@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.field-error {
    color: var(--red-600);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
}

.input-interactive input.error,
.input-interactive textarea.error {
    border-color: var(--red-500);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.notification-info {
    border-left: 4px solid var(--blue-500);
}

.notification-success {
    border-left: 4px solid var(--green-500);
}

.notification-warning {
    border-left: 4px solid var(--yellow-500);
}

.notification-error {
    border-left: 4px solid var(--red-500);
}

.skeleton.loaded {
    animation: none;
    background: transparent;
}

img.loaded {
    opacity: 1;
    transition: opacity var(--transition-normal);
}

img[data-src] {
    opacity: 0;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiInteractions = new UIInteractionsManager();
    });
} else {
    window.uiInteractions = new UIInteractionsManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIInteractionsManager;
}