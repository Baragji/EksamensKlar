// Dashboard Main Controller
class Dashboard {
    constructor() {
        this.progressChart = null;
        this.moduleChart = null;
        this.streakCounter = null;
        this.achievementSystem = null;
        this.goals = this.loadGoals();
        this.checkOnboarding();
        this.init();
    }

    checkOnboarding() {
        // Check if onboarding is completed
        const hasCompletedOnboarding = localStorage.getItem('examklar_onboarding_completed');
        if (!hasCompletedOnboarding) {
            // Redirect to onboarding
            window.location.href = '../onboarding/index.html';
            return false;
        }
        return true;
    }

    loadGoals() {
        // Try to load from DataBridge first
        if (window.DataBridge) {
            const progressSummary = window.DataBridge.getProgressSummary();
            if (progressSummary.goals && progressSummary.goals.daily) {
                return progressSummary.goals.daily;
            }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('examklar-daily-goals');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            content: 1,
            flashcards: 10,
            quiz: 1,
            timeSpent: 30 // minutes
        };
    }

    saveGoals() {
        localStorage.setItem('examklar-daily-goals', JSON.stringify(this.goals));
    }

    init() {
        this.initializeComponents();
        this.updateStats();
        this.updateGoals();
        this.updateTimeline();
        this.bindEvents();
        this.updateDataStats();
        
        // Listen for progress updates from other modules
        window.addEventListener('examklar:progress-updated', (e) => {
            this.handleProgressUpdate(e.detail);
        });
    }

    handleProgressUpdate(data) {
        console.log('Dashboard received progress update:', data);
        
        // Update real-time progress display
        this.updateStats();
        this.updateGoals();
        
        // Update charts if they exist
        if (this.progressChart && typeof this.progressChart.update === 'function') {
            this.progressChart.update();
        }
        if (this.moduleChart && typeof this.moduleChart.update === 'function') {
            this.moduleChart.update();
        }
    }

    initializeComponents() {
        // Initialize charts
        this.progressChart = new ProgressChart('weeklyChart');
        this.moduleChart = new ModuleChart('moduleChart');
        
        // Initialize streak counter
        this.streakCounter = new StreakCounter();
        
        // Initialize achievement system
        this.achievementSystem = new AchievementSystem();
        this.achievementSystem.renderAchievements('achievementsGrid');
    }

    updateStats() {
        // Update streak display
        const streakStats = this.streakCounter.getStreakStats();
        document.getElementById('currentStreak').textContent = streakStats.current;
        
        // Update total content
        const contentProgress = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const contentSessions = contentProgress.sessions || [];
        const totalContentPages = contentSessions.reduce((sum, session) => sum + (session.pagesRead || 0), 0);
        document.getElementById('totalContent').textContent = totalContentPages;
        
        // Update total flashcards
        const flashcardProgress = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const flashcardSessions = flashcardProgress.sessions || [];
        const totalFlashcards = flashcardSessions.reduce((sum, session) => sum + (session.cardsReviewed || 0), 0);
        document.getElementById('totalFlashcards').textContent = totalFlashcards;
        
        // Update total quizzes
        const quizProgress = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        const quizSessions = quizProgress.sessions || [];
        document.getElementById('totalQuizzes').textContent = quizSessions.length;
    }

    updateGoals() {
        // Load goal values into inputs
        document.getElementById('contentGoal').value = this.goals.content;
        document.getElementById('flashcardGoal').value = this.goals.flashcards;
        document.getElementById('quizGoal').value = this.goals.quiz;
        
        // Calculate today's progress
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = this.getTodayProgress(today);
        
        // Update progress bars
        this.updateProgressBar('contentProgress', 'contentProgressText', todayProgress.content, this.goals.content);
        this.updateProgressBar('flashcardProgress', 'flashcardProgressText', todayProgress.flashcards, this.goals.flashcards);
        this.updateProgressBar('quizProgress', 'quizProgressText', todayProgress.quiz, this.goals.quiz);
    }

    getTodayProgress(date) {
        // Try to get from DataBridge first
        if (window.DataBridge) {
            const progressSummary = window.DataBridge.getProgressSummary();
            if (progressSummary.today) {
                return {
                    content: progressSummary.today.content || 0,
                    flashcards: progressSummary.today.flashcards || 0,
                    quiz: progressSummary.today.quiz || 0
                };
            }
        }

        // Fallback to individual module progress
        const contentProgress = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const flashcardProgress = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const quizProgress = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        
        const contentSessions = contentProgress.sessions || [];
        const flashcardSessions = flashcardProgress.sessions || [];
        const quizSessions = quizProgress.sessions || [];
        
        return {
            content: contentSessions
                .filter(session => session.date && session.date.startsWith(date))
                .reduce((sum, session) => sum + (session.pagesRead || 0), 0),
            flashcards: flashcardSessions
                .filter(session => session.date && session.date.startsWith(date))
                .reduce((sum, session) => sum + (session.cardsReviewed || 0), 0),
            quiz: quizSessions
                .filter(session => session.date && session.date.startsWith(date))
                .length
        };
    }

    updateProgressBar(progressId, textId, current, goal) {
        const progressElement = document.getElementById(progressId);
        const textElement = document.getElementById(textId);
        
        if (progressElement && textElement) {
            const percentage = Math.min((current / goal) * 100, 100);
            progressElement.style.width = percentage + '%';
            textElement.textContent = `${current}/${goal}`;
            
            // Change color based on completion
            if (percentage === 100) {
                progressElement.style.background = 'linear-gradient(90deg, #4caf50, #66bb6a)';
            } else if (percentage >= 75) {
                progressElement.style.background = 'linear-gradient(90deg, #ff9800, #ffb74d)';
            } else {
                progressElement.style.background = 'linear-gradient(90deg, #2196f3, #64b5f6)';
            }
        }
    }

