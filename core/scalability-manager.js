/**
 * Enterprise Scalability Manager
 * Implementerer scalability forbedringer, load balancing og resource optimization
 */

class ScalabilityManager {
    constructor() {
        this.resourcePool = new Map();
        this.loadMetrics = {
            cpu: [],
            memory: [],
            network: [],
            storage: []
        };
        this.thresholds = {
            cpu: 80, // 80% CPU usage
            memory: 85, // 85% memory usage
            network: 90, // 90% network capacity
            storage: 90 // 90% storage capacity
        };
        this.optimizationStrategies = new Map();
        this.connectionPool = new Map();
        this.requestQueue = [];
        this.maxConcurrentRequests = 10;
        this.currentRequests = 0;
        
        this.init();
    }

    async init() {
        await this.setupResourceMonitoring();
        this.setupLoadBalancing();
        this.setupCaching();
        this.setupConnectionPooling();
        this.setupRequestQueuing();
        this.setupAutoScaling();
        this.setupResourceOptimization();
        
        console.log('📈 Scalability Manager initialized with enterprise-level optimization');
        
        if (window.AuditLogger) {
            window.AuditLogger.log('SYSTEM', 'Scalability Manager initialized', {
                maxConcurrentRequests: this.maxConcurrentRequests,
                thresholds: this.thresholds
            });
        }
    }

    // Resource Monitoring
    async setupResourceMonitoring() {
        // Monitor performance metrics
        setInterval(() => {
            this.collectMetrics();
        }, 5000); // Every 5 seconds
        
        // Monitor network conditions
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        }
        
