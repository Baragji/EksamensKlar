// Streak Counter Component
class StreakCounter {
    constructor() {
        this.streakData = this.loadStreakData();
        this.init();
    }

    loadStreakData() {
        const data = localStorage.getItem('examklar-streak-data');
        if (data) {
            return JSON.parse(data);
        }
        
        // Initialize default streak data
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            activeDates: [],
            streakStartDate: null
        };
    }

    saveStreakData() {
        localStorage.setItem('examklar-streak-data', JSON.stringify(this.streakData));
    }

    init() {
        this.updateStreakFromActivity();
    }

    updateStreakFromActivity() {
        // Check for activity across all modules
        const hasActivityToday = this.checkActivityToday();
        const today = new Date().toISOString().split('T')[0];
        
        if (hasActivityToday && !this.streakData.activeDates.includes(today)) {
            this.recordActivity(today);
        }
        
        this.calculateCurrentStreak();
        this.saveStreakData();
    }

    checkActivityToday() {
        const today = new Date().toISOString().split('T')[0];
        
        // Check content module
        const contentProgress = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const contentSessions = contentProgress.sessions || [];
        const hasContentToday = contentSessions.some(session => 
            session.date && session.date.startsWith(today)
        );
        
        // Check flashcard module
        const flashcardProgress = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const flashcardSessions = flashcardProgress.sessions || [];
        const hasFlashcardsToday = flashcardSessions.some(session => 
            session.date && session.date.startsWith(today)
        );
        
        // Check quiz module
        const quizProgress = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        const quizSessions = quizProgress.sessions || [];
        const hasQuizToday = quizSessions.some(session => 
            session.date && session.date.startsWith(today)
        );
        
        return hasContentToday || hasFlashcardsToday || hasQuizToday;
    }

    recordActivity(date) {
        if (!this.streakData.activeDates.includes(date)) {
            this.streakData.activeDates.push(date);
            this.streakData.activeDates.sort();
            this.streakData.lastActiveDate = date;
        }
    }

    calculateCurrentStreak() {
        if (this.streakData.activeDates.length === 0) {
            this.streakData.currentStreak = 0;
            this.streakData.streakStartDate = null;
            return;
        }

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if user was active today or yesterday
        const wasActiveToday = this.streakData.activeDates.includes(todayStr);
        const wasActiveYesterday = this.streakData.activeDates.includes(yesterdayStr);
        
        if (!wasActiveToday && !wasActiveYesterday) {
            // Streak is broken
            this.streakData.currentStreak = 0;
            this.streakData.streakStartDate = null;
            return;
        }

        // Calculate consecutive days from the end
        let streak = 0;
        let currentDate = new Date(today);
        
        // Start from today if active today, otherwise yesterday
        if (!wasActiveToday) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        // Safety limit to prevent infinite loops
        let maxIterations = 365; // Maximum 1 year of streak
        
        while (maxIterations > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (this.streakData.activeDates.includes(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
                maxIterations--;
            } else {
                break;
            }
        }
        
        if (maxIterations === 0) {
            console.warn('[StreakCounter] Maximum iterations reached, preventing infinite loop');
        }

        this.streakData.currentStreak = streak;
        
        // Update longest streak
        if (streak > this.streakData.longestStreak) {
            this.streakData.longestStreak = streak;
        }

        // Set streak start date
        if (streak > 0) {
            const startDate = new Date(currentDate);
            startDate.setDate(startDate.getDate() + 1);
            this.streakData.streakStartDate = startDate.toISOString().split('T')[0];
        }
    }

    getCurrentStreak() {
        return this.streakData.currentStreak;
    }

    getLongestStreak() {
        return this.streakData.longestStreak;
    }

    getStreakStartDate() {
        return this.streakData.streakStartDate;
    }

    getStreakEmoji() {
        const streak = this.streakData.currentStreak;
        if (streak === 0) return '😴';
        if (streak < 3) return '🔥';
        if (streak < 7) return '🚀';
        if (streak < 14) return '⭐';
        if (streak < 30) return '💎';
        return '👑';
    }

    getStreakMessage() {
        const streak = this.streakData.currentStreak;
        if (streak === 0) return 'Start din streak i dag!';
        if (streak === 1) return 'Godt begyndt! Hold det kørende!';
        if (streak < 7) return 'Du er i gang! Bliv ved!';
        if (streak < 14) return 'Fantastisk! Du er på ild!';
        if (streak < 30) return 'Utroligt! Du er en læringschampion!';
        return 'Legendarisk! Du er ustoppelig!';
    }

    // Method to manually record activity (for testing or manual updates)
    manualRecordActivity(date = null) {
        const activityDate = date || new Date().toISOString().split('T')[0];
        this.recordActivity(activityDate);
        this.calculateCurrentStreak();
        this.saveStreakData();
    }

    // Method to reset streak (for testing or user request)
    resetStreak() {
        this.streakData = {
            currentStreak: 0,
            longestStreak: this.streakData.longestStreak, // Keep longest streak
            lastActiveDate: null,
            activeDates: [],
            streakStartDate: null
        };
        this.saveStreakData();
    }

    // Get streak statistics for dashboard
    getStreakStats() {
        return {
            current: this.streakData.currentStreak,
            longest: this.streakData.longestStreak,
            emoji: this.getStreakEmoji(),
            message: this.getStreakMessage(),
            startDate: this.streakData.streakStartDate,
            totalActiveDays: this.streakData.activeDates.length
        };
    }
}

// Export for use in main dashboard
window.StreakCounter = StreakCounter;
