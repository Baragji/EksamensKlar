/**
 * Lazy Loading Manager for EksamensKlar
 * Implements intelligent lazy loading for modules and resources
 * that are not critical for initial page load
 */

class LazyLoader {
    constructor(config) {
        this.config = config;
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.intersectionObserver = null;
        this.hoverTimeouts = new Map();
        this.moduleLoader = null;
        this.performanceMetrics = {
            lazyLoaded: 0,
            preloaded: 0,
            failed: 0,
            totalLoadTime: 0,
            averageLoadTime: 0
        };
        this.eventBus = window.EventBus || this.createFallbackEventBus();
        this.userBehavior = {
            scrollDirection: 'down',
            lastScrollY: 0,
            visitedSections: new Set(),
            hoverPatterns: new Map()
        };
    }
    
    /**
     * Create fallback event bus if not available
     */
    createFallbackEventBus() {
        return {
            emit: (namespace, event, data) => {
                console.log(`[LazyLoader] ${namespace}.${event}:`, data);
            },
            on: () => {},
            off: () => {}
        };
    }

    /**
     * Register module loader for coordinated loading
     */
    registerModuleLoader(moduleLoader) {
        this.moduleLoader = moduleLoader;
        console.log('✅ ModuleLoader registered with LazyLoader');
    }
    
    /**
     * Initialize lazy loading system
     */
    init() {
        this.setupIntersectionObserver();
        this.setupHoverPreloading();
        this.setupPredictivePreloading();
        this.markCriticalElementsForLazyLoading();
        
        console.log('🚀 LazyLoader initialized with options:', this.options);
        this.eventBus.emit('lazyLoader', 'initialized', this.options);
    }
    
    /**
     * Setup Intersection Observer for viewport-based lazy loading
     */
    setupIntersectionObserver() {
        if (!this.options.enableViewportPreload || !('IntersectionObserver' in window)) {
            console.warn('⚠️ Intersection Observer not available or disabled');
            return;
        }
        
        this.intersectionObserver = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
        
        console.log('👁️ Intersection Observer setup complete');
    }
    
    /**
     * Handle intersection observer entries
     */
    async handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const element = entry.target;
                const moduleName = element.dataset.lazyModule;
                const resourceUrl = element.dataset.lazyResource;
                
