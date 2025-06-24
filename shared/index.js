/**
 * ExamKlar Shared Module Index
 * Central export point for all shared components, utilities, and services
 */

// Import all shared modules
import { APP_CONFIG, API_ENDPOINTS, MODULE_TYPES, MODULE_STATUS, EVENT_TYPES, STORAGE_KEYS, THEMES, PERFORMANCE_THRESHOLDS, SECURITY_CONFIG, A11Y_CONFIG, ANIMATION_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULT_CONFIG } from './constants/app-constants.js';
import { querySelector, querySelectorAll, createElement, addEventListener, isElementVisible, scrollToElement, getComputedStyleProperty, matchesMediaQuery, debounce, throttle, waitForDOM, createFocusTrap } from './utilities/dom-utils.js';
import { isValidEmail, isValidURL, validateRequiredFields, sanitizeHTML, escapeRegex, deepClone, isEmpty, formatFileSize, formatDuration, generateId, generateUUID, capitalize, camelToKebab, kebabToCamel, parseQueryString, buildQueryString, isNumeric, clamp, roundTo } from './utilities/validation-utils.js';
import { HttpService } from './services/http-service.js';
import { StorageService } from './services/storage-service.js';
import { NotificationComponent } from './components/notification-component.js';
import { ModalComponent } from './components/modal-component.js';

// Re-export constants
export const Constants = {
    APP_CONFIG,
    API_ENDPOINTS,
    MODULE_TYPES,
    MODULE_STATUS,
    EVENT_TYPES,
    STORAGE_KEYS,
    THEMES,
    PERFORMANCE_THRESHOLDS,
    SECURITY_CONFIG,
    A11Y_CONFIG,
    ANIMATION_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DEFAULT_CONFIG
};

// Re-export utilities
export const DOMUtils = {
    querySelector,
    querySelectorAll,
    createElement,
    addEventListener,
    isElementVisible,
    scrollToElement,
    getComputedStyleProperty,
    matchesMediaQuery,
    debounce,
    throttle,
    waitForDOM,
    createFocusTrap
};

export const ValidationUtils = {
    isValidEmail,
    isValidURL,
    validateRequiredFields,
    sanitizeHTML,
    escapeRegex,
    deepClone,
    isEmpty,
    formatFileSize,
    formatDuration,
    generateId,
    generateUUID,
    capitalize,
    camelToKebab,
    kebabToCamel,
    parseQueryString,
    buildQueryString,
    isNumeric,
    clamp,
    roundTo
};

// Re-export services
export { HttpService, StorageService };
export { default as EventBus } from './services/event-bus.js';
export { default as PerformanceMonitor } from './services/performance-monitor.js';
export { default as ErrorReporter } from './services/error-reporter.js';
export { default as AnalyticsService } from './services/analytics-service.js';
export { default as MonitoringInitializer, initializeMonitoring, getMonitoring, trackEvent, reportError, trackPerformance } from './services/monitoring-initializer.js';

// Re-export components
export { NotificationComponent, ModalComponent };
export { default as MonitoringDashboard } from './components/monitoring-dashboard.js';

// Create service instances for global use
export const httpService = new HttpService();
export const storageService = new StorageService();
export const notificationService = new NotificationComponent();
export const modalService = new ModalComponent();

// Convenience object with all shared functionality
export const ExamKlarShared = {
    Constants,
    DOMUtils,
    ValidationUtils,
    Services: {
        Http: httpService,
        Storage: storageService,
        Notification: notificationService,
        Modal: modalService
    },
    Components: {
        NotificationComponent,
        ModalComponent
    }
};

// Global initialization function
export function initializeShared() {
    console.log('🚀 ExamKlar Shared modules initialized');
    
    // Initialize notification service
    notificationService.init();
    
    // Initialize modal service
    modalService.init();
    
    // Set up global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        notificationService.show(
            'Der opstod en uventet fejl. Prøv at genindlæse siden.',
            'error'
        );
    });
    
    // Set up unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        notificationService.show(
            'Der opstod en fejl ved behandling af data.',
            'error'
        );
    });
    
    return ExamKlarShared;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeShared);
    } else {
        initializeShared();
    }
    
    // Make available globally
    window.ExamKlarShared = ExamKlarShared;
}

// Default export
export default ExamKlarShared;