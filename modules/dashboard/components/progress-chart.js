// Progress Chart Component
class ProgressChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = this.loadData();
        this.init();
    }

    loadData() {
        // Get data from localStorage across all modules
        const contentData = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}');
        const flashcardData = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}');
        const quizData = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}');
        
        return {
            content: contentData,
            flashcards: flashcardData,
            quiz: quizData
        };
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;

        // Generate weekly data for the chart
        const weekData = this.generateWeeklyData();
        
        this.container.innerHTML = this.createBarChart(weekData);
    }

    generateWeeklyData() {
        const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Calculate activities for this date
            const activities = this.getActivitiesForDate(dateStr);
            
            weekData.push({
                day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
                date: dateStr,
                activities: activities,
                total: activities.content + activities.flashcards + activities.quiz
            });
        }

        return weekData;
    }

    getActivitiesForDate(dateStr) {
        // This is a simplified version - in a real app you'd track daily activities
        const activities = {
            content: 0,
            flashcards: 0,
            quiz: 0
        };

        // Check if user was active on this date (simplified logic)
        const contentProgress = this.data.content.sessions || [];
        const flashcardProgress = this.data.flashcards.sessions || [];
        const quizProgress = this.data.quiz.sessions || [];

        // Count activities for the date
        contentProgress.forEach(session => {
            if (session.date && session.date.startsWith(dateStr)) {
                activities.content += session.pagesRead || 1;
            }
        });

        flashcardProgress.forEach(session => {
            if (session.date && session.date.startsWith(dateStr)) {
                activities.flashcards += session.cardsReviewed || 1;
            }
        });

        quizProgress.forEach(session => {
            if (session.date && session.date.startsWith(dateStr)) {
                activities.quiz += 1;
            }
        });

        return activities;
    }

    createBarChart(data) {
        const maxValue = Math.max(...data.map(d => d.total), 1);
        
        return `
            <div class="chart-bars" style="display: flex; align-items: end; height: 250px; gap: 10px; padding: 20px;">
                ${data.map(day => `
                    <div class="chart-day" style="flex: 1; text-align: center;">
                        <div class="bar-container" style="height: 200px; display: flex; align-items: end; justify-content: center;">
                            <div class="bar" style="
                                width: 100%;
                                max-width: 40px;
                                height: ${(day.total / maxValue) * 180}px;
                                background: linear-gradient(to top, #2196f3, #64b5f6);
                                border-radius: 6px 6px 0 0;
                                position: relative;
                                transition: all 0.3s ease;
                                cursor: pointer;
                            " 
                            onmouseover="this.style.transform='scale(1.1)'" 
                            onmouseout="this.style.transform='scale(1)'"
                            title="Content: ${day.activities.content}, Flashcards: ${day.activities.flashcards}, Quiz: ${day.activities.quiz}">
                                <span style="
                                    position: absolute;
                                    top: -25px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 12px;
                                    font-weight: bold;
                                    color: #333;
                                ">${day.total}</span>
                            </div>
                        </div>
                        <div class="bar-label" style="margin-top: 10px; font-size: 14px; font-weight: 500;">
                            ${day.day}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Method to update chart when new data is available
    update() {
        this.data = this.loadData();
        this.render();
    }
}

// Module Chart for distribution across different learning modules
class ModuleChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = this.loadModuleData();
        this.init();
    }

    loadModuleData() {
        const contentSessions = JSON.parse(localStorage.getItem('examklar-content-progress') || '{}').sessions || [];
        const flashcardSessions = JSON.parse(localStorage.getItem('examklar-flashcard-progress') || '{}').sessions || [];
        const quizSessions = JSON.parse(localStorage.getItem('examklar-quiz-progress') || '{}').sessions || [];

        return {
            content: contentSessions.length,
            flashcards: flashcardSessions.length,
            quiz: quizSessions.length
        };
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;

        const total = this.data.content + this.data.flashcards + this.data.quiz;
        
        if (total === 0) {
            this.container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 250px; color: #666;">
                    <p>📊 Ingen aktivitet endnu - start med at læse indhold eller øve flashcards!</p>
                </div>
            `;
            return;
        }

        const contentPercent = (this.data.content / total) * 100;
        const flashcardPercent = (this.data.flashcards / total) * 100;
        const quizPercent = (this.data.quiz / total) * 100;

        this.container.innerHTML = `
            <div class="module-chart" style="display: flex; flex-direction: column; gap: 20px; padding: 20px;">
                <div class="module-item" style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">📚</span>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: 500;">Indhold</span>
                            <span style="font-size: 14px; color: #666;">${this.data.content} sessioner (${contentPercent.toFixed(1)}%)</span>
                        </div>
                        <div style="height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${contentPercent}%; background: linear-gradient(90deg, #4caf50, #66bb6a); transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="module-item" style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🎯</span>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: 500;">Flashcards</span>
                            <span style="font-size: 14px; color: #666;">${this.data.flashcards} sessioner (${flashcardPercent.toFixed(1)}%)</span>
                        </div>
                        <div style="height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${flashcardPercent}%; background: linear-gradient(90deg, #2196f3, #42a5f5); transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="module-item" style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🧠</span>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-weight: 500;">Quizzer</span>
                            <span style="font-size: 14px; color: #666;">${this.data.quiz} sessioner (${quizPercent.toFixed(1)}%)</span>
                        </div>
                        <div style="height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${quizPercent}%; background: linear-gradient(90deg, #ff9800, #ffb74d); transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    update() {
        this.data = this.loadModuleData();
        this.render();
    }
}

// Export for use in main dashboard
window.ProgressChart = ProgressChart;
window.ModuleChart = ModuleChart;
