/**
 * Lazy Loading Configuration for EksamensKlar
 * Defines which modules and resources should be lazy loaded
 * and under what conditions
 */

const LazyConfig = {
    // Modules that should be lazy loaded (not critical for initial page load)
    lazyModules: {
        // Advanced features - only load when needed
        'advanced': {
            priority: 'low',
            triggers: ['hover', 'viewport', 'predictive'],
            preloadConditions: {
                userType: 'returning',
                sessionTime: 30000, // 30 seconds
                scrollDepth: 50
            },
            dependencies: [],
            fallback: null
        },
        
        // AI Assistant - heavy module, load on demand
        'ai-assistant': {
            priority: 'medium',
            triggers: ['hover', 'click'],
            preloadConditions: {
                userType: 'returning',
                sessionTime: 60000, // 1 minute
                previousUsage: true
            },
            dependencies: ['utils'],
            fallback: 'basic-chat'
        },
        
        // Content module - load when user shows interest
        'content': {
            priority: 'medium',
            triggers: ['hover', 'viewport', 'predictive'],
            preloadConditions: {
                currentModule: ['subjects', 'dashboard'],
                userEngagement: 'high'
            },
            dependencies: ['utils'],
            fallback: null
        },
        
        // Flashcards - load when user navigates to learning content
        'flashcards': {
            priority: 'medium',
            triggers: ['hover', 'viewport', 'predictive'],
            preloadConditions: {
                currentModule: ['subjects', 'content', 'quiz'],
                studyMode: true
            },
            dependencies: ['utils'],
            fallback: 'simple-cards'
        },
        
        // Quiz module - load when user shows learning intent
        'quiz': {
            priority: 'medium',
            triggers: ['hover', 'viewport', 'predictive'],
            preloadConditions: {
                currentModule: ['subjects', 'content', 'flashcards'],
                studySession: true
            },
            dependencies: ['utils'],
            fallback: 'basic-quiz'
        }
    },
    
    // Critical modules that should always be loaded immediately
    criticalModules: {
        'dashboard': {
            priority: 'critical',
            loadImmediately: true,
            dependencies: ['utils'],
            fallback: 'basic-dashboard'
        },
        
        'subjects': {
            priority: 'high',
            loadImmediately: false,
            preloadConditions: {
                userType: 'any',
                sessionTime: 5000 // 5 seconds
            },
            dependencies: ['utils'],
            fallback: 'subject-list'
        },
        
        'onboarding': {
            priority: 'critical',
            loadImmediately: true,
            conditions: {
                firstVisit: true,
                onboardingIncomplete: true
            },
            dependencies: [],
            fallback: null
        }
    },
    
    // Resources that should be lazy loaded
    lazyResources: {
        // Images
        images: {
            strategy: 'viewport',
            rootMargin: '50px',
            threshold: 0.1,
            placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
        },
        
        // CSS files for non-critical modules
        styles: {
            strategy: 'preload',
            priority: 'low',
            media: 'print',
            onload: "this.media='all'"
        },
        
        // JavaScript files for features
        scripts: {
            strategy: 'defer',
            priority: 'low',
            async: true
        }
    },
    
    // Loading strategies based on device and connection
    strategies: {
        // Fast connection strategy
        fast: {
            enableHoverPreload: true,
            enableViewportPreload: true,
            enablePredictivePreload: true,
            preloadDelay: 50,
            rootMargin: '100px',
            aggressivePreload: true
        },
        
        // Slow connection strategy
        slow: {
            enableHoverPreload: false,
            enableViewportPreload: true,
            enablePredictivePreload: false,
            preloadDelay: 200,
            rootMargin: '20px',
            aggressivePreload: false
        },
        
        // Mobile strategy
        mobile: {
            enableHoverPreload: false,
            enableViewportPreload: true,
            enablePredictivePreload: true,
            preloadDelay: 100,
            rootMargin: '50px',
            aggressivePreload: false
        },
        
        // Desktop strategy
        desktop: {
            enableHoverPreload: true,
            enableViewportPreload: true,
            enablePredictivePreload: true,
            preloadDelay: 50,
            rootMargin: '100px',
            aggressivePreload: true
        }
    },
    
    // Timing configurations
    timing: {
        // Delay before starting lazy loading after page load
        initialDelay: 1000,
        
        // Delay between batch loads
        batchDelay: 100,
        
        // Maximum time to wait for a module to load
        loadTimeout: 10000,
        
        // Idle time before starting background preloading
        idleTime: 2000,
        
        // Debounce time for scroll events
        scrollDebounce: 150
    },
    
    // Performance thresholds
    performance: {
        // Maximum number of concurrent lazy loads
        maxConcurrentLoads: 3,
        
        // Maximum total lazy load time budget (ms)
        loadTimeBudget: 5000,
        
        // Memory usage threshold for aggressive cleanup
        memoryThreshold: 100 * 1024 * 1024, // 100MB
        
        // Network usage threshold
        networkThreshold: 'slow-2g'
    },
    
    // Feature flags
    features: {
        enableIntersectionObserver: true,
        enableHoverPreload: true,
        enablePredictivePreload: true,
        enableViewportPreload: true,
        enableImageLazyLoad: true,
        enableModuleLazyLoad: true,
        enableResourcePreload: true,
        enablePerformanceMonitoring: true,
        enableFallbacks: true,
        enableDebugLogging: true
    },
    
    // User behavior patterns for predictive loading
    patterns: {
        // Common navigation flows
        flows: {
            'onboarding': ['dashboard', 'subjects'],
            'dashboard': ['subjects', 'content', 'quiz'],
            'subjects': ['content', 'flashcards', 'quiz'],
            'content': ['flashcards', 'quiz', 'ai-assistant'],
            'quiz': ['flashcards', 'content', 'advanced'],
            'flashcards': ['quiz', 'content', 'advanced']
        },
        
        // Time-based patterns
        timePatterns: {
            morning: ['dashboard', 'subjects', 'content'],
            afternoon: ['quiz', 'flashcards', 'advanced'],
            evening: ['content', 'ai-assistant', 'advanced']
        },
        
        // Session-based patterns
        sessionPatterns: {
            short: ['dashboard', 'subjects'], // < 10 minutes
            medium: ['content', 'quiz', 'flashcards'], // 10-30 minutes
            long: ['advanced', 'ai-assistant'] // > 30 minutes
        }
    },
    
    // Fallback configurations
    fallbacks: {
        'ai-assistant': {
            type: 'basic-chat',
            html: '<div class="fallback-chat">Chat functionality temporarily unavailable</div>',
            css: '.fallback-chat { padding: 20px; text-align: center; color: #666; }'
        },
        
        'advanced': {
            type: 'basic-features',
            html: '<div class="fallback-advanced">Advanced features loading...</div>',
            css: '.fallback-advanced { padding: 20px; text-align: center; color: #666; }'
        },
        
        'flashcards': {
            type: 'simple-cards',
            html: '<div class="fallback-cards">Flashcard system loading...</div>',
            css: '.fallback-cards { padding: 20px; text-align: center; color: #666; }'
        },
        
        'quiz': {
            type: 'basic-quiz',
            html: '<div class="fallback-quiz">Quiz system loading...</div>',
            css: '.fallback-quiz { padding: 20px; text-align: center; color: #666; }'
        }
    },
    
    // Debug and monitoring
    debug: {
        enableConsoleLogging: true,
        enablePerformanceMarks: true,
        enableEventTracking: true,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    }
};

