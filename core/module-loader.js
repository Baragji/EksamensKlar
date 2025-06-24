/**
 * Advanced Module Loader with Code Splitting and Lazy Loading
 * Implements dynamic imports, preloading, and intelligent caching
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.preloadedModules = new Set();
        this.loadingPromises = new Map();
        this.performanceMetrics = {
            loadTimes: {},
            cacheHits: 0,
            networkRequests: 0
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.preloadCriticalModules();
        this.setupPrefetchOnHover();
        this.monitorNetworkConditions();
    }

    /**
     * Dynamically load a module with code splitting
     */
    async loadModule(moduleName, options = {}) {
        const startTime = performance.now();
        
        try {
            // Check if module is already loaded
            if (this.loadedModules.has(moduleName)) {
                this.performanceMetrics.cacheHits++;
                console.log(`📦 Module '${moduleName}' served from cache`);
                return this.loadedModules.get(moduleName);
            }

            // Check if module is currently loading
            if (this.loadingPromises.has(moduleName)) {
                return await this.loadingPromises.get(moduleName);
            }

            // Start loading process
            const loadingPromise = this.performModuleLoad(moduleName, options);
            this.loadingPromises.set(moduleName, loadingPromise);

            const moduleData = await loadingPromise;
            
            // Cache the loaded module
            this.loadedModules.set(moduleName, moduleData);
            this.loadingPromises.delete(moduleName);
            
            // Record performance metrics
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.loadTimes[moduleName] = loadTime;
            this.performanceMetrics.networkRequests++;
            
            console.log(`🚀 Module '${moduleName}' loaded in ${loadTime.toFixed(2)}ms`);
            
            return moduleData;
            
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Failed to load module '${moduleName}':`, error);
            throw error;
        }
    }

    /**
     * Perform the actual module loading
     */
    async performModuleLoad(moduleName, options) {
        const moduleConfig = this.getModuleConfig(moduleName);
        
        if (!moduleConfig) {
            throw new Error(`Module configuration not found for: ${moduleName}`);
        }

        // Load CSS first for better perceived performance
        if (moduleConfig.css) {
            await this.loadCSS(moduleConfig.css);
        }

        // Load JavaScript module
        const jsModule = await this.loadJS(moduleConfig.js);
        
        // Load HTML template if needed
        let htmlTemplate = null;
        if (moduleConfig.html) {
            htmlTemplate = await this.loadHTML(moduleConfig.html);
        }

        return {
            js: jsModule,
            html: htmlTemplate,
            css: moduleConfig.css,
            config: moduleConfig
        };
    }

    /**
     * Load JavaScript module with dynamic import
     */
    async loadJS(jsPath) {
        try {
            // Use dynamic import for true code splitting
            const module = await import(jsPath);
            return module;
        } catch (error) {
            // Fallback to script tag loading
            return this.loadScriptTag(jsPath);
        }
    }

    /**
     * Fallback script loading method
     */
    loadScriptTag(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(window);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Load CSS with preload optimization
     */
    async loadCSS(cssPath) {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            const existingLink = document.querySelector(`link[href="${cssPath}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    /**
     * Load HTML template
     */
    async loadHTML(htmlPath) {
        try {
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`Failed to load HTML template: ${htmlPath}`, error);
            return null;
        }
    }

    /**
     * Get module configuration
     */
    getModuleConfig(moduleName) {
        const moduleConfigs = {
            'subjects': {
                js: './modules/subjects/subjects.js',
                css: './modules/subjects/subjects.css',
                html: './modules/subjects/index.html',
                priority: 'high'
            },
            'content': {
                js: './modules/content/content.js',
                css: './modules/content/content.css',
                html: './modules/content/index.html',
                priority: 'high'
            },
            'flashcards': {
                js: './modules/flashcards/flashcards.js',
                css: './modules/flashcards/flashcards.css',
                html: './modules/flashcards/index.html',
                priority: 'medium'
            },
            'quiz': {
                js: './modules/quiz/quiz.js',
                css: null,
                html: './modules/quiz/index.html',
                priority: 'medium'
            },
            'dashboard': {
                js: './modules/dashboard/dashboard.js',
                css: './modules/dashboard/dashboard.css',
                html: './modules/dashboard/index.html',
                priority: 'high'
            },
            'ai-assistant': {
                js: './modules/ai-assistant/ai-assistant.js',
                css: './modules/ai-assistant/ai-assistant.css',
                html: './modules/ai-assistant/index.html',
                priority: 'low'
            },
            'advanced': {
                js: './modules/advanced/advanced.js',
                css: './modules/advanced/advanced.css',
                html: './modules/advanced/index.html',
                priority: 'low'
            }
        };

        return moduleConfigs[moduleName];
    }

    /**
     * Preload critical modules based on priority
     */
    async preloadCriticalModules() {
        const criticalModules = ['subjects', 'content', 'dashboard'];
        
        // Only preload on fast connections
        if (this.isSlowConnection()) {
            console.log('🐌 Slow connection detected, skipping preload');
            return;
        }

        for (const moduleName of criticalModules) {
            try {
                await this.preloadModule(moduleName);
            } catch (error) {
                console.warn(`Failed to preload ${moduleName}:`, error);
            }
        }
    }

    /**
     * Preload a module without executing it
     */
    async preloadModule(moduleName) {
        if (this.preloadedModules.has(moduleName)) {
            return;
        }

        const moduleConfig = this.getModuleConfig(moduleName);
        if (!moduleConfig) return;

        // Preload CSS
        if (moduleConfig.css) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = moduleConfig.css;
            link.as = 'style';
            document.head.appendChild(link);
        }

        // Preload JS
        if (moduleConfig.js) {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = moduleConfig.js;
            document.head.appendChild(link);
        }

        this.preloadedModules.add(moduleName);
        console.log(`🔄 Preloaded module: ${moduleName}`);
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const moduleName = entry.target.dataset.module;
                    if (moduleName && !this.preloadedModules.has(moduleName)) {
                        this.preloadModule(moduleName);
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });

        // Observe module cards
        document.querySelectorAll('[data-module]').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Setup prefetch on hover for better UX
     */
    setupPrefetchOnHover() {
        document.addEventListener('mouseover', (event) => {
            const moduleLink = event.target.closest('a[href*="modules/"]');
            if (moduleLink) {
                const href = moduleLink.getAttribute('href');
                const moduleName = this.extractModuleNameFromHref(href);
                
                if (moduleName && !this.preloadedModules.has(moduleName)) {
                    // Debounce to avoid excessive preloading
                    clearTimeout(this.hoverTimeout);
                    this.hoverTimeout = setTimeout(() => {
                        this.preloadModule(moduleName);
                    }, 100);
                }
            }
        });
    }

    /**
     * Extract module name from href
     */
    extractModuleNameFromHref(href) {
        const match = href.match(/modules\/([^/]+)/);
        return match ? match[1] : null;
    }

    /**
     * Monitor network conditions
     */
    monitorNetworkConditions() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateStrategy = () => {
                if (this.isSlowConnection()) {
                    console.log('📶 Slow connection: Reducing preloading');
                    this.preloadedModules.clear();
                } else {
                    console.log('📶 Fast connection: Enabling aggressive preloading');
                    this.preloadCriticalModules();
                }
            };

            connection.addEventListener('change', updateStrategy);
            updateStrategy();
        }
    }

    /**
     * Check if connection is slow
     */
    isSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' ||
                   connection.downlink < 1;
        }
        return false;
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            loadedModules: this.loadedModules.size,
            preloadedModules: this.preloadedModules.size,
            averageLoadTime: this.calculateAverageLoadTime()
        };
    }

    /**
     * Calculate average load time
     */
    calculateAverageLoadTime() {
        const times = Object.values(this.performanceMetrics.loadTimes);
        if (times.length === 0) return 0;
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    /**
     * Clear cache for development
     */
    clearCache() {
        this.loadedModules.clear();
        this.preloadedModules.clear();
        this.loadingPromises.clear();
        console.log('🗑️ Module cache cleared');
    }
}

// Initialize global module loader
const moduleLoader = new ModuleLoader();

// Export for global use
window.moduleLoader = moduleLoader;

// Export for ES6 modules
export default moduleLoader;