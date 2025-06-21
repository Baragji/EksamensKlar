// Achievements System Component
class AchievementSystem {
    constructor() {
        this.achievements = this.defineAchievements();
        this.userProgress = this.loadUserProgress();
        this.init();
    }

    defineAchievements() {
        return [
            // Streak Achievements
            {
                id: 'first_day',
                title: 'Første Dag',
                description: 'Fuldfør din første læringsdag',
                icon: '🌱',
                category: 'streak',
                requirement: { type: 'streak', value: 1 },
                points: 10
            },
            {
                id: 'week_warrior',
                title: 'Uge Kriger',
                description: 'Lær 7 dage i træk',
                icon: '🔥',
                category: 'streak',
                requirement: { type: 'streak', value: 7 },
                points: 50
            },
            {
                id: 'month_master',
                title: 'Måned Mester',
                description: 'Lær 30 dage i træk',
                icon: '💎',
                category: 'streak',
                requirement: { type: 'streak', value: 30 },
                points: 200
            },
            
            // Content Achievements
            {
                id: 'bookworm',
                title: 'Bogorm',
                description: 'Læs 10 sider indhold',
                icon: '📚',
                category: 'content',
                requirement: { type: 'content_pages', value: 10 },
                points: 25
            },
            {
                id: 'knowledge_seeker',
                title: 'Videns Søger',
                description: 'Læs 50 sider indhold',
                icon: '🎓',
                category: 'content',
                requirement: { type: 'content_pages', value: 50 },
                points: 100
            },
            {
                id: 'scholar',
                title: 'Lærd',
                description: 'Læs 100 sider indhold',
                icon: '📖',
                category: 'content',
                requirement: { type: 'content_pages', value: 100 },
                points: 250
            },
            
            // Flashcard Achievements
            {
                id: 'card_starter',
                title: 'Kort Starter',
                description: 'Gennemgå 25 flashcards',
                icon: '🎯',
                category: 'flashcards',
                requirement: { type: 'flashcards_reviewed', value: 25 },
                points: 20
            },
            {
                id: 'memory_champion',
                title: 'Hukommelses Champion',
                description: 'Gennemgå 100 flashcards',
                icon: '🧠',
                category: 'flashcards',
                requirement: { type: 'flashcards_reviewed', value: 100 },
                points: 75
            },
            {
                id: 'flashcard_master',
                title: 'Flashcard Mester',
                description: 'Gennemgå 500 flashcards',
                icon: '⚡',
                category: 'flashcards',
                requirement: { type: 'flashcards_reviewed', value: 500 },
                points: 300
            },
            
            // Quiz Achievements
            {
                id: 'quiz_rookie',
                title: 'Quiz Rookie',
                description: 'Tag din første quiz',
                icon: '🤔',
                category: 'quiz',
                requirement: { type: 'quizzes_completed', value: 1 },
                points: 15
            },
            {
                id: 'quiz_expert',
                title: 'Quiz Ekspert',
                description: 'Tag 10 quizzer',
                icon: '🎪',
                category: 'quiz',
                requirement: { type: 'quizzes_completed', value: 10 },
                points: 60
            },
            {
                id: 'perfect_score',
                title: 'Perfekt Score',
                description: 'Få 100% i en quiz',
                icon: '🏆',
                category: 'quiz',
                requirement: { type: 'perfect_quiz', value: 1 },
                points: 100
            },
            
            // Special Achievements
            {
                id: 'early_bird',
                title: 'Morgenfugl',
                description: 'Lær før kl. 8:00',
                icon: '🌅',
                category: 'special',
                requirement: { type: 'early_session', value: 1 },
                points: 30
            },
            {
                id: 'night_owl',
                title: 'Natteugle',
                description: 'Lær efter kl. 22:00',
                icon: '🦉',
                category: 'special',
                requirement: { type: 'late_session', value: 1 },
                points: 30
            },
            {
                id: 'content_creator',
                title: 'Indhold Skaber',
                description: 'Upload dit første indhold',
                icon: '✏️',
                category: 'special',
                requirement: { type: 'content_uploaded', value: 1 },
                points: 40
            }
        ];
    }

