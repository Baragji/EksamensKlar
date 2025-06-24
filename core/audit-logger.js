/**
 * Enterprise Audit Logger
 * Implementerer omfattende audit logging for compliance og sikkerhedsovervågning
 */

class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000; // Maximum antal logs i memory
        this.batchSize = 100; // Batch størrelse for bulk operations
        this.flushInterval = 30000; // Flush til storage hver 30 sekunder
        this.compressionThreshold = 1000; // Komprimer når der er over 1000 logs
        
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            CRITICAL: 4
        };
        
        this.categories = {
            SECURITY: 'security',
            PERFORMANCE: 'performance',
            USER_ACTION: 'user_action',
            SYSTEM: 'system',
            DATA: 'data',
            ERROR: 'error',
            COMPLIANCE: 'compliance'
        };
        
        this.init();
    }

    async init() {
        await this.loadStoredLogs();
        this.setupPeriodicFlush();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupComplianceTracking();
        
        this.log('SYSTEM', 'Audit Logger initialized', {
            maxLogs: this.maxLogs,
            batchSize: this.batchSize,
            flushInterval: this.flushInterval
        }, 'INFO');
        
        console.log('📋 Audit Logger initialized with enterprise compliance features');
    }

    // Core Logging Function
    log(category, message, data = {}, level = 'INFO', userId = null) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: Date.now(),
            isoTimestamp: new Date().toISOString(),
            category: category,
            level: level,
            message: message,
            data: this.sanitizeLogData(data),
            userId: userId,
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: this.getPerformanceMetrics(),
            stackTrace: level === 'ERROR' || level === 'CRITICAL' ? this.getStackTrace() : null
        };
        
        // Add to memory logs
        this.logs.push(logEntry);
        
        // Maintain max logs limit
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Real-time processing
        this.processLogEntry(logEntry);
        
        // Emit event for real-time monitoring
        if (window.EventBus) {
            window.EventBus.emit('audit:log', logEntry);
        }
        
        return logEntry.id;
    }

    // Specialized Logging Methods
    logSecurity(message, data = {}, level = 'WARN') {
        return this.log(this.categories.SECURITY, message, data, level);
    }
    
    logUserAction(action, data = {}) {
        return this.log(this.categories.USER_ACTION, action, data, 'INFO');
    }
    
    logPerformance(metric, data = {}) {
        return this.log(this.categories.PERFORMANCE, metric, data, 'INFO');
    }
    
    logError(error, context = {}) {
        const errorData = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context: context
        };
        return this.log(this.categories.ERROR, `Error: ${error.message}`, errorData, 'ERROR');
    }
    
    logCompliance(event, data = {}) {
        return this.log(this.categories.COMPLIANCE, event, data, 'INFO');
    }

    // Data Processing
    sanitizeLogData(data) {
        const sanitized = JSON.parse(JSON.stringify(data));
        
        // Remove sensitive information
        const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn'];
        
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            for (const key in obj) {
                if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        };
        
        sanitizeObject(sanitized);
        return sanitized;
    }

    processLogEntry(logEntry) {
        // Check for critical events
        if (logEntry.level === 'CRITICAL') {
            this.handleCriticalEvent(logEntry);
        }
        
        // Check for security patterns
        if (logEntry.category === this.categories.SECURITY) {
            this.analyzeSecurityEvent(logEntry);
        }
        
        // Performance analysis
        if (logEntry.category === this.categories.PERFORMANCE) {
            this.analyzePerformanceEvent(logEntry);
        }
        
        // Compliance tracking
        this.trackComplianceEvent(logEntry);
    }

    handleCriticalEvent(logEntry) {
        console.error('🚨 CRITICAL EVENT:', logEntry);
        
        // Immediate storage
        this.flushToStorage();
        
        // Notify administrators (if notification system exists)
        if (window.NotificationManager) {
            window.NotificationManager.sendCriticalAlert(logEntry);
        }
        
        // Emit critical event
        if (window.EventBus) {
            window.EventBus.emit('audit:critical', logEntry);
        }
    }

    analyzeSecurityEvent(logEntry) {
        // Track security event patterns
        const securityMetrics = this.getSecurityMetrics();
        
        // Check for attack patterns
        const recentSecurityEvents = this.logs
            .filter(log => 
                log.category === this.categories.SECURITY && 
                Date.now() - log.timestamp < 300000 // Last 5 minutes
            );
        
        if (recentSecurityEvents.length > 10) {
            this.log(this.categories.SECURITY, 'Potential security attack detected', {
                eventCount: recentSecurityEvents.length,
                timeWindow: '5 minutes',
                events: recentSecurityEvents.slice(-5) // Last 5 events
            }, 'CRITICAL');
        }
    }

    analyzePerformanceEvent(logEntry) {
        // Track performance degradation
        const performanceMetrics = this.getPerformanceMetrics();
        
        if (performanceMetrics.memoryUsage > 0.8) {
            this.log(this.categories.PERFORMANCE, 'High memory usage detected', {
                memoryUsage: performanceMetrics.memoryUsage,
                threshold: 0.8
            }, 'WARN');
        }
    }

    trackComplianceEvent(logEntry) {
        // GDPR compliance tracking
        if (this.isPersonalDataEvent(logEntry)) {
            this.logCompliance('Personal data processed', {
                originalEvent: logEntry.id,
                dataTypes: this.identifyDataTypes(logEntry.data),
                legalBasis: 'legitimate_interest' // Should be determined by business logic
            });
        }
    }

    isPersonalDataEvent(logEntry) {
        const personalDataIndicators = ['email', 'name', 'phone', 'address', 'userId'];
        const dataString = JSON.stringify(logEntry.data).toLowerCase();
        
        return personalDataIndicators.some(indicator => 
            dataString.includes(indicator)
        );
    }

    identifyDataTypes(data) {
        const dataTypes = [];
        const dataString = JSON.stringify(data).toLowerCase();
        
        if (dataString.includes('email')) dataTypes.push('email');
        if (dataString.includes('name')) dataTypes.push('name');
        if (dataString.includes('phone')) dataTypes.push('phone');
        if (dataString.includes('address')) dataTypes.push('address');
        
        return dataTypes;
    }

    // Storage Management
    async loadStoredLogs() {
        try {
            const storedLogs = localStorage.getItem('audit_logs');
            if (storedLogs) {
                const parsed = JSON.parse(storedLogs);
                this.logs = Array.isArray(parsed) ? parsed : [];
                
                // Clean old logs (older than 30 days)
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                this.logs = this.logs.filter(log => log.timestamp > thirtyDaysAgo);
            }
        } catch (error) {
            console.error('Failed to load stored logs:', error);
            this.logs = [];
        }
    }

    async flushToStorage() {
        try {
            // Compress logs if needed
            let logsToStore = this.logs;
            if (this.logs.length > this.compressionThreshold) {
                logsToStore = await this.compressLogs(this.logs);
            }
            
            localStorage.setItem('audit_logs', JSON.stringify(logsToStore));
            
            // Also store in IndexedDB for larger capacity
            await this.storeInIndexedDB(this.logs);
            
        } catch (error) {
            console.error('Failed to flush logs to storage:', error);
        }
    }

    async compressLogs(logs) {
        // Simple compression: keep only essential fields for older logs
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        return logs.map(log => {
            if (log.timestamp < oneHourAgo) {
                return {
                    id: log.id,
                    timestamp: log.timestamp,
                    category: log.category,
                    level: log.level,
                    message: log.message,
                    compressed: true
                };
            }
            return log;
        });
    }

    async storeInIndexedDB(logs) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('AuditLogs', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['logs'], 'readwrite');
                const store = transaction.objectStore('logs');
                
                // Store in batches
                const batches = this.chunkArray(logs, this.batchSize);
                
                batches.forEach((batch, index) => {
                    store.put({
                        id: `batch_${Date.now()}_${index}`,
                        timestamp: Date.now(),
                        logs: batch
                    });
                });
                
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id' });
                }
            };
        });
    }

    setupPeriodicFlush() {
        setInterval(() => {
            this.flushToStorage();
        }, this.flushInterval);
        
        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flushToStorage();
        });
    }

    // Monitoring Setup
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError(event.error || new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    setupPerformanceMonitoring() {
        // Monitor performance metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.logPerformance('Page Load', {
                            loadTime: entry.loadEventEnd - entry.loadEventStart,
                            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            firstPaint: entry.responseEnd - entry.requestStart
                        });
                    }
                    
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.logPerformance('Largest Contentful Paint', {
                            value: entry.startTime,
                            element: entry.element?.tagName
                        });
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
            } catch (error) {
                console.warn('Performance observer setup failed:', error);
            }
        }
    }

    setupComplianceTracking() {
        // Track consent changes
        if (window.EventBus) {
            window.EventBus.on('consent:changed', (data) => {
                this.logCompliance('Consent changed', data);
            });
            
            window.EventBus.on('data:export', (data) => {
                this.logCompliance('Data export requested', data);
            });
            
            window.EventBus.on('data:delete', (data) => {
                this.logCompliance('Data deletion requested', data);
            });
        }
    }

    // Utility Functions
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSessionId() {
        return window.SecurityManager?.sessionId || 'unknown';
    }

    getStackTrace() {
        try {
            throw new Error();
        } catch (error) {
            return error.stack;
        }
    }

    getPerformanceMetrics() {
        const metrics = {};
        
        if ('performance' in window) {
            metrics.memory = performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null;
            
            metrics.timing = performance.timing ? {
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null;
        }
        
        metrics.memoryUsage = metrics.memory ? 
            metrics.memory.used / metrics.memory.limit : 0;
        
        return metrics;
    }

    getSecurityMetrics() {
        const securityLogs = this.logs.filter(log => 
            log.category === this.categories.SECURITY
        );
        
        return {
            totalSecurityEvents: securityLogs.length,
            recentEvents: securityLogs.filter(log => 
                Date.now() - log.timestamp < 3600000 // Last hour
            ).length,
            criticalEvents: securityLogs.filter(log => 
                log.level === 'CRITICAL'
            ).length
        };
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Query and Export Functions
    queryLogs(filters = {}) {
        let filteredLogs = [...this.logs];
        
        if (filters.category) {
            filteredLogs = filteredLogs.filter(log => log.category === filters.category);
        }
        
        if (filters.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filters.level);
        }
        
        if (filters.startTime) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime);
        }
        
        if (filters.endTime) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime);
        }
        
        if (filters.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }
        
        return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    }

    exportLogs(format = 'json', filters = {}) {
        const logs = this.queryLogs(filters);
        
        switch (format) {
            case 'csv':
                return this.exportToCSV(logs);
            case 'json':
                return JSON.stringify(logs, null, 2);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    exportToCSV(logs) {
        if (logs.length === 0) return '';
        
        const headers = ['timestamp', 'category', 'level', 'message', 'userId', 'url'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
            const row = headers.map(header => {
                const value = log[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Statistics and Reporting
    getStatistics(timeRange = 3600000) { // Default: last hour
        const cutoff = Date.now() - timeRange;
        const recentLogs = this.logs.filter(log => log.timestamp >= cutoff);
        
        const stats = {
            totalLogs: recentLogs.length,
            byCategory: {},
            byLevel: {},
            errorRate: 0,
            averageLogsPerMinute: 0
        };
        
        recentLogs.forEach(log => {
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        });
        
        const errorLogs = recentLogs.filter(log => 
            log.level === 'ERROR' || log.level === 'CRITICAL'
        );
        stats.errorRate = recentLogs.length > 0 ? 
            (errorLogs.length / recentLogs.length) * 100 : 0;
        
        stats.averageLogsPerMinute = recentLogs.length / (timeRange / 60000);
        
        return stats;
    }

    // Cleanup
    cleanup() {
        this.flushToStorage();
        
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
    }
}

// Initialize Audit Logger
if (typeof window !== 'undefined') {
    window.AuditLogger = new AuditLogger();
}

// Export removed to fix syntax error - AuditLogger is available globally
// export default AuditLogger;