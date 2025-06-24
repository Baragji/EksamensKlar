/**
 * Resource Error Handler
 * Handles fallback mechanisms for missing CSS/JS files and improved error logging
 */

class ResourceErrorHandler {
    constructor() {
        this.failedResources = new Set();
        this.fallbackAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.errorLog = [];
        this.fallbackConfigs = new Map();
        
        this.initializeErrorHandling();
        this.setupFallbackConfigs();
        this.loadPersistedErrors();
    }

    /**
     * Initialize global error handling
     */
    initializeErrorHandling() {
        // Handle CSS load errors
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'LINK' && event.target.rel === 'stylesheet') {
                this.handleCSSError(event.target);
            }
        }, true);

        // Handle JS load errors
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'SCRIPT') {
                this.handleJSError(event.target);
            }
        }, true);

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise,
                timestamp: new Date().toISOString()
            });
        });

        // Handle general JavaScript errors
        window.addEventListener('error', (event) => {
            if (!event.target || event.target === window) {
                this.logError('JavaScript Error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error,
                    timestamp: new Date().toISOString()
                });
            }
        });

        console.log('🛡️ Resource Error Handler initialized');
    }

    /**
     * Setup fallback configurations for different resource types
     */
    setupFallbackConfigs() {
        // CSS fallbacks
        this.fallbackConfigs.set('styles/global.css', {
            fallbacks: [
                './styles/global-fallback.css',
                './styles/minimal.css',
                'data:text/css,body{font-family:Arial,sans-serif;margin:0;padding:20px;}'
            ],
            critical: true
        });

        this.fallbackConfigs.set('styles/components.css', {
            fallbacks: [
                './styles/components-fallback.css',
                './styles/basic-components.css',
                'data:text/css,.btn{padding:8px 16px;border:1px solid #ccc;background:#f5f5f5;}'
            ],
            critical: true
        });

        // JS fallbacks
        this.fallbackConfigs.set('core/app.js', {
            fallbacks: [
                './core/app-fallback.js'
            ],
            critical: true,
            callback: () => this.initializeMinimalApp()
        });

        this.fallbackConfigs.set('core/module-loader.js', {
            fallbacks: [
                './core/module-loader-fallback.js'
            ],
            critical: true,
            callback: () => this.initializeSimpleLoader()
        });
    }

    /**
     * Handle CSS loading errors
     */
    async handleCSSError(linkElement) {
        const href = linkElement.href;
        const resourcePath = this.getResourcePath(href);
        
        this.logError('CSS Load Error', {
            href,
            resourcePath,
            timestamp: new Date().toISOString()
        });

        this.failedResources.add(resourcePath);
        
        // Try fallbacks
        const success = await this.tryFallbacks(resourcePath, 'css', linkElement);
        
        if (!success) {
            console.warn(`[ResourceErrorHandler] No fallback available for CSS: ${resourcePath}`);
            this.createEmergencyCSS(resourcePath);
        }
        
        this.showResourceErrorNotice('Some styles may not load correctly. Using fallback styles.');
    }

    /**
     * Handle JavaScript loading errors
     */
    async handleJSError(scriptElement) {
        const src = scriptElement.src;
        const resourcePath = this.getResourcePath(src);
        
        this.logError('JavaScript Load Error', {
            src,
            resourcePath,
            timestamp: new Date().toISOString()
        });

        this.failedResources.add(resourcePath);
        
        // Try fallbacks
        const success = await this.tryFallbacks(resourcePath, 'js', scriptElement);
        
        if (!success) {
            console.warn(`[ResourceErrorHandler] No fallback available for JS: ${resourcePath}`);
            this.createEmergencyJS(resourcePath);
        }
        
        this.showResourceErrorNotice('Some functionality may not work correctly. Using fallback mode.');
    }

    /**
     * Try fallback resources
     */
    async tryFallbacks(resourcePath, type, originalElement) {
        const config = this.fallbackConfigs.get(resourcePath);
        if (!config || !config.fallbacks) {
            return false;
        }

        for (const fallbackPath of config.fallbacks) {
            try {
                const success = await this.loadFallbackResource(fallbackPath, type, originalElement);
                if (success) {
                    this.logError('Fallback Success', {
                        original: resourcePath,
                        fallback: fallbackPath,
                        type,
                        timestamp: new Date().toISOString()
                    });
                    
                    if (config.callback) {
                        config.callback();
                    }
                    
                    return true;
                }
            } catch (error) {
                this.logError('Fallback Failed', {
                    original: resourcePath,
                    fallback: fallbackPath,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return false;
    }

    /**
     * Load a fallback resource
     */
    loadFallbackResource(fallbackPath, type, originalElement) {
        return new Promise((resolve) => {
            if (type === 'css') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = fallbackPath;
                
                link.onload = () => {
                    // Remove original failed element
                    if (originalElement.parentNode) {
                        originalElement.parentNode.removeChild(originalElement);
                    }
                    resolve(true);
                };
                
                link.onerror = () => resolve(false);
                
                document.head.appendChild(link);
            } else if (type === 'js') {
                const script = document.createElement('script');
                script.src = fallbackPath;
                
                script.onload = () => {
                    // Remove original failed element
                    if (originalElement.parentNode) {
                        originalElement.parentNode.removeChild(originalElement);
                    }
                    resolve(true);
                };
                
                script.onerror = () => resolve(false);
                
                document.head.appendChild(script);
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Create emergency CSS when all fallbacks fail
     */
    createEmergencyCSS(resourcePath) {
        const style = document.createElement('style');
        
        let emergencyCSS = '';
        
        if (resourcePath.includes('global')) {
            emergencyCSS = `
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                    background-color: #fff;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .error-notice {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }
            `;
        } else if (resourcePath.includes('components')) {
            emergencyCSS = `
                .btn {
                    display: inline-block;
                    padding: 8px 16px;
                    margin: 4px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #f8f9fa;
                    color: #333;
                    text-decoration: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn:hover {
                    background: #e9ecef;
                }
                .btn-primary {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                .btn-primary:hover {
                    background: #0056b3;
                }
                .card {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 16px;
                    margin: 16px 0;
                    background: white;
                }
                .nav {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                }
                .nav li {
                    margin-right: 20px;
                }
                .nav a {
                    text-decoration: none;
                    color: #333;
                    padding: 8px 12px;
                    display: block;
                }
                .nav a:hover {
                    background: #f8f9fa;
                }
            `;
        }
        
        style.textContent = emergencyCSS;
        document.head.appendChild(style);
        
        this.logError('Emergency CSS Created', {
            resourcePath,
            timestamp: new Date().toISOString()
        });
        
        this.showResourceErrorNotice(`CSS file '${resourcePath}' failed to load. Using emergency styles.`);
    }

    /**
     * Create emergency JavaScript when all fallbacks fail
     */
    createEmergencyJS(resourcePath) {
        if (resourcePath.includes('app.js')) {
            this.initializeMinimalApp();
        } else if (resourcePath.includes('module-loader')) {
            this.initializeSimpleLoader();
        }
        
        this.logError('Emergency JS Created', {
            resourcePath,
            timestamp: new Date().toISOString()
        });
        
        this.showResourceErrorNotice(`JavaScript file '${resourcePath}' failed to load. Using minimal functionality.`);
    }

    /**
     * Initialize minimal app functionality
     */
    initializeMinimalApp() {
        window.app = {
            init: () => {
                console.log('📱 Minimal app initialized');
                this.showResourceErrorNotice('Application is running in minimal mode due to resource loading issues.');
            },
            navigate: (path) => {
                console.log('🧭 Minimal navigation to:', path);
                window.location.hash = path;
            }
        };
        
        // Basic navigation handling
        window.addEventListener('hashchange', () => {
            console.log('🔄 Hash changed to:', window.location.hash);
        });
        
        // Initialize immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => window.app.init());
        } else {
            window.app.init();
        }
    }

    /**
     * Initialize simple module loader
     */
    initializeSimpleLoader() {
        window.moduleLoader = {
            loadModule: async (moduleName) => {
                console.log('📦 Simple loader attempting to load:', moduleName);
                try {
                    const module = await import(`./modules/${moduleName}/${moduleName}.js`);
                    console.log('✅ Module loaded:', moduleName);
                    return module;
                } catch (error) {
                    console.error('❌ Failed to load module:', moduleName, error);
                    throw error;
                }
            }
        };
    }

    /**
     * Show user-friendly error notice
     */
    showResourceErrorNotice(message, type = 'warning') {
        // Prevent duplicate notifications
        const existingNotice = document.querySelector('.resource-error-notice');
        if (existingNotice && existingNotice.textContent === message) {
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `resource-error-notice ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#ffc107'};
            color: ${type === 'error' ? 'white' : '#212529'};
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            font-weight: 500;
            transition: opacity 0.3s ease;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button style="
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 8px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 10 seconds
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, 10000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
    }
    
    /**
     * Remove notification with animation
     */
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * Extract resource path from full URL
     */
    getResourcePath(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.replace(/^\//, '');
        } catch {
            return url;
        }
    }

    /**
     * Log error with structured data
     */
    logError(type, details) {
        const errorEntry = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorLog.push(errorEntry);
        this.persistError(errorEntry);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }
        
        // Console logging with appropriate level
        if (type.includes('Error') || type.includes('Failed')) {
            console.error(`🚨 ${type}:`, details);
        } else {
            console.warn(`⚠️ ${type}:`, details);
        }
        
        // Emit event for external error tracking
        if (window.eventBus) {
            window.eventBus.emit('resourceError', type, errorEntry);
        }
    }

    /**
     * Persist error to localStorage
     */
    persistError(errorEntry) {
        try {
            const existingErrors = JSON.parse(
                localStorage.getItem('eksamensklar_resource_errors') || '[]'
            );
            
            existingErrors.push(errorEntry);
            
            // Keep only last 100 errors to prevent localStorage bloat
            if (existingErrors.length > 100) {
                existingErrors.splice(0, existingErrors.length - 100);
            }
            
            localStorage.setItem(
                'eksamensklar_resource_errors',
                JSON.stringify(existingErrors)
            );
        } catch (error) {
            console.warn('[ResourceErrorHandler] Could not persist error to localStorage:', error);
        }
    }

    /**
     * Load persisted errors from localStorage
     */
    loadPersistedErrors() {
        try {
            const persistedErrors = JSON.parse(
                localStorage.getItem('eksamensklar_resource_errors') || '[]'
            );
            
            // Only load errors from the last 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentErrors = persistedErrors.filter(error => {
                const errorDate = new Date(error.timestamp);
                return errorDate > oneDayAgo;
            });
            
            this.errorLog = recentErrors;
            
            if (recentErrors.length > 0) {
                console.log(`[ResourceErrorHandler] Loaded ${recentErrors.length} persisted errors`);
            }
        } catch (error) {
            console.warn('[ResourceErrorHandler] Could not load persisted errors:', error);
            this.errorLog = [];
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errorLog.length,
            failedResources: Array.from(this.failedResources),
            errorsByType: {},
            recentErrors: this.errorLog.slice(-10)
        };
        
        this.errorLog.forEach(error => {
            stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.failedResources.clear();
        this.fallbackAttempts.clear();
        console.log('🧹 Error log cleared');
    }

    /**
     * Export error logs for debugging
     */
    exportErrorLogs() {
        try {
            const logs = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    version: '1.0.0'
                },
                errors: this.errorLog,
                fallbackConfigs: Object.fromEntries(this.fallbackConfigs),
                statistics: {
                    totalErrors: this.errorLog.length,
                    errorTypes: this.getErrorStatistics(),
                    timeRange: this.getTimeRange()
                }
            };
            
            const blob = new Blob([JSON.stringify(logs, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eksamensklar-resource-errors-${new Date().toISOString().split('T')[0]}.json`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[ResourceErrorHandler] Error logs exported successfully');
            this.showResourceErrorNotice('Error logs exported successfully', 'success');
            
        } catch (error) {
            console.error('[ResourceErrorHandler] Failed to export error logs:', error);
            this.showResourceErrorNotice('Failed to export error logs', 'error');
        }
    }
    
    /**
     * Get error statistics
     */
    getErrorStatistics() {
        const stats = {};
        this.errorLog.forEach(error => {
            const type = error.type || 'unknown';
            stats[type] = (stats[type] || 0) + 1;
        });
        return stats;
    }
    
    /**
     * Get time range of errors
     */
    getTimeRange() {
        if (this.errorLog.length === 0) {
            return null;
        }
        
        const timestamps = this.errorLog
            .map(error => new Date(error.timestamp))
            .filter(date => !isNaN(date.getTime()))
            .sort((a, b) => a - b);
            
        if (timestamps.length === 0) {
            return null;
        }
        
        return {
            earliest: timestamps[0].toISOString(),
            latest: timestamps[timestamps.length - 1].toISOString(),
            duration: timestamps[timestamps.length - 1] - timestamps[0]
        };
    }
    
    /**
     * Clear error logs
     */
    clearErrorLogs() {
        this.errorLog = [];
        try {
            localStorage.removeItem('eksamensklar_resource_errors');
            console.log('[ResourceErrorHandler] Error logs cleared');
            this.showResourceErrorNotice('Error logs cleared', 'success');
        } catch (error) {
            console.warn('[ResourceErrorHandler] Could not clear localStorage:', error);
        }
    }
    
    /**
     * Get error summary
     */
    getErrorSummary() {
        return {
            totalErrors: this.errorLog.length,
            recentErrors: this.errorLog.slice(-10),
            statistics: this.getErrorStatistics(),
            timeRange: this.getTimeRange()
        };
    }
}

// Initialize global resource error handler
const resourceErrorHandler = new ResourceErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceErrorHandler;
} else {
    window.ResourceErrorHandler = ResourceErrorHandler;
    window.resourceErrorHandler = resourceErrorHandler;
    
    // Expose useful methods globally for debugging
    window.getResourceErrors = () => window.resourceErrorHandler.getErrorSummary();
    window.exportResourceErrors = () => window.resourceErrorHandler.exportErrorLogs();
    window.clearResourceErrors = () => window.resourceErrorHandler.clearErrorLogs();
    
    console.log('[ResourceErrorHandler] Initialized successfully');
    
    // Log initialization info
    const existingErrors = window.resourceErrorHandler.errorLog.length;
    if (existingErrors > 0) {
        console.warn(`[ResourceErrorHandler] Found ${existingErrors} persisted errors from previous sessions`);
    }
}

console.log('🛡️ Resource Error Handler loaded and initialized');