/**
 * Resource Preloading Performance Monitor
 * Tracks and analyzes the effectiveness of resource preloading strategies
 */

class PreloadMonitor {
    constructor() {
        this.metrics = {
            preloadHits: new Map(), // Resources that were preloaded and then used
            preloadMisses: new Map(), // Resources that were preloaded but not used
            cacheHits: new Map(), // Resources loaded from cache
            loadTimes: new Map(), // Resource load times
            connectionType: null,
            deviceType: null,
            startTime: performance.now()
        };
        
        this.observers = new Map();
        this.init();
    }

    init() {
        this.detectConnectionType();
        this.detectDeviceType();
        this.setupPerformanceObserver();
        this.setupResourceObserver();
        this.setupNavigationObserver();
        
        console.log('📊 Preload monitor initialized');
    }

    /**
     * Detect connection type for adaptive strategies
     */
    detectConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.connectionType = connection.effectiveType;
            
            connection.addEventListener('change', () => {
                this.metrics.connectionType = connection.effectiveType;
                this.logConnectionChange(connection.effectiveType);
            });
        }
    }

    /**
     * Detect device type for adaptive strategies
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Mobi|Android/i.test(userAgent)) {
            this.metrics.deviceType = 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            this.metrics.deviceType = 'tablet';
        } else {
            this.metrics.deviceType = 'desktop';
        }
    }

    /**
     * Setup performance observer to track resource loading
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.analyzeResourceEntry(entry);
                }
            });
            
            observer.observe({ entryTypes: ['resource', 'navigation'] });
            this.observers.set('performance', observer);
        }
    }

    /**
     * Setup resource observer to track preload effectiveness
     */
    setupResourceObserver() {
        // Track link preloads
        const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="modulepreload"], link[rel="prefetch"]');
        
        preloadLinks.forEach(link => {
            const url = link.href;
            const type = link.rel;
            
            link.addEventListener('load', () => {
                this.recordPreloadSuccess(url, type);
            });
            
            link.addEventListener('error', () => {
                this.recordPreloadError(url, type);
            });
        });
    }

    /**
     * Setup navigation observer to track page transitions
     */
    setupNavigationObserver() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordSessionEnd();
            } else {
                this.recordSessionStart();
            }
        });

        // Track beforeunload to save metrics
        window.addEventListener('beforeunload', () => {
            this.saveMetrics();
        });
    }

    /**
     * Analyze resource performance entry
     */
    analyzeResourceEntry(entry) {
        const url = entry.name;
        const loadTime = entry.responseEnd - entry.startTime;
        
        this.metrics.loadTimes.set(url, {
            loadTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            fromCache: entry.transferSize === 0 && entry.decodedBodySize > 0
        });

        // Check if resource was preloaded
        if (this.wasPreloaded(url)) {
            this.recordPreloadHit(url, loadTime);
        }

        // Check if loaded from cache
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            this.recordCacheHit(url);
        }
    }

    /**
     * Check if a resource was preloaded
     */
    wasPreloaded(url) {
        const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="modulepreload"], link[rel="prefetch"]');
        return Array.from(preloadLinks).some(link => link.href === url);
    }

    /**
     * Record successful preload usage
     */
    recordPreloadHit(url, loadTime) {
        this.metrics.preloadHits.set(url, {
            timestamp: performance.now(),
            loadTime,
            connectionType: this.metrics.connectionType
        });
        
        console.log(`🎯 Preload hit: ${this.getRelativeUrl(url)} (${loadTime.toFixed(2)}ms)`);
    }

    /**
     * Record preload that wasn't used
     */
    recordPreloadMiss(url) {
        this.metrics.preloadMisses.set(url, {
            timestamp: performance.now(),
            connectionType: this.metrics.connectionType
        });
        
        console.log(`❌ Preload miss: ${this.getRelativeUrl(url)}`);
    }

    /**
     * Record successful preload
     */
    recordPreloadSuccess(url, type) {
        console.log(`✅ Preload success: ${this.getRelativeUrl(url)} (${type})`);
    }

    /**
     * Record preload error
     */
    recordPreloadError(url, type) {
        console.warn(`❌ Preload error: ${this.getRelativeUrl(url)} (${type})`);
    }

    /**
     * Record cache hit
     */
    recordCacheHit(url) {
        this.metrics.cacheHits.set(url, {
            timestamp: performance.now(),
            connectionType: this.metrics.connectionType
        });
    }

    /**
     * Record session start
     */
    recordSessionStart() {
        this.metrics.sessionStart = performance.now();
    }

    /**
     * Record session end
     */
    recordSessionEnd() {
        this.metrics.sessionEnd = performance.now();
        this.generateReport();
    }

    /**
     * Log connection change
     */
    logConnectionChange(newType) {
        console.log(`📶 Connection changed to: ${newType}`);
    }

    /**
     * Generate performance report
     */
    generateReport() {
        const report = {
            summary: {
                totalPreloadHits: this.metrics.preloadHits.size,
                totalPreloadMisses: this.metrics.preloadMisses.size,
                totalCacheHits: this.metrics.cacheHits.size,
                preloadEfficiency: this.calculatePreloadEfficiency(),
                averageLoadTime: this.calculateAverageLoadTime(),
                connectionType: this.metrics.connectionType,
                deviceType: this.metrics.deviceType
            },
            details: {
                preloadHits: Array.from(this.metrics.preloadHits.entries()),
                preloadMisses: Array.from(this.metrics.preloadMisses.entries()),
                cacheHits: Array.from(this.metrics.cacheHits.entries()),
                loadTimes: Array.from(this.metrics.loadTimes.entries())
            },
            recommendations: this.generateRecommendations()
        };

        console.group('📊 Preload Performance Report');
        console.log('Summary:', report.summary);
        console.log('Recommendations:', report.recommendations);
        console.groupEnd();

        return report;
    }

    /**
     * Calculate preload efficiency
     */
    calculatePreloadEfficiency() {
        const hits = this.metrics.preloadHits.size;
        const misses = this.metrics.preloadMisses.size;
        const total = hits + misses;
        
        return total > 0 ? (hits / total * 100).toFixed(1) + '%' : '0%';
    }

    /**
     * Calculate average load time
     */
    calculateAverageLoadTime() {
        const loadTimes = Array.from(this.metrics.loadTimes.values());
        if (loadTimes.length === 0) return 0;
        
        const total = loadTimes.reduce((sum, entry) => sum + entry.loadTime, 0);
        return (total / loadTimes.length).toFixed(2) + 'ms';
    }

    /**
     * Generate optimization recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Check preload efficiency
        const efficiency = parseFloat(this.calculatePreloadEfficiency());
        if (efficiency < 70) {
            recommendations.push('Consider reducing preload scope - efficiency is below 70%');
        }
        
        // Check for slow connection
        if (this.metrics.connectionType === 'slow-2g' || this.metrics.connectionType === '2g') {
            recommendations.push('Reduce preloading on slow connections');
        }
        
        // Check for mobile device
        if (this.metrics.deviceType === 'mobile') {
            recommendations.push('Optimize preloading strategy for mobile devices');
        }
        
        // Check for unused preloads
        if (this.metrics.preloadMisses.size > this.metrics.preloadHits.size) {
            recommendations.push('Too many unused preloads - review preload strategy');
        }
        
        return recommendations;
    }

    /**
     * Save metrics to localStorage
     */
    saveMetrics() {
        try {
            const report = this.generateReport();
            localStorage.setItem('examklar_preload_metrics', JSON.stringify({
                timestamp: Date.now(),
                report
            }));
        } catch (error) {
            console.warn('Failed to save preload metrics:', error);
        }
    }

    /**
     * Load saved metrics
     */
    loadSavedMetrics() {
        try {
            const saved = localStorage.getItem('examklar_preload_metrics');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load preload metrics:', error);
            return null;
        }
    }

    /**
     * Get relative URL for logging
     */
    getRelativeUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname + urlObj.search;
        } catch {
            return url;
        }
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return this.metrics;
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.preloadHits.clear();
        this.metrics.preloadMisses.clear();
        this.metrics.cacheHits.clear();
        this.metrics.loadTimes.clear();
        localStorage.removeItem('examklar_preload_metrics');
        console.log('🧹 Preload metrics cleared');
    }

    /**
     * Cleanup observers
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        console.log('🔄 Preload monitor destroyed');
    }
}

// Global instance
window.PreloadMonitor = PreloadMonitor;

// Auto-initialize if enabled in config
if (window.PreloadConfig?.features?.enablePerformanceMonitoring) {
    window.preloadMonitor = new PreloadMonitor();
}

console.log('📊 Preload monitor loaded');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreloadMonitor;
}