// Helper functions
LazyConfig.getStrategy = function(connectionType, deviceType) {
    if (connectionType === 'slow-2g' || connectionType === '2g') {
        return this.strategies.slow;
    }
    
    if (deviceType === 'mobile') {
        return this.strategies.mobile;
    }
    
    if (connectionType === '4g' || connectionType === 'wifi') {
        return this.strategies.fast;
    }
    
    return this.strategies.desktop;
};

LazyConfig.shouldLazyLoad = function(moduleName, context = {}) {
    const moduleConfig = this.lazyModules[moduleName];
    if (!moduleConfig) return false;
    
    // Check if module should be loaded immediately
    const criticalConfig = this.criticalModules[moduleName];
    if (criticalConfig && criticalConfig.loadImmediately) {
        return false;
    }
    
    // Check preload conditions
    if (moduleConfig.preloadConditions) {
        const conditions = moduleConfig.preloadConditions;
        
        if (conditions.userType && conditions.userType !== context.userType) {
            return false;
        }
        
        if (conditions.sessionTime && context.sessionTime < conditions.sessionTime) {
            return false;
        }
        
        if (conditions.currentModule && !conditions.currentModule.includes(context.currentModule)) {
            return false;
        }
    }
    
    return true;
};

LazyConfig.getPredictiveModules = function(currentModule, context = {}) {
    const flows = this.patterns.flows[currentModule] || [];
    const timePattern = this.getTimePattern();
    const sessionPattern = this.getSessionPattern(context.sessionTime);
    
    // Combine different prediction sources
    const predictions = new Set([
        ...flows,
        ...(this.patterns.timePatterns[timePattern] || []),
        ...(this.patterns.sessionPatterns[sessionPattern] || [])
    ]);
    
    // Filter based on lazy loading eligibility
    return Array.from(predictions).filter(module => 
        this.shouldLazyLoad(module, context)
    );
};

LazyConfig.getTimePattern = function() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
};

LazyConfig.getSessionPattern = function(sessionTime) {
    if (!sessionTime) return 'short';
    if (sessionTime < 10 * 60 * 1000) return 'short'; // < 10 minutes
    if (sessionTime < 30 * 60 * 1000) return 'medium'; // < 30 minutes
    return 'long';
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyConfig;
} else {
    window.LazyConfig = LazyConfig;
}