/**
 * EksamensKlar Enterprise EventBus System
 * Advanced cross-module communication with middleware, namespaces, and debugging
 * 
 * Features:
 * - Namespace management for module isolation
 * - Middleware pipeline for event processing
 * - Event history and debugging capabilities
 * - Performance monitoring and metrics
 * - Error handling and recovery
 * - Priority-based event handling
 * - Async/sync event support
 */

class EventBus {
    constructor() {
        this.listeners = new Map(); // namespace -> eventType -> [listeners]
        this.middleware = [];
        this.history = [];
        this.metrics = {
            totalEvents: 0,
            eventsByType: new Map(),
            eventsByNamespace: new Map(),
            averageProcessingTime: 0,
            errors: []
        };
        this.config = {
            maxHistorySize: 1000,
            enableDebug: true,
            enableMetrics: true,
            defaultNamespace: 'global',
            errorRetryAttempts: 3
        };
        this.namespaces = new Set(['global']);
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize EventBus system
     */
    init() {
        if (this.isInitialized) return;
        
        this.log('🚀 EventBus: Initializing enterprise event system...');
        
        // Register core namespaces
        this.registerNamespace('dashboard');
        this.registerNamespace('content');
        this.registerNamespace('flashcards');
        this.registerNamespace('quiz');
        this.registerNamespace('subjects');
        this.registerNamespace('ai-assistant');
        this.registerNamespace('data-bridge');
        this.registerNamespace('system');
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        this.isInitialized = true;
        this.log('✅ EventBus: System initialized successfully');
        
        // Emit initialization event
        this.emit('system:initialized', {
            timestamp: new Date().toISOString(),
            namespaces: Array.from(this.namespaces),
            config: this.config
        });
    }

    /**
     * Register a new namespace
     */
    registerNamespace(namespace) {
        if (this.namespaces.has(namespace)) {
            this.log(`⚠️ Namespace '${namespace}' already exists`);
            return false;
        }
        
        this.namespaces.add(namespace);
        this.listeners.set(namespace, new Map());
        this.metrics.eventsByNamespace.set(namespace, 0);
        
        this.log(`📁 Namespace '${namespace}' registered`);
        return true;
    }

    /**
     * Add middleware to the processing pipeline
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        
        this.middleware.push(middleware);
        this.log(`🔧 Middleware added (total: ${this.middleware.length})`);
        return this;
    }

    /**
     * Subscribe to events with advanced options
     */
    on(eventType, listener, options = {}) {
        const {
            namespace = this.config.defaultNamespace,
            priority = 0,
            once = false,
            condition = null
        } = options;
        
        // Validate namespace
        if (!this.namespaces.has(namespace)) {
            this.registerNamespace(namespace);
        }
        
        // Get or create event listeners for namespace
        let namespaceListeners = this.listeners.get(namespace);
        if (!namespaceListeners) {
            this.registerNamespace(namespace);
            namespaceListeners = this.listeners.get(namespace);
        }
        if (!namespaceListeners.has(eventType)) {
            namespaceListeners.set(eventType, []);
        }
        
        const listeners = namespaceListeners.get(eventType);
        
        // Create enhanced listener object
        const enhancedListener = {
            id: this.generateListenerId(),
            fn: listener,
            priority,
            once,
            condition,
            namespace,
            eventType,
            created: new Date().toISOString(),
            callCount: 0
        };
        
        // Insert listener based on priority (higher priority first)
        const insertIndex = listeners.findIndex(l => l.priority < priority);
        if (insertIndex === -1) {
            listeners.push(enhancedListener);
        } else {
            listeners.splice(insertIndex, 0, enhancedListener);
        }
        
        this.log(`👂 Listener registered: ${namespace}:${eventType} (priority: ${priority})`);
        
        // Return unsubscribe function
        return () => this.off(eventType, enhancedListener.id, { namespace });
    }

    /**
     * Subscribe to event once
     */
    once(eventType, listener, options = {}) {
        return this.on(eventType, listener, { ...options, once: true });
    }

    /**
     * Unsubscribe from events
     */
    off(eventType, listenerId, options = {}) {
        const { namespace = this.config.defaultNamespace } = options;
        
        const namespaceListeners = this.listeners.get(namespace);
        if (!namespaceListeners || !namespaceListeners.has(eventType)) {
            return false;
        }
        
        const listeners = namespaceListeners.get(eventType);
        const index = listeners.findIndex(l => l.id === listenerId);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            this.log(`🚫 Listener removed: ${namespace}:${eventType}`);
            return true;
        }
        
        return false;
    }

