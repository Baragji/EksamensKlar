/**
 * Accessibility Enhancements
 * Provides screen reader support, keyboard navigation, and WCAG compliance
 */

class AccessibilityManager {
    constructor() {
        this.focusTrap = null;
        this.announcer = null;
        this.currentFocus = null;
        this.init();
    }

    init() {
        this.createLiveRegion();
        this.setupKeyboardNavigation();
        this.enhanceInteractiveElements();
        this.setupFocusManagement();
        this.addSkipLinks();
        this.checkColorContrast();
        this.setupPreferenceDetection();
    }

    createLiveRegion() {
        // Create ARIA live region for announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.id = 'announcements';
        
        // Add CSS for screen reader only content
        if (!document.getElementById('accessibility-styles')) {
            const style = document.createElement('style');
            style.id = 'accessibility-styles';
            style.textContent = `
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: var(--primary-color);
                    color: white;
                    padding: 8px;
                    text-decoration: none;
                    z-index: 1000;
                    border-radius: 4px;
                }

                .skip-link:focus {
                    top: 6px;
                }

                .focus-ring {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }

                .high-contrast {
                    filter: contrast(150%);
                }

                .large-text {
                    font-size: 1.2em;
                }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                @media (prefers-contrast: high) {
                    :root {
                        --primary-color: #000080;
                        --text-color: #000000;
                        --bg-color: #ffffff;
                        --border-color: #000000;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(this.announcer);
    }

    announce(message, priority = 'polite') {
        // Announce messages to screen readers
        if (this.announcer) {
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
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
                case 'ArrowDown':
                case 'ArrowUp':
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

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToModule('content');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToModule('flashcards');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToModule('quiz');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateToModule('dashboard');
                        break;
                    case 'h':
                        e.preventDefault();
                        window.location.href = './index.html';
                        break;
                }
            }
        });
    }

    handleTabNavigation(e) {
        // Improve tab navigation
        const focusableElements = this.getFocusableElements();
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Shift+Tab (backwards)
            if (currentIndex === 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab (forwards)
            if (currentIndex === focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    }

    getFocusableElements() {
        return document.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    }

    handleEscapeKey(e) {
        // Close modals or return to main navigation
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            this.closeModal(activeModal);
        } else {
            // Focus on main navigation
            const mainNav = document.querySelector('.nav') || document.querySelector('header');
            if (mainNav) {
                const firstFocusable = mainNav.querySelector('a, button');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }
        }
    }

    handleActivation(e) {
        // Handle Enter/Space activation for custom elements
        const target = e.target;
        if (target.getAttribute('role') === 'button' && !target.tagName === 'BUTTON') {
            e.preventDefault();
            target.click();
        }
    }

    handleArrowNavigation(e) {
        // Arrow key navigation for lists and grids
        const target = e.target;
        const parent = target.closest('[role="list"], [role="grid"], [role="listbox"]');
        
        if (parent) {
            e.preventDefault();
            const items = parent.querySelectorAll('[role="listitem"], [role="gridcell"], [role="option"]');
            const currentIndex = Array.from(items).indexOf(target);
            
            let nextIndex;
            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    break;
            }
            
            if (nextIndex !== undefined && items[nextIndex]) {
                items[nextIndex].focus();
            }
        }
    }

    handleHomeEndNavigation(e) {
        // Home/End navigation
        const parent = e.target.closest('[role="list"], [role="grid"], [role="listbox"]');
        
        if (parent) {
            e.preventDefault();
            const items = parent.querySelectorAll('[role="listitem"], [role="gridcell"], [role="option"]');
            
            if (e.key === 'Home' && items[0]) {
                items[0].focus();
            } else if (e.key === 'End' && items[items.length - 1]) {
                items[items.length - 1].focus();
            }
        }
    }

    enhanceInteractiveElements() {
        // Add ARIA labels and roles to interactive elements
        document.querySelectorAll('.module-card').forEach((card, index) => {
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            if (!card.getAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
            if (!card.getAttribute('aria-label')) {
                const title = card.querySelector('.module-title');
                const description = card.querySelector('.module-description');
                if (title && description) {
                    card.setAttribute('aria-label', `${title.textContent} - ${description.textContent}`);
                }
            }
        });

        // Enhance form elements
        document.querySelectorAll('input, textarea, select').forEach(element => {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (!label && !element.getAttribute('aria-label')) {
                // Try to find nearby text as label
                const nearbyLabel = element.previousElementSibling || element.parentElement.querySelector('label');
                if (nearbyLabel && nearbyLabel.textContent) {
                    element.setAttribute('aria-label', nearbyLabel.textContent.trim());
                }
            }
        });

        // Add loading states
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (!button.disabled) {
                    button.setAttribute('aria-busy', 'true');
                    setTimeout(() => {
                        button.removeAttribute('aria-busy');
                    }, 1000);
                }
            });
        });
    }

    setupFocusManagement() {
        // Focus management for SPA navigation
        let lastFocusedElement = null;

        document.addEventListener('focusin', (e) => {
            this.currentFocus = e.target;
        });

        // Focus management for route changes
        window.addEventListener('beforeunload', () => {
            lastFocusedElement = this.currentFocus;
        });

        window.addEventListener('load', () => {
            // Focus on main heading or skip link
            const mainHeading = document.querySelector('h1');
            const skipLink = document.querySelector('.skip-link');
            
            if (skipLink) {
                skipLink.focus();
            } else if (mainHeading) {
                mainHeading.setAttribute('tabindex', '-1');
                mainHeading.focus();
            }
        });
    }

    addSkipLinks() {
        // Add skip navigation links
        const skipNav = document.createElement('div');
        skipNav.className = 'skip-navigation';
        skipNav.innerHTML = `
            <a href="#main-content" class="skip-link">Spring til hovedindhold</a>
            <a href="#navigation" class="skip-link">Spring til navigation</a>
        `;

        document.body.insertBefore(skipNav, document.body.firstChild);

        // Ensure target elements have IDs
        const mainContent = document.querySelector('main') || document.querySelector('#mainContent');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }

        const navigation = document.querySelector('nav') || document.querySelector('.nav');
        if (navigation && !navigation.id) {
            navigation.id = 'navigation';
        }
    }

    checkColorContrast() {
        // Basic color contrast checking (simplified)
        if (window.location.hostname === 'localhost') {
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
            let contrastIssues = 0;

            textElements.forEach(element => {
                const computedStyle = window.getComputedStyle(element);
                const color = computedStyle.color;
                const backgroundColor = computedStyle.backgroundColor;
                
                // Simple check for very light text on light backgrounds
                if (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) {
                    contrastIssues++;
                }
            });

            if (contrastIssues > 0) {
                console.warn(`⚠️ Potential contrast issues found: ${contrastIssues} elements`);
            }
        }
    }

    setupPreferenceDetection() {
        // Detect and adapt to user preferences
        
        // Reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
            this.announce('Animationer er reduceret baseret på dine systemindstillinger');
        }

        // High contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
            this.announce('Høj kontrast er aktiveret');
        }

        // Color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }

        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
                this.announce('Animationer reduceret');
            } else {
                document.body.classList.remove('reduce-motion');
                this.announce('Animationer genaktiveret');
            }
        });
    }

    navigateToModule(module) {
        // Accessible navigation with announcements
        const moduleUrls = {
            content: 'modules/content/index.html',
            flashcards: 'modules/flashcards/index.html',
            quiz: 'modules/quiz/index.html',
            dashboard: 'modules/dashboard/index.html'
        };

        if (moduleUrls[module]) {
            this.announce(`Navigerer til ${module} modul`);
            window.location.href = moduleUrls[module];
        }
    }

    createFocusTrap(container) {
        // Create focus trap for modals
        const focusableElements = container.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const trapFocus = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', trapFocus);
        
        return {
            activate: () => {
                if (firstFocusable) firstFocusable.focus();
            },
            deactivate: () => {
                container.removeEventListener('keydown', trapFocus);
            }
        };
    }

    // Public methods
    addAnnouncement(message, priority = 'polite') {
        this.announce(message, priority);
    }

    addFocusTrap(element) {
        return this.createFocusTrap(element);
    }

    getAccessibilityReport() {
        const focusableCount = this.getFocusableElements().length;
        const headingStructure = this.analyzeHeadingStructure();
        const missingLabels = this.findMissingLabels();

        return {
            focusableElements: focusableCount,
            headingStructure: headingStructure,
            missingLabels: missingLabels,
            hasSkipLinks: document.querySelectorAll('.skip-link').length > 0,
            hasLiveRegion: !!this.announcer,
            preferredMotion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            preferredContrast: window.matchMedia('(prefers-contrast: high)').matches
        };
    }

    analyzeHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = {};
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            structure[level] = (structure[level] || 0) + 1;
        });

        return structure;
    }

    findMissingLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        const missing = [];

        inputs.forEach(input => {
            const hasLabel = document.querySelector(`label[for="${input.id}"]`);
            const hasAriaLabel = input.getAttribute('aria-label');
            const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                missing.push(input.tagName.toLowerCase() + (input.type ? `[type="${input.type}"]` : ''));
            }
        });

        return missing;
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for global use
window.accessibilityManager = accessibilityManager;
