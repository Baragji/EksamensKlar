// Content Management System
class ContentManager {
    constructor() {
        this.storageKey = 'examklar-content';
        this.curriculum = this.loadCurriculum();
        this.init();
    }

    init() {
        this.renderContentList();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-save on form changes
        const dayTitleEl = document.getElementById('dayTitle');
        const dayContentEl = document.getElementById('dayContent');
        
        if (dayTitleEl) dayTitleEl.addEventListener('input', () => this.saveFormState());
        if (dayContentEl) dayContentEl.addEventListener('input', () => this.saveFormState());

        // Listen for progress updates
        window.addEventListener('examklar:progress-updated', (e) => {
            this.handleProgressUpdate(e.detail);
        });
    }

    loadCurriculum() {
        // First try to load from DataBridge unified training data
        if (window.DataBridge) {
            const trainingData = window.DataBridge.getTrainingData();
            if (trainingData && trainingData.content) {
                return {
                    program: {
                        title: `${trainingData.subject.name} Læringsplan`,
                        description: `Personaliseret læringsplan for ${trainingData.subject.name}`,
                        totalDays: trainingData.content.items.length,
                        estimatedHours: Math.ceil(trainingData.content.items.reduce((sum, item) => sum + (item.estimatedTime || 15), 0) / 60)
                    },
                    days: trainingData.content.items.map((item, index) => ({
                        day: index + 1,
                        title: item.title,
                        content: item.content || '',
                        duration: item.estimatedTime || 15,
                        difficulty: item.difficulty || 2,
                        status: item.status || 'available',
                        created: item.created
                    })),
                    metadata: {
                        version: "1.0",
                        lastUpdated: trainingData.meta.lastUpdated,
                        contentType: "ai-generated"
                    }
                };
            }
        }

        // Fallback to legacy storage
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.curriculum) {
                return parsed.curriculum;
            }
            return parsed;
        }

        // Default empty curriculum
        return {
            program: {
                title: "Custom Learning Program",
                description: "User-generated content program",
                totalDays: 0,
                estimatedHours: 0
            },
            days: [],
            metadata: {
                version: "1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                contentType: "user-generated"
            }
        };
    }

    saveCurriculum() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.curriculum));
        // Also save to JSON file structure for compatibility
        this.updateJsonFiles();
    }

    async updateJsonFiles() {
        // Update curriculum.json
        const curriculumData = {
            program: this.curriculum.program,
            days: this.curriculum.days.map(day => ({
                day: day.day,
                title: day.title,
                duration: day.duration,
                difficulty: day.difficulty,
                status: day.status || 'available'
            })),
            metadata: this.curriculum.metadata
        };
        
        // In a real file system, we'd write to files
        // For now, we store in localStorage with different keys
        localStorage.setItem('examklar-curriculum', JSON.stringify(curriculumData));
    }

    addContent() {
        const titleEl = document.getElementById('dayTitle');
        const contentEl = document.getElementById('dayContent');
        const timeEl = document.getElementById('estimatedTime');
        const difficultyEl = document.getElementById('difficulty');

        if (!titleEl || !contentEl) {
            alert('📝 Udfyld venligst titel og indhold!');
            return;
        }

        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        const estimatedTime = timeEl ? parseInt(timeEl.value) || 15 : 15;
        const difficulty = difficultyEl ? parseInt(difficultyEl.value) || 2 : 2;

        if (!title || !content) {
            alert('📝 Udfyld venligst titel og indhold!');
            return;
        }

        const newDay = {
            day: this.curriculum.days.length + 1,
            title: title,
            duration: estimatedTime,
            difficulty: difficulty,
            content: content,
            sections: this.parseContentSections(content),
            created: new Date().toISOString(),
            status: 'available'
        };

        this.curriculum.days.push(newDay);
        this.curriculum.program.totalDays++;
        this.curriculum.program.estimatedHours += Math.ceil(estimatedTime / 60);
        this.curriculum.metadata.lastUpdated = new Date().toISOString().split('T')[0];

        this.saveCurriculum();
        this.renderContentList();
        this.clearForm();

        // Show success message
        this.showNotification('✅ Indhold tilføjet succesfuldt!', 'success');
    }

    /**
     * Mark content as completed and update progress
     */
    completeContent(dayIndex, actualReadingTime = null) {
        const day = this.curriculum.days[dayIndex];
        if (!day) return;
        
        // Update status to completed
        day.status = 'completed';
        day.completedAt = new Date().toISOString();
        
        // Save curriculum
        this.saveCurriculum();
        
        // Update progress through DataBridge
        if (window.DataBridge) {
            const timeSpent = actualReadingTime || day.duration || 15;
            window.DataBridge.updateProgress('content', 'lesson-completed', {
                timeSpent: timeSpent,
                lessonId: `day_${day.day}`,
                lessonTitle: day.title,
                difficulty: day.difficulty
            });
        }

        // Show completion feedback
        this.showNotification(`🎉 Godt klaret! Du har gennemført "${day.title}"`, 'success');
        
        // Re-render to show updated status
        this.renderContentList();

        // Unlock next lesson if available
        const nextDay = this.curriculum.days[dayIndex + 1];
        if (nextDay && nextDay.status === 'locked') {
            nextDay.status = 'available';
            this.saveCurriculum();
            this.showNotification(`🔓 Ny lektion låst op: "${nextDay.title}"`, 'info');
        }
    }

    /**
     * Handle progress updates from other modules
     */
    handleProgressUpdate(data) {
        // Could update UI to reflect cross-module progress
        console.log('Content module received progress update:', data);
    }

    parseContentSections(content) {
        // Parse markdown-style content into sections
        const lines = content.split('\n');
        const sections = [];
        let currentSection = null;

        lines.forEach((line, index) => {
            if (line.startsWith('# ') || line.startsWith('## ')) {
                // Save previous section
                if (currentSection) {
                    sections.push(currentSection);
                }
                
                // Start new section
                currentSection = {
                    id: `section-${sections.length + 1}`,
                    title: line.replace(/^#+\s/, ''),
                    content: '',
                    type: 'text'
                };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            } else if (line.trim()) {
                // Content before first heading
                if (!currentSection) {
                    currentSection = {
                        id: 'intro',
                        title: 'Introduction',
                        content: line + '\n',
                        type: 'text'
                    };
                }
            }
        });

        // Add final section
        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    }

    renderContentList() {
        const container = document.getElementById('contentList');
        
        if (this.curriculum.days.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📭 Intet indhold endnu. Upload dit første lesson!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.curriculum.days.map((day, index) => {
            const statusIcon = this.getStatusIcon(day.status);
            const statusClass = day.status === 'completed' ? 'completed' : day.status === 'locked' ? 'locked' : 'available';
            
            return `
            <div class="content-item ${statusClass}">
                <div class="content-header">
                    <h3>${statusIcon} Day ${day.day}: ${day.title}</h3>
                    <div class="content-meta">
                        <span class="duration">⏱️ ${day.duration} min</span>
                        <span class="difficulty">${'⭐'.repeat(day.difficulty)}</span>
                        <span class="status status-${day.status}">${this.getStatusText(day.status)}</span>
                    </div>
                </div>
                <div class="content-preview">
                    ${this.truncateText(day.content, 150)}
                </div>
                <div class="content-actions">
                    ${day.status === 'available' ? `
                        <button onclick="contentManager.startContent(${index})" class="btn-small btn-primary">
                            ▶️ Start Lektion
                        </button>
                    ` : ''}
                    ${day.status === 'completed' ? `
                        <button onclick="contentManager.reviewContent(${index})" class="btn-small">
                            🔄 Gennemgå igen
                        </button>
                    ` : ''}
                    <button onclick="contentManager.editContent(${day.day})" class="btn-small">
                        ✏️ Rediger
                    </button>
                    <button onclick="contentManager.previewContent(${day.day})" class="btn-small">
                        👁️ Preview
                    </button>
                    <button onclick="contentManager.deleteContent(${day.day})" class="btn-small btn-danger">
                        🗑️ Slet
                    </button>
                </div>
            </div>
        `}).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    editContent(dayNumber) {
        const day = this.curriculum.days.find(d => d.day === dayNumber);
        if (!day) return;

        document.getElementById('dayTitle').value = day.title;
        document.getElementById('dayContent').value = day.content;
        document.getElementById('estimatedTime').value = day.duration;
        document.getElementById('difficulty').value = day.difficulty;

        // Change button to update mode
        const button = document.querySelector('.upload-form button');
        button.textContent = '✏️ Opdater Indhold';
        button.onclick = () => this.updateContent(dayNumber);

        // Scroll to form
        document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
    }

    updateContent(dayNumber) {
        const dayIndex = this.curriculum.days.findIndex(d => d.day === dayNumber);
        if (dayIndex === -1) return;

        const title = document.getElementById('dayTitle').value.trim();
        const content = document.getElementById('dayContent').value.trim();
        const estimatedTime = parseInt(document.getElementById('estimatedTime').value);
        const difficulty = parseInt(document.getElementById('difficulty').value);

        this.curriculum.days[dayIndex] = {
            ...this.curriculum.days[dayIndex],
            title,
            content,
            duration: estimatedTime,
            difficulty,
            sections: this.parseContentSections(content),
            updated: new Date().toISOString()
        };

        this.saveCurriculum();
        this.renderContentList();
        this.clearForm();

        // Reset button
        const button = document.querySelector('.upload-form button');
        button.textContent = '➕ Tilføj Indhold';
        button.onclick = () => this.addContent();

        this.showNotification('✅ Indhold opdateret!', 'success');
    }

    deleteContent(dayNumber) {
        if (!confirm('🗑️ Er du sikker på at du vil slette dette indhold?')) return;

        const dayIndex = this.curriculum.days.findIndex(d => d.day === dayNumber);
        if (dayIndex === -1) return;

        this.curriculum.days.splice(dayIndex, 1);
        
        // Renumber remaining days
        this.curriculum.days.forEach((day, index) => {
            day.day = index + 1;
        });

        this.curriculum.program.totalDays = this.curriculum.days.length;
        this.curriculum.program.estimatedHours = this.curriculum.days.reduce((total, day) => 
            total + Math.ceil(day.duration / 60), 0);

        this.saveCurriculum();
        this.renderContentList();
        this.showNotification('🗑️ Indhold slettet!', 'info');
    }

    previewContent(dayNumber) {
        const day = this.curriculum.days.find(d => d.day === dayNumber);
        if (!day) return;

        // Open preview in new window/tab
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview: ${day.title}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                           max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1, h2, h3 { color: #2c3e50; }
                    pre { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    blockquote { border-left: 4px solid #3498db; margin-left: 0; padding-left: 20px; }
                </style>
            </head>
            <body>
                <h1>${day.title}</h1>
                <p><strong>Duration:</strong> ${day.duration} minutes | <strong>Difficulty:</strong> ${'⭐'.repeat(day.difficulty)}</p>
                <hr>
                <div>${this.markdownToHtml(day.content)}</div>
            </body>
            </html>
        `);
    }

    markdownToHtml(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^([^<].*$)/gim, '<p>$1</p>')
            .replace(/\n/gim, '<br>');
    }

    clearForm() {
        document.getElementById('dayTitle').value = '';
        document.getElementById('dayContent').value = '';
        document.getElementById('estimatedTime').value = 15;
        document.getElementById('difficulty').value = 1;
        localStorage.removeItem('examklar-form-state');
    }

    saveFormState() {
        const formState = {
            title: document.getElementById('dayTitle').value,
            content: document.getElementById('dayContent').value,
            time: document.getElementById('estimatedTime').value,
            difficulty: document.getElementById('difficulty').value
        };
        localStorage.setItem('examklar-form-state', JSON.stringify(formState));
    }

    exportData() {
        const dataStr = JSON.stringify(this.curriculum, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `examklar-content-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('📤 Data exporteret!', 'success');
    }

    importData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.days && Array.isArray(importedData.days)) {
                    this.curriculum = importedData;
                    this.saveCurriculum();
                    this.renderContentList();
                    this.showNotification('📥 Data importeret succesfuldt!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('❌ Fejl ved import af fil. Tjek filformatet.');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        input.value = '';
    }

    clearAllData() {
        if (!confirm('🗑️ Er du SIKKER på at du vil slette ALT indhold? Dette kan ikke fortrydes!')) return;

        this.curriculum = {
            program: {
                title: "Custom Learning Program",
                description: "User-generated content program",
                totalDays: 0,
                estimatedHours: 0
            },
            days: [],
            metadata: {
                version: "1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                contentType: "user-generated"
            }
        };

        this.saveCurriculum();
        this.renderContentList();
        this.clearForm();
        this.showNotification('🗑️ Alt data slettet!', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'locked': return '🔒';
            case 'in-progress': return '🔄';
            default: return '📖';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'completed': return 'Gennemført';
            case 'locked': return 'Låst';
            case 'in-progress': return 'I gang';
            default: return 'Tilgængelig';
        }
    }

    /**
     * Start a content lesson
     */
    startContent(dayIndex) {
        const day = this.curriculum.days[dayIndex];
        if (!day || day.status === 'locked') return;

        // Open content reader modal
        this.openContentReader(day, dayIndex);
    }

    /**
     * Review completed content
     */
    reviewContent(dayIndex) {
        const day = this.curriculum.days[dayIndex];
        if (!day) return;

        // Open content reader modal in review mode
        this.openContentReader(day, dayIndex, true);
    }

    /**
     * Open content reader modal
     */
    openContentReader(day, dayIndex, isReview = false) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('contentReaderModal');
        if (!modal) {
            modal = this.createContentReaderModal();
            document.body.appendChild(modal);
        }

        // Populate modal content
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-content-body');
        const modalActions = modal.querySelector('.modal-actions');

        modalTitle.textContent = `📖 ${day.title}`;
        modalContent.innerHTML = `
            <div class="content-meta-info">
                <span class="duration">⏱️ ${day.duration} min</span>
                <span class="difficulty">Sværhedsgrad: ${'⭐'.repeat(day.difficulty)}</span>
                <span class="day-number">Dag ${day.day}</span>
            </div>
            <div class="content-text">
                ${this.formatContent(day.content)}
            </div>
        `;

        // Set up action buttons
        if (isReview) {
            modalActions.innerHTML = `
                <button onclick="contentManager.closeContentReader()" class="btn btn-secondary">
                    Luk
                </button>
            `;
        } else {
            modalActions.innerHTML = `
                <button onclick="contentManager.closeContentReader()" class="btn btn-secondary">
                    Luk
                </button>
                <button onclick="contentManager.finishContent(${dayIndex})" class="btn btn-primary">
                    ✅ Marker som Gennemført
                </button>
            `;
        }

        // Show modal
        modal.style.display = 'block';
        modal.classList.add('active');
        
        // Track reading start time
        this.readingStartTime = Date.now();
    }

    /**
     * Create content reader modal
     */
    createContentReaderModal() {
        const modal = document.createElement('div');
        modal.id = 'contentReaderModal';
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="contentManager.closeContentReader()"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title"></h2>
                    <button class="modal-close" onclick="contentManager.closeContentReader()">×</button>
                </div>
                <div class="modal-content-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;
        return modal;
    }

    /**
     * Close content reader modal
     */
    closeContentReader() {
        const modal = document.getElementById('contentReaderModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    /**
     * Finish reading content and mark as completed
     */
    finishContent(dayIndex) {
        const day = this.curriculum.days[dayIndex];
        if (!day) return;

        // Calculate reading time
        const readingTime = this.readingStartTime ? 
            Math.round((Date.now() - this.readingStartTime) / 1000 / 60) : 
            day.duration;

        // Close modal first
        this.closeContentReader();

        // Mark as completed
        this.completeContent(dayIndex, readingTime);
    }

    /**
     * Format content for display
     */
    formatContent(content) {
        // Convert markdown-style formatting to HTML
        return content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/, '<p>$1</p>')
            .replace(/^<p><h([1-6])>/g, '<h$1>')
            .replace(/<\/h([1-6])><\/p>$/g, '</h$1>');
    }
}

// Global functions for HTML onclick handlers
let contentManager;

function addContent() {
    contentManager.addContent();
}

function exportData() {
    contentManager.exportData();
}

function importData(input) {
    contentManager.importData(input);
}

function clearAllData() {
    contentManager.clearAllData();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentManager();
});
