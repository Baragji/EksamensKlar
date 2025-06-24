/**
 * Performance Optimization Utilities
 * Tools for lazy loading, asset optimization, and performance monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.observer = null;
        this.lazyImages = [];
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0
        };
        this.init();
    }

    /**
     * Initialize performance optimization
     */
    init() {
        this.measurePageLoad();
        this.setupLazyLoading();
        this.optimizeCSS();
        this.preloadCriticalResources();
        this.setupPerformanceMonitoring();
        this.optimizeForSlowDevice();
        this.optimizeMemory();
        this.adaptToConnection();
        this.setupAdvancedOptimizations();
        this.initializeModuleLoader();
        this.setupIntelligentPrefetching();
    }

    measurePageLoad() {
        // Measure page load performance
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            
            // Measure First Contentful Paint
            if ('getEntriesByType' in performance) {
                const paintMetrics = performance.getEntriesByType('paint');
                paintMetrics.forEach(metric => {
                    if (metric.name === 'first-contentful-paint') {
                        this.metrics.renderTime = metric.startTime;
                    }
                });
            }

            // Report performance if it's slow
            if (this.metrics.loadTime > 2000) {
                console.warn('⚠️ Slow page load detected:', this.metrics.loadTime + 'ms');
                this.optimizeForSlowDevice();
            }

            console.log('📊 Performance Metrics:', this.metrics);
        });
    }

    setupLazyLoading() {
        // Lazy load images and content
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            this.observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            // Find all lazy images
            this.lazyImages = document.querySelectorAll('img[data-src]');
            this.lazyImages.forEach(img => {
                this.observer.observe(img);
            });
        }
    }

    optimizeCSS() {
        // Remove unused CSS classes (simplified version)
        const usedClasses = new Set();
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            el.classList.forEach(className => {
                usedClasses.add(className);
            });
        });

        // Log unused classes for development
        if (window.location.hostname === 'localhost') {
            console.log('🎨 Used CSS classes:', usedClasses.size);
        }
    }

    preloadCriticalResources() {
        // Check if ResourcePreloader is available and use it
        if (window.ResourcePreloader) {
            console.log('🔄 Using ResourcePreloader for critical resources');
            return; // ResourcePreloader handles this more intelligently
        }
        
        // Fallback to basic preloading if ResourcePreloader is not available
        const criticalResources = [
            { href: 'styles/global.css', as: 'style' },
            { href: 'styles/components.css', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });

        console.log('🚀 Critical resources preloaded (fallback)');
    }

    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('⚠️ Long task detected:', entry.duration + 'ms');
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task observer not supported
            }
        }

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1048576);
                
                if (usedMemoryMB > 50) {
                    console.warn('⚠️ High memory usage:', usedMemoryMB + 'MB');
                    this.optimizeMemory();
                }
            }, 30000); // Check every 30 seconds
        }
    }

    optimizeForSlowDevice() {
        // Reduce animations and effects for slow devices
        document.body.classList.add('reduce-motion');
        
        // Add CSS to reduce animations
        if (!document.getElementById('performance-optimizations')) {
            const style = document.createElement('style');
            style.id = 'performance-optimizations';
            style.textContent = `
                .reduce-motion * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    optimizeMemory() {
        // Clean up unused objects and cache
        if ('gc' in window && typeof window.gc === 'function') {
            window.gc();
        }

        // Clear old localStorage entries
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('examklar-cache-')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item.timestamp && item.timestamp < oneWeekAgo) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Invalid JSON, remove it
                    localStorage.removeItem(key);
                }
            }
        });
    }

    // Compress and optimize data before storing
    compressData(data) {
        try {
            // Simple compression by removing whitespace from JSON
            return JSON.stringify(data);
        } catch (e) {
            return data;
        }
    }

    // Bundle size analyzer
    analyzeBundleSize() {
        let totalSize = 0;
        const files = [
            'styles/global.css',
            'styles/components.css',
            'core/app.js',
            'core/utils.js',
            'core/storage.js'
        ];

        files.forEach(async (file) => {
            try {
                // Skip fetch for file:// protocol
                if (window.location.protocol === 'file:') {
                    console.log(`📁 ${file}: Skipped (file:// protocol)`);
                    return;
                }
                
                const response = await fetch(file);
                const text = await response.text();
                const size = new Blob([text]).size;
                totalSize += size;
                console.log(`📁 ${file}: ${(size / 1024).toFixed(1)}KB`);
            } catch (e) {
                console.warn(`❌ Could not analyze ${file}`);
            }
        });

        setTimeout(() => {
            console.log(`📊 Total bundle size: ${(totalSize / 1024).toFixed(1)}KB`);
            if (totalSize > 200 * 1024) {
                console.warn('⚠️ Bundle size exceeds 200KB target');
            }
        }, 1000);
    }

    // Network-aware loading
    adaptToConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Load minimal content for slow connections
                this.optimizeForSlowDevice();
                console.log('📶 Slow connection detected, optimizing...');
            }

            // Listen for connection changes
            connection.addEventListener('change', () => {
                console.log('📶 Connection changed:', connection.effectiveType);
                if (connection.effectiveType === '4g') {
                    this.preloadNextModules();
                }
            });
        }
    }

    preloadNextModules() {
        // Preload likely next modules
        const moduleLinks = [
            'modules/content/index.html',
            'modules/flashcards/index.html',
            'modules/quiz/index.html',
            'modules/dashboard/index.html'
        ];

        moduleLinks.forEach(link => {
            const linkEl = document.createElement('link');
            linkEl.rel = 'prefetch';
            linkEl.href = link;
            document.head.appendChild(linkEl);
        });
    }

    // Public methods for manual optimization
    measureUserTiming(name, fn) {
        performance.mark(`${name}-start`);
        const result = fn();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = performance.getEntriesByName(name)[0];
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
        
        return result;
    }

    /**
     * Setup advanced performance optimizations
     */
    setupAdvancedOptimizations() {
        this.setupResourceHints();
        this.setupCriticalResourcePrioritization();
        this.setupAdaptiveLoading();
        this.setupPerformanceBudgets();
    }

    /**
     * Initialize module loader integration
     */
    initializeModuleLoader() {
        if (window.moduleLoader) {
            // Configure module loader with performance settings
            window.moduleLoader.setPerformanceConfig({
                maxConcurrentLoads: this.getOptimalConcurrency(),
                preloadThreshold: this.getPreloadThreshold(),
                networkAware: true
            });
        }
    }

    /**
     * Setup intelligent prefetching (integrated with ResourcePreloader)
     */
    setupIntelligentPrefetching() {
        // Check if ResourcePreloader is available and use it
        if (window.ResourcePreloader) {
            console.log('🔄 Using ResourcePreloader for intelligent prefetching');
            return; // ResourcePreloader handles this more intelligently
        }
        
        // Fallback to basic prefetching if ResourcePreloader is not available
        this.navigationPatterns = new Map();
        this.setupNavigationTracking();
        this.setupPredictivePrefetching();
        console.log('🚀 Intelligent prefetching setup (fallback)');
    }

    /**
     * Setup resource hints for better loading
     */
    setupResourceHints() {
        const head = document.head;
        
        // DNS prefetch for external resources
        const dnsPrefetch = [
            '//fonts.googleapis.com',
            '//cdn.jsdelivr.net'
        ];
        
        dnsPrefetch.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            head.appendChild(link);
        });

        // Preconnect to critical origins
        const preconnect = [
            'https://fonts.googleapis.com'
        ];
        
        preconnect.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            link.crossOrigin = 'anonymous';
            head.appendChild(link);
        });
    }

    /**
     * Setup critical resource prioritization
     */
    setupCriticalResourcePrioritization() {
        // Use Intersection Observer to prioritize visible content
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.prioritizeVisibleContent(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe all modules
            document.querySelectorAll('[data-module]').forEach(module => {
                observer.observe(module);
            });
        }
    }

    /**
     * Prioritize content that becomes visible
     */
    prioritizeVisibleContent(element) {
        const moduleName = element.dataset.module;
        if (moduleName && window.moduleLoader) {
            window.moduleLoader.prioritizeModule(moduleName);
        }

        // Preload related resources
        const relatedResources = element.querySelectorAll('[data-preload]');
        relatedResources.forEach(resource => {
            this.preloadResource(resource.dataset.preload);
        });
    }

    /**
     * Setup adaptive loading based on device capabilities
     */
    setupAdaptiveLoading() {
        const deviceCapabilities = this.assessDeviceCapabilities();
        
        // Adjust loading strategy based on device
        if (deviceCapabilities.isLowEnd) {
            this.enableLowEndOptimizations();
        } else if (deviceCapabilities.isHighEnd) {
            this.enableHighEndOptimizations();
        }
    }

    /**
     * Assess device capabilities
     */
    assessDeviceCapabilities() {
        const capabilities = {
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            connection: this.getConnectionInfo(),
            isLowEnd: false,
            isHighEnd: false
        };

        // Classify device
        capabilities.isLowEnd = capabilities.memory <= 2 || capabilities.cores <= 2;
        capabilities.isHighEnd = capabilities.memory >= 8 && capabilities.cores >= 8;

        return capabilities;
    }

    /**
     * Enable optimizations for low-end devices
     */
    enableLowEndOptimizations() {
        // Reduce concurrent requests
        this.maxConcurrentRequests = 2;
        
        // Disable non-essential features
        this.disableAnimations();
        this.reduceImageQuality();
        this.enableAggressiveCaching();
        
        console.log('🔧 Low-end device optimizations enabled');
    }

    /**
     * Enable optimizations for high-end devices
     */
    enableHighEndOptimizations() {
        // Increase concurrent requests
        this.maxConcurrentRequests = 8;
        
        // Enable advanced features
        this.enablePredictiveLoading();
        this.enableAdvancedCaching();
        
        console.log('🚀 High-end device optimizations enabled');
    }

    /**
     * Setup performance budgets
     */
    setupPerformanceBudgets() {
        this.budgets = {
            totalSize: 2 * 1024 * 1024, // 2MB
            loadTime: 3000, // 3 seconds
            renderTime: 1000, // 1 second
            interactionTime: 100 // 100ms
        };

        this.monitorBudgets();
    }

    /**
     * Monitor performance budgets
     */
    monitorBudgets() {
        // Monitor total page size
        if (window.bundleAnalyzer) {
            window.bundleAnalyzer.analyzeStaticAssets().then(analysis => {
                if (analysis.totalSize > this.budgets.totalSize) {
                    console.warn(`⚠️ Size budget exceeded: ${this.formatSize(analysis.totalSize)} > ${this.formatSize(this.budgets.totalSize)}`);
                    this.triggerSizeOptimization();
                }
            });
        }

        // Monitor load time
        if (this.metrics.loadTime > this.budgets.loadTime) {
            console.warn(`⚠️ Load time budget exceeded: ${this.metrics.loadTime}ms > ${this.budgets.loadTime}ms`);
            this.triggerLoadOptimization();
        }
    }

    /**
     * Setup navigation tracking for predictive loading
     */
    setupNavigationTracking() {
        // Track clicks on navigation elements
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link) {
                this.trackNavigation(window.location.pathname, link.getAttribute('href'));
            }
        });

        // Track module loads
        if (window.moduleLoader) {
            window.moduleLoader.onModuleLoad = (moduleName) => {
                this.trackModuleUsage(moduleName);
            };
        }
    }

    /**
     * Track navigation patterns
     */
    trackNavigation(from, to) {
        const pattern = `${from} -> ${to}`;
        const count = this.navigationPatterns.get(pattern) || 0;
        this.navigationPatterns.set(pattern, count + 1);

        // Store in localStorage for persistence
        const patterns = JSON.parse(localStorage.getItem('examklar-nav-patterns') || '{}');
        patterns[pattern] = (patterns[pattern] || 0) + 1;
        localStorage.setItem('examklar-nav-patterns', JSON.stringify(patterns));
    }

    /**
     * Setup predictive prefetching
     */
    setupPredictivePrefetching() {
        // Load stored navigation patterns
        const storedPatterns = JSON.parse(localStorage.getItem('examklar-nav-patterns') || '{}');
        Object.entries(storedPatterns).forEach(([pattern, count]) => {
            this.navigationPatterns.set(pattern, count);
        });

        // Predict and prefetch likely next pages
        this.predictAndPrefetch();
    }

    /**
     * Predict and prefetch likely next resources
     */
    predictAndPrefetch() {
        const currentPath = window.location.pathname;
        const predictions = [];

        // Find patterns starting from current path
        this.navigationPatterns.forEach((count, pattern) => {
            const [from, to] = pattern.split(' -> ');
            if (from === currentPath && count > 2) { // Only if visited more than twice
                predictions.push({ to, probability: count });
            }
        });

        // Sort by probability and prefetch top predictions
        predictions
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3) // Top 3 predictions
            .forEach(prediction => {
                this.prefetchPage(prediction.to);
            });
    }

    /**
     * Prefetch a page
     */
    prefetchPage(url) {
        // Only prefetch if on fast connection
        const connection = this.getConnectionInfo();
        if (connection.effectiveType === '4g' || connection.effectiveType === '3g') {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            
            console.log(`🔮 Prefetching predicted page: ${url}`);
        }
    }

    /**
     * Get optimal concurrency based on device and network
     */
    getOptimalConcurrency() {
        const connection = this.getConnectionInfo();
        const deviceCapabilities = this.assessDeviceCapabilities();
        
        if (deviceCapabilities.isLowEnd || connection.effectiveType === 'slow-2g') {
            return 2;
        } else if (connection.effectiveType === '4g' && deviceCapabilities.isHighEnd) {
            return 8;
        }
        
        return 4; // Default
    }

    /**
     * Get preload threshold based on connection
     */
    getPreloadThreshold() {
        const connection = this.getConnectionInfo();
        
        switch (connection.effectiveType) {
            case 'slow-2g': return 0; // No preloading
            case '2g': return 1;
            case '3g': return 3;
            case '4g': return 5;
            default: return 3;
        }
    }

    /**
     * Trigger size optimization when budget exceeded
     */
    triggerSizeOptimization() {
        // Enable aggressive compression
        if (window.cacheStrategy) {
            window.cacheStrategy.cacheConfig.compressionThreshold = 512; // Lower threshold
        }

        // Lazy load non-critical modules
        this.lazyLoadNonCriticalModules();
    }

    /**
     * Trigger load optimization when budget exceeded
     */
    triggerLoadOptimization() {
        // Reduce image quality
        this.reduceImageQuality();
        
        // Defer non-critical scripts
        this.deferNonCriticalScripts();
        
        // Enable service worker caching
        this.enableServiceWorkerCaching();
    }

    /**
     * Format file size for display
     */
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)}${units[unitIndex]}`;
    }

    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            };
        }
        return { effectiveType: 'unknown', downlink: 0 };
    }

    getPerformanceReport() {
        return {
            metrics: this.metrics,
            memoryUsage: 'memory' in performance ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            } : null,
            connection: 'connection' in navigator ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for global use
window.performanceOptimizer = performanceOptimizer;