    loadUserProgress() {
        const saved = localStorage.getItem('examklar-achievements');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            unlockedAchievements: [],
            totalPoints: 0,
            lastChecked: null
        };
    }

    saveUserProgress() {
        localStorage.setItem('examklar-achievements', JSON.stringify(this.userProgress));
    }

    init() {
        this.checkAchievements();
    }

    getCurrentStats() {
        // Collect stats from all modules
        const contentProgress = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const flashcardProgress = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const quizProgress = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        const streakData = JSON.parse(localStorage.getItem('examklar-streak-data') || '{}');
        
        // Content stats
        const contentSessions = contentProgress.sessions || [];
        const totalContentPages = contentSessions.reduce((sum, session) => sum + (session.pagesRead || 0), 0);
        const contentUploaded = Object.keys(contentProgress.items || {}).length;
        
        // Flashcard stats
        const flashcardSessions = flashcardProgress.sessions || [];
        const totalFlashcardsReviewed = flashcardSessions.reduce((sum, session) => sum + (session.cardsReviewed || 0), 0);
        
        // Quiz stats
        const quizSessions = quizProgress.sessions || [];
        const totalQuizzes = quizSessions.length;
        const perfectQuizzes = quizSessions.filter(session => session.score === 100).length;
        
        // Time-based stats
        const earlySessions = this.countSessionsByTime([...contentSessions, ...flashcardSessions, ...quizSessions], 0, 8);
        const lateSessions = this.countSessionsByTime([...contentSessions, ...flashcardSessions, ...quizSessions], 22, 24);
        
        return {
            streak: streakData.currentStreak || 0,
            content_pages: totalContentPages,
            flashcards_reviewed: totalFlashcardsReviewed,
            quizzes_completed: totalQuizzes,
            perfect_quiz: perfectQuizzes,
            early_session: earlySessions,
            late_session: lateSessions,
            content_uploaded: contentUploaded
        };
    }

    countSessionsByTime(sessions, startHour, endHour) {
        return sessions.filter(session => {
            if (!session.date) return false;
            const hour = new Date(session.date).getHours();
            return hour >= startHour && hour < endHour;
        }).length;
    }

    checkAchievements() {
        const stats = this.getCurrentStats();
        let newAchievements = [];
        
        this.achievements.forEach(achievement => {
            // Skip if already unlocked
            if (this.userProgress.unlockedAchievements.includes(achievement.id)) {
                return;
            }
            
            // Check if requirement is met
            const requirementType = achievement.requirement.type;
            const requirementValue = achievement.requirement.value;
            const currentValue = stats[requirementType] || 0;
            
            if (currentValue >= requirementValue) {
                this.unlockAchievement(achievement);
                newAchievements.push(achievement);
            }
        });
        
        // Show notifications for new achievements
        if (newAchievements.length > 0) {
            this.showAchievementNotifications(newAchievements);
        }
        
        this.saveUserProgress();
        return newAchievements;
    }

    unlockAchievement(achievement) {
        this.userProgress.unlockedAchievements.push(achievement.id);
        this.userProgress.totalPoints += achievement.points;
    }

    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showNotification(`🏆 ${achievement.title} unlocked! (+${achievement.points} points)`);
            }, index * 2000); // Stagger notifications
        });
    }

    showNotification(message) {
        // Create and show achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4caf50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 500;
                animation: slideIn 0.5s ease, slideOut 0.5s ease 3s forwards;
            ">
                ${message}
            </div>
        `;
        
        // Add animation styles
        if (!document.getElementById('achievement-styles')) {
            const styles = document.createElement('style');
            styles.id = 'achievement-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    getUnlockedAchievements() {
        return this.achievements.filter(achievement => 
            this.userProgress.unlockedAchievements.includes(achievement.id)
        );
    }

    getLockedAchievements() {
        return this.achievements.filter(achievement => 
            !this.userProgress.unlockedAchievements.includes(achievement.id)
        );
    }

    getTotalPoints() {
        return this.userProgress.totalPoints;
    }

    getProgressToNext(achievement) {
        const stats = this.getCurrentStats();
        const current = stats[achievement.requirement.type] || 0;
        const required = achievement.requirement.value;
        return Math.min((current / required) * 100, 100);
    }

    renderAchievements(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const unlocked = this.getUnlockedAchievements();
        const locked = this.getLockedAchievements();
        
        container.innerHTML = `
            ${unlocked.map(achievement => `
                <div class="achievement unlocked">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-points">+${achievement.points} points</div>
                </div>
            `).join('')}
            
            ${locked.slice(0, 6).map(achievement => { // Show only next 6 locked achievements
                const progress = this.getProgressToNext(achievement);
                return `
                    <div class="achievement locked">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                        <div class="achievement-progress" style="
                            width: 100%;
                            height: 4px;
                            background: #e0e0e0;
                            border-radius: 2px;
                            margin-top: 8px;
                            overflow: hidden;
                        ">
                            <div style="
                                width: ${progress}%;
                                height: 100%;
                                background: linear-gradient(90deg, #2196f3, #64b5f6);
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                        <div class="achievement-points" style="font-size: 0.8rem; margin-top: 4px;">
                            ${progress.toFixed(0)}% - ${achievement.points} points
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // Update achievements (call this when user completes activities)
    update() {
        return this.checkAchievements();
    }
}

// Export for use in main dashboard
window.AchievementSystem = AchievementSystem;
