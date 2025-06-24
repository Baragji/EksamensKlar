/**
 * ExamKlar Data Bridge - Central data koordination
 * Ensures data flows correctly between all modules
 */

const DataBridge = {
    eventBus: null,
    
    // Central storage keys
    KEYS: {
        ONBOARDING_DATA: 'examklar_onboarding_data',
        USER_TRAINING_DATA: 'examklar_user_training_data',
        PROGRESS_TRACKER: 'examklar_progress_tracker',
        CROSS_MODULE_DATA: 'examklar_cross_module_data'
    },

    /**
     * Initialize EventBus connection
     * @param {Object} eventBus - EventBus instance
     */
    initEventBus(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
        console.log('🌉 DataBridge: EventBus initialized');
    },

    /**
     * Setup EventBus listeners
     */
    setupEventListeners() {
        if (!this.eventBus) return;

        // Listen for data requests
        this.eventBus.on('data', 'request', (data) => {
            this.handleDataRequest(data);
        });

        // Listen for data updates
        this.eventBus.on('data', 'update', (data) => {
            this.handleDataUpdate(data);
        });

        // Listen for onboarding completion
        this.eventBus.on('onboarding', 'complete', (data) => {
            this.initializeFromOnboarding(data.onboardingData);
        });
    },

    /**
     * Handle data requests from other modules
     * @param {Object} request - Data request object
     */
    handleDataRequest(request) {
        const { type, key, callback } = request;
        let data = null;

        switch (type) {
            case 'onboarding':
                data = this.getOnboardingData();
                break;
            case 'training':
                data = this.getTrainingData();
                break;
            case 'progress':
                data = this.getProgressSummary();
                break;
            default:
                console.warn('🌉 DataBridge: Unknown data request type:', type);
        }

        if (this.eventBus) {
            this.eventBus.emit('data', 'response', { type, key, data, requestId: request.requestId });
        }
    },

    /**
     * Handle data updates from other modules
     * @param {Object} update - Data update object
     */
    handleDataUpdate(update) {
        const { type, data } = update;

        switch (type) {
            case 'progress':
                this.updateProgress(data.module, data.activityType, data.data);
                break;
            case 'training':
                this.saveTrainingData(data);
                break;
            default:
                console.warn('🌉 DataBridge: Unknown data update type:', type);
        }

        if (this.eventBus) {
            this.eventBus.emit('data', 'updated', { type, timestamp: Date.now() });
        }
    },

    /**
     * Initialize data bridge after onboarding
     */
    initializeFromOnboarding() {
        console.log('🔄 DataBridge: Initializing from onboarding...');
        
        if (this.eventBus) {
            this.eventBus.emit('data', 'initialization_start', { source: 'onboarding' });
        }
        
        const onboardingData = this.getOnboardingData();
        console.log('🔍 DEBUG: Retrieved onboarding data:', onboardingData);
        
        if (!onboardingData) {
            console.warn('⚠️ No onboarding data found');
            // Additional debugging
            const allKeys = Object.keys(localStorage).filter(key => key.includes('examklar'));
            console.log('🔍 DEBUG: Available localStorage keys:', allKeys);
            return false;
        }

        console.log('🔍 DEBUG: Onboarding data structure:', {
            hasSubject: !!onboardingData.subject,
            hasEmoji: !!onboardingData.subjectEmoji,
            hasExamDate: !!onboardingData.examDate,
            hasDaysToExam: !!onboardingData.daysToExam,
            hasContent: !!(onboardingData.content && onboardingData.content.length > 0),
            contentLength: onboardingData.content ? onboardingData.content.length : 0
        });

        // Create unified training data structure
        const trainingData = {
            subject: {
                name: onboardingData.subject,
                emoji: onboardingData.subjectEmoji,
                examDate: onboardingData.examDate,
                daysToExam: onboardingData.daysToExam
            },
            content: {
                items: this.initializeContentFromOnboarding(onboardingData),
                completed: [],
                progress: {}
            },
            flashcards: {
                decks: this.initializeFlashcardsFromOnboarding(onboardingData),
                completed: [],
                stats: {
                    totalReviewed: 0,
                    averageScore: 0,
                    streakCount: 0
                }
            },
            quiz: {
                available: this.initializeQuizzesFromOnboarding(onboardingData),
                completed: [],
                stats: {
                    totalQuizzes: 0,
                    averageScore: 0,
                    bestScore: 0
                }
            },
            dashboard: {
                totalSessions: 0,
                totalTimeSpent: 0,
                weeklyGoals: {
                    content: 3,
                    flashcards: 20,
                    quiz: 2
                },
                achievements: []
            },
            meta: {
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            }
        };

        console.log('🔍 DEBUG: Created training data structure:', trainingData);

        // Save the unified training data
        try {
            this.saveTrainingData(trainingData);
            console.log('✅ Training data saved successfully');
        } catch (error) {
            console.error('❌ Error saving training data:', error);
            return false;
        }
        
        // Update progress tracker
        try {
            this.initializeProgressTracker();
            console.log('✅ Progress tracker initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing progress tracker:', error);
            return false;
        }
        
        console.log('✅ DataBridge: Training data initialized successfully');
        
        if (this.eventBus) {
            this.eventBus.emit('data', 'initialization_complete', { 
                source: 'onboarding', 
                trainingData,
                timestamp: Date.now()
            });
        }
        
        return true;
    },

    /**
     * Get onboarding data
     */
    getOnboardingData() {
        const data = localStorage.getItem(this.KEYS.ONBOARDING_DATA);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Get unified training data
     */
    getTrainingData() {
        const data = localStorage.getItem(this.KEYS.USER_TRAINING_DATA);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Save unified training data
     */
    saveTrainingData(data) {
        try {
            data.meta.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.KEYS.USER_TRAINING_DATA, JSON.stringify(data));
            
            // Also update cross-module data for backward compatibility
            this.updateCrossModuleData(data);
            
            if (this.eventBus) {
                this.eventBus.emit('data', 'saved', { type: 'training', timestamp: Date.now() });
            }
        } catch (error) {
            console.error('🌉 DataBridge: Error saving training data:', error);
            
            if (this.eventBus) {
                this.eventBus.emit('data', 'save_error', { type: 'training', error: error.message });
            }
        }
    },

    /**
     * Initialize content from onboarding
     */
    initializeContentFromOnboarding(onboardingData) {
        const contentItems = [];
        
        // Add content from onboarding if available
        if (onboardingData.content && onboardingData.content.length > 0) {
            onboardingData.content.forEach((item, index) => {
                contentItems.push({
                    id: `content_${index + 1}`,
                    title: item.name || `${onboardingData.subject} - Del ${index + 1}`,
                    type: item.type || 'document',
                    content: item.content || '',
                    estimatedTime: 15,
                    difficulty: 2,
                    status: 'available',
                    created: new Date().toISOString()
                });
            });
        }

        // Add default content structure for the subject
        const defaultContent = this.generateDefaultContent(onboardingData.subject);
        contentItems.push(...defaultContent);

        return contentItems;
    },

    /**
     * Initialize flashcards from onboarding
     */
    initializeFlashcardsFromOnboarding(onboardingData) {
        const subject = onboardingData.subject.toLowerCase();
        
        // Generate subject-specific flashcards
        const flashcards = this.generateSubjectFlashcards(subject);
        
        return [{
            id: 'deck_main',
            name: `${onboardingData.subject} - Hovedkort`,
            description: 'Grundlæggende begreber og definitioner',
            cards: flashcards,
            created: new Date().toISOString(),
            settings: {
                spacedRepetition: true,
                randomOrder: false,
                showHints: true
            }
        }];
    },

    /**
     * Initialize quizzes from onboarding
     */
    initializeQuizzesFromOnboarding(onboardingData) {
        const subject = onboardingData.subject.toLowerCase();
        
        // Generate subject-specific quiz
        const quiz = this.generateSubjectQuiz(subject, onboardingData.subject);
        
        return [quiz];
    },

    /**
     * Generate default content for a subject
     */
    generateDefaultContent(subject) {
        const subjectLower = subject.toLowerCase();
        
        if (subjectLower.includes('matematik')) {
            return [
                {
                    id: 'content_math_1',
                    title: 'Grundlæggende Algebra',
                    type: 'lesson',
                    content: 'Lær de grundlæggende algebraiske principper...',
                    estimatedTime: 20,
                    difficulty: 2,
                    status: 'available',
                    created: new Date().toISOString()
                },
                {
                    id: 'content_math_2',
                    title: 'Geometri og Trigonometri',
                    type: 'lesson',
                    content: 'Forstå geometriske former og trigonometriske funktioner...',
                    estimatedTime: 25,
                    difficulty: 3,
                    status: 'locked',
                    created: new Date().toISOString()
                }
            ];
        }
        
        // Default content for any subject
        return [
            {
                id: 'content_intro',
                title: `Introduktion til ${subject}`,
                type: 'lesson',
                content: `Grundlæggende introduktion til ${subject}...`,
                estimatedTime: 15,
                difficulty: 1,
                status: 'available',
                created: new Date().toISOString()
            },
            {
                id: 'content_advanced',
                title: `Avanceret ${subject}`,
                type: 'lesson',
                content: `Dybdegående emner inden for ${subject}...`,
                estimatedTime: 30,
                difficulty: 3,
                status: 'locked',
                created: new Date().toISOString()
            }
        ];
    },

    /**
     * Generate subject-specific flashcards
     */
    generateSubjectFlashcards(subject) {
        if (subject.includes('matematik')) {
            return [
                {
                    id: 'card_1',
                    front: 'Hvad er Pythagoras sætning?',
                    back: 'a² + b² = c², hvor c er hypotenusen i en retvinklet trekant',
                    category: 'geometri',
                    difficulty: 2,
                    created: new Date().toISOString(),
                    nextReview: new Date().toISOString()
                },
                {
                    id: 'card_2',
                    front: 'Hvordan løser man en andengradsligning?',
                    back: 'Brug formlen: x = (-b ± √(b²-4ac)) / 2a',
                    category: 'algebra',
                    difficulty: 3,
                    created: new Date().toISOString(),
                    nextReview: new Date().toISOString()
                },
                {
                    id: 'card_3',
                    front: 'Hvad er derivatet af x²?',
                    back: '2x',
                    category: 'calculus',
                    difficulty: 2,
                    created: new Date().toISOString(),
                    nextReview: new Date().toISOString()
                }
            ];
        }
        
        // Default cards for any subject
        return [
            {
                id: 'card_intro_1',
                front: `Hvad er hovedformålet med at studere ${subject}?`,
                back: 'At opbygge en grundlæggende forståelse og anvendelse af centrale begreber',
                category: 'introduction',
                difficulty: 1,
                created: new Date().toISOString(),
                nextReview: new Date().toISOString()
            },
            {
                id: 'card_intro_2',
                front: `Nævn tre vigtige områder inden for ${subject}`,
                back: 'Dette afhænger af det specifikke emne og dets underområder',
                category: 'overview',
                difficulty: 2,
                created: new Date().toISOString(),
                nextReview: new Date().toISOString()
            }
        ];
    },

    /**
     * Generate subject-specific quiz
     */
    generateSubjectQuiz(subject, subjectName) {
        let questions = [];
        
        if (subject.includes('matematik')) {
            questions = [
                {
                    id: 'q1',
                    question: 'Hvad er 2 + 2?',
                    options: ['3', '4', '5', '6'],
                    correct: 1,
                    explanation: 'Grundlæggende addition: 2 + 2 = 4'
                },
                {
                    id: 'q2',
                    question: 'Hvad er arealet af en cirkel med radius 3?',
                    options: ['6π', '9π', '12π', '18π'],
                    correct: 1,
                    explanation: 'Areal = π × r² = π × 3² = 9π'
                }
            ];
        } else {
            questions = [
                {
                    id: 'q1',
                    question: `Hvor godt kender du ${subjectName} på en skala fra 1-4?`,
                    options: ['1 - Begynder', '2 - Lidt erfaring', '3 - Ret erfaren', '4 - Ekspert'],
                    correct: 1, // No wrong answer for self-assessment
                    explanation: 'Dette er en selvvurdering for at tilpasse indholdet til dit niveau'
                }
            ];
        }

        return {
            id: 'quiz_intro',
            title: `${subjectName} - Intro Quiz`,
            description: 'Test dine grundlæggende færdigheder',
            questions: questions,
            timeLimit: 600, // 10 minutes
            passingScore: 70,
            attempts: 0,
            maxAttempts: 3,
            created: new Date().toISOString()
        };
    },

    /**
     * Initialize progress tracker
     */
    initializeProgressTracker() {
        const tracker = {
            daily: {
                [new Date().toISOString().split('T')[0]]: {
                    content: 0,
                    flashcards: 0,
                    quiz: 0,
                    timeSpent: 0
                }
            },
            weekly: {},
            monthly: {},
            goals: {
                daily: {
                    content: 1,
                    flashcards: 10,
                    quiz: 1,
                    timeSpent: 30 // minutes
                },
                weekly: {
                    content: 5,
                    flashcards: 50,
                    quiz: 3,
                    timeSpent: 180 // minutes
                }
            },
            streaks: {
                current: 0,
                longest: 0,
                lastActiveDate: null
            },
            totalStats: {
                contentCompleted: 0,
                flashcardsReviewed: 0,
                quizzesCompleted: 0,
                totalTimeSpent: 0,
                sessionsCompleted: 0
            }
        };

        localStorage.setItem(this.KEYS.PROGRESS_TRACKER, JSON.stringify(tracker));
    },

    /**
     * Update cross-module data for backward compatibility
     */
    updateCrossModuleData(trainingData) {
        // Update content module data
        if (trainingData.content) {
            localStorage.setItem('examklar-content', JSON.stringify({
                curriculum: {
                    program: {
                        title: `${trainingData.subject.name} Program`,
                        description: `Læringsplan for ${trainingData.subject.name}`,
                        totalDays: trainingData.content.items.length,
                        estimatedHours: trainingData.content.items.reduce((sum, item) => sum + (item.estimatedTime || 15), 0) / 60
                    },
                    days: trainingData.content.items.map((item, index) => ({
                        day: index + 1,
                        title: item.title,
                        content: item.content,
                        duration: item.estimatedTime,
                        difficulty: item.difficulty,
                        status: item.status
                    }))
                }
            }));
        }

        // Update flashcard module data
        if (trainingData.flashcards && trainingData.flashcards.decks.length > 0) {
            localStorage.setItem('examklar-flashcards', JSON.stringify({
                flashcards: trainingData.flashcards.decks[0].cards,
                categories: [
                    {
                        id: "main",
                        name: trainingData.subject.name,
                        description: `Flashcards for ${trainingData.subject.name}`,
                        color: "#3498db"
                    }
                ],
                stats: trainingData.flashcards.stats
            }));
        }

        // Update quiz module data
        if (trainingData.quiz && trainingData.quiz.available.length > 0) {
            localStorage.setItem('examklar-quiz', JSON.stringify({
                quizzes: trainingData.quiz.available,
                categories: [
                    {
                        id: trainingData.subject.name.toLowerCase(),
                        name: trainingData.subject.name,
                        icon: trainingData.subject.emoji || '📚',
                        color: '#6366f1'
                    }
                ],
                stats: trainingData.quiz.stats
            }));
        }
    },

    /**
     * Update progress when user completes activity
     */
    updateProgress(module, activityType, data = {}) {
        const today = new Date().toISOString().split('T')[0];
        const tracker = JSON.parse(localStorage.getItem(this.KEYS.PROGRESS_TRACKER) || '{}');
        
        // Initialize today if not exists
        if (!tracker.daily) tracker.daily = {};
        if (!tracker.daily[today]) {
            tracker.daily[today] = {
                content: 0,
                flashcards: 0,
                quiz: 0,
                timeSpent: 0
            };
        }

        // Update daily progress
        tracker.daily[today][module] += 1;
        tracker.daily[today].timeSpent += data.timeSpent || 0;

        // Update total stats
        if (!tracker.totalStats) tracker.totalStats = {};
        tracker.totalStats[`${module}Completed`] = (tracker.totalStats[`${module}Completed`] || 0) + 1;
        tracker.totalStats.totalTimeSpent = (tracker.totalStats.totalTimeSpent || 0) + (data.timeSpent || 0);
        tracker.totalStats.sessionsCompleted = (tracker.totalStats.sessionsCompleted || 0) + 1;

        // Update streak
        this.updateStreak(tracker, today);

        // Save updated tracker
        localStorage.setItem(this.KEYS.PROGRESS_TRACKER, JSON.stringify(tracker));

        // Trigger UI updates
        this.triggerProgressUpdate(module, tracker);
    },

    /**
     * Update streak calculation
     */
    updateStreak(tracker, today) {
        if (!tracker.streaks) {
            tracker.streaks = { current: 0, longest: 0, lastActiveDate: null };
        }

        const lastActive = tracker.streaks.lastActiveDate;
        if (!lastActive) {
            // First day
            tracker.streaks.current = 1;
            tracker.streaks.longest = 1;
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActive === yesterdayStr) {
                // Continue streak
                tracker.streaks.current += 1;
                if (tracker.streaks.current > tracker.streaks.longest) {
                    tracker.streaks.longest = tracker.streaks.current;
                }
            } else if (lastActive !== today) {
                // Break streak, start new
                tracker.streaks.current = 1;
            }
        }

        tracker.streaks.lastActiveDate = today;
    },

    /**
     * Trigger UI updates across modules
     */
    triggerProgressUpdate(module, tracker) {
        // Dispatch custom event for other modules to listen to
        window.dispatchEvent(new CustomEvent('examklar:progress-updated', {
            detail: { module, tracker }
        }));

        console.log(`📈 Progress updated for ${module}:`, tracker.daily[new Date().toISOString().split('T')[0]]);
    },

    /**
     * Get progress summary for dashboard
     */
    getProgressSummary() {
        const tracker = JSON.parse(localStorage.getItem(this.KEYS.PROGRESS_TRACKER) || '{}');
        const today = new Date().toISOString().split('T')[0];
        
        return {
            today: tracker.daily?.[today] || { content: 0, flashcards: 0, quiz: 0, timeSpent: 0 },
            total: tracker.totalStats || {},
            streaks: tracker.streaks || { current: 0, longest: 0 },
            goals: tracker.goals || {}
        };
    },

    /**
     * Check if system has training data
     */
    hasTrainingData() {
        return !!localStorage.getItem(this.KEYS.USER_TRAINING_DATA);
    },

    /**
     * Reset all training data (for testing)
     */
    resetTrainingData() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Also remove legacy keys
        const keysToRemove = ['examklar-content', 'examklar-flashcards', 'examklar-quiz'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('🗑️ All training data reset');
    }
};

// Make DataBridge globally available
window.DataBridge = DataBridge;

// Auto-initialize if onboarding is complete but no training data exists
document.addEventListener('DOMContentLoaded', () => {
    const onboardingComplete = localStorage.getItem('examklar_onboarding_completed');
    const hasTrainingData = DataBridge.hasTrainingData();
    
    if (onboardingComplete && !hasTrainingData) {
        console.log('🔄 Auto-initializing training data from onboarding...');
        DataBridge.initializeFromOnboarding();
    }
});
