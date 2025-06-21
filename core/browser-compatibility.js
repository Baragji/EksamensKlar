/**
 * Cross-Browser Compatibility Manager
 * Ensures ExamKlar works across all modern browsers
 */

class BrowserCompatibility {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.features = this.detectFeatures();
        this.polyfills = [];
        this.init();
    }

    init() {
        this.checkCompatibility();
        this.loadPolyfills();
        this.applyBrowserSpecificFixes();
        this.setupCompatibilityWarnings();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: /Chrome\/([0-9\.]+)/.exec(userAgent),
            firefox: /Firefox\/([0-9\.]+)/.exec(userAgent),
            safari: /Version\/([0-9\.]+).*Safari/.exec(userAgent),
            edge: /Edg\/([0-9\.]+)/.exec(userAgent),
            ie: /MSIE ([0-9\.]+)/.exec(userAgent) || /Trident.*rv:([0-9\.]+)/.exec(userAgent),
            opera: /Opera\/([0-9\.]+)/.exec(userAgent) || /OPR\/([0-9\.]+)/.exec(userAgent)
        };

        for (const [name, match] of Object.entries(browsers)) {
            if (match) {
                return {
                    name: name,
                    version: parseFloat(match[1]),
                    fullVersion: match[1]
                };
            }
        }

        return { name: 'unknown', version: 0, fullVersion: 'unknown' };
    }

    detectFeatures() {
        return {
            // Storage
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: !!window.indexedDB,

            // Modern JS
            es6: this.checkES6Support(),
            modules: 'noModule' in HTMLScriptElement.prototype,
            asyncAwait: this.checkAsyncAwait(),

            // Web APIs
            serviceWorker: 'serviceWorker' in navigator,
            webManifest: 'onbeforeinstallprompt' in window,
            pushNotifications: 'Notification' in window && 'PushManager' in window,
            vibration: 'vibrate' in navigator,
            
            // CSS Features
            cssGrid: CSS.supports('display', 'grid'),
            cssFlexbox: CSS.supports('display', 'flex'),
            cssVariables: CSS.supports('--test', 'value'),
            cssTransforms: CSS.supports('transform', 'translateX(0)'),

            // Touch and Gestures
            touch: 'ontouchstart' in window,
            pointer: 'onpointerdown' in window,
            
            // Media
            webp: this.checkWebPSupport(),
            avif: this.checkAVIFSupport(),

            // Performance
            intersectionObserver: 'IntersectionObserver' in window,
            performanceObserver: 'PerformanceObserver' in window,
            webWorkers: typeof Worker !== 'undefined'
        };
    }

    checkES6Support() {
        try {
            eval('const test = () => {}; class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    checkAsyncAwait() {
        try {
            eval('(async () => {})()');
            return true;
        } catch (e) {
            return false;
        }
    }

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch (e) {
            return false;
        }
    }

    checkCompatibility() {
        const issues = [];
        const warnings = [];

        // Check browser support
        if (this.browserInfo.name === 'ie') {
            issues.push('Internet Explorer er ikke understøttet. Skift til en moderne browser.');
        }

        if (this.browserInfo.name === 'chrome' && this.browserInfo.version < 70) {
            warnings.push('Din Chrome browser er forældet. Opdater for bedste oplevelse.');
        }

        if (this.browserInfo.name === 'firefox' && this.browserInfo.version < 65) {
            warnings.push('Din Firefox browser er forældet. Opdater for bedste oplevelse.');
        }

        if (this.browserInfo.name === 'safari' && this.browserInfo.version < 12) {
            warnings.push('Din Safari browser er forældet. Opdater for bedste oplevelse.');
        }

        // Check essential features
        if (!this.features.localStorage) {
            issues.push('LocalStorage er ikke tilgængeligt. Dine data kan ikke gemmes.');
        }

        if (!this.features.es6) {
            issues.push('Din browser understøtter ikke moderne JavaScript. Nogle funktioner virker muligvis ikke.');
        }

        if (!this.features.cssFlexbox) {
            warnings.push('CSS Flexbox understøttes ikke. Layout kan se anderledes ud.');
        }

        if (!this.features.cssGrid) {
            warnings.push('CSS Grid understøttes ikke. Layout kan se anderledes ud.');
        }

        // Store issues for later use
        this.compatibilityIssues = issues;
        this.compatibilityWarnings = warnings;

        // Log compatibility info
        console.log('🌐 Browser:', this.browserInfo);
        console.log('✅ Supported features:', Object.keys(this.features).filter(f => this.features[f]));
        console.log('❌ Missing features:', Object.keys(this.features).filter(f => !this.features[f]));

        if (issues.length > 0) {
            console.error('🚨 Compatibility issues:', issues);
        }
        if (warnings.length > 0) {
            console.warn('⚠️ Compatibility warnings:', warnings);
        }
    }

    loadPolyfills() {
        // Load polyfills for missing features
        if (!this.features.intersectionObserver) {
            this.loadPolyfill('intersection-observer');
        }

        if (!this.features.webp) {
            // Use fallback images
            document.body.classList.add('no-webp');
        }

        if (!this.features.cssVariables) {
            this.loadPolyfill('css-variables');
        }

        if (!this.features.es6) {
            this.loadPolyfill('es6-shim');
        }
    }

    loadPolyfill(name) {
        // Simple polyfill loader (in a real app, you'd load actual polyfill files)
        console.log(`📦 Loading polyfill: ${name}`);
        this.polyfills.push(name);

        switch (name) {
            case 'intersection-observer':
                this.polyfillIntersectionObserver();
                break;
            case 'css-variables':
                this.polyfillCSSVariables();
                break;
            case 'es6-shim':
                this.polyfillES6Features();
                break;
        }
    }

    polyfillIntersectionObserver() {
        // Basic IntersectionObserver polyfill
        if (!window.IntersectionObserver) {
            window.IntersectionObserver = class {
                constructor(callback, options = {}) {
                    this.callback = callback;
                    this.root = options.root || null;
                    this.rootMargin = options.rootMargin || '0px';
                    this.thresholds = options.threshold || [0];
                    this.observed = new Set();
                }

                observe(element) {
                    this.observed.add(element);
                    // Simplified - just call callback immediately
                    setTimeout(() => {
                        this.callback([{
                            target: element,
                            isIntersecting: true,
                            intersectionRatio: 1
                        }]);
                    }, 100);
                }

                unobserve(element) {
                    this.observed.delete(element);
                }

                disconnect() {
                    this.observed.clear();
                }
            };
        }
    }

    polyfillCSSVariables() {
        // Add fallback for CSS variables
        document.body.classList.add('no-css-variables');
        
        // Add fallback styles
        const style = document.createElement('style');
        style.textContent = `
            .no-css-variables {
                --primary-color: #2563eb;
                --secondary-color: #64b5f6;
                --text-color: #333;
                --bg-color: #f5f5f5;
            }
            
            .no-css-variables .btn-primary {
                background-color: #2563eb;
            }
            
            .no-css-variables .module-card {
                background-color: white;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }

    polyfillES6Features() {
        // Basic ES6 polyfills
        if (!Array.prototype.includes) {
            Array.prototype.includes = function(searchElement) {
                return this.indexOf(searchElement) !== -1;
            };
        }

        if (!String.prototype.includes) {
            String.prototype.includes = function(searchString) {
                return this.indexOf(searchString) !== -1;
            };
        }

        if (!Object.assign) {
            Object.assign = function(target) {
                for (let i = 1; i < arguments.length; i++) {
                    const source = arguments[i];
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            };
        }
    }

    applyBrowserSpecificFixes() {
        // Apply browser-specific CSS classes
        document.body.classList.add(`browser-${this.browserInfo.name}`);
        document.body.classList.add(`browser-version-${Math.floor(this.browserInfo.version)}`);

        // Safari-specific fixes
        if (this.browserInfo.name === 'safari') {
            this.applySafariFixes();
        }

        // Firefox-specific fixes
        if (this.browserInfo.name === 'firefox') {
            this.applyFirefoxFixes();
        }

        // Chrome-specific fixes
        if (this.browserInfo.name === 'chrome') {
            this.applyChromeFixes();
        }

        // Mobile browser fixes
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            this.applyMobileFixes();
        }
    }

    applySafariFixes() {
        // Fix Safari specific issues
        const style = document.createElement('style');
        style.textContent = `
            .browser-safari .module-card {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
            
            .browser-safari input {
                -webkit-appearance: none;
                border-radius: 6px;
            }
            
            .browser-safari .btn {
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
    }

    applyFirefoxFixes() {
        // Fix Firefox specific issues
        const style = document.createElement('style');
        style.textContent = `
            .browser-firefox .module-card {
                outline: none;
            }
            
            .browser-firefox input[type="number"] {
                -moz-appearance: textfield;
            }
            
            .browser-firefox input[type="number"]::-webkit-outer-spin-button,
            .browser-firefox input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    }

    applyChromeFixes() {
        // Fix Chrome specific issues
        const style = document.createElement('style');
        style.textContent = `
            .browser-chrome .btn {
                -webkit-font-smoothing: antialiased;
            }
        `;
        document.head.appendChild(style);
    }

    applyMobileFixes() {
        // Mobile browser fixes
        document.body.classList.add('mobile-browser');
        
        const style = document.createElement('style');
        style.textContent = `
            .mobile-browser {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            
            .mobile-browser .btn {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .mobile-browser input {
                font-size: 16px; /* Prevent zoom on iOS */
            }
        `;
        document.head.appendChild(style);
    }

    setupCompatibilityWarnings() {
        // Show compatibility warnings to users
        if (this.compatibilityIssues.length > 0) {
            this.showCompatibilityModal('Compatibility Issues', this.compatibilityIssues, 'error');
        } else if (this.compatibilityWarnings.length > 0) {
            // Only show warnings after a delay, and only on localhost
            if (window.location.hostname === 'localhost') {
                setTimeout(() => {
                    this.showCompatibilityNotification(this.compatibilityWarnings[0], 'warning');
                }, 2000);
            }
        }
    }

    showCompatibilityModal(title, messages, type) {
        const modal = document.createElement('div');
        modal.className = 'compatibility-modal';
        modal.innerHTML = `
            <div class="compatibility-content ${type}">
                <h3>${title}</h3>
                <ul>
                    ${messages.map(msg => `<li>${msg}</li>`).join('')}
                </ul>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Forstået
                </button>
            </div>
        `;

        // Add styles
        if (!document.getElementById('compatibility-styles')) {
            const style = document.createElement('style');
            style.id = 'compatibility-styles';
            style.textContent = `
                .compatibility-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }

                .compatibility-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    max-width: 500px;
                    margin: 1rem;
                    text-align: center;
                }

                .compatibility-content.error {
                    border-left: 4px solid #f44336;
                }

                .compatibility-content.warning {
                    border-left: 4px solid #ff9800;
                }

                .compatibility-content h3 {
                    margin-top: 0;
                    color: #333;
                }

                .compatibility-content ul {
                    text-align: left;
                    margin: 1.5rem 0;
                }

                .compatibility-content li {
                    margin-bottom: 0.5rem;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    showCompatibilityNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `compatibility-notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    // Public methods
    getBrowserInfo() {
        return this.browserInfo;
    }

    getFeatureSupport() {
        return this.features;
    }

    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            features: this.features,
            polyfills: this.polyfills,
            issues: this.compatibilityIssues,
            warnings: this.compatibilityWarnings,
            overallCompatibility: this.calculateOverallCompatibility()
        };
    }

    calculateOverallCompatibility() {
        const totalFeatures = Object.keys(this.features).length;
        const supportedFeatures = Object.values(this.features).filter(Boolean).length;
        const score = (supportedFeatures / totalFeatures) * 100;

        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    }
}

// Initialize browser compatibility
const browserCompatibility = new BrowserCompatibility();

// Export for global use
window.browserCompatibility = browserCompatibility;