    /**
     * Emit events with middleware processing
     */
    async emit(eventType, data = {}, options = {}) {
        const startTime = performance.now();
        
        const {
            namespace = this.config.defaultNamespace,
            async = false,
            timeout = 5000,
            retries = this.config.errorRetryAttempts
        } = options;
        
        // Create event object
        const event = {
            id: this.generateEventId(),
            type: eventType,
            namespace,
            data,
            timestamp: new Date().toISOString(),
            source: this.getCallStack(),
            async,
            processed: false,
            errors: []
        };
        
        try {
            // Process through middleware pipeline
            const processedEvent = await this.processMiddleware(event);
            
            if (processedEvent.cancelled) {
                this.log(`🚫 Event cancelled by middleware: ${namespace}:${eventType}`);
                return false;
            }
            
            // Emit to listeners
            const result = await this.emitToListeners(processedEvent, { timeout, retries });
            
            // Update metrics
            this.updateMetrics(processedEvent, performance.now() - startTime);
            
            // Add to history
            this.addToHistory(processedEvent);
            
            this.log(`📡 Event emitted: ${namespace}:${eventType} (${result.listenerCount} listeners)`);
            
            return result;
            
        } catch (error) {
            this.handleError(error, event);
            return false;
        }
    }

    /**
     * Process event through middleware pipeline
     */
    async processMiddleware(event) {
        let processedEvent = { ...event };
        
        for (const middleware of this.middleware) {
            try {
                const result = await middleware(processedEvent);
                
                if (result === false) {
                    processedEvent.cancelled = true;
                    break;
                }
                
                if (result && typeof result === 'object') {
                    processedEvent = { ...processedEvent, ...result };
                }
                
            } catch (error) {
                this.log(`❌ Middleware error: ${error.message}`);
                processedEvent.errors.push({
                    type: 'middleware',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return processedEvent;
    }

    /**
     * Emit event to all registered listeners
     */
    async emitToListeners(event, options = {}) {
        const { timeout, retries } = options;
        const namespaceListeners = this.listeners.get(event.namespace);
        
        if (!namespaceListeners || !namespaceListeners.has(event.type)) {
            return { listenerCount: 0, results: [] };
        }
        
        const listeners = namespaceListeners.get(event.type);
        const results = [];
        let processedCount = 0;
        
        for (const listener of listeners) {
            try {
                // Check condition if specified
                if (listener.condition && !listener.condition(event)) {
                    continue;
                }
                
                // Execute listener with timeout
                const result = await this.executeListener(listener, event, timeout);
                results.push({ listenerId: listener.id, result, success: true });
                
                listener.callCount++;
                processedCount++;
                
                // Remove if once listener
                if (listener.once) {
                    this.off(event.type, listener.id, { namespace: event.namespace });
                }
                
            } catch (error) {
                results.push({ 
                    listenerId: listener.id, 
                    error: error.message, 
                    success: false 
                });
                
                // Handle error and add to metrics
                this.handleError(error, event);
            }
        }
        
        return { listenerCount: processedCount, results };
    }

    /**
     * Execute individual listener with timeout
     */
    async executeListener(listener, event, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Listener timeout after ${timeout}ms`));
            }, timeout);
            
            try {
                const result = listener.fn(event.data, event);
                
                if (result && typeof result.then === 'function') {
                    // Handle async listener
                    result
                        .then(res => {
                            clearTimeout(timeoutId);
                            resolve(res);
                        })
                        .catch(err => {
                            clearTimeout(timeoutId);
                            reject(err);
                        });
                } else {
                    // Handle sync listener
                    clearTimeout(timeoutId);
                    resolve(result);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Get all listeners for debugging
     */
    getListeners(namespace = null, eventType = null) {
        if (namespace && eventType) {
            const namespaceListeners = this.listeners.get(namespace);
            return namespaceListeners ? namespaceListeners.get(eventType) || [] : [];
        }
        
        if (namespace) {
            return this.listeners.get(namespace) || new Map();
        }
        
        return this.listeners;
    }

    /**
     * Get event history for debugging
     */
    getHistory(filter = {}) {
        const { namespace, eventType, limit = 100 } = filter;
        
        let filtered = this.history;
        
        if (namespace) {
            filtered = filtered.filter(event => event.namespace === namespace);
        }
        
        if (eventType) {
            filtered = filtered.filter(event => event.type === eventType);
        }
        
        return filtered.slice(-limit);
    }

    /**
     * Get system metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            namespaces: Array.from(this.namespaces),
            totalListeners: this.getTotalListenerCount(),
            uptime: this.getUptime()
        };
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.history = [];
        this.log('🗑️ Event history cleared');
    }

    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.metrics = {
            totalEvents: 0,
            eventsByType: new Map(),
            eventsByNamespace: new Map(),
            averageProcessingTime: 0,
            errors: []
        };
        this.log('📊 Metrics reset');
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.emit('system:error', {
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            }, { namespace: 'system' });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.emit('system:error', {
                type: 'promise',
                message: event.reason.message || 'Unhandled promise rejection',
                stack: event.reason.stack
            }, { namespace: 'system' });
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.emit('system:performance', {
                        type: entry.entryType,
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime
                    }, { namespace: 'system' });
                }
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        }
    }

    /**
     * Utility methods
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateListenerId() {
        return `lst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getCallStack() {
        const stack = new Error().stack;
        return stack ? stack.split('\n').slice(3, 6) : [];
    }
    
    getTotalListenerCount() {
        let count = 0;
        for (const namespaceListeners of this.listeners.values()) {
            for (const listeners of namespaceListeners.values()) {
                count += listeners.length;
            }
        }
        return count;
    }
    
    getUptime() {
        return Date.now() - this.startTime;
    }
    
    updateMetrics(event, processingTime) {
        if (!this.config.enableMetrics) return;
        
        this.metrics.totalEvents++;
        
        // Update event type metrics
        const typeCount = this.metrics.eventsByType.get(event.type) || 0;
        this.metrics.eventsByType.set(event.type, typeCount + 1);
        
        // Update namespace metrics
        const namespaceCount = this.metrics.eventsByNamespace.get(event.namespace) || 0;
        this.metrics.eventsByNamespace.set(event.namespace, namespaceCount + 1);
        
        // Update average processing time
        const totalTime = this.metrics.averageProcessingTime * (this.metrics.totalEvents - 1);
        this.metrics.averageProcessingTime = (totalTime + processingTime) / this.metrics.totalEvents;
    }
    
    addToHistory(event) {
        this.history.push(event);
        
        // Maintain history size limit
        if (this.history.length > this.config.maxHistorySize) {
            this.history.shift();
        }
    }
    
    handleError(error, event) {
        this.metrics.errors.push({
            message: error.message,
            event: event.type,
            namespace: event.namespace,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        
        this.log(`❌ EventBus error: ${error.message}`);
    }
    
    log(message) {
        if (this.config.enableDebug) {
            console.log(`[EventBus] ${message}`);
        }
    }
}

// Create global EventBus instance
const eventBus = new EventBus();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = eventBus;
}

// Global access
window.EventBus = eventBus;

// Initialize start time
eventBus.startTime = Date.now();

console.log('🚀 EventBus: Enterprise event system loaded and ready');