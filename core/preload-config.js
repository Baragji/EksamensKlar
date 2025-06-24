/**
 * Resource Preloading Configuration
 * Centralized configuration for intelligent resource preloading strategies
 */

window.PreloadConfig = {
    // Critical resources that should always be preloaded
    criticalResources: [
        {
            url: 'styles/global.css',
            type: 'style',
            priority: 'high',
            strategy: 'immediate'
        },
        {
            url: 'styles/components.css',
            type: 'style',
            priority: 'high',
            strategy: 'immediate'
        },
        {
            url: 'core/utils.js',
            type: 'script',
            priority: 'high',
            strategy: 'immediate'
        },
        {
            url: 'core/app.js',
            type: 'script',
            priority: 'high',
            strategy: 'immediate'
        },
        {
            url: 'core/module-loader.js',
            type: 'module',
            priority: 'high',
            strategy: 'immediate'
        }
    ],

    // Module-specific preloading strategies
    moduleStrategies: {
        dashboard: {
            preloadOn: ['homepage', 'onboarding-complete'],
            resources: [
                'modules/dashboard/index.html',
                'modules/dashboard/dashboard.css',
                'modules/dashboard/dashboard.js'
            ],
            priority: 'high'
        },
        content: {
            preloadOn: ['dashboard', 'navigation-hover'],
            resources: [
                'modules/content/index.html',
                'modules/content/content.css',
                'modules/content/content.js'
            ],
            priority: 'medium'
        },
        flashcards: {
            preloadOn: ['content', 'navigation-hover'],
            resources: [
                'modules/flashcards/index.html',
                'modules/flashcards/flashcards.css',
                'modules/flashcards/flashcards.js'
            ],
            priority: 'medium'
        },
        quiz: {
            preloadOn: ['content', 'flashcards', 'navigation-hover'],
            resources: [
                'modules/quiz/index.html',
                'modules/quiz/quiz.css',
                'modules/quiz/quiz.js'
            ],
            priority: 'medium'
        },
        onboarding: {
            preloadOn: ['first-visit'],
            resources: [
                'modules/onboarding/index.html',
                'modules/onboarding/onboarding.css',
                'modules/onboarding/onboarding.js'
            ],
            priority: 'high'
        },
        'ai-assistant': {
            preloadOn: ['user-interaction', 'navigation-hover'],
            resources: [
                'modules/ai-assistant/index.html',
                'modules/ai-assistant/ai-assistant.css',
                'modules/ai-assistant/ai-assistant.js'
            ],
            priority: 'low'
        }
    },

    // Connection-based strategies
    connectionStrategies: {
        'slow-2g': {
            enablePreloading: false,
            maxConcurrentPreloads: 1,
            preloadOnlyOnIdle: true
        },
        '2g': {
            enablePreloading: true,
            maxConcurrentPreloads: 2,
            preloadOnlyOnIdle: true,
            priorityThreshold: 'high'
        },
        '3g': {
            enablePreloading: true,
            maxConcurrentPreloads: 3,
            preloadOnlyOnIdle: false,
            priorityThreshold: 'medium'
        },
        '4g': {
            enablePreloading: true,
            maxConcurrentPreloads: 5,
            preloadOnlyOnIdle: false,
            priorityThreshold: 'low'
        }
    },

    // Device-based strategies
    deviceStrategies: {
        mobile: {
            reducePreloading: true,
            maxConcurrentPreloads: 2,
            priorityThreshold: 'medium'
        },
        tablet: {
            reducePreloading: false,
            maxConcurrentPreloads: 3,
            priorityThreshold: 'medium'
        },
        desktop: {
            reducePreloading: false,
            maxConcurrentPreloads: 5,
            priorityThreshold: 'low'
        }
    },

    // Timing strategies
    timingStrategies: {
        immediate: {
            delay: 0,
            condition: 'always'
        },
        onIdle: {
            delay: 0,
            condition: 'requestIdleCallback'
        },
        onInteraction: {
            delay: 0,
            condition: 'user-interaction'
        },
        delayed: {
            delay: 2000,
            condition: 'timeout'
        },
        onHover: {
            delay: 100,
            condition: 'hover'
        },
        onViewport: {
            delay: 0,
            condition: 'intersection'
        }
    },

    // External resources to prefetch
    externalResources: {
        fonts: [
            '//fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ],
        cdn: [
            '//cdnjs.cloudflare.com'
        ],
        apis: [
            // Add API endpoints that should be DNS prefetched
        ]
    },

    // Performance thresholds
    performanceThresholds: {
        maxPreloadSize: 500 * 1024, // 500KB
        maxPreloadTime: 3000, // 3 seconds
        maxConcurrentRequests: 6,
        idleTimeout: 50 // ms
    },

    // Feature flags
    features: {
        enableHoverPrefetch: true,
        enableViewportPrefetch: true,
        enablePredictivePrefetch: true,
        enableConnectionAwareness: true,
        enableDeviceAwareness: true,
        enablePerformanceMonitoring: true,
        enableUserBehaviorTracking: true
    },

    // Debug settings
    debug: {
        enabled: false, // Set to true for development
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        showNotifications: false
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.PreloadConfig;
}

console.log('📋 Preload configuration loaded');