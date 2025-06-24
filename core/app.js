/**
 * ExamKlar Main Application
 * Core application logic and routing with EventBus integration
 */

const app = {
    // Current state
    currentModule: 'home',
    isInitialized: false,
    modules: {},
    eventBus: null,
    integration: null,

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing ExamKlar...');
        
        // Initialize EventBus system first
        await this.initializeEventBus();
        
        // Check if this is a new user and redirect to onboarding
        const hasCompletedOnboarding = localStorage.getItem('examklar_onboarding_completed');
        if (!hasCompletedOnboarding) {
            console.log('🎯 New user detected, redirecting to onboarding...');
            this.eventBus.emit('app', 'user.new_detected', { redirecting: true });
            window.location.href = 'modules/onboarding/index.html';
            return;
        }
        
        // Update last active timestamp
        storage.updateLastActive();
        this.eventBus.emit('app', 'user.activity', { action: 'app_start', timestamp: Date.now() });
        
        // Initialize modules
        this.initializeModules();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial route
        this.handleInitialRoute();
        
        // Update UI with stored data
        this.updateUI();
        
        // Setup periodic updates
        this.setupPeriodicUpdates();
        
        this.isInitialized = true;
        console.log('✅ ExamKlar initialized successfully');
        this.eventBus.emit('app', 'initialized', { timestamp: Date.now(), modules: Object.keys(this.modules) });
        
        // Show welcome message for new users
        this.checkFirstVisit();
    },

    /**
     * Initialize EventBus system
     */
    async initializeEventBus() {
        try {
            // Initialize EventBus with enterprise configuration
            this.eventBus = new EventBus({
                debug: true,
                maxHistory: 500,
                enablePerformanceTracking: true,
                defaultNamespace: 'app'
            });
            
            // Initialize integration helper
            this.integration = new EventBusIntegration(this.eventBus);
            
            // Add core middleware
            this.eventBus.use(EventBusMiddleware.logger({
                includeData: false,
                filter: (event) => !event.type.startsWith('internal.')
            }));
            
            this.eventBus.use(EventBusMiddleware.performance({
                threshold: 100,
                logSlow: true
            }));
            
            this.eventBus.use(EventBusMiddleware.errorHandler({
                retryAttempts: 3,
                retryDelay: 1000
            }));
            
            // Integrate with existing systems
            if (typeof DataBridge !== 'undefined') {
                this.integration.integrateWithDataBridge(DataBridge);
            }
            
            this.integration.integrateWithLocalStorage({
                persistEvents: ['app.state_changed', 'user.progress_updated', 'data.saved'],
                autoRestore: true
            });
            
            this.integration.integrateWithDOM({
                autoCapture: ['click', 'submit', 'change'],
                selector: '[data-event]',
                namespace: 'ui'
            });
            
            // Initialize DataBridge with EventBus
            if (window.DataBridge) {
                window.DataBridge.initEventBus(this.eventBus);
                
                // Initialize Real-time features if available
                this.dataBridgeRealtime = window.DataBridge.initRealtime(this.eventBus);
                if (this.dataBridgeRealtime) {
                    console.log('🔄 DataBridge Real-time features enabled');
                }
            }
            
            // Setup core event listeners
            this.setupCoreEventListeners();
            
            console.log('🚀 EventBus system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize EventBus:', error);
            // Fallback to basic functionality without EventBus
            this.eventBus = {
                emit: () => {},
                on: () => {},
                off: () => {}
            };
        }
    },
    
    /**
     * Setup core EventBus listeners
     */
    setupCoreEventListeners() {
        // Navigation events
        this.eventBus.on('app', 'navigate', (data) => {
            this.navigateTo(data.module, data.pushState !== false);
        });
        
        // Module events
        this.eventBus.on('app', 'module.load_start', (data) => {
            console.log(`📦 Loading module: ${data.module}`);
        });
        
        this.eventBus.on('app', 'module.load_complete', (data) => {
            console.log(`✅ Module loaded: ${data.module}`);
        });
        
        this.eventBus.on('app', 'module.load_error', (data) => {
            console.error(`❌ Module load error: ${data.module}`, data.error);
            utils.showToast(`Fejl ved indlæsning af ${data.module}`, 'error');
        });
        
        // User activity events
        this.eventBus.on('user', '*', (data, event) => {
            storage.updateLastActive();
            console.log(`👤 User event: ${event.type}`, data);
        });
        
        // Data events
        this.eventBus.on('data', '*', (data, event) => {
            console.log(`💾 Data event: ${event.type}`, data);
        });
        
        // UI events
        this.eventBus.on('ui', '*', (data, event) => {
            console.log(`🖱️ UI event: ${event.type}`, data);
        });
        
        // Error handling
        this.eventBus.on('app', 'error', (data) => {
            console.error('Application error:', data);
            utils.showToast('Der opstod en fejl. Prøv igen.', 'error');
        });
    },

    /**
     * Initialize all modules
     */
    initializeModules() {
        this.modules = {
            home: {
                name: 'Hjem',
                path: '/',
                element: document.getElementById('mainContent'),
                active: true
            },
            content: {
                name: 'Indhold',
                path: '/modules/content/',
                element: null,
                active: false
            },
            flashcards: {
                name: 'Flashcards',
                path: '/modules/flashcards/',
                element: null,
                active: false
            },
            quiz: {
                name: 'Quiz',
                path: '/modules/quiz/',
                element: null,
                active: false
            },
            dashboard: {
                name: 'Dashboard',
                path: '/modules/dashboard/',
                element: null,
                active: false
            }
        };
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleRoute(event.state?.module || 'home');
        });

        // Handle clicks on navigation items
        document.addEventListener('click', (event) => {
            const navItem = event.target.closest('[data-nav]');
            if (navItem) {
                const module = navItem.dataset.nav;
                this.navigateTo(module);
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Handle visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                storage.updateLastActive();
                this.updateUI();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            utils.showToast('Du er nu online igen! 🌐', 'success');
        });

        window.addEventListener('offline', () => {
            utils.showToast('Du er offline. Data gemmes lokalt. 📱', 'warning');
        });
    },

    /**
     * Handle initial route on page load
     */
    handleInitialRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const module = urlParams.get('module') || 'home';
        this.handleRoute(module, false);
    },

    /**
     * Navigate to a specific module
     * @param {string} module - Module to navigate to
     * @param {boolean} pushState - Whether to push to browser history
     */
    navigateTo(module, pushState = true) {
        if (!this.modules[module]) {
            console.warn(`Module '${module}' not found`);
            this.eventBus.emit('app', 'navigation.error', { module, error: 'Module not found' });
            return;
        }

        this.eventBus.emit('app', 'navigation.start', { from: this.currentModule, to: module });
        this.handleRoute(module, pushState);
    },

    /**
     * Handle route changes
     * @param {string} module - Module to load
     * @param {boolean} pushState - Whether to push to browser history
     */
    async handleRoute(module, pushState = true) {
        if (this.currentModule === module) return;

        console.log(`🧭 Navigating to: ${module}`);
        this.eventBus.emit('app', 'route.change', { from: this.currentModule, to: module });

        // Update browser history
        if (pushState) {
            const url = new URL(window.location);
            url.searchParams.set('module', module);
            window.history.pushState({ module }, '', url);
            this.eventBus.emit('app', 'history.updated', { module, url: url.toString() });
        }

        // Update navigation state
        this.updateNavigation(module);

        // Load module content
        await this.loadModule(module);

        this.currentModule = module;
        this.eventBus.emit('app', 'navigation.complete', { module, timestamp: Date.now() });
    },

    /**
     * Update navigation UI
     * @param {string} activeModule - Currently active module
     */
    updateNavigation(activeModule) {
        // Update bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.nav === activeModule) {
                item.classList.add('active');
            }
        });

        // Update module states
        Object.keys(this.modules).forEach(key => {
            this.modules[key].active = key === activeModule;
        });
    },

    /**
     * Load module content
     * @param {string} module - Module to load
     */
    async loadModule(module) {
        const mainContent = document.getElementById('mainContent');
        
        try {
            this.eventBus.emit('app', 'module.load_start', { module });
            
            // Show loading state
            mainContent.innerHTML = this.getLoadingHTML();
            this.eventBus.emit('ui', 'loading.show', { module });

            if (module === 'home') {
                // Home module is already loaded in index.html
                await this.loadHomeModule();
            } else {
                // Load external module
                await this.loadExternalModule(module);
            }
            
            this.eventBus.emit('app', 'module.load_complete', { module, timestamp: Date.now() });
            
        } catch (error) {
            console.error(`Error loading module ${module}:`, error);
            this.eventBus.emit('app', 'module.load_error', { module, error: error.message });
            mainContent.innerHTML = this.getErrorHTML(module, error.message);
        }
    },

    /**
     * Load home module content
     */
    async loadHomeModule() {
        const mainContent = document.getElementById('mainContent');
        
        // Restore original home content
        mainContent.innerHTML = `
            <!-- Landing Page Content -->
            <section class="hero">
                <div class="hero-content">
                    <h2 class="hero-title">Mester Proteinrensning på 7 Dage</h2>
                    <p class="hero-subtitle">
                        Lær gennem daglige mikro-sessioner med spaced repetition, 
                        interaktive flashcards og praksis-orienterede quizzer.
                    </p>
                    <div class="hero-actions">
                        <button class="btn btn-primary" onclick="app.navigateTo('dashboard')">
                            Start Læring 🚀
                        </button>
                        <button class="btn btn-secondary" onclick="app.navigateTo('content')">
                            Se Indhold 📖
                        </button>
                    </div>
                </div>
            </section>

            <!-- Quick Stats -->
            <section class="stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-number" id="totalProgress">0%</span>
                        <span class="stat-label">Samlet Fremskridt</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="currentStreak">0</span>
                        <span class="stat-label">Dage i Træk</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="completedCards">0</span>
                        <span class="stat-label">Gennemførte Cards</span>
                    </div>
                </div>
            </section>

            <!-- Module Navigation -->
            <section class="modules">
                <h3 class="modules-title">Læringsmoduler</h3>
                <div class="modules-grid">
                    
                    <div class="module-card" onclick="app.navigateTo('content')">
                        <div class="module-icon">📖</div>
                        <h4 class="module-title">Dagligt Indhold</h4>
                        <p class="module-description">7 dages struktureret læringsindhold om proteinrensning</p>
                        <div class="module-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%" id="contentProgress"></div>
                            </div>
                            <span class="progress-text">0/7 dage</span>
                        </div>
                    </div>

                    <div class="module-card" onclick="app.navigateTo('flashcards')">
                        <div class="module-icon">🗂️</div>
                        <h4 class="module-title">Flashcards</h4>
                        <p class="module-description">Interaktive kort til hurtig gentagelse og memorering</p>
                        <div class="module-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%" id="flashcardsProgress"></div>
                            </div>
                            <span class="progress-text">0/50 kort</span>
                        </div>
                    </div>

                    <div class="module-card" onclick="app.navigateTo('quiz')">
                        <div class="module-icon">❓</div>
                        <h4 class="module-title">Quiz</h4>
                        <p class="module-description">Test din viden med multiple-choice spørgsmål</p>
                        <div class="module-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%" id="quizProgress"></div>
                            </div>
                            <span class="progress-text">0/25 spørgsmål</span>
                        </div>
                    </div>

                    <div class="module-card" onclick="app.navigateTo('dashboard')">
                        <div class="module-icon">📊</div>
                        <h4 class="module-title">Dashboard</h4>
                        <p class="module-description">Oversigt over dit fremskridt og statistikker</p>
                        <div class="module-status">
                            <span class="status-badge">Aktiv</span>
                        </div>
                    </div>

                </div>
            </section>
        `;

        // Update stats after content is loaded
        this.updateHomeStats();
    },

    /**
     * Load external module
     * @param {string} module - Module name
     */
    async loadExternalModule(module) {
        const mainContent = document.getElementById('mainContent');
        
        // For now, show placeholder content for modules that don't exist yet
        mainContent.innerHTML = this.getModulePlaceholder(module);
    },

    /**
     * Get loading HTML
     * @returns {string} Loading HTML
     */
    getLoadingHTML() {
        return `
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 300px; flex-direction: column; gap: 16px;">
                <div class="loading-spinner"></div>
                <p style="color: var(--text-secondary);">Indlæser...</p>
            </div>
        `;
    },

    /**
     * Get error HTML
     * @param {string} module - Module name
     * @param {string} error - Error message
     * @returns {string} Error HTML
     */
    getErrorHTML(module, error) {
        return `
            <div class="error-container" style="text-align: center; padding: 40px; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 4rem; margin-bottom: 16px;">😵</div>
                <h3 style="color: var(--error-color); margin-bottom: 16px;">Ups! Noget gik galt</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    Kunne ikke indlæse modulet "${this.modules[module]?.name || module}".
                </p>
                <p style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 24px;">
                    Fejl: ${error}
                </p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    Tilbage til Hjem
                </button>
            </div>
        `;
    },

    /**
     * Get module placeholder HTML
     * @param {string} module - Module name
     * @returns {string} Placeholder HTML
     */
    getModulePlaceholder(module) {
        const moduleInfo = this.modules[module];
        return `
            <div class="module-placeholder" style="text-align: center; padding: 40px; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 4rem; margin-bottom: 24px;">🚧</div>
                <h2 style="margin-bottom: 16px;">${moduleInfo.name}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 1.125rem;">
                    Dette modul er under udvikling og kommer snart!
                </p>
                <div class="alert alert-info" style="text-align: left; margin-bottom: 32px;">
                    <h4 style="margin-bottom: 12px;">Planlagte features:</h4>
                    ${this.getPlannedFeatures(module)}
                </div>
                <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="app.navigateTo('home')">
                        Tilbage til Hjem
                    </button>
                    <button class="btn btn-secondary" onclick="utils.showToast('Tak for din interesse! Vi arbejder hårdt på at få alle moduler klar 🚀', 'info', 4000)">
                        Få besked når det er klar
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Get planned features for a module
     * @param {string} module - Module name
     * @returns {string} Features HTML
     */
    getPlannedFeatures(module) {
        const features = {
            content: [
                'Dag 1-7: Struktureret læringsindhold',
                'Protein purification fundamenter',
                'Interaktive diagrammer og illustrationer',
                'Downloadbare PDF noter'
            ],
            flashcards: [
                'Interaktive flashcards med spaced repetition',
                'Kategorisering efter sværhedsgrad',
                'Personlige favoritter og svære kort',
                'Offline tilgængelighed'
            ],
            quiz: [
                'Multiple choice spørgsmål',
                'Øjeblikkelig feedback',
                'Detaljerede forklaringer',
                'Fremskridt tracking'
            ],
            dashboard: [
                'Komplet fremskridts oversigt',
                'Læringsstatistikker',
                'Streak counter og badges',
                'Personaliserede anbefalinger'
            ]
        };

        const moduleFeatures = features[module] || ['Kommer snart...'];
        return moduleFeatures.map(feature => `<li>${feature}</li>`).join('');
    },

    /**
     * Update UI with current data
     */
    updateUI() {
        this.updateHomeStats();
        this.updateLastActiveStatus();
    },

    /**
     * Update home page statistics
     */
    updateHomeStats() {
        const progress = storage.getUserProgress();
        const streakData = storage.getLearningStreak();
        const flashcardData = storage.getFlashcardData();

        // Update stat elements if they exist
        const totalProgressEl = document.getElementById('totalProgress');
        const currentStreakEl = document.getElementById('currentStreak');
        const completedCardsEl = document.getElementById('completedCards');

        if (totalProgressEl) {
            const totalProgress = utils.calculatePercentage(progress.totalDaysCompleted, 7);
            totalProgressEl.textContent = `${totalProgress}%`;
        }

        if (currentStreakEl) {
            currentStreakEl.textContent = streakData.currentStreak;
        }

        if (completedCardsEl) {
            completedCardsEl.textContent = flashcardData.completed.length;
        }

        // Update module progress bars
        this.updateModuleProgress();
    },

    /**
     * Update module progress bars
     */
    updateModuleProgress() {
        const moduleCompletion = storage.getModuleCompletion();
        
        // Content progress
        const contentProgressEl = document.getElementById('contentProgress');
        if (contentProgressEl) {
            const contentProgress = utils.calculatePercentage(
                moduleCompletion.content.completed.length, 
                7
            );
            contentProgressEl.style.width = `${contentProgress}%`;
            
            const progressText = contentProgressEl.parentElement.nextElementSibling;
            if (progressText) {
                progressText.textContent = `${moduleCompletion.content.completed.length}/7 dage`;
            }
        }

        // Flashcards progress
        const flashcardsProgressEl = document.getElementById('flashcardsProgress');
        if (flashcardsProgressEl) {
            const flashcardData = storage.getFlashcardData();
            const flashcardsProgress = utils.calculatePercentage(
                flashcardData.completed.length, 
                50
            );
            flashcardsProgressEl.style.width = `${flashcardsProgress}%`;
            
            const progressText = flashcardsProgressEl.parentElement.nextElementSibling;
            if (progressText) {
                progressText.textContent = `${flashcardData.completed.length}/50 kort`;
            }
        }

        // Quiz progress
        const quizProgressEl = document.getElementById('quizProgress');
        if (quizProgressEl) {
            const quizResults = storage.getQuizResults();
            const uniqueQuestions = new Set(quizResults.map(result => result.questionId)).size;
            const quizProgress = utils.calculatePercentage(uniqueQuestions, 25);
            quizProgressEl.style.width = `${quizProgress}%`;
            
            const progressText = quizProgressEl.parentElement.nextElementSibling;
            if (progressText) {
                progressText.textContent = `${uniqueQuestions}/25 spørgsmål`;
            }
        }
    },

    /**
     * Update last active status
     */
    updateLastActiveStatus() {
        const lastActive = storage.getLastActive();
        if (lastActive && utils.isToday(lastActive)) {
            storage.updateLearningStreak(true);
        }
    },

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        // Alt + number keys for navigation
        if (event.altKey) {
            const moduleKeys = {
                '1': 'home',
                '2': 'content', 
                '3': 'flashcards',
                '4': 'quiz',
                '5': 'dashboard'
            };

            if (moduleKeys[event.key]) {
                event.preventDefault();
                this.navigateTo(moduleKeys[event.key]);
            }
        }

        // Escape key to go back to home
        if (event.key === 'Escape' && this.currentModule !== 'home') {
            this.navigateTo('home');
        }
    },

    /**
     * Setup periodic updates
     */
    setupPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            if (!document.hidden) {
                this.updateUI();
            }
        }, 30000);

        // Check for streak updates every hour
        setInterval(() => {
            this.updateLastActiveStatus();
        }, 3600000);
    },

    /**
     * Check if this is user's first visit
     */
    checkFirstVisit() {
        const progress = storage.getUserProgress();
        
        if (!progress.lastActiveDate) {
            // First time user
            setTimeout(() => {
                utils.showToast('Velkommen til ExamKlar! 👋 Start din læringsrejse nu', 'success', 5000);
            }, 1000);
            
            // Update progress to mark first visit
            storage.updateUserProgress({
                firstVisit: new Date().toISOString()
            });
        }
    },

    /**
     * Get application status
     * @returns {Object} App status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentModule: this.currentModule,
            modules: Object.keys(this.modules),
            storageAvailable: storage.isAvailable(),
            lastActive: storage.getLastActive(),
            version: '1.0.0'
        };
    }
};

// Make app globally available
window.app = app;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}