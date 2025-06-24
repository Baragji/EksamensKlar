/**
 * ExamKlar Storage Manager
 * Handles all local storage operations with fallbacks and error handling
 */

const storage = {
    // Storage keys
    KEYS: {
        USER_PROGRESS: 'examklar_user_progress',
        FLASHCARD_DATA: 'examklar_flashcard_data',
        QUIZ_RESULTS: 'examklar_quiz_results',
        LEARNING_STREAK: 'examklar_learning_streak',
        MODULE_COMPLETION: 'examklar_module_completion',
        USER_SETTINGS: 'examklar_user_settings',
        SPACED_REPETITION: 'examklar_spaced_repetition',
        LAST_ACTIVE: 'examklar_last_active'
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is supported
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            if (!this.isAvailable()) {
                console.warn('localStorage not available, returning default value');
                return defaultValue;
            }

            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;

            // Try to parse JSON, return as string if it fails
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} True if successful
     */
    set(key, value) {
        try {
            if (!this.isAvailable()) {
                console.warn('localStorage not available');
                return false;
            }

            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    remove(key) {
        try {
            if (!this.isAvailable()) {
                console.warn('localStorage not available');
                return false;
            }

            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    },

    /**
     * Clear all ExamKlar data from localStorage
     * @returns {boolean} True if successful
     */
    clear() {
        try {
            if (!this.isAvailable()) {
                console.warn('localStorage not available');
                return false;
            }

            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    /**
     * Get user progress data
     * @returns {Object} User progress object
     */
    getUserProgress() {
        return this.get(this.KEYS.USER_PROGRESS, {
            totalDaysCompleted: 0,
            currentDay: 1,
            completedModules: [],
            lastActiveDate: null,
            streakCount: 0,
            totalStudyTime: 0,
            badges: []
        });
    },

    /**
     * Update user progress
     * @param {Object} progressData - Progress data to update
     * @returns {boolean} True if successful
     */
    updateUserProgress(progressData) {
        const currentProgress = this.getUserProgress();
        const updatedProgress = { ...currentProgress, ...progressData };
        updatedProgress.lastActiveDate = new Date().toISOString();
        
        return this.set(this.KEYS.USER_PROGRESS, updatedProgress);
    },

    /**
     * Get flashcard data
     * @returns {Object} Flashcard data object
     */
    getFlashcardData() {
        return this.get(this.KEYS.FLASHCARD_DATA, {
            completed: [],
            favorites: [],
            difficult: [],
            lastReviewed: {}
        });
    },

    /**
     * Update flashcard data
     * @param {Object} flashcardData - Flashcard data to update
     * @returns {boolean} True if successful
     */
    updateFlashcardData(flashcardData) {
        const currentData = this.getFlashcardData();
        const updatedData = { ...currentData, ...flashcardData };
        
        return this.set(this.KEYS.FLASHCARD_DATA, updatedData);
    },

    /**
     * Get quiz results
     * @returns {Array} Array of quiz results
     */
    getQuizResults() {
        return this.get(this.KEYS.QUIZ_RESULTS, []);
    },

    /**
     * Add quiz result
     * @param {Object} result - Quiz result object
     * @returns {boolean} True if successful
     */
    addQuizResult(result) {
        const results = this.getQuizResults();
        const newResult = {
            id: utils.generateId(),
            date: new Date().toISOString(),
            ...result
        };
        
        results.push(newResult);
        
        // Keep only last 50 results to avoid bloating storage
        if (results.length > 50) {
            results.shift();
        }
        
        return this.set(this.KEYS.QUIZ_RESULTS, results);
    },

    /**
     * Get learning streak data
     * @returns {Object} Streak data object
     */
    getLearningStreak() {
        return this.get(this.KEYS.LEARNING_STREAK, {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            streakHistory: []
        });
    },

    /**
     * Update learning streak
     * @param {boolean} wasActiveToday - Whether user was active today
     * @returns {boolean} True if successful
     */
    updateLearningStreak(wasActiveToday = true) {
        const streakData = this.getLearningStreak();
        const today = new Date().toDateString();
        const lastActive = streakData.lastActiveDate ? new Date(streakData.lastActiveDate).toDateString() : null;
        
        if (wasActiveToday && lastActive !== today) {
            // Check if yesterday was the last active day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastActive === yesterdayStr) {
                // Continue streak
                streakData.currentStreak += 1;
            } else if (lastActive !== today) {
                // Start new streak
                streakData.currentStreak = 1;
            }
            
            // Update longest streak
            if (streakData.currentStreak > streakData.longestStreak) {
                streakData.longestStreak = streakData.currentStreak;
            }
            
            streakData.lastActiveDate = new Date().toISOString();
            
            // Add to history
            streakData.streakHistory.push({
                date: today,
                streakCount: streakData.currentStreak
            });
            
            // Keep only last 365 days of history
            if (streakData.streakHistory.length > 365) {
                streakData.streakHistory.shift();
            }
        }
        
        return this.set(this.KEYS.LEARNING_STREAK, streakData);
    },

    /**
     * Get module completion data
     * @returns {Object} Module completion object
     */
    getModuleCompletion() {
        return this.get(this.KEYS.MODULE_COMPLETION, {
            content: { completed: [], progress: {} },
            flashcards: { completed: [], progress: {} },
            quiz: { completed: [], progress: {} },
            dashboard: { lastVisited: null }
        });
    },

    /**
     * Update module completion
     * @param {string} module - Module name
     * @param {Object} completionData - Completion data
     * @returns {boolean} True if successful
     */
    updateModuleCompletion(module, completionData) {
        const moduleData = this.getModuleCompletion();
        
        if (!moduleData[module]) {
            moduleData[module] = { completed: [], progress: {} };
        }
        
        moduleData[module] = { ...moduleData[module], ...completionData };
        moduleData[module].lastUpdated = new Date().toISOString();
        
        return this.set(this.KEYS.MODULE_COMPLETION, moduleData);
    },

    /**
     * Get user settings
     * @returns {Object} User settings object
     */
    getUserSettings() {
        return this.get(this.KEYS.USER_SETTINGS, {
            theme: 'light', // light, dark, auto
            language: 'da',
            notifications: true,
            soundEnabled: true,
            difficulty: 'medium', // easy, medium, hard
            studyReminders: true,
            dailyGoal: 15, // minutes
            preferredStudyTime: '18:00'
        });
    },

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     * @returns {boolean} True if successful
     */
    updateUserSettings(settings) {
        const currentSettings = this.getUserSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        
        return this.set(this.KEYS.USER_SETTINGS, updatedSettings);
    },

    /**
     * Get spaced repetition data
     * @returns {Object} Spaced repetition data
     */
    getSpacedRepetitionData() {
        return this.get(this.KEYS.SPACED_REPETITION, {
            cards: {},
            algorithm: '2357', // Default algorithm
            settings: {
                intervals: [2, 3, 5, 7, 14, 30, 60], // days
                easyMultiplier: 1.3,
                hardMultiplier: 0.8
            }
        });
    },

    /**
     * Update spaced repetition data for a card
     * @param {string} cardId - Card ID
     * @param {Object} cardData - Card repetition data
     * @returns {boolean} True if successful
     */
    updateSpacedRepetitionCard(cardId, cardData) {
        const srpData = this.getSpacedRepetitionData();
        
        srpData.cards[cardId] = {
            ...srpData.cards[cardId],
            ...cardData,
            lastReviewed: new Date().toISOString()
        };
        
        return this.set(this.KEYS.SPACED_REPETITION, srpData);
    },

    /**
     * Get cards due for review
     * @returns {Array} Array of card IDs due for review
     */
    getCardsDueForReview() {
        const srpData = this.getSpacedRepetitionData();
        const now = new Date();
        const dueCards = [];
        
        Object.entries(srpData.cards).forEach(([cardId, cardData]) => {
            if (cardData.nextReview && new Date(cardData.nextReview) <= now) {
                dueCards.push(cardId);
            }
        });
        
        return dueCards;
    },

    /**
     * Update last active timestamp
     * @returns {boolean} True if successful
     */
    updateLastActive() {
        return this.set(this.KEYS.LAST_ACTIVE, new Date().toISOString());
    },

    /**
     * Get last active timestamp
     * @returns {string|null} Last active timestamp or null
     */
    getLastActive() {
        return this.get(this.KEYS.LAST_ACTIVE, null);
    },

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        if (!this.isAvailable()) {
            return { available: false };
        }
        
        let totalSize = 0;
        const keyData = {};
        
        Object.entries(this.KEYS).forEach(([name, key]) => {
            const value = localStorage.getItem(key);
            const size = value ? new Blob([value]).size : 0;
            keyData[name] = { key, size };
            totalSize += size;
        });
        
        return {
            available: true,
            totalSize,
            keyData,
            formattedSize: this.formatBytes(totalSize)
        };
    },

    /**
     * Format bytes to human readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Export all data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            data[name] = this.get(key);
        });
        
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            version: '1.0',
            data
        }, null, 2);
    },

    /**
     * Import data from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} True if successful
     */
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            
            if (!imported.data) {
                throw new Error('Invalid data format');
            }
            
            Object.entries(imported.data).forEach(([name, value]) => {
                if (this.KEYS[name]) {
                    this.set(this.KEYS[name], value);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storage;
}