/**
 * ExamKlar Application Configuration
 * Central configuration file for the entire application
 */

// Environment detection
const getEnvironment = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
        return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        return 'staging';
    } else if (protocol === 'https:' && !hostname.includes('localhost')) {
        return 'production';
    }
    return 'development';
};

const currentEnv = getEnvironment();

const AppConfig = {
    // Application metadata
    app: {
        name: 'ExamKlar',
        version: '0.5.0', // Match package.json version
        description: 'Advanced exam preparation platform',
        author: 'ExamKlar Team',
        homepage: currentEnv === 'production' ? 'https://examklar.dk' : window.location.origin
    },

    // Environment settings
    environment: {
        current: currentEnv,
        isDevelopment: currentEnv === 'development',
        isStaging: currentEnv === 'staging',
        isProduction: currentEnv === 'production',
        debugMode: currentEnv !== 'production' && localStorage.getItem('examklar_debug') !== 'false'
    },

    // API configuration - environment-based
    api: {
        baseUrl: (() => {
            switch(currentEnv) {
                case 'production': return 'https://api.examklar.dk';
                case 'staging': return 'https://staging-api.examklar.dk';
                default: return window.location.origin;
            }
        })(),
        timeout: currentEnv === 'production' ? 30000 : 10000,
        retryAttempts: currentEnv === 'production' ? 3 : 1,
        retryDelay: 1000
    },

    // Module configuration
    modules: {
        basePath: './modules/',
        defaultModule: 'dashboard',
        loadTimeout: 10000,
        preloadModules: ['dashboard', 'flashcards', 'quiz']
    },

    // Performance settings
    performance: {
        enableLazyLoading: true,
        enablePreloading: true,
        enableCaching: true,
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        enableServiceWorker: true
    },

    // Security settings - environment-based
    security: {
        enableCSP: true,
        enableEncryption: true,
        sessionTimeout: currentEnv === 'production' ? 30 * 60 * 1000 : 60 * 60 * 1000, // 30 min prod, 60 min dev
        maxLoginAttempts: currentEnv === 'production' ? 5 : 10,
        lockoutDuration: currentEnv === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min prod, 5 min dev
        enableRateLimiting: true,
        rateLimitRequests: currentEnv === 'production' ? 100 : 1000, // per minute
        enableInputValidation: true,
        sanitizeInputs: true,
        allowedOrigins: (() => {
            switch(currentEnv) {
                case 'production': return ['https://examklar.dk', 'https://www.examklar.dk'];
                case 'staging': return ['https://staging.examklar.dk'];
                default: return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'];
            }
        })()
    },

    // UI/UX settings
    ui: {
        theme: {
            default: 'luxury',
            available: ['luxury', 'dark', 'light', 'high-contrast'],
            autoDetect: true
        },
        animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        responsive: {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200,
                wide: 1600
            }
        }
    },

    // Accessibility settings
    accessibility: {
        enableScreenReader: true,
        enableKeyboardNavigation: true,
        enableHighContrast: false,
        enableReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        focusIndicators: true,
        announcements: true
    },

    // Analytics and monitoring
    analytics: {
        enabled: false, // Set to true when analytics service is implemented
        trackPageViews: true,
        trackUserInteractions: true,
        trackPerformance: true,
        trackErrors: true
    },
    
    // Monitoring configuration
    monitoring: {
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
            flushInterval: 30000 // 30 seconds
        },
        
        // Error reporting
        enableErrorReporting: true,
        errorConfig: {
            enableConsoleLogging: true,
            enableRemoteLogging: false, // Set to true when backend is ready
            enableLocalStorage: true,
            maxStoredErrors: 50,
            enableStackTrace: true,
            enableUserContext: true,
            enableBreadcrumbs: true,
            maxBreadcrumbs: 20
        },
        
        // Analytics service
        enableAnalytics: true,
        analyticsConfig: {
            enablePageViews: true,
            enableEvents: true,
            enableUserActions: true,
            enableConversions: true,
            enableSessionTracking: true,
            enablePerformanceTracking: true,
            bufferSize: 50,
            flushInterval: 10000, // 10 seconds
            requireConsent: true
        },
        
        // Monitoring dashboard
        enableDashboard: false, // Set to true for development
        dashboardConfig: {
            enableRealTimeUpdates: true,
            updateInterval: 5000,
            position: 'bottom-right',
            minimized: true,
            theme: 'dark'
        },
        
        // Global monitoring settings
        apiEndpoint: null, // Set when backend monitoring endpoint is available
        enableConsentManagement: true,
        enableDebugMode: false // Set to true for development
    },

    // Storage configuration
    storage: {
        prefix: 'examklar_',
        enableEncryption: true,
        enableCompression: true,
        maxSize: 10 * 1024 * 1024, // 10MB
        enableBackup: true
    },

    // Feature flags
    features: {
        enablePWA: true,
        enableOfflineMode: true,
        enableNotifications: true,
        enableSyncAcrossDevices: false, // Future feature
        enableAIAssistant: false, // Future feature
        enableCollaboration: false, // Future feature
        enableAdvancedAnalytics: false // Future feature
    },

    // Development tools
    development: {
        enableDevTools: false,
        enablePerformanceMonitoring: true,
        enableErrorReporting: true,
        enableDebugConsole: false
    }
};

// Configuration validation
const validateConfig = (config) => {
    const errors = [];
    
    // Validate required fields
    if (!config.app?.name) errors.push('App name is required');
    if (!config.app?.version) errors.push('App version is required');
    
    // Validate API configuration
    if (!config.api?.baseUrl) errors.push('API base URL is required');
    if (config.api?.timeout < 1000) errors.push('API timeout must be at least 1000ms');
    
    // Validate security settings
    if (config.security?.sessionTimeout < 60000) errors.push('Session timeout must be at least 1 minute');
    if (config.security?.maxLoginAttempts < 1) errors.push('Max login attempts must be at least 1');
    
    // Validate storage settings
    if (config.storage?.maxSize < 1024) errors.push('Storage max size must be at least 1KB');
    
    if (errors.length > 0) {
        console.error('Configuration validation errors:', errors);
        if (currentEnv === 'production') {
            throw new Error('Invalid configuration detected');
        }
    }
    
    return errors.length === 0;
};

// Validate configuration
validateConfig(AppConfig);

// Freeze configuration to prevent accidental modifications
Object.freeze(AppConfig);

// Add configuration getter with validation
const getConfig = (path) => {
    if (!path) return AppConfig;
    
    const keys = path.split('.');
    let value = AppConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            console.warn(`Configuration path '${path}' not found`);
            return undefined;
        }
    }
    
    return value;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppConfig, getConfig, validateConfig };
} else if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
    window.getConfig = getConfig;
    window.validateConfig = validateConfig;
}