    updateTimeline() {
        const timelineContainer = document.getElementById('activityTimeline');
        if (!timelineContainer) return;
        
        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            timelineContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 2rem;">
                    <p>📝 Ingen aktivitet endnu</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Start med at læse indhold eller øve flashcards!</p>
                </div>
            `;
            return;
        }
        
        timelineContainer.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="timeline-item">
                <div class="timeline-time">${this.formatTimeAgo(activity.date)}</div>
                <div class="timeline-content">${activity.icon} ${activity.description}</div>
            </div>
        `).join('');
    }

    getRecentActivities() {
        const activities = [];
        
        // Content activities
        const contentProgress = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const contentSessions = contentProgress.sessions || [];
        contentSessions.forEach(session => {
            if (session.date) {
                activities.push({
                    date: session.date,
                    icon: '📚',
                    description: `Læste ${session.pagesRead || 1} side(r) af "${session.title || 'indhold'}"`
                });
            }
        });
        
        // Flashcard activities
        const flashcardProgress = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const flashcardSessions = flashcardProgress.sessions || [];
        flashcardSessions.forEach(session => {
            if (session.date) {
                activities.push({
                    date: session.date,
                    icon: '🎯',
                    description: `Øvede ${session.cardsReviewed || 1} flashcard(s)`
                });
            }
        });
        
        // Quiz activities
        const quizProgress = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        const quizSessions = quizProgress.sessions || [];
        quizSessions.forEach(session => {
            if (session.date) {
                const scoreText = session.score !== undefined ? ` (${session.score}%)` : '';
                activities.push({
                    date: session.date,
                    icon: '🧠',
                    description: `Tog quiz "${session.title || 'Unnamed Quiz'}"${scoreText}`
                });
            }
        });
        
        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return activities;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Lige nu';
        if (diffInHours < 24) return `${diffInHours} time(r) siden`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'I går';
        if (diffInDays < 7) return `${diffInDays} dage siden`;
        
        return date.toLocaleDateString('da-DK');
    }

    updateDataStats() {
        // Calculate total data size
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('examklar-')) {
                totalSize += localStorage.getItem(key).length;
            }
        }
        
        // Convert to KB
        const sizeInKB = (totalSize / 1024).toFixed(1);
        document.getElementById('dataSize').textContent = `${sizeInKB} KB`;
        
        // Check for last backup
        const lastBackup = localStorage.getItem('examklar-last-backup');
        if (lastBackup) {
            const backupDate = new Date(lastBackup);
            document.getElementById('lastBackup').textContent = backupDate.toLocaleDateString('da-DK');
        }
    }

    bindEvents() {
        // Goal input changes
        document.getElementById('contentGoal').addEventListener('change', (e) => {
            this.goals.content = parseInt(e.target.value);
            this.saveGoals();
            this.updateGoals();
        });
        
        document.getElementById('flashcardGoal').addEventListener('change', (e) => {
            this.goals.flashcards = parseInt(e.target.value);
            this.saveGoals();
            this.updateGoals();
        });
        
        document.getElementById('quizGoal').addEventListener('change', (e) => {
            this.goals.quiz = parseInt(e.target.value);
            this.saveGoals();
            this.updateGoals();
        });
        
        // Export/Import buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleImportFile(e));
        
        // Data management buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetData());
        document.getElementById('backupBtn').addEventListener('click', () => this.backupData());
    }

    exportData() {
        const data = this.getAllExamKlarData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `examklar-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('📤 Data eksporteret!', 'success');
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.restoreData(data);
                this.showMessage('📥 Data importeret!', 'success');
                this.refresh();
            } catch (error) {
                this.showMessage('❌ Fejl ved import af data', 'error');
            }
        };
        reader.readAsText(file);
    }

    getAllExamKlarData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('examklar-')) {
                data[key] = JSON.parse(localStorage.getItem(key));
            }
        }
        return data;
    }

    restoreData(data) {
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]));
        });
    }

    resetData() {
        if (!confirm('⚠️ Er du sikker på at du vil slette ALLE data? Dette kan ikke fortrydes!')) {
            return;
        }
        
        // Remove all ExamKlar data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('examklar-')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        this.showMessage('🗑️ Alle data slettet!', 'success');
        this.refresh();
    }

    backupData() {
        localStorage.setItem('examklar-last-backup', new Date().toISOString());
        this.exportData();
        this.updateDataStats();
    }

    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type} show`;
        
        setTimeout(() => {
            messageEl.className = 'message hidden';
        }, 3000);
    }

    refresh() {
        // Reinitialize all components with new data
        this.goals = this.loadGoals();
        this.initializeComponents();
        this.updateStats();
        this.updateGoals();
        this.updateTimeline();
        this.updateDataStats();
    }

    // Method to update dashboard when returning from other modules
    update() {
        this.streakCounter.updateStreakFromActivity();
        this.achievementSystem.update();
        this.progressChart.update();
        this.moduleChart.update();
        this.updateStats();
        this.updateGoals();
        this.updateTimeline();
        this.achievementSystem.renderAchievements('achievementsGrid');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Update dashboard every 30 seconds to catch any new activities
    setInterval(() => {
        if (window.dashboard) {
            window.dashboard.update();
        }
    }, 30000);
});

// Export for global access
window.Dashboard = Dashboard;