                if (moduleName) {
                    console.log(`👁️ Module '${moduleName}' entered viewport, lazy loading...`);
                    this.performanceMetrics.viewportLoads++;
                    await this.loadModule(moduleName, { trigger: 'viewport' });
                    this.intersectionObserver.unobserve(element);
                } else if (resourceUrl) {
                    console.log(`👁️ Resource '${resourceUrl}' entered viewport, lazy loading...`);
                    await this.loadResource(resourceUrl, { trigger: 'viewport' });
                    this.intersectionObserver.unobserve(element);
                }
            }
        }
    }
    
    /**
     * Setup hover-based preloading
     */
    setupHoverPreloading() {
        if (!this.options.enableHoverPreload) return;
        
        document.addEventListener('mouseover', (event) => {
            const element = event.target.closest('[data-lazy-module], [data-lazy-resource]');
            if (!element) return;
            
            const moduleName = element.dataset.lazyModule;
            const resourceUrl = element.dataset.lazyResource;
            
            if (moduleName && !this.preloadedModules.has(moduleName)) {
                this.scheduleHoverPreload(moduleName, element);
            } else if (resourceUrl && !this.preloadedModules.has(resourceUrl)) {
                this.scheduleHoverPreload(resourceUrl, element, true);
            }
        });
        
        document.addEventListener('mouseout', (event) => {
            const element = event.target.closest('[data-lazy-module], [data-lazy-resource]');
            if (!element) return;
            
            const moduleName = element.dataset.lazyModule || element.dataset.lazyResource;
            if (this.hoverTimeouts.has(moduleName)) {
                clearTimeout(this.hoverTimeouts.get(moduleName));
                this.hoverTimeouts.delete(moduleName);
            }
        });
        
        console.log('🖱️ Hover preloading setup complete');
    }
    
    /**
     * Schedule hover-based preloading with delay
     */
    scheduleHoverPreload(identifier, element, isResource = false) {
        const timeout = setTimeout(async () => {
            console.log(`🖱️ Hover preloading ${isResource ? 'resource' : 'module'}: ${identifier}`);
            this.performanceMetrics.hoverLoads++;
            
            if (isResource) {
                await this.preloadResource(identifier, { trigger: 'hover' });
            } else {
                await this.preloadModule(identifier, { trigger: 'hover' });
            }
            
            this.hoverTimeouts.delete(identifier);
        }, this.options.preloadDelay);
        
        this.hoverTimeouts.set(identifier, timeout);
    }
    
    /**
     * Setup predictive preloading based on user behavior
     */
    setupPredictivePreloading() {
        if (!this.options.enablePredictivePreload) return;
        
        // Preload likely next modules based on current page
        this.predictNextModules();
        
        // Setup scroll-based predictive loading
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScrollPrediction();
            }, 150);
        });
        
        console.log('🔮 Predictive preloading setup complete');
    }
    
    /**
     * Predict and preload likely next modules
     */
    predictNextModules() {
        const currentPath = window.location.pathname;
        const predictions = this.getPredictiveModules(currentPath);
        
        predictions.forEach(async (moduleName, index) => {
            // Stagger predictive loads to avoid overwhelming the network
            setTimeout(async () => {
                if (!this.preloadedModules.has(moduleName)) {
                    console.log(`🔮 Predictively preloading module: ${moduleName}`);
                    this.performanceMetrics.predictiveLoads++;
                    await this.preloadModule(moduleName, { trigger: 'predictive' });
                }
            }, index * 500);
        });
    }
    
    /**
     * Get predictive modules based on current path
     */
    getPredictiveModules(currentPath) {
        const predictions = {
            '/': ['dashboard', 'subjects'],
            '/index.html': ['dashboard', 'subjects'],
            '/modules/dashboard/': ['subjects', 'content', 'quiz'],
            '/modules/subjects/': ['content', 'flashcards', 'quiz'],
            '/modules/content/': ['flashcards', 'quiz', 'ai-assistant'],
            '/modules/quiz/': ['flashcards', 'content', 'advanced'],
            '/modules/flashcards/': ['quiz', 'content', 'advanced'],
            '/modules/onboarding/': ['dashboard', 'subjects']
        };
        
        return predictions[currentPath] || [];
    }
    
    /**
     * Handle scroll-based prediction
     */
    handleScrollPrediction() {
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        // If user has scrolled 70% down, preload likely next modules
        if (scrollPercentage > 70) {
            const nextModules = this.getPredictiveModules(window.location.pathname);
            nextModules.slice(0, 2).forEach(async (moduleName) => {
                if (!this.preloadedModules.has(moduleName)) {
                    console.log(`📜 Scroll-triggered preload: ${moduleName}`);
                    await this.preloadModule(moduleName, { trigger: 'scroll' });
                }
            });
        }
    }
    
    /**
     * Mark elements for lazy loading
     */
    markCriticalElementsForLazyLoading() {
        // Mark navigation links for lazy loading
        const navLinks = document.querySelectorAll('a[href*="modules/"]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const moduleName = this.extractModuleNameFromHref(href);
            if (moduleName) {
                link.dataset.lazyModule = moduleName;
                if (this.intersectionObserver) {
                    this.intersectionObserver.observe(link);
                }
            }
        });
        
        // Mark images for lazy loading
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.dataset.lazyResource = img.dataset.src;
            if (this.intersectionObserver) {
                this.intersectionObserver.observe(img);
            }
        });
        
        console.log(`🏷️ Marked ${navLinks.length} navigation links and ${images.length} images for lazy loading`);
    }
    
    /**
     * Extract module name from href
     */
    extractModuleNameFromHref(href) {
        const match = href.match(/modules\/([^/]+)/);
        return match ? match[1] : null;
    }
    
    /**
     * Lazy load a module
     */
    async loadModule(moduleName, options = {}) {
        if (this.loadedModules.has(moduleName)) {
            this.performanceMetrics.cacheHits++;
            console.log(`📦 Module '${moduleName}' already loaded (cache hit)`);
            return;
        }
        
        if (this.loadingPromises.has(moduleName)) {
            return await this.loadingPromises.get(moduleName);
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`🚀 Lazy loading module: ${moduleName}`);
            this.eventBus.emit('lazyLoader', 'module_load_start', { moduleName, ...options });
            
            let loadPromise;
            if (this.moduleLoader) {
                loadPromise = this.moduleLoader.loadModule(moduleName, options);
            } else {
                loadPromise = this.fallbackModuleLoad(moduleName);
            }
            
            this.loadingPromises.set(moduleName, loadPromise);
            
            await loadPromise;
            
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
            
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.loadTimes[moduleName] = loadTime;
            this.performanceMetrics.lazyLoads++;
            
            console.log(`✅ Module '${moduleName}' lazy loaded in ${loadTime.toFixed(2)}ms`);
            this.eventBus.emit('lazyLoader', 'module_loaded', { moduleName, loadTime, ...options });
            
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Failed to lazy load module '${moduleName}':`, error);
            this.eventBus.emit('lazyLoader', 'module_load_failed', { moduleName, error: error.message, ...options });
            throw error;
        }
    }
    
    /**
     * Preload a module without executing it
     */
    async preloadModule(moduleName, options = {}) {
        if (this.preloadedModules.has(moduleName) || this.loadedModules.has(moduleName)) {
            return;
        }
        
        try {
            console.log(`⚡ Preloading module: ${moduleName}`);
            this.eventBus.emit('lazyLoader', 'module_preload_start', { moduleName, ...options });
            
            // Use moduleLoader's preload functionality if available
            if (this.moduleLoader && this.moduleLoader.preloadModule) {
                await this.moduleLoader.preloadModule(moduleName);
            } else {
                await this.fallbackModulePreload(moduleName);
            }
            
            this.preloadedModules.add(moduleName);
            this.performanceMetrics.preloads++;
            
            console.log(`✅ Module '${moduleName}' preloaded`);
            this.eventBus.emit('lazyLoader', 'module_preloaded', { moduleName, ...options });
            
        } catch (error) {
            console.error(`❌ Failed to preload module '${moduleName}':`, error);
            this.eventBus.emit('lazyLoader', 'module_preload_failed', { moduleName, error: error.message, ...options });
        }
    }
    
    /**
     * Lazy load a resource (image, CSS, etc.)
     */
    async loadResource(resourceUrl, options = {}) {
        try {
            console.log(`🖼️ Lazy loading resource: ${resourceUrl}`);
            
            if (resourceUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                await this.loadImage(resourceUrl);
            } else if (resourceUrl.match(/\.css$/i)) {
                await this.loadCSS(resourceUrl);
            } else if (resourceUrl.match(/\.js$/i)) {
                await this.loadScript(resourceUrl);
            }
            
            console.log(`✅ Resource loaded: ${resourceUrl}`);
            this.eventBus.emit('lazyLoader', 'resource_loaded', { resourceUrl, ...options });
            
        } catch (error) {
            console.error(`❌ Failed to load resource '${resourceUrl}':`, error);
            this.eventBus.emit('lazyLoader', 'resource_load_failed', { resourceUrl, error: error.message, ...options });
        }
    }
    
    /**
     * Preload a resource
     */
    async preloadResource(resourceUrl, options = {}) {
        if (this.preloadedModules.has(resourceUrl)) {
            return;
        }
        
        try {
            console.log(`⚡ Preloading resource: ${resourceUrl}`);
            
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resourceUrl;
            
            if (resourceUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                link.as = 'image';
            } else if (resourceUrl.match(/\.css$/i)) {
                link.as = 'style';
            } else if (resourceUrl.match(/\.js$/i)) {
                link.as = 'script';
            }
            
            document.head.appendChild(link);
            this.preloadedModules.add(resourceUrl);
            
            console.log(`✅ Resource preloaded: ${resourceUrl}`);
            this.eventBus.emit('lazyLoader', 'resource_preloaded', { resourceUrl, ...options });
            
        } catch (error) {
            console.error(`❌ Failed to preload resource '${resourceUrl}':`, error);
        }
    }
    
    /**
     * Load image with lazy loading
     */
    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }
    
    /**
     * Load CSS file
     */
    async loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load JavaScript file
     */
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Fallback module loading without ModuleLoader
     */
    async fallbackModuleLoad(moduleName) {
        const moduleConfig = {
            js: `./modules/${moduleName}/${moduleName}.js`,
            css: `./modules/${moduleName}/${moduleName}.css`,
            html: `./modules/${moduleName}/index.html`
        };
        
        // Load CSS first
        try {
            await this.loadCSS(moduleConfig.css);
        } catch (error) {
            console.warn(`⚠️ CSS not found for module '${moduleName}':`, error.message);
        }
        
        // Load JavaScript
        try {
            await this.loadScript(moduleConfig.js);
        } catch (error) {
            console.warn(`⚠️ JS not found for module '${moduleName}':`, error.message);
        }
    }
    
    /**
     * Fallback module preloading
     */
    async fallbackModulePreload(moduleName) {
        const moduleConfig = {
            js: `./modules/${moduleName}/${moduleName}.js`,
            css: `./modules/${moduleName}/${moduleName}.css`
        };
        
        // Preload CSS
        try {
            await this.preloadResource(moduleConfig.css);
        } catch (error) {
            console.warn(`⚠️ Could not preload CSS for module '${moduleName}':`, error.message);
        }
        
        // Preload JavaScript
        try {
            await this.preloadResource(moduleConfig.js);
        } catch (error) {
            console.warn(`⚠️ Could not preload JS for module '${moduleName}':`, error.message);
        }
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this.performanceMetrics,
            loadedModules: Array.from(this.loadedModules),
            preloadedModules: Array.from(this.preloadedModules),
            totalModules: this.loadedModules.size + this.preloadedModules.size
        };
    }
    
    /**
     * Generate performance report
     */
    generateReport() {
        const metrics = this.getMetrics();
        const report = {
            summary: {
                totalLazyLoads: metrics.lazyLoads,
                totalPreloads: metrics.preloads,
                cacheHitRate: metrics.cacheHits / (metrics.lazyLoads || 1) * 100,
                averageLoadTime: Object.values(metrics.loadTimes).reduce((a, b) => a + b, 0) / Object.keys(metrics.loadTimes).length || 0
            },
            breakdown: {
                viewportLoads: metrics.viewportLoads,
                hoverLoads: metrics.hoverLoads,
                predictiveLoads: metrics.predictiveLoads
            },
            loadTimes: metrics.loadTimes,
            recommendations: this.generateRecommendations(metrics)
        };
        
        console.log('📊 LazyLoader Performance Report:', report);
        return report;
    }
    
    /**
     * Generate performance recommendations
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.cacheHits / (metrics.lazyLoads || 1) < 0.3) {
            recommendations.push('Consider increasing preload aggressiveness for better cache hit rate');
        }
        
        const avgLoadTime = Object.values(metrics.loadTimes).reduce((a, b) => a + b, 0) / Object.keys(metrics.loadTimes).length || 0;
        if (avgLoadTime > 500) {
            recommendations.push('Module load times are high, consider optimizing module sizes');
        }
        
        if (metrics.hoverLoads < metrics.viewportLoads * 0.1) {
            recommendations.push('Hover preloading is underutilized, consider improving hover targets');
        }
        
        return recommendations;
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
        this.hoverTimeouts.clear();
        
        console.log('🧹 LazyLoader destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
} else {
    window.LazyLoader = LazyLoader;
}