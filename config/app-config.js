/**
 * ExamKlar Application Configuration
 * Central configuration file for the entire application
 */

const AppConfig = {
    // Application metadata
    app: {
        name: 'ExamKlar',
        version: '2.0.0',
        description: 'Advanced exam preparation platform',
        author: 'ExamKlar Team',
        homepage: 'https://examklar.dk'
    },

    // Environment settings
    environment: {
        isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        isProduction: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
        debugMode: localStorage.getItem('examklar_debug') === 'true'
    },

    // API configuration
    api: {
        baseUrl: window.location.origin,
        timeout: 30000,
        retryAttempts: 3,
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

    // Security settings
    security: {
        enableCSP: true,
        enableEncryption: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
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

// Freeze configuration to prevent accidental modifications
Object.freeze(AppConfig);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
}