        // Monitor storage usage
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            setInterval(() => {
                this.monitorStorageUsage();
            }, 30000); // Every 30 seconds
        }
    }

    async collectMetrics() {
        const metrics = {
            timestamp: Date.now(),
            memory: this.getMemoryMetrics(),
            performance: this.getPerformanceMetrics(),
            network: this.getNetworkMetrics(),
            dom: this.getDOMMetrics()
        };
        
        // Store metrics
        this.storeMetrics(metrics);
        
        // Check thresholds
        this.checkThresholds(metrics);
        
        // Emit metrics event
        if (window.EventBus) {
            window.EventBus.emit('scalability:metrics', metrics);
        }
    }

    getMemoryMetrics() {
        if (!performance.memory) return null;
        
        const memory = performance.memory;
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
    }

    getPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return null;
        
        return {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: navigation.responseEnd - navigation.requestStart,
            ttfb: navigation.responseStart - navigation.requestStart
        };
    }

    getNetworkMetrics() {
        if (!navigator.connection) return null;
        
        return {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        };
    }

    getDOMMetrics() {
        return {
            elements: document.querySelectorAll('*').length,
            scripts: document.querySelectorAll('script').length,
            stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
            images: document.querySelectorAll('img').length
        };
    }

    storeMetrics(metrics) {
        // Store in appropriate arrays
        if (metrics.memory) {
            this.loadMetrics.memory.push({
                timestamp: metrics.timestamp,
                usage: metrics.memory.usage
            });
        }
        
        if (metrics.network) {
            this.loadMetrics.network.push({
                timestamp: metrics.timestamp,
                downlink: metrics.network.downlink,
                rtt: metrics.network.rtt
            });
        }
        
        // Keep only last 100 metrics
        Object.keys(this.loadMetrics).forEach(key => {
            if (this.loadMetrics[key].length > 100) {
                this.loadMetrics[key] = this.loadMetrics[key].slice(-100);
            }
        });
    }

    checkThresholds(metrics) {
        // Memory threshold
        if (metrics.memory && metrics.memory.usage > this.thresholds.memory) {
            this.handleHighMemoryUsage(metrics.memory);
        }
        
        // Network threshold
        if (metrics.network && metrics.network.downlink < 1) { // Less than 1 Mbps
            this.handleSlowNetwork(metrics.network);
        }
    }

    handleHighMemoryUsage(memoryMetrics) {
        console.warn('📈 High memory usage detected:', memoryMetrics.usage + '%');
        
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear caches
        this.clearNonEssentialCaches();
        
        // Reduce resource pool
        this.optimizeResourcePool();
        
        if (window.AuditLogger) {
            window.AuditLogger.log('PERFORMANCE', 'High memory usage detected', {
                usage: memoryMetrics.usage,
                threshold: this.thresholds.memory,
                action: 'cache_cleanup'
            }, 'WARN');
        }
    }

    handleSlowNetwork(networkMetrics) {
        console.warn('📈 Slow network detected:', networkMetrics.downlink + ' Mbps');
        
        // Enable data saving mode
        this.enableDataSavingMode();
        
        // Reduce image quality
        this.optimizeImages();
        
        // Defer non-critical resources
        this.deferNonCriticalResources();
        
        if (window.AuditLogger) {
            window.AuditLogger.log('PERFORMANCE', 'Slow network detected', {
                downlink: networkMetrics.downlink,
                rtt: networkMetrics.rtt,
                action: 'data_saving_enabled'
            }, 'WARN');
        }
    }

    async monitorStorageUsage() {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = (estimate.usage / estimate.quota) * 100;
            
            this.loadMetrics.storage.push({
                timestamp: Date.now(),
                usage: usage,
                used: estimate.usage,
                quota: estimate.quota
            });
            
            if (usage > this.thresholds.storage) {
                this.handleHighStorageUsage(estimate);
            }
        } catch (error) {
            console.warn('Storage monitoring failed:', error);
        }
    }

    handleHighStorageUsage(storageEstimate) {
        console.warn('📈 High storage usage detected:', 
            ((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(2) + '%');
        
        // Clear old cache entries
        this.clearOldCacheEntries();
        
        // Compress stored data
        this.compressStoredData();
        
        if (window.AuditLogger) {
            window.AuditLogger.log('PERFORMANCE', 'High storage usage detected', {
                usage: storageEstimate.usage,
                quota: storageEstimate.quota,
                percentage: (storageEstimate.usage / storageEstimate.quota) * 100,
                action: 'storage_cleanup'
            }, 'WARN');
        }
    }

    // Load Balancing
    setupLoadBalancing() {
        this.loadBalancer = {
            strategies: {
                roundRobin: this.roundRobinStrategy.bind(this),
                leastConnections: this.leastConnectionsStrategy.bind(this),
                weightedRoundRobin: this.weightedRoundRobinStrategy.bind(this)
            },
            currentStrategy: 'roundRobin',
            servers: [
                { id: 'primary', weight: 3, connections: 0, healthy: true },
                { id: 'secondary', weight: 2, connections: 0, healthy: true },
                { id: 'tertiary', weight: 1, connections: 0, healthy: true }
            ],
            currentIndex: 0
        };
    }

    getNextServer() {
        const strategy = this.loadBalancer.strategies[this.loadBalancer.currentStrategy];
        return strategy();
    }

    roundRobinStrategy() {
        const healthyServers = this.loadBalancer.servers.filter(s => s.healthy);
        if (healthyServers.length === 0) return null;
        
        const server = healthyServers[this.loadBalancer.currentIndex % healthyServers.length];
        this.loadBalancer.currentIndex++;
        return server;
    }

    leastConnectionsStrategy() {
        const healthyServers = this.loadBalancer.servers.filter(s => s.healthy);
        if (healthyServers.length === 0) return null;
        
        return healthyServers.reduce((min, server) => 
            server.connections < min.connections ? server : min
        );
    }

    weightedRoundRobinStrategy() {
        const healthyServers = this.loadBalancer.servers.filter(s => s.healthy);
        if (healthyServers.length === 0) return null;
        
        // Simple weighted selection
        const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const server of healthyServers) {
            random -= server.weight;
            if (random <= 0) {
                return server;
            }
        }
        
        return healthyServers[0];
    }

    // Connection Pooling
    setupConnectionPooling() {
        this.connectionPool = new Map();
        this.maxConnectionsPerHost = 6; // HTTP/1.1 standard
        this.connectionTimeout = 30000; // 30 seconds
        
        // Cleanup idle connections
        setInterval(() => {
            this.cleanupIdleConnections();
        }, 60000); // Every minute
    }

    async getConnection(host) {
        if (!this.connectionPool.has(host)) {
            this.connectionPool.set(host, {
                active: [],
                idle: [],
                pending: []
            });
        }
        
        const pool = this.connectionPool.get(host);
        
        // Return idle connection if available
        if (pool.idle.length > 0) {
            const connection = pool.idle.pop();
            pool.active.push(connection);
            return connection;
        }
        
        // Create new connection if under limit
        if (pool.active.length < this.maxConnectionsPerHost) {
            const connection = await this.createConnection(host);
            pool.active.push(connection);
            return connection;
        }
        
        // Queue request if at limit
        return new Promise((resolve) => {
            pool.pending.push(resolve);
        });
    }

    async createConnection(host) {
        return {
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            host: host,
            created: Date.now(),
            lastUsed: Date.now(),
            requests: 0
        };
    }

    releaseConnection(connection) {
        const pool = this.connectionPool.get(connection.host);
        if (!pool) return;
        
        // Move from active to idle
        const activeIndex = pool.active.indexOf(connection);
        if (activeIndex > -1) {
            pool.active.splice(activeIndex, 1);
            connection.lastUsed = Date.now();
            pool.idle.push(connection);
        }
        
        // Process pending requests
        if (pool.pending.length > 0) {
            const resolve = pool.pending.shift();
            pool.active.push(connection);
            resolve(connection);
        }
    }

    cleanupIdleConnections() {
        const now = Date.now();
        
        this.connectionPool.forEach((pool, host) => {
            pool.idle = pool.idle.filter(connection => {
                const isExpired = now - connection.lastUsed > this.connectionTimeout;
                if (isExpired) {
                    console.log(`🔗 Cleaning up idle connection to ${host}`);
                }
                return !isExpired;
            });
        });
    }

    // Request Queuing
    setupRequestQueuing() {
        this.requestQueue = [];
        this.processingQueue = false;
        
        // Process queue periodically
        setInterval(() => {
            this.processRequestQueue();
        }, 100); // Every 100ms
    }

    async queueRequest(requestFn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const request = {
                id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fn: requestFn,
                priority: priority,
                timestamp: Date.now(),
                resolve: resolve,
                reject: reject
            };
            
            // Insert based on priority
            if (priority === 'high') {
                this.requestQueue.unshift(request);
            } else {
                this.requestQueue.push(request);
            }
            
            this.processRequestQueue();
        });
    }

    async processRequestQueue() {
        if (this.processingQueue || this.requestQueue.length === 0) {
            return;
        }
        
        if (this.currentRequests >= this.maxConcurrentRequests) {
            return;
        }
        
        this.processingQueue = true;
        
        while (this.requestQueue.length > 0 && this.currentRequests < this.maxConcurrentRequests) {
            const request = this.requestQueue.shift();
            this.currentRequests++;
            
            try {
                const result = await request.fn();
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            } finally {
                this.currentRequests--;
            }
        }
        
        this.processingQueue = false;
    }

    // Auto Scaling
    setupAutoScaling() {
        this.autoScaling = {
            enabled: true,
            rules: [
                {
                    metric: 'memory',
                    threshold: 80,
                    action: 'scale_down',
                    cooldown: 300000 // 5 minutes
                },
                {
                    metric: 'requests',
                    threshold: 50,
                    action: 'scale_up',
                    cooldown: 180000 // 3 minutes
                }
            ],
            lastAction: 0
        };
        
        // Check scaling rules
        setInterval(() => {
            this.checkAutoScaling();
        }, 30000); // Every 30 seconds
    }

    checkAutoScaling() {
        if (!this.autoScaling.enabled) return;
        
        const now = Date.now();
        
        for (const rule of this.autoScaling.rules) {
            if (now - this.autoScaling.lastAction < rule.cooldown) {
                continue;
            }
            
            const shouldScale = this.evaluateScalingRule(rule);
            if (shouldScale) {
                this.executeScalingAction(rule);
                this.autoScaling.lastAction = now;
                break;
            }
        }
    }

    evaluateScalingRule(rule) {
        switch (rule.metric) {
            case 'memory':
                const memoryMetrics = this.loadMetrics.memory.slice(-5); // Last 5 measurements
                if (memoryMetrics.length === 0) return false;
                const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.usage, 0) / memoryMetrics.length;
                return avgMemory > rule.threshold;
                
            case 'requests':
                return this.currentRequests > rule.threshold;
                
            default:
                return false;
        }
    }

    executeScalingAction(rule) {
        console.log(`📈 Executing auto-scaling action: ${rule.action}`);
        
        switch (rule.action) {
            case 'scale_up':
                this.scaleUp();
                break;
            case 'scale_down':
                this.scaleDown();
                break;
        }
        
        if (window.AuditLogger) {
            window.AuditLogger.log('PERFORMANCE', 'Auto-scaling action executed', {
                action: rule.action,
                metric: rule.metric,
                threshold: rule.threshold
            });
        }
    }

    scaleUp() {
        // Increase concurrent request limit
        this.maxConcurrentRequests = Math.min(this.maxConcurrentRequests + 2, 20);
        
        // Increase connection pool size
        this.maxConnectionsPerHost = Math.min(this.maxConnectionsPerHost + 1, 10);
        
        console.log(`📈 Scaled up: maxConcurrentRequests=${this.maxConcurrentRequests}, maxConnectionsPerHost=${this.maxConnectionsPerHost}`);
    }

    scaleDown() {
        // Decrease concurrent request limit
        this.maxConcurrentRequests = Math.max(this.maxConcurrentRequests - 1, 5);
        
        // Decrease connection pool size
        this.maxConnectionsPerHost = Math.max(this.maxConnectionsPerHost - 1, 4);
        
        // Clear caches
        this.clearNonEssentialCaches();
        
        console.log(`📈 Scaled down: maxConcurrentRequests=${this.maxConcurrentRequests}, maxConnectionsPerHost=${this.maxConnectionsPerHost}`);
    }

    // Resource Optimization
    setupResourceOptimization() {
        this.resourceOptimizer = {
            strategies: {
                lazy_loading: this.setupLazyLoading.bind(this),
                image_optimization: this.optimizeImages.bind(this),
                code_splitting: this.setupCodeSplitting.bind(this),
                prefetching: this.setupPrefetching.bind(this)
            }
        };
        
        // Apply all optimization strategies
        Object.values(this.resourceOptimizer.strategies).forEach(strategy => {
            try {
                strategy();
            } catch (error) {
                console.warn('Resource optimization strategy failed:', error);
            }
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                        
                        if (element.dataset.module) {
                            this.loadModule(element.dataset.module);
                        }
                        
                        observer.unobserve(element);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            // Observe lazy-loadable elements
            document.querySelectorAll('[data-src], [data-module]').forEach(el => {
                observer.observe(el);
            });
        }
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" if not present
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Optimize based on network conditions
            if (navigator.connection && navigator.connection.saveData) {
                // Reduce image quality for data saving
                if (img.src && !img.dataset.optimized) {
                    img.dataset.originalSrc = img.src;
                    img.src = this.getOptimizedImageUrl(img.src, 'low');
                    img.dataset.optimized = 'true';
                }
            }
        });
    }

    getOptimizedImageUrl(originalUrl, quality = 'medium') {
        // This would typically integrate with an image optimization service
        // For now, we'll just add quality parameters
        const url = new URL(originalUrl, window.location.origin);
        url.searchParams.set('quality', quality);
        return url.toString();
    }

    setupCodeSplitting() {
        // Dynamic import wrapper with error handling
        window.loadModule = async (modulePath) => {
            try {
                const module = await import(modulePath);
                return module;
            } catch (error) {
                console.error(`Failed to load module: ${modulePath}`, error);
                
                if (window.AuditLogger) {
                    window.AuditLogger.logError(error, {
                        modulePath: modulePath,
                        context: 'code_splitting'
                    });
                }
                
                throw error;
            }
        };
    }

    setupPrefetching() {
        // Prefetch critical resources
        const criticalResources = [
            '/modules/dashboard/dashboard.js',
            '/modules/subjects/subjects.js',
            '/styles/components.css'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
        
        // Intelligent prefetching based on user behavior
        this.setupIntelligentPrefetching();
    }

    setupIntelligentPrefetching() {
        const navigationPatterns = new Map();
        
        // Track navigation patterns
        if (window.EventBus) {
            window.EventBus.on('navigation:change', (data) => {
                const from = data.from;
                const to = data.to;
                
                if (!navigationPatterns.has(from)) {
                    navigationPatterns.set(from, new Map());
                }
                
                const fromPatterns = navigationPatterns.get(from);
                fromPatterns.set(to, (fromPatterns.get(to) || 0) + 1);
                
                // Prefetch likely next destinations
                this.prefetchLikelyDestinations(from, fromPatterns);
            });
        }
    }

    prefetchLikelyDestinations(currentPage, patterns) {
        // Sort by frequency and prefetch top destinations
        const sorted = Array.from(patterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3); // Top 3 destinations
        
        sorted.forEach(([destination, frequency]) => {
            if (frequency > 2) { // Only if visited more than twice
                this.prefetchPage(destination);
            }
        });
    }

    prefetchPage(pagePath) {
        // Prefetch page resources
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = pagePath;
        document.head.appendChild(link);
    }

    // Cache Management
    setupCaching() {
        this.cacheManager = {
            strategies: {
                'cache-first': this.cacheFirstStrategy.bind(this),
                'network-first': this.networkFirstStrategy.bind(this),
                'stale-while-revalidate': this.staleWhileRevalidateStrategy.bind(this)
            },
            defaultStrategy: 'stale-while-revalidate'
        };
    }

    async cacheFirstStrategy(request) {
        const cached = await this.getFromCache(request);
        if (cached) {
            return cached;
        }
        
        const response = await fetch(request);
        await this.putInCache(request, response.clone());
        return response;
    }

    async networkFirstStrategy(request) {
        try {
            const response = await fetch(request);
            await this.putInCache(request, response.clone());
            return response;
        } catch (error) {
            const cached = await this.getFromCache(request);
            if (cached) {
                return cached;
            }
            throw error;
        }
    }

    async staleWhileRevalidateStrategy(request) {
        const cached = await this.getFromCache(request);
        
        // Return cached immediately if available
        const responsePromise = cached ? Promise.resolve(cached) : fetch(request);
        
        // Update cache in background
        fetch(request).then(response => {
            this.putInCache(request, response.clone());
        }).catch(error => {
            console.warn('Background cache update failed:', error);
        });
        
        return responsePromise;
    }

    async getFromCache(request) {
        if ('caches' in window) {
            const cache = await caches.open('scalability-cache');
            return await cache.match(request);
        }
        return null;
    }

    async putInCache(request, response) {
        if ('caches' in window) {
            const cache = await caches.open('scalability-cache');
            await cache.put(request, response);
        }
    }

    clearNonEssentialCaches() {
        // Clear old cache entries
        if ('caches' in window) {
            caches.open('scalability-cache').then(cache => {
                cache.keys().then(requests => {
                    requests.forEach(request => {
                        // Remove non-critical cached items
                        if (!this.isCriticalResource(request.url)) {
                            cache.delete(request);
                        }
                    });
                });
            });
        }
        
        // Clear localStorage non-essential items
        const nonEssentialKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !this.isEssentialStorageKey(key)) {
                nonEssentialKeys.push(key);
            }
        }
        
        nonEssentialKeys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    isCriticalResource(url) {
        const criticalPatterns = [
            '/core/',
            '/styles/global.css',
            '/styles/components.css',
            'manifest.json'
        ];
        
        return criticalPatterns.some(pattern => url.includes(pattern));
    }

    isEssentialStorageKey(key) {
        const essentialPatterns = [
            'user_preferences',
            'auth_token',
            'secure_',
            'critical_'
        ];
        
        return essentialPatterns.some(pattern => key.includes(pattern));
    }

    clearOldCacheEntries() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Clear old localStorage entries
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item.timestamp && item.timestamp < oneWeekAgo) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Remove invalid entries
                    localStorage.removeItem(key);
                }
            }
        }
    }

    compressStoredData() {
        // Simple compression for stored data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('compressed_')) {
                try {
                    const data = localStorage.getItem(key);
                    if (data && data.length > 1000) { // Only compress large items
                        const compressed = this.simpleCompress(data);
                        if (compressed.length < data.length) {
                            localStorage.setItem(`compressed_${key}`, compressed);
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    console.warn('Data compression failed for key:', key, error);
                }
            }
        }
    }

    simpleCompress(data) {
        // Simple run-length encoding for demonstration
        return data.replace(/(.)\1+/g, (match, char) => {
            return char + match.length;
        });
    }

    // Network Optimization
    handleNetworkChange() {
        const connection = navigator.connection;
        
        if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            this.enableDataSavingMode();
        } else {
            this.disableDataSavingMode();
        }
        
        if (window.AuditLogger) {
            window.AuditLogger.log('PERFORMANCE', 'Network conditions changed', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });
        }
    }

    enableDataSavingMode() {
        document.body.classList.add('data-saving-mode');
        
        // Reduce image quality
        this.optimizeImages();
        
        // Defer non-critical resources
        this.deferNonCriticalResources();
        
        // Reduce animation complexity
        document.body.classList.add('reduced-animations');
        
        console.log('📱 Data saving mode enabled');
    }

    disableDataSavingMode() {
        document.body.classList.remove('data-saving-mode');
        document.body.classList.remove('reduced-animations');
        
        console.log('📱 Data saving mode disabled');
    }

    deferNonCriticalResources() {
        // Defer non-critical scripts
        const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
        nonCriticalScripts.forEach(script => {
            script.setAttribute('defer', 'true');
        });
        
        // Defer non-critical stylesheets
        const nonCriticalStyles = document.querySelectorAll('link[data-defer]');
        nonCriticalStyles.forEach(link => {
            link.setAttribute('media', 'print');
            link.addEventListener('load', () => {
                link.setAttribute('media', 'all');
            });
        });
    }

    // Performance Monitoring
    getPerformanceReport() {
        return {
            timestamp: Date.now(),
            metrics: {
                memory: this.loadMetrics.memory.slice(-10),
                network: this.loadMetrics.network.slice(-10),
                storage: this.loadMetrics.storage.slice(-10)
            },
            loadBalancer: {
                strategy: this.loadBalancer.currentStrategy,
                servers: this.loadBalancer.servers.map(s => ({
                    id: s.id,
                    connections: s.connections,
                    healthy: s.healthy
                }))
            },
            connectionPool: {
                totalPools: this.connectionPool.size,
                totalConnections: Array.from(this.connectionPool.values())
                    .reduce((sum, pool) => sum + pool.active.length + pool.idle.length, 0)
            },
            requestQueue: {
                pending: this.requestQueue.length,
                current: this.currentRequests,
                max: this.maxConcurrentRequests
            },
            autoScaling: {
                enabled: this.autoScaling.enabled,
                lastAction: this.autoScaling.lastAction
            }
        };
    }

    // Public API
    optimizeForDevice() {
        const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB
        const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default to 4 cores
        
        // Adjust settings based on device capabilities
        if (deviceMemory < 2) {
            // Low-end device optimizations
            this.maxConcurrentRequests = 5;
            this.maxConnectionsPerHost = 3;
            this.enableDataSavingMode();
        } else if (deviceMemory >= 8) {
            // High-end device optimizations
            this.maxConcurrentRequests = 15;
            this.maxConnectionsPerHost = 8;
        }
        
        console.log(`📱 Optimized for device: ${deviceMemory}GB RAM, ${hardwareConcurrency} cores`);
    }

    getScalabilityStatus() {
        return {
            resourceMonitoring: true,
            loadBalancing: true,
            connectionPooling: true,
            requestQueuing: true,
            autoScaling: this.autoScaling.enabled,
            caching: true,
            optimization: true,
            currentLoad: {
                requests: this.currentRequests,
                maxRequests: this.maxConcurrentRequests,
                queueLength: this.requestQueue.length
            }
        };
    }
}

// Initialize Scalability Manager
if (typeof window !== 'undefined') {
    window.ScalabilityManager = new ScalabilityManager();
}

// Export removed to fix syntax error - ScalabilityManager is available globally
// export default ScalabilityManager;