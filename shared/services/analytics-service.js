/**
 * Analytics Service
 * Comprehensive analytics and user behavior tracking
 */

class AnalyticsService {
    constructor(config = {}) {
        this.config = {
            enableTracking: true,
            enableUserTracking: true,
            enablePageTracking: true,
            enableEventTracking: true,
            enableConversionTracking: true,
            enableHeatmapTracking: false,
            enableSessionRecording: false,
            endpoint: '/api/analytics',
            apiKey: null,
            sampleRate: 1.0,
            bufferSize: 50,
            flushInterval: 30000,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            enableGDPRCompliance: true,
            enableCookieConsent: true,
            ...config
        };

        this.events = [];
        this.pageViews = [];
        this.userActions = [];
        this.conversions = [];
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.sessionStart = Date.now();
        this.lastActivity = Date.now();
        this.pageLoadTime = Date.now();
        this.isInitialized = false;
        this.consentGiven = false;

        this.init();
    }

    /**
     * Initialize analytics service
     */
    init() {
        if (this.isInitialized) return;

        this.checkConsent();
        
        if (this.consentGiven || !this.config.enableGDPRCompliance) {
            this.setupTracking();
        }

        this.isInitialized = true;
    }

    /**
     * Check for user consent
     */
    checkConsent() {
        if (!this.config.enableGDPRCompliance) {
            this.consentGiven = true;
            return;
        }

        // Check for stored consent
        const consent = localStorage.getItem('analytics_consent');
        this.consentGiven = consent === 'true';

        if (!this.consentGiven && this.config.enableCookieConsent) {
            this.showConsentBanner();
        }
    }

