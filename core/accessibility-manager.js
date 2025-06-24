/**
 * Accessibility Manager
 * Håndterer tilgængelighed, keyboard navigation og screen reader support
 */

class AccessibilityManager {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        this.trapFocus = null;
        this.lastFocusedElement = null;
        this.announcements = [];
        
        this.init();
    }

    // Initialiser accessibility features
    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupARIALiveRegions();
        this.setupReducedMotion();
        
        console.log('✅ Accessibility Manager initialized');
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
                case 'Home':
                case 'End':
                    this.handleHomeEndNavigation(e);
                    break;
            }
        });

        // Add visible focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Handle tab navigation
    handleTabNavigation(e) {
        if (this.trapFocus) {
            const focusableElements = this.trapFocus.querySelectorAll(this.focusableElements);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Handle escape key
    handleEscapeKey(e) {
        // Close modals, dropdowns, etc.
        const openModal = document.querySelector('.modal.active, .dropdown.open, .menu.open');
        if (openModal) {
            e.preventDefault();
            this.closeModal(openModal);
        }

        // Clear focus trap
        if (this.trapFocus) {
            this.releaseFocusTrap();
        }
    }

    // Handle enter/space activation
    handleActivation(e) {
        const target = e.target;
        
        // Handle custom interactive elements
        if (target.hasAttribute('data-ripple') || target.classList.contains('card-interactive')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                target.click();
            }
        }

        // Handle navigation toggle
        if (target.id === 'navToggle' || target.classList.contains('nav-toggle')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleNavigation();
            }
        }
    }

    // Handle arrow key navigation
    handleArrowNavigation(e) {
        const target = e.target;
        const parent = target.closest('.modules-grid-luxury, .stats-grid-luxury, .nav-menu');
        
        if (parent) {
            e.preventDefault();
            const items = Array.from(parent.querySelectorAll(this.focusableElements));
            const currentIndex = items.indexOf(target);
            let nextIndex;

            switch (e.key) {
                case 'ArrowUp':
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    break;
                case 'ArrowDown':
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'ArrowLeft':
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    break;
                case 'ArrowRight':
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    break;
            }

            if (nextIndex !== undefined && items[nextIndex]) {
                items[nextIndex].focus();
            }
        }
    }

    // Handle Home/End navigation
    handleHomeEndNavigation(e) {
        const target = e.target;
        const parent = target.closest('.modules-grid-luxury, .stats-grid-luxury, .nav-menu');
        
        if (parent) {
            e.preventDefault();
            const items = Array.from(parent.querySelectorAll(this.focusableElements));
            
            if (e.key === 'Home' && items[0]) {
                items[0].focus();
            } else if (e.key === 'End' && items[items.length - 1]) {
                items[items.length - 1].focus();
            }
        }
    }

    // Setup screen reader support
    setupScreenReaderSupport() {
        // Add screen reader only text for better context
        this.addScreenReaderText();
        
        // Setup live regions for dynamic content
        this.setupLiveRegions();
        
        // Add descriptive labels
        this.enhanceLabels();
    }

    // Add screen reader only text
    addScreenReaderText() {
        // Add sr-only class if not exists
        if (!document.querySelector('style[data-accessibility]')) {
            const style = document.createElement('style');
            style.setAttribute('data-accessibility', 'true');
            style.textContent = `
                .sr-only {
                    position: absolute !important;
                    width: 1px !important;
                    height: 1px !important;
                    padding: 0 !important;
                    margin: -1px !important;
                    overflow: hidden !important;
                    clip: rect(0, 0, 0, 0) !important;
                    white-space: nowrap !important;
                    border: 0 !important;
                }
                
                .keyboard-navigation *:focus {
                    outline: 3px solid var(--accent-color, #007bff) !important;
                    outline-offset: 2px !important;
                }
                
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: var(--bg-primary, #000);
                    color: var(--text-primary, #fff);
                    padding: 8px;
                    text-decoration: none;
                    z-index: 10000;
                    border-radius: 4px;
                }
                
                .skip-link:focus {
                    top: 6px;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Setup live regions
    setupLiveRegions() {
        // Create announcement region if not exists
        if (!document.getElementById('announcements')) {
            const announceRegion = document.createElement('div');
            announceRegion.id = 'announcements';
            announceRegion.setAttribute('aria-live', 'polite');
            announceRegion.setAttribute('aria-atomic', 'true');
            announceRegion.className = 'sr-only';
            document.body.appendChild(announceRegion);
        }

        // Create status region if not exists
        if (!document.getElementById('status')) {
            const statusRegion = document.createElement('div');
            statusRegion.id = 'status';
            statusRegion.setAttribute('aria-live', 'assertive');
            statusRegion.setAttribute('aria-atomic', 'true');
            statusRegion.className = 'sr-only';
            document.body.appendChild(statusRegion);
        }
    }

    // Enhance labels and descriptions
    enhanceLabels() {
        // Add labels to progress bars
        document.querySelectorAll('.progress-luxury[data-progress]').forEach(progress => {
            const value = progress.getAttribute('data-progress');
            if (!progress.getAttribute('aria-label')) {
                progress.setAttribute('aria-label', `${value}% færdig`);
            }
            progress.setAttribute('role', 'progressbar');
            progress.setAttribute('aria-valuenow', value);
            progress.setAttribute('aria-valuemin', '0');
            progress.setAttribute('aria-valuemax', '100');
        });

        // Add labels to interactive cards
        document.querySelectorAll('.card-interactive, [data-ripple]').forEach(card => {
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            if (!card.getAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
        });

        // Enhance navigation
        const navToggle = document.getElementById('navToggle');
        if (navToggle && !navToggle.getAttribute('aria-controls')) {
            navToggle.setAttribute('aria-controls', 'navigation');
        }
    }

    // Setup skip links
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Spring til hovedindhold';
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Setup ARIA live regions
    setupARIALiveRegions() {
        // Monitor dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Setup reduced motion preferences
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            this.announce('Animationer er reduceret baseret på dine indstillinger');
        }
    }

    // Focus management
    setupFocusManagement() {
        // Track last focused element
        document.addEventListener('focusin', (e) => {
            this.lastFocusedElement = e.target;
        });

        // Handle focus restoration
        document.addEventListener('focusout', (e) => {
            // Store focus for potential restoration
        });
    }

    // Set focus trap
    setFocusTrap(element) {
        this.trapFocus = element;
        const focusableElements = element.querySelectorAll(this.focusableElements);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    // Release focus trap
    releaseFocusTrap() {
        this.trapFocus = null;
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    }

    // Announce to screen readers
    announce(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'status' : 'announcements';
        const region = document.getElementById(regionId);
        
        if (region) {
            region.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
        
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
    }

    // Toggle navigation with accessibility
    toggleNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navigation = document.getElementById('navigation') || document.querySelector('.nav-menu');
        
        if (navToggle && navigation) {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navigation.classList.toggle('open');
            
            if (!isExpanded) {
                this.setFocusTrap(navigation);
                this.announce('Navigation åbnet');
            } else {
                this.releaseFocusTrap();
                this.announce('Navigation lukket');
            }
        }
    }

    // Close modal with accessibility
    closeModal(modal) {
        modal.classList.remove('active', 'open');
        this.releaseFocusTrap();
        this.announce('Modal lukket');
    }

    // Enhance new content
    enhanceNewContent(element) {
        // Add accessibility attributes to new interactive elements
        const interactiveElements = element.querySelectorAll('.card-interactive, [data-ripple]');
        interactiveElements.forEach(el => {
            if (!el.getAttribute('role')) {
                el.setAttribute('role', 'button');
            }
            if (!el.getAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });

        // Add labels to new progress bars
        const progressBars = element.querySelectorAll('.progress-luxury[data-progress]');
        progressBars.forEach(progress => {
            const value = progress.getAttribute('data-progress');
            progress.setAttribute('aria-label', `${value}% færdig`);
            progress.setAttribute('role', 'progressbar');
            progress.setAttribute('aria-valuenow', value);
            progress.setAttribute('aria-valuemin', '0');
            progress.setAttribute('aria-valuemax', '100');
        });
    }

    // Update progress with announcement
    updateProgress(element, value, label) {
        element.setAttribute('data-progress', value);
        element.setAttribute('aria-valuenow', value);
        element.setAttribute('aria-label', label || `${value}% færdig`);
        
        this.announce(`Fremskridt opdateret til ${value}%`);
    }

    // Get accessibility status
    getAccessibilityStatus() {
        return {
            focusTrapActive: !!this.trapFocus,
            lastFocusedElement: this.lastFocusedElement?.tagName || null,
            announcements: this.announcements.slice(-5), // Last 5 announcements
            reducedMotion: document.body.classList.contains('reduced-motion'),
            keyboardNavigation: document.body.classList.contains('keyboard-navigation')
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
} else {
    window.AccessibilityManager = AccessibilityManager;
}