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

    init() {
        this.measurePageLoad();
        this.setupLazyLoading();
        this.optimizeCSS();
        this.preloadCriticalResources();
        this.setupPerformanceMonitoring();
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
        // Preload critical fonts and resources
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