    /**
     * Show consent banner
     */
    showConsentBanner() {
        // Simple consent banner implementation
        const banner = document.createElement('div');
        banner.id = 'analytics-consent-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        banner.innerHTML = `
            <p style="margin: 0 0 10px 0;">Vi bruger cookies og analytics til at forbedre din oplevelse.</p>
            <button id="accept-analytics" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; margin: 0 5px; cursor: pointer; border-radius: 4px;">Accepter</button>
            <button id="decline-analytics" style="background: #f44336; color: white; border: none; padding: 8px 16px; margin: 0 5px; cursor: pointer; border-radius: 4px;">Afvis</button>
        `;

        document.body.appendChild(banner);

        // Handle consent
        document.getElementById('accept-analytics').addEventListener('click', () => {
            this.giveConsent();
            banner.remove();
        });

        document.getElementById('decline-analytics').addEventListener('click', () => {
            this.revokeConsent();
            banner.remove();
        });
    }

    /**
     * Give consent for analytics
     */
    giveConsent() {
        this.consentGiven = true;
        localStorage.setItem('analytics_consent', 'true');
        this.setupTracking();
        this.trackEvent('consent_given');
    }

    /**
     * Revoke consent for analytics
     */
    revokeConsent() {
        this.consentGiven = false;
        localStorage.setItem('analytics_consent', 'false');
        this.clearStoredData();
        this.trackEvent('consent_revoked');
    }

    /**
     * Setup tracking mechanisms
     */
    setupTracking() {
        if (!this.consentGiven) return;

        this.setupPageTracking();
        this.setupUserInteractionTracking();
        this.setupSessionTracking();
        this.setupPerformanceTracking();
        this.setupConversionTracking();
        this.startPeriodicFlush();

        this.trackEvent('analytics_initialized', {
            sessionId: this.sessionId,
            timestamp: Date.now()
        });
    }

    /**
     * Setup page tracking
     */
    setupPageTracking() {
        if (!this.config.enablePageTracking) return;

        // Track initial page view
        this.trackPageView();

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', {
                    timeOnPage: Date.now() - this.pageLoadTime
                });
            } else {
                this.pageLoadTime = Date.now();
                this.trackEvent('page_visible');
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload', {
                sessionDuration: Date.now() - this.sessionStart,
                timeOnPage: Date.now() - this.pageLoadTime
            });
            this.flush();
        });

        // Track hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            this.trackPageView();
        });

        // Track popstate (browser navigation)
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });
    }

    /**
     * Setup user interaction tracking
     */
    setupUserInteractionTracking() {
        if (!this.config.enableEventTracking) return;

        // Track clicks
        document.addEventListener('click', (event) => {
            this.trackUserAction('click', {
                element: event.target.tagName,
                id: event.target.id,
                className: event.target.className,
                text: event.target.textContent?.substring(0, 100),
                x: event.clientX,
                y: event.clientY
            });
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackUserAction('form_submit', {
                formId: event.target.id,
                formAction: event.target.action,
                formMethod: event.target.method
            });
        });

        // Track input focus (for form analytics)
        document.addEventListener('focus', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                this.trackUserAction('input_focus', {
                    inputType: event.target.type,
                    inputName: event.target.name,
                    inputId: event.target.id
                });
            }
        }, true);

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollDepth = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestone scroll depths
                if (scrollDepth >= 25 && scrollDepth < 50 && maxScrollDepth < 25) {
                    this.trackEvent('scroll_depth_25');
                } else if (scrollDepth >= 50 && scrollDepth < 75 && maxScrollDepth < 50) {
                    this.trackEvent('scroll_depth_50');
                } else if (scrollDepth >= 75 && scrollDepth < 100 && maxScrollDepth < 75) {
                    this.trackEvent('scroll_depth_75');
                } else if (scrollDepth >= 100 && maxScrollDepth < 100) {
                    this.trackEvent('scroll_depth_100');
                }
            }
        }, 1000));
    }

    /**
     * Setup session tracking
     */
    setupSessionTracking() {
        // Update last activity on user interaction
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, this.throttle(() => {
                this.updateLastActivity();
            }, 5000));
        });

        // Check for session timeout
        setInterval(() => {
            if (Date.now() - this.lastActivity > this.config.sessionTimeout) {
                this.endSession();
                this.startNewSession();
            }
        }, 60000); // Check every minute
    }

    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.trackEvent('page_performance', {
                        loadTime: navigation.loadEventEnd - navigation.navigationStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                        firstByte: navigation.responseStart - navigation.navigationStart,
                        domComplete: navigation.domComplete - navigation.navigationStart
                    });
                }
            }, 0);
        });

        // Track resource performance
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) { // Only track slow resources
                            this.trackEvent('slow_resource', {
                                name: entry.name,
                                duration: entry.duration,
                                type: entry.initiatorType
                            });
                        }
                    }
                });
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Performance observer not supported');
            }
        }
    }

    /**
     * Setup conversion tracking
     */
    setupConversionTracking() {
        if (!this.config.enableConversionTracking) return;

        // Track button clicks that might be conversions
        document.addEventListener('click', (event) => {
            const element = event.target;
            const isConversionElement = 
                element.classList.contains('btn-primary') ||
                element.classList.contains('cta-button') ||
                element.type === 'submit' ||
                element.textContent?.toLowerCase().includes('køb') ||
                element.textContent?.toLowerCase().includes('tilmeld') ||
                element.textContent?.toLowerCase().includes('download');

            if (isConversionElement) {
                this.trackConversion('button_click', {
                    buttonText: element.textContent,
                    buttonId: element.id,
                    buttonClass: element.className
                });
            }
        });
    }

    /**
     * Track a page view
     */
    trackPageView(customData = {}) {
        if (!this.consentGiven || !this.config.enablePageTracking) return;

        const pageView = {
            id: this.generateId(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            ...customData
        };

        this.pageViews.push(pageView);
        this.checkBufferSize();
        this.pageLoadTime = Date.now();
    }

    /**
     * Track an event
     */
    trackEvent(eventName, eventData = {}, customData = {}) {
        if (!this.consentGiven || !this.config.enableEventTracking) return;
        if (Math.random() > this.config.sampleRate) return;

        const event = {
            id: this.generateId(),
            sessionId: this.sessionId,
            userId: this.userId,
            name: eventName,
            data: eventData,
            url: window.location.href,
            timestamp: Date.now(),
            ...customData
        };

        this.events.push(event);
        this.checkBufferSize();
        this.updateLastActivity();
    }

    /**
     * Track a user action
     */
    trackUserAction(actionType, actionData = {}) {
        if (!this.consentGiven || !this.config.enableUserTracking) return;

        const action = {
            id: this.generateId(),
            sessionId: this.sessionId,
            userId: this.userId,
            type: actionType,
            data: actionData,
            url: window.location.href,
            timestamp: Date.now()
        };

        this.userActions.push(action);
        this.checkBufferSize();
        this.updateLastActivity();
    }

    /**
     * Track a conversion
     */
    trackConversion(conversionType, conversionData = {}, value = null) {
        if (!this.consentGiven || !this.config.enableConversionTracking) return;

        const conversion = {
            id: this.generateId(),
            sessionId: this.sessionId,
            userId: this.userId,
            type: conversionType,
            data: conversionData,
            value: value,
            url: window.location.href,
            timestamp: Date.now()
        };

        this.conversions.push(conversion);
        this.checkBufferSize();
        this.updateLastActivity();

        // Also track as regular event
        this.trackEvent('conversion', {
            conversionType,
            conversionData,
            value
        });
    }

    /**
     * Set user ID
     */
    setUserId(userId, userData = {}) {
        this.userId = userId;
        this.trackEvent('user_identified', {
            userId,
            ...userData
        });
    }

    /**
     * Set custom user properties
     */
    setUserProperties(properties) {
        this.trackEvent('user_properties_set', properties);
    }

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    /**
     * Start a new session
     */
    startNewSession() {
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.lastActivity = Date.now();
        this.trackEvent('session_start');
    }

    /**
     * End current session
     */
    endSession() {
        this.trackEvent('session_end', {
            sessionDuration: Date.now() - this.sessionStart
        });
        this.flush();
    }

    /**
     * Check buffer size and flush if needed
     */
    checkBufferSize() {
        const totalItems = this.events.length + this.pageViews.length + 
                          this.userActions.length + this.conversions.length;
        
        if (totalItems >= this.config.bufferSize) {
            this.flush();
        }
    }

    /**
     * Start periodic flush
     */
    startPeriodicFlush() {
        setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    /**
     * Flush all collected data
     */
    async flush() {
        if (!this.consentGiven) return;
        
        if (this.events.length === 0 && this.pageViews.length === 0 && 
            this.userActions.length === 0 && this.conversions.length === 0) {
            return;
        }

        const payload = {
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now(),
            events: [...this.events],
            pageViews: [...this.pageViews],
            userActions: [...this.userActions],
            conversions: [...this.conversions]
        };

        // Clear buffers
        this.events = [];
        this.pageViews = [];
        this.userActions = [];
        this.conversions = [];

        try {
            await this.sendData(payload);
        } catch (error) {
            console.error('Failed to send analytics data:', error);
        }
    }

    /**
     * Send data to analytics endpoint
     */
    async sendData(payload) {
        if (!this.config.endpoint) {
            console.log('Analytics data (no endpoint configured):', payload);
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            // Use sendBeacon as fallback
            if (navigator.sendBeacon) {
                navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
            }
            throw error;
        }
    }

    /**
     * Clear all stored analytics data
     */
    clearStoredData() {
        this.events = [];
        this.pageViews = [];
        this.userActions = [];
        this.conversions = [];
        localStorage.removeItem('analytics_consent');
    }

    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            sessionDuration: Date.now() - this.sessionStart,
            eventsCount: this.events.length,
            pageViewsCount: this.pageViews.length,
            userActionsCount: this.userActions.length,
            conversionsCount: this.conversions.length,
            consentGiven: this.consentGiven,
            lastActivity: this.lastActivity
        };
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Destroy analytics service
     */
    destroy() {
        this.endSession();
        this.clearStoredData();
    }
}

export default AnalyticsService;