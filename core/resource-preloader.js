/**
 * Smart Resource Preloader
 * Optimizes resource loading based on user behavior, connection speed, and priority
 */
class ResourcePreloader {
    constructor(config = {}, monitor = null) {
        this.config = config;
        this.monitor = monitor;
        this.preloadedResources = new Map();
        this.preloadQueue = [];
        this.isPreloading = false;
        this.connectionInfo = this.getConnectionInfo();
        this.userBehavior = {
            visitedPages: new Set(),
            moduleUsage: new Map(),
            sessionStartTime: Date.now()
        };
        this.preloadStrategies = {
            critical: { priority: 1, immediate: true },
            important: { priority: 2, immediate: false },
            optional: { priority: 3, immediate: false },
            lazy: { priority: 4, immediate: false }
        };
        
        this.init();
    }

    /**
     * Initialize the preloader
     */
    init() {
        this.setupConnectionMonitoring();
        this.setupUserBehaviorTracking();
        this.preloadCriticalResources();
        this.setupIntelligentPreloading();
        
        console.log('[ResourcePreloader] Initialized with connection:', this.connectionInfo.effectiveType);
    }

    /**
     * Get current connection information
     */
    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 0,
            rtt: connection?.rtt || 0,
            saveData: connection?.saveData || false,
            isFast: this.isFastConnection(connection)
        };
    }

    /**
     * Determine if connection is fast enough for aggressive preloading
     */
    isFastConnection(connection) {
        if (!connection) return true; // Assume fast if unknown
        
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        if (connection.saveData) return false;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
        if (downlink && downlink < 1.5) return false;
        
        return true;
    }

    /**
     * Setup connection monitoring
     */
    setupConnectionMonitoring() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            connection.addEventListener('change', () => {
                this.connectionInfo = this.getConnectionInfo();
                this.adjustPreloadingStrategy();
                console.log('[ResourcePreloader] Connection changed:', this.connectionInfo.effectiveType);
            });
        }
    }

    /**
     * Setup user behavior tracking
     */
    setupUserBehaviorTracking() {
        // Track page visits
        this.userBehavior.visitedPages.add(window.location.pathname);
        
        // Track module usage
        document.addEventListener('moduleLoaded', (event) => {
            const moduleName = event.detail.moduleName;
            const usage = this.userBehavior.moduleUsage.get(moduleName) || 0;
            this.userBehavior.moduleUsage.set(moduleName, usage + 1);
        });
        
        // Track user interactions for predictive preloading
        this.setupPredictivePreloading();
    }

    /**
     * Preload critical resources immediately
     */
    async preloadCriticalResources() {
        const criticalResources = [
            { url: 'styles/global.css', type: 'style', strategy: 'critical' },
            { url: 'styles/components.css', type: 'style', strategy: 'critical' },
            { url: 'core/app.js', type: 'script', strategy: 'critical' },
            { url: 'core/module-loader.js', type: 'script', strategy: 'critical' }
        ];

        for (const resource of criticalResources) {
            await this.preloadResource(resource);
        }
    }

    /**
     * Preload a resource with intelligent strategy
     */
    async preloadResource(resource) {
        const { url, type, strategy = 'important', priority = 2 } = resource;
        
        // Check if already preloaded
        if (this.preloadedResources.has(url)) {
            return this.preloadedResources.get(url);
        }

        // Check connection constraints
        if (!this.shouldPreload(strategy)) {
            console.log(`[ResourcePreloader] Skipping ${url} due to connection constraints`);
            return null;
        }

        const startTime = performance.now();
        const preloadPromise = this.createPreloadPromise(url, type);
        this.preloadedResources.set(url, preloadPromise);
        
        try {
            await preloadPromise;
            const loadTime = performance.now() - startTime;
            
            // Track preload success with monitor
            if (this.monitor) {
                this.monitor.trackPreload(url, type, true, loadTime);
            }
            
            console.log(`[ResourcePreloader] ✅ Preloaded: ${url}`);
            return preloadPromise;
        } catch (error) {
            const loadTime = performance.now() - startTime;
            
            // Track preload failure with monitor
            if (this.monitor) {
                this.monitor.trackPreload(url, type, false, loadTime);
            }
            
            console.warn(`[ResourcePreloader] ❌ Failed to preload ${url}:`, error);
            this.preloadedResources.delete(url);
            return null;
        }
    }

    /**
     * Create preload promise for a resource
     */
    createPreloadPromise(url, type) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            
            // Set appropriate preload type
            switch (type) {
                case 'style':
                    link.rel = 'preload';
                    link.as = 'style';
                    break;
                case 'script':
                    link.rel = 'modulepreload';
                    break;
                case 'font':
                    link.rel = 'preload';
                    link.as = 'font';
                    link.crossOrigin = 'anonymous';
                    break;
                case 'image':
                    link.rel = 'preload';
                    link.as = 'image';
                    break;
                default:
                    link.rel = 'prefetch';
            }
            
            link.href = url;
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to preload ${url}`));
            
            document.head.appendChild(link);
        });
    }

    /**
     * Check if resource should be preloaded based on strategy and connection
     */
    shouldPreload(strategy) {
        const strategyConfig = this.preloadStrategies[strategy];
        if (!strategyConfig) return false;

        // Always preload critical resources
        if (strategy === 'critical') return true;
        
        // Check connection constraints
        if (!this.connectionInfo.isFast && strategy !== 'important') {
            return false;
        }
        
        // Check save data preference
        if (this.connectionInfo.saveData && strategy !== 'critical') {
            return false;
        }
        
        return true;
    }

    /**
     * Setup intelligent preloading based on user behavior
     */
    setupIntelligentPreloading() {
        // Preload modules based on usage patterns
        this.scheduleIntelligentPreloading();
        
        // Setup hover-based preloading
        this.setupHoverPreloading();
        
        // Setup viewport-based preloading
        this.setupViewportPreloading();
    }

    /**
     * Schedule intelligent preloading based on patterns
     */
    scheduleIntelligentPreloading() {
        // Wait for initial load to complete
        setTimeout(() => {
            this.preloadBasedOnUsage();
        }, 2000);
        
        // Periodic optimization
        setInterval(() => {
            this.optimizePreloadQueue();
        }, 30000);
    }

    /**
     * Preload resources based on usage patterns
     */
    async preloadBasedOnUsage() {
        const frequentModules = Array.from(this.userBehavior.moduleUsage.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([module]) => module);

        for (const moduleName of frequentModules) {
            await this.preloadModuleResources(moduleName);
        }
    }

    /**
     * Preload resources for a specific module
     */
    async preloadModuleResources(moduleName) {
        const moduleConfig = this.getModuleConfig(moduleName);
        if (!moduleConfig) return;

        const resources = [];
        
        if (moduleConfig.css) {
            resources.push({ url: moduleConfig.css, type: 'style', strategy: 'important' });
        }
        
        if (moduleConfig.js) {
            resources.push({ url: moduleConfig.js, type: 'script', strategy: 'important' });
        }

        for (const resource of resources) {
            await this.preloadResource(resource);
        }
    }

    /**
     * Get module configuration (placeholder - should integrate with actual module loader)
     */
    getModuleConfig(moduleName) {
        // This should integrate with the actual ModuleLoader
        const configs = {
            'subjects': { css: 'modules/subjects/subjects.css', js: 'modules/subjects/subjects.js' },
            'content': { css: 'modules/content/content.css', js: 'modules/content/content.js' },
            'dashboard': { css: 'modules/dashboard/dashboard.css', js: 'modules/dashboard/dashboard.js' },
            'flashcards': { css: 'modules/flashcards/flashcards.css', js: 'modules/flashcards/flashcards.js' },
            'quiz': { css: 'modules/quiz/quiz.css', js: 'modules/quiz/quiz.js' }
        };
        
        return configs[moduleName];
    }

    /**
     * Setup hover-based preloading
     */
    setupHoverPreloading() {
        let hoverTimeout;
        
        document.addEventListener('mouseover', (event) => {
            const target = event.target.closest('[data-module]');
            if (!target) return;
            
            const moduleName = target.dataset.module;
            if (!moduleName) return;
            
            // Debounce hover events
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                this.preloadModuleResources(moduleName);
            }, 100);
        });
    }

    /**
     * Setup viewport-based preloading
     */
    setupViewportPreloading() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const moduleName = entry.target.dataset.preloadModule;
                    if (moduleName) {
                        this.preloadModuleResources(moduleName);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        // Observe elements with preload-module attribute
        document.querySelectorAll('[data-preload-module]').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Setup predictive preloading based on user patterns
     */
    setupPredictivePreloading() {
        // Track navigation patterns
        const navigationPatterns = new Map();
        
        // Track clicks and predict next actions
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-module], [href]');
            if (!target) return;
            
            const currentPage = window.location.pathname;
            const targetModule = target.dataset.module || target.getAttribute('href');
            
            if (targetModule) {
                const pattern = navigationPatterns.get(currentPage) || new Map();
                const count = pattern.get(targetModule) || 0;
                pattern.set(targetModule, count + 1);
                navigationPatterns.set(currentPage, pattern);
                
                // Predict and preload likely next resources
                this.predictAndPreload(navigationPatterns, currentPage);
            }
        });
    }

    /**
     * Predict and preload likely next resources
     */
    async predictAndPreload(patterns, currentPage) {
        const pagePatterns = patterns.get(currentPage);
        if (!pagePatterns) return;
        
        // Get most likely next destinations
        const predictions = Array.from(pagePatterns.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2); // Top 2 predictions
        
        for (const [target] of predictions) {
            if (target.startsWith('#') || target.includes('module')) {
                // It's a module
                const moduleName = target.replace('#', '').replace('module-', '');
                await this.preloadModuleResources(moduleName);
            }
        }
    }

    /**
     * Adjust preloading strategy based on connection changes
     */
    adjustPreloadingStrategy() {
        if (!this.connectionInfo.isFast) {
            // Clear non-critical preloads on slow connection
            this.clearNonCriticalPreloads();
            console.log('[ResourcePreloader] Adjusted to conservative preloading');
        } else {
            // Resume aggressive preloading on fast connection
            this.resumeAggressivePreloading();
            console.log('[ResourcePreloader] Resumed aggressive preloading');
        }
    }

    /**
     * Clear non-critical preloaded resources
     */
    clearNonCriticalPreloads() {
        const criticalUrls = [
            'styles/global.css',
            'styles/components.css',
            'core/app.js',
            'core/module-loader.js'
        ];
        
        for (const [url] of this.preloadedResources) {
            if (!criticalUrls.includes(url)) {
                this.preloadedResources.delete(url);
                // Remove preload links
                const links = document.querySelectorAll(`link[href="${url}"]`);
                links.forEach(link => {
                    if (link.rel === 'preload' || link.rel === 'prefetch' || link.rel === 'modulepreload') {
                        link.remove();
                    }
                });
            }
        }
    }

    /**
     * Resume aggressive preloading
     */
    resumeAggressivePreloading() {
        this.preloadBasedOnUsage();
    }

    /**
     * Optimize preload queue
     */
    optimizePreloadQueue() {
        // Remove unused preloads
        this.removeUnusedPreloads();
        
        // Preload based on current context
        this.contextualPreload();
    }

    /**
     * Remove unused preloaded resources
     */
    removeUnusedPreloads() {
        const unusedThreshold = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        
        for (const [url] of this.preloadedResources) {
            // Check if resource was actually used
            const links = document.querySelectorAll(`link[href="${url}"], script[src="${url}"]`);
            const hasActiveReference = Array.from(links).some(link => 
                link.rel !== 'preload' && link.rel !== 'prefetch' && link.rel !== 'modulepreload'
            );
            
            if (!hasActiveReference) {
                // Remove if not used within threshold
                this.preloadedResources.delete(url);
                links.forEach(link => {
                    if (link.rel === 'preload' || link.rel === 'prefetch' || link.rel === 'modulepreload') {
                        link.remove();
                    }
                });
            }
        }
    }

    /**
     * Contextual preloading based on current page/module
     */
    async contextualPreload() {
        const currentPath = window.location.pathname;
        const activeModule = document.querySelector('.module.active')?.dataset.module;
        
        // Preload related resources based on context
        if (activeModule) {
            const relatedModules = this.getRelatedModules(activeModule);
            for (const moduleName of relatedModules) {
                await this.preloadModuleResources(moduleName);
            }
        }
    }

    /**
     * Get related modules for contextual preloading
     */
    getRelatedModules(currentModule) {
        const relationships = {
            'subjects': ['content', 'flashcards'],
            'content': ['flashcards', 'quiz'],
            'dashboard': ['subjects', 'content'],
            'flashcards': ['quiz', 'content'],
            'quiz': ['flashcards', 'content']
        };
        
        return relationships[currentModule] || [];
    }

    /**
     * Mark resource as used (call this when resource is actually loaded)
     */
    markResourceUsed(url) {
        if (this.preloadedResources.has(url)) {
            const resource = this.preloadedResources.get(url);
            if (resource && typeof resource === 'object' && !resource.used) {
                resource.used = true;
                
                // Track cache hit with monitor
                if (this.monitor) {
                    this.monitor.trackCacheHit(url, true);
                }
            }
        } else {
            // Track cache miss with monitor
            if (this.monitor) {
                this.monitor.trackCacheHit(url, false);
            }
        }
    }

    /**
     * Utility method to check if resource was preloaded
     */
    wasPreloaded(url) {
        return this.preloadedResources.has(url);
    }

    /**
     * Get preloading statistics
     */
    getStats() {
        return {
            preloadedCount: this.preloadedResources.size,
            preloadedResources: Array.from(this.preloadedResources.keys()),
            connectionInfo: this.connectionInfo,
            userBehavior: {
                visitedPages: Array.from(this.userBehavior.visitedPages),
                moduleUsage: Object.fromEntries(this.userBehavior.moduleUsage),
                sessionDuration: Date.now() - this.userBehavior.sessionStartTime
            }
        };
    }

    /**
     * Force cleanup of all preloaded resources
     */
    cleanup() {
        this.preloadedResources.clear();
        
        // Remove all preload links
        const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"]');
        preloadLinks.forEach(link => link.remove());
        
        console.log('[ResourcePreloader] Cleaned up all preloaded resources');
    }
}

// Initialize global resource preloader
if (typeof window !== 'undefined') {
    window.resourcePreloader = new ResourcePreloader();
    
    // Expose debugging methods
    window.getPreloadStats = () => window.resourcePreloader.getStats();
    window.cleanupPreloads = () => window.resourcePreloader.cleanup();
    
    console.log('[ResourcePreloader] Initialized successfully');
}

export default ResourcePreloader;