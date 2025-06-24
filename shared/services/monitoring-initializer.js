/**
 * Monitoring Initializer
 * Centralized initialization and coordination of all monitoring services
 */

import PerformanceMonitor from './performance-monitor.js';
import ErrorReporter from './error-reporter.js';
import AnalyticsService from './analytics-service.js';
import MonitoringDashboard from '../components/monitoring-dashboard.js';

class MonitoringInitializer {
    constructor(config = {}) {
        this.config = {
            // Performance monitoring
            enablePerformanceMonitoring: true,
            performanceConfig: {
                enableNavigationTiming: true,
                enableResourceTiming: true,
                enableUserTiming: true,
                enableLongTasks: true,
                enableLayoutShift: true,
                enableLargestContentfulPaint: true,
                enableFirstInputDelay: true,
                bufferSize: 100,
                flushInterval: 30000
            },
            
            // Error reporting
            enableErrorReporting: true,
            errorConfig: {
                enableConsoleLogging: true,
                enableRemoteLogging: false,
                enableLocalStorage: true,
                maxStoredErrors: 50,
                enableStackTrace: true,
                enableUserContext: true,
                enableBreadcrumbs: true,
                maxBreadcrumbs: 20
            },
            
            // Analytics
            enableAnalytics: true,
            analyticsConfig: {
                enablePageViews: true,
                enableEvents: true,
                enableUserActions: true,
                enableConversions: true,
                enableSessionTracking: true,
                enablePerformanceTracking: true,
                bufferSize: 50,
                flushInterval: 10000,
                requireConsent: true
            },
            
            // Dashboard
            enableDashboard: false, // Disabled by default for production
            dashboardConfig: {
                enableRealTimeUpdates: true,
                updateInterval: 5000,
                position: 'bottom-right',
                minimized: true,
                theme: 'dark'
            },
            
            // Global settings
            environment: 'production',
            apiEndpoint: null,
            enableDebugMode: false,
            enableConsentManagement: true,
            
            ...config
        };
        
        this.services = {
            performanceMonitor: null,
            errorReporter: null,
            analyticsService: null,
            dashboard: null
        };
        
        this.isInitialized = false;
        this.consentGiven = false;
    }
    
