/**
 * Mobile Gesture Support
 * Adds swipe navigation and touch enhancements for better mobile experience
 */

class MobileGestureManager {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.maxVerticalDistance = 100;
        this.isScrolling = false;
        this.currentModule = this.getCurrentModule();
        this.modules = ['index.html', 'content', 'flashcards', 'quiz', 'dashboard'];
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupPullToRefresh();
        this.enhanceTouchTargets();
        this.setupHapticFeedback();
        this.addGestureIndicators();
    }

    getCurrentModule() {
        const path = window.location.pathname;
        if (path.includes('content')) return 'content';
        if (path.includes('flashcards')) return 'flashcards';
        if (path.includes('quiz')) return 'quiz';
        if (path.includes('dashboard')) return 'dashboard';
        return 'index.html';
    }

    setupTouchEvents() {
        let isSwipeEnabled = true;

        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
            this.isScrolling = false;
            
            // Disable swipe if touching form elements or scrollable content
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
                target.closest('.scrollable') || target.closest('.chart')) {
                isSwipeEnabled = false;
            } else {
                isSwipeEnabled = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipeEnabled) return;
            
            const currentY = e.changedTouches[0].screenY;
            const deltaY = Math.abs(currentY - this.touchStartY);
            
            // If user is scrolling vertically, disable horizontal swipe
            if (deltaY > 10) {
                this.isScrolling = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isSwipeEnabled || this.isScrolling) return;
            
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > this.minSwipeDistance && deltaY < this.maxVerticalDistance) {
            
            if (deltaX > 0) {
                // Swipe right - go to previous module
                this.navigateToPrevious();
                this.triggerHapticFeedback();
            } else {
                // Swipe left - go to next module
                this.navigateToNext();
                this.triggerHapticFeedback();
            }
        }
    }

    navigateToPrevious() {
        const currentIndex = this.modules.indexOf(this.currentModule);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : this.modules.length - 1;
        const previousModule = this.modules[previousIndex];
        
        this.navigateToModule(previousModule);
        this.showSwipeIndicator('left');
    }

    navigateToNext() {
        const currentIndex = this.modules.indexOf(this.currentModule);
        const nextIndex = currentIndex < this.modules.length - 1 ? currentIndex + 1 : 0;
        const nextModule = this.modules[nextIndex];
        
        this.navigateToModule(nextModule);
        this.showSwipeIndicator('right');
    }

    navigateToModule(module) {
        const moduleUrls = {
            'index.html': '../../../index.html',
            'content': '../content/index.html',
            'flashcards': '../flashcards/index.html',
            'quiz': '../quiz/index.html',
            'dashboard': '../dashboard/index.html'
        };

        // Adjust URLs based on current location
        let url;
        if (window.location.pathname.includes('modules/')) {
            url = moduleUrls[module];
        } else {
            // We're in root, adjust URLs
            if (module === 'index.html') {
                url = './index.html';
            } else {
                url = `./modules/${module}/index.html`;
            }
        }

        if (url) {
            // Add transition class
            document.body.classList.add('page-transition');
            
            // Navigate after short delay for animation
            setTimeout(() => {
                window.location.href = url;
            }, 150);
        }
    }

    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        let isPulling = false;
        let refreshThreshold = 80;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling || window.scrollY > 0) return;

            pullDistance = e.touches[0].clientY - startY;
            
            if (pullDistance > 0) {
                e.preventDefault();
                this.showPullToRefreshIndicator(pullDistance);
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling && pullDistance > refreshThreshold) {
                this.performRefresh();
            }
            this.hidePullToRefreshIndicator();
            isPulling = false;
            pullDistance = 0;
        });
    }

    showPullToRefreshIndicator(distance) {
        let indicator = document.getElementById('pull-refresh-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-refresh-indicator';
            indicator.innerHTML = '↓ Træk for at opdatere';
            indicator.style.cssText = `
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--primary-color);
                color: white;
                padding: 10px 20px;
                border-radius: 0 0 10px 10px;
                font-size: 14px;
                z-index: 1000;
                transition: top 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }

        const progress = Math.min(distance / 80, 1);
        indicator.style.top = `${-50 + (60 * progress)}px`;
        
        if (progress >= 1) {
            indicator.innerHTML = '↑ Slip for at opdatere';
            indicator.style.background = 'var(--success-color)';
        } else {
            indicator.innerHTML = '↓ Træk for at opdatere';
            indicator.style.background = 'var(--primary-color)';
        }
    }

    hidePullToRefreshIndicator() {
        const indicator = document.getElementById('pull-refresh-indicator');
        if (indicator) {
            indicator.style.top = '-50px';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }
    }

    performRefresh() {
        const indicator = document.getElementById('pull-refresh-indicator');
        if (indicator) {
            indicator.innerHTML = '🔄 Opdaterer...';
            indicator.style.background = 'var(--warning-color)';
        }

        // Simulate refresh
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    enhanceTouchTargets() {
        // Ensure all interactive elements meet minimum touch target size (44px)
        const interactiveElements = document.querySelectorAll('button, a, input, .module-card, .nav-item');
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.display = 'inline-flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
        });

        // Add touch feedback
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });

        // Add CSS for touch feedback
        if (!document.getElementById('touch-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-styles';
            style.textContent = `
                .touch-active {
                    transform: scale(0.95);
                    opacity: 0.8;
                    transition: all 0.1s ease;
                }

                .page-transition {
                    opacity: 0.9;
                    transition: opacity 0.3s ease;
                }

                @media (hover: none) and (pointer: coarse) {
                    /* Mobile-specific styles */
                    .btn:hover {
                        transform: none;
                    }
                    
                    .module-card:hover {
                        transform: none;
                    }
                    
                    .module-card:active,
                    .btn:active {
                        transform: scale(0.95);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupHapticFeedback() {
        // Use Vibration API for haptic feedback
        this.canVibrate = 'vibrate' in navigator;
    }

    triggerHapticFeedback(pattern = 10) {
        if (this.canVibrate) {
            navigator.vibrate(pattern);
        }
    }

    showSwipeIndicator(direction) {
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = direction === 'left' ? '← Forrige' : 'Næste →';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            ${direction === 'left' ? 'left: 20px' : 'right: 20px'};
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            animation: swipeIndicatorShow 0.5s ease forwards;
        `;

        // Add animation
        if (!document.getElementById('swipe-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'swipe-animation-styles';
            style.textContent = `
                @keyframes swipeIndicatorShow {
                    0% { opacity: 0; transform: translateY(-50%) scale(0.8); }
                    50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
                    100% { opacity: 0; transform: translateY(-50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 500);
    }

    addGestureIndicators() {
        // Add visual hint for swipe gestures
        if (window.innerWidth <= 768) { // Only on mobile
            const gestureHint = document.createElement('div');
            gestureHint.className = 'gesture-hint';
            gestureHint.innerHTML = '← Swipe mellem moduler →';
            gestureHint.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 15px;
                font-size: 12px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;

            document.body.appendChild(gestureHint);

            // Show hint briefly on page load
            setTimeout(() => {
                gestureHint.style.opacity = '1';
            }, 1000);

            setTimeout(() => {
                gestureHint.style.opacity = '0';
            }, 4000);

            // Remove after fade out
            setTimeout(() => {
                if (gestureHint.parentNode) {
                    gestureHint.parentNode.removeChild(gestureHint);
                }
            }, 4500);
        }
    }

    // Add double-tap to zoom for content areas
    setupDoubleTapZoom() {
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                const target = e.target.closest('.content-area, .chart, .module-card');
                if (target && !target.classList.contains('zoomed')) {
                    this.zoomElement(target);
                    this.triggerHapticFeedback([50, 50, 50]);
                }
            }
            lastTap = currentTime;
        });
    }

    zoomElement(element) {
        element.style.transition = 'transform 0.3s ease';
        element.style.transform = 'scale(1.2)';
        element.style.zIndex = '1000';
        element.classList.add('zoomed');

        // Zoom out after delay or on next tap
        const zoomOut = () => {
            element.style.transform = 'scale(1)';
            element.style.zIndex = '';
            element.classList.remove('zoomed');
            element.removeEventListener('click', zoomOut);
        };

        setTimeout(zoomOut, 3000); // Auto zoom out
        element.addEventListener('click', zoomOut, { once: true }); // Or tap to zoom out
    }

    // Get gesture statistics
    getGestureStats() {
        return {
            canVibrate: this.canVibrate,
            touchSupported: 'ontouchstart' in window,
            currentModule: this.currentModule,
            availableModules: this.modules,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
}

// Initialize mobile gestures
const mobileGestureManager = new MobileGestureManager();

// Export for global use
window.mobileGestureManager = mobileGestureManager;
