/**
 * EksamensKlar EventBus Middleware Collection
 * Pre-built middleware for common use cases
 */

const EventBusMiddleware = {
    /**
     * Logging middleware - logs all events
     */
    logger: (options = {}) => {
        const { 
            logLevel = 'info',
            includeData = false,
            filter = null 
        } = options;
        
        return (event) => {
            if (filter && !filter(event)) {
                return event;
            }
            
            const logData = {
                id: event.id,
                type: event.type,
                namespace: event.namespace,
                timestamp: event.timestamp
            };
            
            if (includeData) {
                logData.data = event.data;
            }
            
            console.log(`[EventBus:${logLevel.toUpperCase()}]`, logData);
            return event;
        };
    },

    /**
     * Rate limiting middleware
     */
    rateLimit: (options = {}) => {
        const { 
            maxEvents = 100,
            windowMs = 60000,
            skipSuccessfulRequests = false 
        } = options;
        
        const eventCounts = new Map();
        
        return (event) => {
            const key = `${event.namespace}:${event.type}`;
            const now = Date.now();
            
            if (!eventCounts.has(key)) {
                eventCounts.set(key, []);
            }
            
            const timestamps = eventCounts.get(key);
            
            // Remove old timestamps
            const cutoff = now - windowMs;
            while (timestamps.length > 0 && timestamps[0] < cutoff) {
                timestamps.shift();
            }
            
            // Check rate limit
            if (timestamps.length >= maxEvents) {
                console.warn(`[EventBus] Rate limit exceeded for ${key}`);
                return { ...event, cancelled: true };
            }
            
            timestamps.push(now);
            return event;
        };
    },

    /**
     * Data validation middleware
     */
    validator: (schemas = {}) => {
        return (event) => {
            const key = `${event.namespace}:${event.type}`;
            const schema = schemas[key] || schemas[event.type];
            
            if (!schema) {
                return event;
            }
            
            try {
                const isValid = validateEventData(event.data, schema);
                if (!isValid) {
                    console.error(`[EventBus] Validation failed for ${key}:`, event.data);
                    return { ...event, cancelled: true };
                }
            } catch (error) {
                console.error(`[EventBus] Validation error for ${key}:`, error.message);
                return { ...event, cancelled: true };
            }
            
            return event;
        };
    },

    /**
     * Data transformation middleware
     */
    transformer: (transformers = {}) => {
        return (event) => {
            const key = `${event.namespace}:${event.type}`;
            const transformer = transformers[key] || transformers[event.type];
            
            if (!transformer) {
                return event;
            }
            
            try {
                const transformedData = transformer(event.data, event);
                return { ...event, data: transformedData };
            } catch (error) {
                console.error(`[EventBus] Transformation error for ${key}:`, error.message);
                return event;
            }
        };
    },

    /**
     * Performance monitoring middleware
     */
    performance: (options = {}) => {
        const { 
            threshold = 100,
            logSlow = true 
        } = options;
        
        return (event) => {
            const startTime = performance.now();
            
            // Add performance tracking to event
            event.performance = {
                startTime,
                middleware: []
            };
            
            // Override event processing to measure time
            const originalProcessed = event.processed;
            Object.defineProperty(event, 'processed', {
                get: () => originalProcessed,
                set: (value) => {
                    if (value) {
                        const endTime = performance.now();
                        const duration = endTime - startTime;
                        
                        event.performance.endTime = endTime;
                        event.performance.duration = duration;
                        
                        if (logSlow && duration > threshold) {
                            console.warn(`[EventBus] Slow event detected: ${event.namespace}:${event.type} (${duration.toFixed(2)}ms)`);
                        }
                    }
                    originalProcessed = value;
                }
            });
            
            return event;
        };
    },

    /**
     * Error handling middleware
     */
    errorHandler: (options = {}) => {
        const { 
            retryAttempts = 3,
            retryDelay = 1000,
            onError = null 
        } = options;
        
        return (event) => {
            if (!event.errors) {
                event.errors = [];
            }
            
            event.retryCount = event.retryCount || 0;
            
            // Add error handling metadata
            event.errorHandling = {
                maxRetries: retryAttempts,
                retryDelay,
                canRetry: event.retryCount < retryAttempts
            };
            
            if (onError && event.errors.length > 0) {
                try {
                    onError(event.errors[event.errors.length - 1], event);
                } catch (handlerError) {
                    console.error('[EventBus] Error in error handler:', handlerError);
                }
            }
            
            return event;
        };
    },

    /**
     * Caching middleware
     */
    cache: (options = {}) => {
        const { 
            ttl = 300000, // 5 minutes
            maxSize = 1000,
            keyGenerator = null 
        } = options;
        
        const cache = new Map();
        
        return (event) => {
            const key = keyGenerator ? 
                keyGenerator(event) : 
                `${event.namespace}:${event.type}:${JSON.stringify(event.data)}`;
            
            const now = Date.now();
            
            // Check cache
            if (cache.has(key)) {
                const cached = cache.get(key);
                if (now - cached.timestamp < ttl) {
                    console.log(`[EventBus] Cache hit for ${key}`);
                    return { ...event, cached: true, cachedResult: cached.result };
                } else {
                    cache.delete(key);
                }
            }
            
            // Clean up old entries if cache is full
            if (cache.size >= maxSize) {
                const oldestKey = cache.keys().next().value;
                cache.delete(oldestKey);
            }
            
            // Store in cache after processing
            event.cacheKey = key;
            event.cacheTtl = ttl;
            
            return event;
        };
    },

    /**
     * Security middleware
     */
    security: (options = {}) => {
        const { 
            allowedNamespaces = [],
            blockedEventTypes = [],
            requireAuth = false,
            authCheck = null 
        } = options;
        
        return (event) => {
            // Check namespace whitelist
            if (allowedNamespaces.length > 0 && !allowedNamespaces.includes(event.namespace)) {
                console.warn(`[EventBus] Blocked event from unauthorized namespace: ${event.namespace}`);
                return { ...event, cancelled: true };
            }
            
            // Check event type blacklist
            if (blockedEventTypes.includes(event.type)) {
                console.warn(`[EventBus] Blocked event type: ${event.type}`);
                return { ...event, cancelled: true };
            }
            
            // Check authentication if required
            if (requireAuth && authCheck) {
                try {
                    const isAuthorized = authCheck(event);
                    if (!isAuthorized) {
                        console.warn(`[EventBus] Unauthorized event: ${event.namespace}:${event.type}`);
                        return { ...event, cancelled: true };
                    }
                } catch (error) {
                    console.error('[EventBus] Auth check error:', error);
                    return { ...event, cancelled: true };
                }
            }
            
            return event;
        };
    }
};

/**
 * Simple data validation function
 */
function validateEventData(data, schema) {
    if (schema.required) {
        for (const field of schema.required) {
            if (!(field in data)) {
                return false;
            }
        }
    }
    
    if (schema.properties) {
        for (const [field, rules] of Object.entries(schema.properties)) {
            if (field in data) {
                const value = data[field];
                
                if (rules.type && typeof value !== rules.type) {
                    return false;
                }
                
                if (rules.minLength && value.length < rules.minLength) {
                    return false;
                }
                
                if (rules.maxLength && value.length > rules.maxLength) {
                    return false;
                }
                
                if (rules.pattern && !rules.pattern.test(value)) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Export middleware collection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBusMiddleware;
}

// Global access
window.EventBusMiddleware = EventBusMiddleware;

console.log('🔧 EventBus: Middleware collection loaded');