    /**
     * Initialize all monitoring services
     */
    async init() {
        try {
            console.log('🚀 Initializing monitoring services...');
            
            // Check consent if required
            if (this.config.enableConsentManagement) {
                await this.checkConsent();
            } else {
                this.consentGiven = true;
            }
            
            // Initialize services based on configuration
            await this.initializeServices();
            
            // Setup service integrations
            this.setupServiceIntegrations();
            
            // Setup global error handlers
            this.setupGlobalHandlers();
            
            // Initialize dashboard if enabled
            if (this.config.enableDashboard) {
                this.initializeDashboard();
            }
            
            this.isInitialized = true;
            console.log('✅ Monitoring services initialized successfully');
            
            // Send initialization event
            this.trackEvent('monitoring_initialized', {
                services: Object.keys(this.services).filter(key => this.services[key] !== null),
                environment: this.config.environment,
                consent_given: this.consentGiven
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize monitoring services:', error);
            this.reportError(error, 'monitoring_initialization_failed');
        }
    }
    
    /**
     * Check user consent for monitoring
     */
    async checkConsent() {
        // Check if consent was previously given
        const storedConsent = localStorage.getItem('monitoring_consent');
        
        if (storedConsent === 'granted') {
            this.consentGiven = true;
            return;
        }
        
        if (storedConsent === 'denied') {
            this.consentGiven = false;
            return;
        }
        
        // Show consent dialog if no previous consent
        this.consentGiven = await this.showConsentDialog();
        
        // Store consent decision
        localStorage.setItem('monitoring_consent', this.consentGiven ? 'granted' : 'denied');
    }
    
    /**
     * Show consent dialog
     */
    async showConsentDialog() {
        return new Promise((resolve) => {
            // Create consent dialog
            const dialog = document.createElement('div');
            dialog.className = 'monitoring-consent-dialog';
            dialog.innerHTML = `
                <div class="consent-overlay">
                    <div class="consent-modal">
                        <h3>📊 Monitoring & Analytics</h3>
                        <p>Vi vil gerne indsamle anonyme data om applikationens ydeevne og fejl for at forbedre din oplevelse.</p>
                        <p>Dette inkluderer:</p>
                        <ul>
                            <li>Sideindlæsningstider og ydeevne</li>
                            <li>JavaScript-fejl og tekniske problemer</li>
                            <li>Anonyme brugsstatistikker</li>
                        </ul>
                        <p><strong>Ingen personlige data indsamles.</strong></p>
                        <div class="consent-buttons">
                            <button class="btn-deny">Afvis</button>
                            <button class="btn-accept">Accepter</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add styles
            const styles = document.createElement('style');
            styles.textContent = `
                .monitoring-consent-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10001;
                }
                
                .consent-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .consent-modal {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    max-width: 500px;
                    margin: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
                
                .consent-modal h3 {
                    margin: 0 0 16px 0;
                    color: #333;
                }
                
                .consent-modal p {
                    margin: 0 0 12px 0;
                    color: #666;
                    line-height: 1.5;
                }
                
                .consent-modal ul {
                    margin: 0 0 12px 20px;
                    color: #666;
                }
                
                .consent-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                .consent-buttons button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .btn-deny {
                    background: #f5f5f5;
                    color: #666;
                }
                
                .btn-accept {
                    background: #007acc;
                    color: white;
                }
                
                .btn-deny:hover {
                    background: #e0e0e0;
                }
                
                .btn-accept:hover {
                    background: #005a99;
                }
            `;
            
            document.head.appendChild(styles);
            document.body.appendChild(dialog);
            
            // Handle button clicks
            dialog.querySelector('.btn-accept').addEventListener('click', () => {
                document.body.removeChild(dialog);
                document.head.removeChild(styles);
                resolve(true);
            });
            
            dialog.querySelector('.btn-deny').addEventListener('click', () => {
                document.body.removeChild(dialog);
                document.head.removeChild(styles);
                resolve(false);
            });
        });
    }
    
    /**
     * Initialize individual services
     */
    async initializeServices() {
        // Initialize Performance Monitor
        if (this.config.enablePerformanceMonitoring) {
            this.services.performanceMonitor = new PerformanceMonitor({
                ...this.config.performanceConfig,
                apiEndpoint: this.config.apiEndpoint,
                enabled: this.consentGiven
            });
            
            if (this.consentGiven) {
                this.services.performanceMonitor.init();
            }
        }
        
        // Initialize Error Reporter
        if (this.config.enableErrorReporting) {
            this.services.errorReporter = new ErrorReporter({
                ...this.config.errorConfig,
                apiEndpoint: this.config.apiEndpoint,
                enabled: this.consentGiven
            });
            
            if (this.consentGiven) {
                this.services.errorReporter.init();
            }
        }
        
        // Initialize Analytics Service
        if (this.config.enableAnalytics) {
            this.services.analyticsService = new AnalyticsService({
                ...this.config.analyticsConfig,
                apiEndpoint: this.config.apiEndpoint,
                consentGiven: this.consentGiven
            });
            
            if (this.consentGiven) {
                this.services.analyticsService.init();
            }
        }
    }
    
    /**
     * Setup integrations between services
     */
    setupServiceIntegrations() {
        // Connect error reporter to analytics
        if (this.services.errorReporter && this.services.analyticsService) {
            this.services.errorReporter.onError((error) => {
                this.services.analyticsService.trackEvent('error_occurred', {
                    error_type: error.type,
                    error_message: error.message,
                    error_source: error.source
                });
            });
        }
        
        // Connect performance monitor to analytics
        if (this.services.performanceMonitor && this.services.analyticsService) {
            this.services.performanceMonitor.onMetric((metric) => {
                this.services.analyticsService.trackPerformance(metric.name, metric.value, {
                    metric_type: metric.type,
                    timestamp: metric.timestamp
                });
            });
        }
        
        // Setup cross-service error reporting
        if (this.services.errorReporter) {
            // Report analytics errors
            if (this.services.analyticsService) {
                this.services.analyticsService.onError((error) => {
                    this.services.errorReporter.reportError(error, 'analytics_service_error');
                });
            }
            
            // Report performance monitoring errors
            if (this.services.performanceMonitor) {
                this.services.performanceMonitor.onError((error) => {
                    this.services.errorReporter.reportError(error, 'performance_monitor_error');
                });
            }
        }
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Global unhandled error handler
        window.addEventListener('error', (event) => {
            this.reportError(event.error, 'global_javascript_error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.reportError(event.reason, 'global_promise_rejection');
        });
        
        // Page visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
                this.flushAllData();
            } else {
                this.trackEvent('page_visible');
            }
        });
        
        // Before unload handler
        window.addEventListener('beforeunload', () => {
            this.flushAllData();
        });
    }
    
    /**
     * Initialize monitoring dashboard
     */
    initializeDashboard() {
        if (!this.config.enableDashboard) return;
        
        this.services.dashboard = new MonitoringDashboard(this.config.dashboardConfig);
        
        // Connect services to dashboard
        this.services.dashboard.setServices(
            this.services.performanceMonitor,
            this.services.errorReporter,
            this.services.analyticsService
        );
        
        // Show dashboard if in development mode
        if (this.config.environment === 'development' || this.config.enableDebugMode) {
            this.services.dashboard.show();
        }
        
        // Add keyboard shortcut to toggle dashboard (Ctrl+Shift+M)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'M') {
                event.preventDefault();
                this.services.dashboard.toggle();
            }
        });
    }
    
    /**
     * Track an event across all services
     */
    trackEvent(eventName, properties = {}) {
        if (this.services.analyticsService && this.consentGiven) {
            this.services.analyticsService.trackEvent(eventName, properties);
        }
        
        if (this.config.enableDebugMode) {
            console.log('📊 Event tracked:', eventName, properties);
        }
    }
    
    /**
     * Report an error across all services
     */
    reportError(error, context = 'unknown', additionalData = {}) {
        if (this.services.errorReporter) {
            this.services.errorReporter.reportError(error, context, additionalData);
        }
        
        if (this.config.enableDebugMode) {
            console.error('🚨 Error reported:', error, context, additionalData);
        }
    }
    
    /**
     * Track performance metric across all services
     */
    trackPerformance(metricName, value, properties = {}) {
        if (this.services.performanceMonitor && this.consentGiven) {
            this.services.performanceMonitor.trackCustomMetric(metricName, value, properties);
        }
        
        if (this.services.analyticsService && this.consentGiven) {
            this.services.analyticsService.trackPerformance(metricName, value, properties);
        }
        
        if (this.config.enableDebugMode) {
            console.log('⚡ Performance tracked:', metricName, value, properties);
        }
    }
    
    /**
     * Flush all buffered data
     */
    flushAllData() {
        if (this.services.performanceMonitor) {
            this.services.performanceMonitor.flush();
        }
        
        if (this.services.analyticsService) {
            this.services.analyticsService.flush();
        }
        
        if (this.config.enableDebugMode) {
            console.log('💾 All monitoring data flushed');
        }
    }
    
    /**
     * Update consent status
     */
    updateConsent(consentGiven) {
        const previousConsent = this.consentGiven;
        this.consentGiven = consentGiven;
        
        // Store consent decision
        localStorage.setItem('monitoring_consent', consentGiven ? 'granted' : 'denied');
        
        // Update services
        if (this.services.performanceMonitor) {
            this.services.performanceMonitor.updateConsent(consentGiven);
        }
        
        if (this.services.analyticsService) {
            this.services.analyticsService.updateConsent(consentGiven);
        }
        
        // Track consent change
        if (consentGiven && !previousConsent) {
            this.trackEvent('monitoring_consent_granted');
        } else if (!consentGiven && previousConsent) {
            this.trackEvent('monitoring_consent_revoked');
        }
        
        if (this.config.enableDebugMode) {
            console.log('🔒 Consent updated:', consentGiven);
        }
    }
    
    /**
     * Get monitoring summary
     */
    getSummary() {
        return {
            initialized: this.isInitialized,
            consentGiven: this.consentGiven,
            environment: this.config.environment,
            services: {
                performanceMonitor: {
                    enabled: !!this.services.performanceMonitor,
                    summary: this.services.performanceMonitor?.getPerformanceSummary() || null
                },
                errorReporter: {
                    enabled: !!this.services.errorReporter,
                    stats: this.services.errorReporter?.getErrorStats() || null
                },
                analyticsService: {
                    enabled: !!this.services.analyticsService,
                    summary: this.services.analyticsService?.getAnalyticsSummary() || null
                },
                dashboard: {
                    enabled: !!this.services.dashboard,
                    visible: this.services.dashboard?.isVisible || false
                }
            }
        };
    }
    
    /**
     * Get service instance
     */
    getService(serviceName) {
        return this.services[serviceName] || null;
    }
    
    /**
     * Destroy all services
     */
    destroy() {
        // Stop all services
        Object.values(this.services).forEach(service => {
            if (service && typeof service.destroy === 'function') {
                service.destroy();
            }
        });
        
        // Clear services
        this.services = {
            performanceMonitor: null,
            errorReporter: null,
            analyticsService: null,
            dashboard: null
        };
        
        this.isInitialized = false;
        
        if (this.config.enableDebugMode) {
            console.log('🗑️ All monitoring services destroyed');
        }
    }
}

// Global monitoring instance
let globalMonitoring = null;

/**
 * Initialize global monitoring
 */
export function initializeMonitoring(config = {}) {
    if (globalMonitoring) {
        console.warn('Monitoring already initialized');
        return globalMonitoring;
    }
    
    globalMonitoring = new MonitoringInitializer(config);
    globalMonitoring.init();
    
    // Make available globally for debugging
    if (typeof window !== 'undefined') {
        window.monitoring = globalMonitoring;
    }
    
    return globalMonitoring;
}

/**
 * Get global monitoring instance
 */
export function getMonitoring() {
    return globalMonitoring;
}

/**
 * Quick access functions
 */
export function trackEvent(eventName, properties) {
    if (globalMonitoring) {
        globalMonitoring.trackEvent(eventName, properties);
    }
}

export function reportError(error, context, additionalData) {
    if (globalMonitoring) {
        globalMonitoring.reportError(error, context, additionalData);
    }
}

export function trackPerformance(metricName, value, properties) {
    if (globalMonitoring) {
        globalMonitoring.trackPerformance(metricName, value, properties);
    }
}

export default MonitoringInitializer;