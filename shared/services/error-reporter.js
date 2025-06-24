/**
 * Error Reporter Service
 * Centralized error reporting and logging system
 */

class ErrorReporter {
    constructor(config = {}) {
        this.config = {
            enableConsoleLogging: true,
            enableRemoteLogging: true,
            enableLocalStorage: true,
            maxLocalErrors: 50,
            endpoint: '/api/errors',
            apiKey: null,
            environment: 'development',
            version: '1.0.0',
            userId: null,
            sessionId: null,
            enableStackTrace: true,
            enableBreadcrumbs: true,
            maxBreadcrumbs: 20,
            enablePerformanceContext: true,
            enableUserContext: true,
            ...config
        };

        this.breadcrumbs = [];
        this.errorQueue = [];
        this.isOnline = navigator.onLine;
        this.sessionId = this.generateSessionId();
        
        this.init();
    }

    /**
     * Initialize the error reporter
     */
    init() {
        this.setupGlobalErrorHandlers();
        this.setupNetworkStatusTracking();
        this.loadStoredErrors();
        this.addBreadcrumb('error_reporter_initialized', { sessionId: this.sessionId });
    }

    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.reportError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                error: event.error
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.reportError({
                type: 'unhandled_promise_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                error: event.reason
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.reportError({
                    type: 'resource_error',
                    message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    target: event.target
                });
            }
        }, true);
    }

    /**
     * Setup network status tracking
     */
    setupNetworkStatusTracking() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.addBreadcrumb('network_online');
            this.flushErrorQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.addBreadcrumb('network_offline');
        });
    }

    /**
     * Report an error
     */
    reportError(errorData, context = {}) {
        const error = this.enrichError(errorData, context);
        
        if (this.config.enableConsoleLogging) {
            this.logToConsole(error);
        }

        if (this.config.enableLocalStorage) {
            this.storeErrorLocally(error);
        }

        if (this.config.enableRemoteLogging) {
            if (this.isOnline) {
                this.sendError(error);
            } else {
                this.queueError(error);
            }
        }

        this.addBreadcrumb('error_reported', {
            type: error.type,
            message: error.message
        });

        return error;
    }

    /**
     * Enrich error with additional context
     */
    enrichError(errorData, context = {}) {
        const enrichedError = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: errorData.type || 'unknown_error',
            message: errorData.message || 'Unknown error occurred',
            stack: errorData.stack,
            filename: errorData.filename,
            lineno: errorData.lineno,
            colno: errorData.colno,
            ...errorData,
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                ...context
            },
            environment: {
                version: this.config.version,
                environment: this.config.environment,
                userId: this.config.userId
            }
        };

        // Add breadcrumbs
        if (this.config.enableBreadcrumbs) {
            enrichedError.breadcrumbs = [...this.breadcrumbs];
        }

        // Add performance context
        if (this.config.enablePerformanceContext) {
            enrichedError.performance = this.getPerformanceContext();
        }

        // Add user context
        if (this.config.enableUserContext) {
            enrichedError.user = this.getUserContext();
        }

        return enrichedError;
    }

    /**
     * Get performance context
     */
    getPerformanceContext() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const memory = performance.memory;
        
        return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : null,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : null,
            memoryUsage: memory ? {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            } : null,
            connectionType: navigator.connection?.effectiveType || 'unknown'
        };
    }

    /**
     * Get user context
     */
    getUserContext() {
        return {
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Add breadcrumb
     */
    addBreadcrumb(message, data = {}) {
        if (!this.config.enableBreadcrumbs) return;

        const breadcrumb = {
            message,
            data,
            timestamp: new Date().toISOString(),
            level: 'info'
        };

        this.breadcrumbs.push(breadcrumb);

        // Keep only the last N breadcrumbs
        if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
            this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
        }
    }

    /**
     * Log error to console
     */
    logToConsole(error) {
        const logLevel = this.getLogLevel(error.type);
        const message = `[${error.type}] ${error.message}`;
        
        switch (logLevel) {
            case 'error':
                console.error(message, error);
                break;
            case 'warn':
                console.warn(message, error);
                break;
            default:
                console.log(message, error);
        }
    }

    /**
     * Get appropriate log level for error type
     */
    getLogLevel(errorType) {
        const errorLevels = {
            'javascript_error': 'error',
            'unhandled_promise_rejection': 'error',
            'resource_error': 'warn',
            'network_error': 'warn',
            'validation_error': 'warn'
        };

        return errorLevels[errorType] || 'error';
    }

    /**
     * Store error locally
     */
    storeErrorLocally(error) {
        try {
            const stored = JSON.parse(localStorage.getItem('error_reporter_errors') || '[]');
            stored.push(error);
            
            // Keep only the last N errors
            const trimmed = stored.slice(-this.config.maxLocalErrors);
            localStorage.setItem('error_reporter_errors', JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Failed to store error locally:', e);
        }
    }

    /**
     * Load stored errors from localStorage
     */
    loadStoredErrors() {
        try {
            const stored = JSON.parse(localStorage.getItem('error_reporter_errors') || '[]');
            return stored;
        } catch (e) {
            console.warn('Failed to load stored errors:', e);
            return [];
        }
    }

    /**
     * Queue error for later sending
     */
    queueError(error) {
        this.errorQueue.push(error);
    }

    /**
     * Flush error queue when online
     */
    async flushErrorQueue() {
        if (this.errorQueue.length === 0) return;

        const errors = [...this.errorQueue];
        this.errorQueue = [];

        for (const error of errors) {
            try {
                await this.sendError(error);
            } catch (e) {
                // Re-queue if failed
                this.queueError(error);
            }
        }
    }

    /**
     * Send error to remote endpoint
     */
    async sendError(error) {
        if (!this.config.endpoint) {
            console.log('Error (no endpoint configured):', error);
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(error)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (e) {
            console.error('Failed to send error to remote endpoint:', e);
            throw e;
        }
    }

    /**
     * Report a custom error
     */
    reportCustomError(message, context = {}, level = 'error') {
        return this.reportError({
            type: 'custom_error',
            message,
            level
        }, context);
    }

    /**
     * Report a network error
     */
    reportNetworkError(url, status, statusText, context = {}) {
        return this.reportError({
            type: 'network_error',
            message: `Network request failed: ${status} ${statusText}`,
            url,
            status,
            statusText
        }, context);
    }

    /**
     * Report a validation error
     */
    reportValidationError(field, value, rule, context = {}) {
        return this.reportError({
            type: 'validation_error',
            message: `Validation failed for field '${field}': ${rule}`,
            field,
            value,
            rule
        }, context);
    }

    /**
     * Set user context
     */
    setUser(userId, userData = {}) {
        this.config.userId = userId;
        this.addBreadcrumb('user_identified', { userId, ...userData });
    }

    /**
     * Set custom context
     */
    setContext(key, value) {
        this.addBreadcrumb('context_set', { key, value });
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stored = this.loadStoredErrors();
        const errorTypes = {};
        
        stored.forEach(error => {
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        });

        return {
            totalErrors: stored.length,
            errorTypes,
            queuedErrors: this.errorQueue.length,
            sessionId: this.sessionId,
            breadcrumbs: this.breadcrumbs.length
        };
    }

    /**
     * Clear stored errors
     */
    clearStoredErrors() {
        try {
            localStorage.removeItem('error_reporter_errors');
            this.addBreadcrumb('stored_errors_cleared');
        } catch (e) {
            console.warn('Failed to clear stored errors:', e);
        }
    }

    /**
     * Export errors for debugging
     */
    exportErrors() {
        const stored = this.loadStoredErrors();
        const exportData = {
            errors: stored,
            stats: this.getErrorStats(),
            breadcrumbs: this.breadcrumbs,
            config: {
                environment: this.config.environment,
                version: this.config.version,
                sessionId: this.sessionId
            },
            exportedAt: new Date().toISOString()
        };

        return exportData;
    }

    /**
     * Destroy the error reporter
     */
    destroy() {
        this.flushErrorQueue();
        this.breadcrumbs = [];
        this.errorQueue = [];
    }
}

export default ErrorReporter;