/**
 * Performance Monitor Service
 * Tracks application performance metrics, errors, and resource usage
 */

class PerformanceMonitor {
    constructor(config = {}) {
        this.config = {
            enableMetrics: true,
            enableErrorTracking: true,
            enableResourceMonitoring: true,
            enableUserTiming: true,
            sampleRate: 1.0, // 100% sampling by default
            bufferSize: 100,
            flushInterval: 30000, // 30 seconds
            endpoint: '/api/analytics',
            ...config
        };

        this.metrics = [];
        this.errors = [];
        this.resources = [];
        this.userTimings = [];
        this.sessionId = this.generateSessionId();
        this.startTime = performance.now();
        this.isInitialized = false;

        this.init();
    }

    /**
     * Initialize the performance monitor
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.setupPerformanceObserver();
            this.setupErrorTracking();
            this.setupResourceMonitoring();
            this.setupUserTimingTracking();
            this.setupPageVisibilityTracking();
            this.setupMemoryTracking();
            this.startPeriodicFlush();

            this.isInitialized = true;
            this.trackEvent('performance_monitor_initialized', {
                sessionId: this.sessionId,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to initialize PerformanceMonitor:', error);
        }
    }

    /**
     * Setup Performance Observer for various metrics
     */
    setupPerformanceObserver() {
        if (!window.PerformanceObserver) return;

        // Navigation timing
        try {
            const navObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackNavigationTiming(entry);
                }
            });
            navObserver.observe({ entryTypes: ['navigation'] });
        } catch (e) {
            console.warn('Navigation timing not supported');
        }

        // Paint timing
        try {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackPaintTiming(entry);
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.warn('Paint timing not supported');
        }

        // Largest Contentful Paint
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.trackMetric('largest_contentful_paint', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('LCP timing not supported');
        }

        // First Input Delay
        try {
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackMetric('first_input_delay', entry.processingStart - entry.startTime);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('FID timing not supported');
        }

        // Layout Shift
        try {
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.trackMetric('cumulative_layout_shift', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('CLS timing not supported');
        }
    }

    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        if (!this.config.enableErrorTracking) return;

        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.trackError({
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * Setup resource monitoring
     */
    setupResourceMonitoring() {
        if (!this.config.enableResourceMonitoring) return;

        if (window.PerformanceObserver) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackResource({
                            name: entry.name,
                            type: entry.initiatorType,
                            size: entry.transferSize,
                            duration: entry.duration,
                            startTime: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Resource timing not supported');
            }
        }
    }

    /**
     * Setup user timing tracking
     */
    setupUserTimingTracking() {
        if (!this.config.enableUserTiming) return;

        if (window.PerformanceObserver) {
            try {
                const userTimingObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackUserTiming({
                            name: entry.name,
                            type: entry.entryType,
                            duration: entry.duration,
                            startTime: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                });
                userTimingObserver.observe({ entryTypes: ['measure', 'mark'] });
            } catch (e) {
                console.warn('User timing not supported');
            }
        }
    }

    /**
     * Setup page visibility tracking
     */
    setupPageVisibilityTracking() {
        let visibilityStart = Date.now();

        document.addEventListener('visibilitychange', () => {
            const now = Date.now();
            if (document.hidden) {
                this.trackEvent('page_hidden', {
                    visibleDuration: now - visibilityStart,
                    timestamp: now
                });
            } else {
                visibilityStart = now;
                this.trackEvent('page_visible', {
                    timestamp: now
                });
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload', {
                sessionDuration: Date.now() - this.startTime,
                timestamp: Date.now()
            });
            this.flush(); // Send remaining data
        });
    }

    /**
     * Setup memory tracking
     */
    setupMemoryTracking() {
        if (!performance.memory) return;

        setInterval(() => {
            this.trackMetric('memory_used', performance.memory.usedJSHeapSize);
            this.trackMetric('memory_total', performance.memory.totalJSHeapSize);
            this.trackMetric('memory_limit', performance.memory.jsHeapSizeLimit);
        }, 10000); // Every 10 seconds
    }

    /**
     * Track navigation timing
     */
    trackNavigationTiming(entry) {
        const metrics = {
            dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcp_connect: entry.connectEnd - entry.connectStart,
            ssl_negotiation: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
            request_time: entry.responseStart - entry.requestStart,
            response_time: entry.responseEnd - entry.responseStart,
            dom_processing: entry.domComplete - entry.domLoading,
            load_complete: entry.loadEventEnd - entry.loadEventStart,
            total_time: entry.loadEventEnd - entry.navigationStart
        };

        Object.entries(metrics).forEach(([key, value]) => {
            if (value >= 0) {
                this.trackMetric(`navigation_${key}`, value);
            }
        });
    }

    /**
     * Track paint timing
     */
    trackPaintTiming(entry) {
        this.trackMetric(entry.name.replace('-', '_'), entry.startTime);
    }

    /**
     * Track a performance metric
     */
    trackMetric(name, value, tags = {}) {
        if (!this.config.enableMetrics) return;
        if (Math.random() > this.config.sampleRate) return;

        this.metrics.push({
            name,
            value,
            tags: {
                sessionId: this.sessionId,
                userAgent: navigator.userAgent,
                url: window.location.href,
                ...tags
            },
            timestamp: Date.now()
        });

        this.checkBufferSize();
    }

    /**
     * Track an error
     */
    trackError(errorData) {
        if (!this.config.enableErrorTracking) return;

        this.errors.push({
            ...errorData,
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        this.checkBufferSize();
    }

    /**
     * Track a resource
     */
    trackResource(resourceData) {
        if (!this.config.enableResourceMonitoring) return;

        this.resources.push({
            ...resourceData,
            sessionId: this.sessionId
        });

        this.checkBufferSize();
    }

    /**
     * Track user timing
     */
    trackUserTiming(timingData) {
        if (!this.config.enableUserTiming) return;

        this.userTimings.push({
            ...timingData,
            sessionId: this.sessionId
        });

        this.checkBufferSize();
    }

    /**
     * Track a custom event
     */
    trackEvent(eventName, eventData = {}) {
        this.trackMetric(`event_${eventName}`, 1, eventData);
    }

    /**
     * Mark a custom timing point
     */
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
        }
    }

    /**
     * Measure time between two marks
     */
    measure(name, startMark, endMark) {
        if (performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
            } catch (e) {
                console.warn(`Failed to measure ${name}:`, e);
            }
        }
    }

    /**
     * Check if buffer size limit is reached
     */
    checkBufferSize() {
        const totalItems = this.metrics.length + this.errors.length + 
                          this.resources.length + this.userTimings.length;
        
        if (totalItems >= this.config.bufferSize) {
            this.flush();
        }
    }

    /**
     * Start periodic flush
     */
    startPeriodicFlush() {
        setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    /**
     * Flush all collected data
     */
    async flush() {
        if (this.metrics.length === 0 && this.errors.length === 0 && 
            this.resources.length === 0 && this.userTimings.length === 0) {
            return;
        }

        const payload = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            metrics: [...this.metrics],
            errors: [...this.errors],
            resources: [...this.resources],
            userTimings: [...this.userTimings]
        };

        // Clear buffers
        this.metrics = [];
        this.errors = [];
        this.resources = [];
        this.userTimings = [];

        try {
            await this.sendData(payload);
        } catch (error) {
            console.error('Failed to send analytics data:', error);
        }
    }

    /**
     * Send data to analytics endpoint
     */
    async sendData(payload) {
        if (!this.config.endpoint) {
            console.log('Analytics data (no endpoint configured):', payload);
            return;
        }

        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            // Use sendBeacon as fallback for page unload
            if (navigator.sendBeacon) {
                navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
            }
            throw error;
        }
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            sessionId: this.sessionId,
            loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : null,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : null,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            timestamp: Date.now()
        };
    }

    /**
     * Destroy the performance monitor
     */
    destroy() {
        this.flush();
        this.isInitialized = false;
    }
}

export default PerformanceMonitor;