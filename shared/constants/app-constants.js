/**
 * ExamKlar Application Constants
 * Centralized constants for the entire application
 */

// Application Configuration
export const APP_CONFIG = {
    NAME: 'ExamKlar',
    VERSION: '2.0.0',
    DESCRIPTION: 'AI-Powered Learning Platform',
    AUTHOR: 'ExamKlar Team'
};

// API Endpoints
export const API_ENDPOINTS = {
    BASE_URL: '/api',
    MODULES: '/api/modules',
    USER: '/api/user',
    ANALYTICS: '/api/analytics',
    CONTENT: '/api/content'
};

// Module Types
export const MODULE_TYPES = {
    CORE: 'core',
    FEATURE: 'feature',
    UTILITY: 'utility',
    SERVICE: 'service'
};

// Module Status
export const MODULE_STATUS = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
    READY: 'ready'
};

// Event Types
export const EVENT_TYPES = {
    MODULE_LOADED: 'module:loaded',
    MODULE_ERROR: 'module:error',
    USER_ACTION: 'user:action',
    PERFORMANCE: 'performance:metric',
    ANALYTICS: 'analytics:event'
};

// Storage Keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'examklar_user_preferences',
    MODULE_CACHE: 'examklar_module_cache',
    PERFORMANCE_DATA: 'examklar_performance',
    THEME: 'examklar_theme',
    ONBOARDING: 'examklar_onboarding'
};

// Theme Configuration
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
    LOAD_TIME_WARNING: 3000, // 3 seconds
    LOAD_TIME_ERROR: 5000,   // 5 seconds
    MEMORY_WARNING: 50,      // 50MB
    MEMORY_ERROR: 100        // 100MB
};

// Security Configuration
export const SECURITY_CONFIG = {
    CSP_NONCE_LENGTH: 16,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_RETRY_ATTEMPTS: 3
};

// Accessibility Configuration
export const A11Y_CONFIG = {
    FOCUS_TRAP_SELECTOR: '[data-focus-trap]',
    SKIP_LINK_SELECTOR: '.skip-link',
    LIVE_REGION_SELECTOR: '[aria-live]'
};

// Animation Configuration
export const ANIMATION_CONFIG = {
    DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    },
    EASING: {
        EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
        EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
        EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

// Error Messages
export const ERROR_MESSAGES = {
    MODULE_LOAD_FAILED: 'Failed to load module',
    NETWORK_ERROR: 'Network connection error',
    STORAGE_ERROR: 'Local storage error',
    PERMISSION_DENIED: 'Permission denied',
    INVALID_INPUT: 'Invalid input provided'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    MODULE_LOADED: 'Module loaded successfully',
    DATA_SAVED: 'Data saved successfully',
    SETTINGS_UPDATED: 'Settings updated successfully'
};

// Default Configuration
export const DEFAULT_CONFIG = {
    theme: THEMES.AUTO,
    language: 'da',
    animations: true,
    notifications: true,
    analytics: true
};