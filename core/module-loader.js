/**
 * Advanced Module Loader with Code Splitting and Lazy Loading
 * Implements dynamic imports, preloading, intelligent caching, and robust error handling
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.preloadedModules = new Set();
        this.loadingPromises = new Map();
        this.failedModules = new Map();
        this.dependencies = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.performanceMetrics = {
            loadTimes: {},
            cacheHits: 0,
            networkRequests: 0,
            failures: 0,
            retries: 0
        };
        this.eventBus = window.EventBus || this.createFallbackEventBus();
        this.init();
    }

    /**
     * Create fallback event bus if not available
     */
    createFallbackEventBus() {
        return {
            emit: (namespace, event, data) => {
                console.log(`[ModuleLoader] ${namespace}.${event}:`, data);
            },
            on: () => {},
            off: () => {}
        };
    }

    init() {
        this.setupIntersectionObserver();
        this.preloadCriticalModules();
        this.setupPrefetchOnHover();
        this.monitorNetworkConditions();
        this.integrateLazyLoader();
    }

    /**
     * Integrate with LazyLoader for coordinated loading
     */
    integrateLazyLoader() {
        if (window.lazyLoader) {
            // Register module loader with lazy loader
            window.lazyLoader.registerModuleLoader(this);
            
            // Listen for lazy loading events
            this.eventBus.on('lazy-loader', 'module-requested', (data) => {
                this.loadModule(data.moduleName, { priority: data.priority });
            });
            
            console.log('✅ ModuleLoader integrated with LazyLoader');
        }
    }

    /**
     * Dynamically load a module with code splitting and robust error handling
     */
    async loadModule(moduleName, options = {}) {
        const startTime = performance.now();
        
        try {
            // Check if module is already loaded
            if (this.loadedModules.has(moduleName)) {
                this.performanceMetrics.cacheHits++;
                console.log(`📦 Module '${moduleName}' served from cache`);
                this.eventBus.emit('moduleLoader', 'cache_hit', { moduleName });
                return this.loadedModules.get(moduleName);
            }

            // Check if module has failed and is within retry limit
            if (this.failedModules.has(moduleName)) {
                const retryCount = this.retryAttempts.get(moduleName) || 0;
                if (retryCount >= this.maxRetries) {
                    const error = this.failedModules.get(moduleName);
                    console.error(`❌ Module '${moduleName}' failed permanently after ${this.maxRetries} attempts`);
                    this.eventBus.emit('moduleLoader', 'permanent_failure', { moduleName, error: error.message });
                    throw error;
                }
            }

            // Check if module is currently loading
            if (this.loadingPromises.has(moduleName)) {
                return await this.loadingPromises.get(moduleName);
            }

            // Load dependencies first
            await this.loadDependencies(moduleName);

            // Start loading process
            const loadingPromise = this.performModuleLoadWithRetry(moduleName, options);
            this.loadingPromises.set(moduleName, loadingPromise);

            const moduleData = await loadingPromise;
            
            // Cache the loaded module
            this.loadedModules.set(moduleName, moduleData);
            this.loadingPromises.delete(moduleName);
            this.failedModules.delete(moduleName);
            this.retryAttempts.delete(moduleName);
            
            // Record performance metrics
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.loadTimes[moduleName] = loadTime;
            this.performanceMetrics.networkRequests++;
            
            console.log(`🚀 Module '${moduleName}' loaded in ${loadTime.toFixed(2)}ms`);
            this.eventBus.emit('moduleLoader', 'module_loaded', { moduleName, loadTime });
            
            return moduleData;
            
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            this.failedModules.set(moduleName, error);
            this.performanceMetrics.failures++;
            
            console.error(`❌ Failed to load module '${moduleName}':`, error);
            this.eventBus.emit('moduleLoader', 'load_failed', { moduleName, error: error.message });
            
            // Try fallback if available
            const fallback = await this.tryFallback(moduleName, options);
            if (fallback) {
                return fallback;
            }
            
            throw error;
        }
    }

    /**
     * Load module dependencies
     */
    async loadDependencies(moduleName) {
        const dependencies = this.dependencies.get(moduleName) || [];
        
        for (const dependency of dependencies) {
            if (!this.loadedModules.has(dependency)) {
                console.log(`📦 Loading dependency '${dependency}' for '${moduleName}'`);
                await this.loadModule(dependency);
            }
        }
    }

    /**
     * Perform module loading with retry logic
     */
    async performModuleLoadWithRetry(moduleName, options) {
        let lastError;
        const retryCount = this.retryAttempts.get(moduleName) || 0;
        
        for (let attempt = retryCount; attempt < this.maxRetries; attempt++) {
            try {
                this.retryAttempts.set(moduleName, attempt + 1);
                
                if (attempt > 0) {
                    console.log(`🔄 Retry attempt ${attempt + 1}/${this.maxRetries} for module '${moduleName}'`);
                    this.performanceMetrics.retries++;
                    this.eventBus.emit('moduleLoader', 'retry_attempt', { moduleName, attempt: attempt + 1 });
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
                
                return await this.performModuleLoad(moduleName, options);
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt + 1} failed for module '${moduleName}':`, error.message);
            }
        }
        
        throw lastError;
    }

    /**
     * Try fallback mechanisms for failed modules
     */
    async tryFallback(moduleName, options) {
        console.log(`🔄 Attempting fallback for module '${moduleName}'`);
        
        try {
            // Try loading a basic version or placeholder
            const fallbackConfig = this.getFallbackConfig(moduleName);
            if (fallbackConfig) {
                console.log(`📦 Loading fallback for '${moduleName}'`);
                this.eventBus.emit('moduleLoader', 'fallback_used', { moduleName });
                return await this.performModuleLoad(moduleName, { ...options, config: fallbackConfig });
            }
            
            // Return minimal module structure
            return {
                js: { default: () => console.warn(`Module '${moduleName}' loaded in fallback mode`) },
                html: `<div class="module-fallback">Module '${moduleName}' is temporarily unavailable</div>`,
                css: null,
                config: { fallback: true }
            };
            
        } catch (error) {
            console.error(`❌ Fallback also failed for module '${moduleName}':`, error);
            return null;
        }
    }

    /**
     * Get fallback configuration for a module
     */
    getFallbackConfig(moduleName) {
        const fallbackConfigs = {
            'subjects': {
                js: './modules/subjects/subjects.js',
                css: './styles/components.css', // Use global CSS as fallback
                html: './modules/subjects/index.html',
                priority: 'high',
                fallback: true
            },
            'content': {
                js: './core/utils.js', // Use utils as minimal fallback
                css: './styles/global.css',
                html: null,
                priority: 'high',
                fallback: true
            }
        };
        
        return fallbackConfigs[moduleName];
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
     * Get module configuration with dependencies
     */
    getModuleConfig(moduleName) {
        const moduleConfigs = {
            'subjects': {
                js: './modules/subjects/subjects.js',
                css: './modules/subjects/subjects.css',
                html: './modules/subjects/index.html',
                priority: 'high',
                dependencies: [],
                timeout: 10000,
                retryable: true
            },
            'content': {
                js: './modules/content/content.js',
                css: './modules/content/content.css',
                html: './modules/content/index.html',
                priority: 'high',
                dependencies: [],
                timeout: 10000,
                retryable: true
            },
            'flashcards': {
                js: './modules/flashcards/flashcards.js',
                css: './modules/flashcards/flashcards.css',
                html: './modules/flashcards/index.html',
                priority: 'medium',
                dependencies: ['content'],
                timeout: 8000,
                retryable: true
            },
            'quiz': {
                js: './modules/quiz/quiz.js',
                css: null,
                html: './modules/quiz/index.html',
                priority: 'medium',
                dependencies: ['content'],
                timeout: 8000,
                retryable: true
            },
            'dashboard': {
                js: './modules/dashboard/dashboard.js',
                css: './modules/dashboard/dashboard.css',
                html: './modules/dashboard/index.html',
                priority: 'high',
                dependencies: [],
                timeout: 10000,
                retryable: true
            },
            'ai-assistant': {
                js: './modules/ai-assistant/ai-assistant.js',
                css: './modules/ai-assistant/ai-assistant.css',
                html: './modules/ai-assistant/index.html',
                priority: 'low',
                dependencies: [],
                timeout: 15000,
                retryable: true
            },
            'advanced': {
                js: './modules/advanced/advanced.js',
                css: './modules/advanced/advanced.css',
                html: './modules/advanced/index.html',
                priority: 'low',
                dependencies: [],
                timeout: 8000,
                retryable: true
            },
            'onboarding': {
                js: './modules/onboarding/onboarding.js',
                css: './modules/onboarding/onboarding.css',
                html: './modules/onboarding/index.html',
                priority: 'critical',
                dependencies: [],
                timeout: 5000,
                retryable: false
            }
        };

        const config = moduleConfigs[moduleName];
        if (config && config.dependencies) {
            // Store dependencies for later use
            this.dependencies.set(moduleName, config.dependencies);
        }
        
        return config;
    }

    /**
     * Register a new module configuration
     */
    registerModule(moduleName, config) {
        if (!config.js) {
            throw new Error(`Module '${moduleName}' must have a JavaScript file`);
        }
        
        const defaultConfig = {
            css: null,
            html: null,
            priority: 'medium',
            dependencies: [],
            timeout: 10000,
            retryable: true
        };
        
        const moduleConfig = { ...defaultConfig, ...config };
        
        // Store dependencies
        if (moduleConfig.dependencies) {
            this.dependencies.set(moduleName, moduleConfig.dependencies);
        }
        
        // Add to internal config (this would ideally be stored persistently)
        console.log(`📝 Registered module '${moduleName}' with config:`, moduleConfig);
        this.eventBus.emit('moduleLoader', 'module_registered', { moduleName, config: moduleConfig });
        
        return moduleConfig;
    }

    /**
     * Unload a module and clear its cache
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            this.loadedModules.delete(moduleName);
            this.preloadedModules.delete(moduleName);
            this.failedModules.delete(moduleName);
            this.retryAttempts.delete(moduleName);
            
            console.log(`🗑️ Unloaded module '${moduleName}'`);
            this.eventBus.emit('moduleLoader', 'module_unloaded', { moduleName });
            
            return true;
        }
        
        return false;
    }

    /**
     * Check if a module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Get module health status
     */
    getModuleHealth(moduleName) {
        return {
            loaded: this.loadedModules.has(moduleName),
            preloaded: this.preloadedModules.has(moduleName),
            failed: this.failedModules.has(moduleName),
            retryCount: this.retryAttempts.get(moduleName) || 0,
            loadTime: this.performanceMetrics.loadTimes[moduleName] || null
        };
    }

    /**
     * Preload critical modules based on priority (integrated with ResourcePreloader)
     */
    async preloadCriticalModules() {
        // Check if ResourcePreloader is available and delegate to it
        if (window.ResourcePreloader) {
            console.log('🔄 Using ResourcePreloader for module preloading');
            return; // ResourcePreloader handles this more intelligently
        }
        
        // Fallback to basic module preloading
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
        
        console.log('🚀 Critical modules preloaded (fallback)');
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
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics() {
        const loadedCount = this.loadedModules.size;
        const preloadedCount = this.preloadedModules.size;
        const failedCount = this.failedModules.size;
        const totalLoadTime = Object.values(this.performanceMetrics.loadTimes).reduce((sum, time) => sum + time, 0);
        const averageLoadTime = loadedCount > 0 ? totalLoadTime / loadedCount : 0;
        const totalRetries = Array.from(this.retryAttempts.values()).reduce((sum, count) => sum + count, 0);

        return {
            loadedModules: Array.from(this.loadedModules),
            preloadedModules: Array.from(this.preloadedModules),
            failedModules: Array.from(this.failedModules),
            loadedCount,
            preloadedCount,
            failedCount,
            totalRetries,
            averageLoadTime: Math.round(averageLoadTime),
            totalLoadTime: Math.round(totalLoadTime),
            loadTimes: this.performanceMetrics.loadTimes,
            failures: this.performanceMetrics.failures,
            retries: this.performanceMetrics.retries,
            successRate: loadedCount > 0 ? Math.round((loadedCount / (loadedCount + failedCount)) * 100) : 0
        };
    }

    /**
     * Reset all metrics and caches
     */
    reset() {
        this.loadedModules.clear();
        this.preloadedModules.clear();
        this.failedModules.clear();
        this.retryAttempts.clear();
        this.dependencies.clear();
        
        this.performanceMetrics = {
            loadTimes: {},
            failures: {},
            retries: {}
        };
        
        console.log('🔄 ModuleLoader reset completed');
        this.eventBus.emit('moduleLoader', 'reset', {});
    }

    /**
     * Get system health overview
     */
    getSystemHealth() {
        const metrics = this.getPerformanceMetrics();
        const networkCondition = this.networkCondition;
        
        let healthStatus = 'excellent';
        if (metrics.failedCount > 0 || metrics.successRate < 95) {
            healthStatus = 'poor';
        } else if (metrics.averageLoadTime > 2000 || networkCondition === 'slow') {
            healthStatus = 'fair';
        } else if (metrics.averageLoadTime > 1000) {
            healthStatus = 'good';
        }
        
        return {
            status: healthStatus,
            networkCondition,
            metrics,
            recommendations: this.getHealthRecommendations(healthStatus, metrics)
        };
    }

    /**
     * Get health-based recommendations
     */
    getHealthRecommendations(healthStatus, metrics) {
        const recommendations = [];
        
        if (metrics.failedCount > 0) {
            recommendations.push('Consider checking network connectivity and module file availability');
        }
        
        if (metrics.averageLoadTime > 2000) {
            recommendations.push('Module load times are high - consider optimizing module sizes or implementing better caching');
        }
        
        if (metrics.totalRetries > 5) {
            recommendations.push('High retry count detected - investigate module stability issues');
        }
        
        if (this.networkCondition === 'slow') {
            recommendations.push('Slow network detected - preloading critical modules is recommended');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('System is performing optimally');
        }
        
        return recommendations;
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