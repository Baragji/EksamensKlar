/**
 * Monitoring Integration
 * Integrates monitoring services with the ExamKlar application
 */

import { initializeMonitoring, trackEvent, reportError, trackPerformance } from '../shared/index.js';
import { AppConfig } from '../config/app-config.js';

class MonitoringIntegration {
    constructor() {
        this.monitoring = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize monitoring for the application
     */
    async init() {
        try {
            console.log('🔧 Initializing monitoring integration...');
            
            // Get monitoring configuration
            const config = this.getMonitoringConfig();
            
            // Initialize monitoring services
            this.monitoring = initializeMonitoring(config);
            
            // Setup application-specific tracking
            this.setupApplicationTracking();
            
            // Setup module-specific tracking
            this.setupModuleTracking();
            
            // Setup exam-specific tracking
            this.setupExamTracking();
            
            // Setup accessibility tracking
            this.setupAccessibilityTracking();
            
            this.isInitialized = true;
            console.log('✅ Monitoring integration initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize monitoring integration:', error);
            reportError(error, 'monitoring_integration_failed');
        }
    }
    
    /**
     * Get monitoring configuration from app config
     */
    getMonitoringConfig() {
        const baseConfig = AppConfig.monitoring || {};
        
        // Determine environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('dev');
        
        return {
            ...baseConfig,
            environment: isDevelopment ? 'development' : 'production',
            enableDashboard: isDevelopment || baseConfig.enableDashboard,
            enableDebugMode: isDevelopment || baseConfig.enableDebugMode
        };
    }
    
    /**
     * Setup application-specific tracking
     */
    setupApplicationTracking() {
        // Track application startup
        trackEvent('app_startup', {
            timestamp: Date.now(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            trackEvent('page_visibility_change', {
                hidden: document.hidden,
                timestamp: Date.now()
            });
        });
        
        // Track window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                trackEvent('window_resize', {
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: Date.now()
                });
            }, 250);
        });
        
        // Track connection status
        window.addEventListener('online', () => {
            trackEvent('connection_status_change', {
                status: 'online',
                timestamp: Date.now()
            });
        });
        
        window.addEventListener('offline', () => {
            trackEvent('connection_status_change', {
                status: 'offline',
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * Setup module-specific tracking
     */
    setupModuleTracking() {
        // Track module loading
        this.trackModuleLoading();
        
        // Track module interactions
        this.trackModuleInteractions();
        
        // Track module performance
        this.trackModulePerformance();
    }
    
    /**
     * Track module loading
     */
    trackModuleLoading() {
        // Listen for module load events
        document.addEventListener('moduleLoaded', (event) => {
            trackEvent('module_loaded', {
                module_name: event.detail.moduleName,
                load_time: event.detail.loadTime,
                timestamp: Date.now()
            });
        });
        
        // Listen for module error events
        document.addEventListener('moduleError', (event) => {
            reportError(event.detail.error, 'module_load_error', {
                module_name: event.detail.moduleName,
                error_type: 'module_loading'
            });
        });
    }
    
    /**
     * Track module interactions
     */
    trackModuleInteractions() {
        // Track button clicks in modules
        document.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (button) {
                const moduleContainer = button.closest('[data-module]');
                if (moduleContainer) {
                    trackEvent('module_button_click', {
                        module_name: moduleContainer.dataset.module,
                        button_text: button.textContent.trim(),
                        button_id: button.id,
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        // Track form submissions in modules
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const moduleContainer = form.closest('[data-module]');
            if (moduleContainer) {
                trackEvent('module_form_submit', {
                    module_name: moduleContainer.dataset.module,
                    form_id: form.id,
                    timestamp: Date.now()
                });
            }
        });
    }
    
    /**
     * Track module performance
     */
    trackModulePerformance() {
        // Track module render times
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('module-')) {
                    trackPerformance('module_render_time', entry.duration, {
                        module_name: entry.name.replace('module-', ''),
                        entry_type: entry.entryType
                    });
                }
            }
        });
        
        if ('PerformanceObserver' in window) {
            observer.observe({ entryTypes: ['measure'] });
        }
    }
    
    /**
     * Setup exam-specific tracking
     */
    setupExamTracking() {
        // Track exam start
        document.addEventListener('examStarted', (event) => {
            trackEvent('exam_started', {
                exam_type: event.detail.examType,
                exam_id: event.detail.examId,
                timestamp: Date.now()
            });
        });
        
        // Track exam completion
        document.addEventListener('examCompleted', (event) => {
            trackEvent('exam_completed', {
                exam_type: event.detail.examType,
                exam_id: event.detail.examId,
                score: event.detail.score,
                duration: event.detail.duration,
                timestamp: Date.now()
            });
        });
        
        // Track question interactions
        document.addEventListener('questionAnswered', (event) => {
            trackEvent('question_answered', {
                exam_id: event.detail.examId,
                question_id: event.detail.questionId,
                answer_type: event.detail.answerType,
                time_spent: event.detail.timeSpent,
                timestamp: Date.now()
            });
        });
        
        // Track exam errors
        document.addEventListener('examError', (event) => {
            reportError(event.detail.error, 'exam_error', {
                exam_id: event.detail.examId,
                error_context: event.detail.context
            });
        });
    }
    
    /**
     * Setup accessibility tracking
     */
    setupAccessibilityTracking() {
        // Track accessibility feature usage
        document.addEventListener('accessibilityFeatureUsed', (event) => {
            trackEvent('accessibility_feature_used', {
                feature_name: event.detail.featureName,
                feature_state: event.detail.state,
                timestamp: Date.now()
            });
        });
        
        // Track keyboard navigation
        let keyboardNavigation = false;
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                if (!keyboardNavigation) {
                    keyboardNavigation = true;
                    trackEvent('keyboard_navigation_started', {
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        // Track screen reader usage (approximate)
        if (navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver')) {
            trackEvent('screen_reader_detected', {
                user_agent: navigator.userAgent,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Track custom application event
     */
    trackAppEvent(eventName, properties = {}) {
        trackEvent(`app_${eventName}`, {
            ...properties,
            timestamp: Date.now()
        });
    }
    
    /**
     * Report application error
     */
    reportAppError(error, context = 'application', additionalData = {}) {
        reportError(error, `app_${context}`, {
            ...additionalData,
            timestamp: Date.now()
        });
    }
    
    /**
     * Track application performance metric
     */
    trackAppPerformance(metricName, value, properties = {}) {
        trackPerformance(`app_${metricName}`, value, {
            ...properties,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get monitoring instance
     */
    getMonitoring() {
        return this.monitoring;
    }
    
    /**
     * Check if monitoring is initialized
     */
    isMonitoringInitialized() {
        return this.isInitialized;
    }
}

// Create global instance
const monitoringIntegration = new MonitoringIntegration();

// Export for use in other modules
export default monitoringIntegration;

// Export convenience functions
export function initAppMonitoring() {
    return monitoringIntegration.init();
}

export function trackAppEvent(eventName, properties) {
    return monitoringIntegration.trackAppEvent(eventName, properties);
}

export function reportAppError(error, context, additionalData) {
    return monitoringIntegration.reportAppError(error, context, additionalData);
}

export function trackAppPerformance(metricName, value, properties) {
    return monitoringIntegration.trackAppPerformance(metricName, value, properties);
}

export function getAppMonitoring() {
    return monitoringIntegration.getMonitoring();
}