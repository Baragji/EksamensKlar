// Subject Management System
class SubjectManager {
    constructor() {
        this.subjects = JSON.parse(localStorage.getItem('examklar_subjects') || '[]');
        this.currentSubject = localStorage.getItem('examklar_current_subject') || null;
        this.init();
    }

    init() {
        this.renderSubjects();
        this.setupEventListeners();
        this.loadStats();
    }

    setupEventListeners() {
        const form = document.getElementById('createSubjectForm');
        if (form) {
            form.addEventListener('submit', (e) => this.createSubject(e));
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.subject-menu')) {
                this.closeAllMenus();
            }
        });
    }

    createSubject(e) {
        e.preventDefault();
        
        const name = document.getElementById('subjectName').value.trim();
        const description = document.getElementById('subjectDescription').value.trim();
        const color = document.getElementById('subjectColor').value;
        
        if (!name) {
            alert('Emne navn er påkrævet!');
            return;
        }
        
        // Check if subject already exists
        if (this.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
            alert('Et emne med dette navn eksisterer allerede!');
            return;
        }
        
        const subject = {
            id: this.generateId(),
            name: name,
            description: description || 'Intet beskrivelse endnu...',
            color: color,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            contentCount: 0,
            flashcardCount: 0,
            quizCount: 0,
            stats: {
                totalStudyTime: 0,
                completedSessions: 0,
                streak: 0,
                lastStudyDate: null
            }
        };
        
        this.subjects.push(subject);
        this.saveSubjects();
        this.renderSubjects();
        
        // Clear form
        document.getElementById('createSubjectForm').reset();
        
        // Show success message
        this.showNotification(`Emne "${name}" er oprettet! 🎉`);
    }

    renderSubjects() {
        const container = document.getElementById('subjectsList');
        if (!container) return;
        
        if (this.subjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>🚀 Kom i gang!</h3>
                    <p>Opret dit første emne ovenfor for at begynde at lære</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.subjects.forEach(subject => {
            const card = this.createSubjectCard(subject);
            container.appendChild(card);
        });
    }

    createSubjectCard(subject) {
        const template = document.getElementById('subjectCardTemplate');
        const card = template.content.cloneNode(true);
        
        // Set basic info
        card.querySelector('.subject-card').dataset.subjectId = subject.id;
        card.querySelector('.subject-name').textContent = subject.name;
        card.querySelector('.subject-description').textContent = subject.description;
        card.querySelector('.subject-icon').className = `subject-icon ${subject.color}`;
        card.querySelector('.subject-icon').textContent = this.getSubjectEmoji(subject.name);
        
        // Set stats
        card.querySelector('.content-count').textContent = subject.contentCount;
        card.querySelector('.flashcard-count').textContent = subject.flashcardCount;
        card.querySelector('.quiz-count').textContent = subject.quizCount;
        
        // Set up actions
        const enterBtn = card.querySelector('.enter-subject');
        enterBtn.href = `subject.html?id=${subject.id}`;
        
        card.querySelector('.edit-subject').onclick = () => this.editSubject(subject.id);
        card.querySelector('.delete-subject').onclick = () => this.deleteSubject(subject.id);
        
        return card;
    }

    getSubjectEmoji(name) {
        const name_lower = name.toLowerCase();
        
        // Math/Science emojis
        if (name_lower.includes('matematik') || name_lower.includes('math')) return '📐';
        if (name_lower.includes('fysik') || name_lower.includes('physics')) return '⚡';
        if (name_lower.includes('kemi') || name_lower.includes('chemistry')) return '🧪';
        if (name_lower.includes('biologi') || name_lower.includes('biology')) return '🧬';
        if (name_lower.includes('protein')) return '🧬';
        
        // Languages
        if (name_lower.includes('engelsk') || name_lower.includes('english')) return '🇬🇧';
        if (name_lower.includes('dansk') || name_lower.includes('danish')) return '🇩🇰';
        if (name_lower.includes('tysk') || name_lower.includes('german')) return '🇩🇪';
        if (name_lower.includes('fransk') || name_lower.includes('french')) return '🇫🇷';
        if (name_lower.includes('spansk') || name_lower.includes('spanish')) return '🇪🇸';
        
        // Other subjects
        if (name_lower.includes('historie') || name_lower.includes('history')) return '📜';
        if (name_lower.includes('geografi') || name_lower.includes('geography')) return '🌍';
        if (name_lower.includes('filosofi') || name_lower.includes('philosophy')) return '💭';
        if (name_lower.includes('økonomi') || name_lower.includes('economics')) return '💰';
        if (name_lower.includes('psykologi') || name_lower.includes('psychology')) return '🧠';
        if (name_lower.includes('kunst') || name_lower.includes('art')) return '🎨';
        if (name_lower.includes('musik') || name_lower.includes('music')) return '🎵';
        if (name_lower.includes('sport') || name_lower.includes('fitness')) return '⚽';
        
        // Programming/Tech
        if (name_lower.includes('programmering') || name_lower.includes('programming')) return '💻';
        if (name_lower.includes('javascript') || name_lower.includes('js')) return '🟨';
        if (name_lower.includes('python')) return '🐍';
        if (name_lower.includes('html') || name_lower.includes('css')) return '🌐';
        
        // Default
        return '📚';
    }

    editSubject(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        const newName = prompt('Nyt navn:', subject.name);
        if (newName && newName.trim() && newName.trim() !== subject.name) {
            subject.name = newName.trim();
            this.saveSubjects();
            this.renderSubjects();
            this.showNotification('Emne opdateret! ✏️');
        }
        
        const newDescription = prompt('Ny beskrivelse:', subject.description);
        if (newDescription !== null) {
            subject.description = newDescription.trim() || 'Ingen beskrivelse...';
            this.saveSubjects();
            this.renderSubjects();
        }
    }

    deleteSubject(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        if (confirm(`Er du sikker på at du vil slette "${subject.name}"?\n\nDette vil også slette alt indhold, flashcards og quizzer tilknyttet dette emne.`)) {
            // Remove subject
            this.subjects = this.subjects.filter(s => s.id !== subjectId);
            
            // Clear current subject if it's the one being deleted
            if (this.currentSubject === subjectId) {
                this.currentSubject = null;
                localStorage.removeItem('examklar_current_subject');
            }
            
            // Remove all related data
            this.removeSubjectData(subjectId);
            
            this.saveSubjects();
            this.renderSubjects();
            this.showNotification('Emne slettet! 🗑️');
        }
    }

    removeSubjectData(subjectId) {
        // Remove subject-specific data from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(`_${subjectId}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    duplicateSubject(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        const duplicate = {
            ...subject,
            id: this.generateId(),
            name: `${subject.name} (Kopi)`,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            stats: {
                totalStudyTime: 0,
                completedSessions: 0,
                streak: 0,
                lastStudyDate: null
            }
        };
        
        this.subjects.push(duplicate);
        this.saveSubjects();
        this.renderSubjects();
        this.showNotification('Emne kopieret! 📋');
    }

    exportSubject(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;
        
        // Gather all subject data
        const subjectData = {
            subject: subject,
            content: this.getSubjectContent(subjectId),
            flashcards: this.getSubjectFlashcards(subjectId),
            quizzes: this.getSubjectQuizzes(subjectId)
        };
        
        // Create download
        const blob = new Blob([JSON.stringify(subjectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${subject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Emne eksporteret! 📤');
    }

    getSubjectContent(subjectId) {
        // Get content for this subject from localStorage
        const content = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`examklar_content_${subjectId}_`)) {
                content.push({
                    key: key,
                    data: JSON.parse(localStorage.getItem(key))
                });
            }
        }
        return content;
    }

    getSubjectFlashcards(subjectId) {
        const flashcards = localStorage.getItem(`examklar_flashcards_${subjectId}`);
        return flashcards ? JSON.parse(flashcards) : [];
    }

    getSubjectQuizzes(subjectId) {
        const quizzes = localStorage.getItem(`examklar_quizzes_${subjectId}`);
        return quizzes ? JSON.parse(quizzes) : [];
    }

    loadStats() {
        // Update subject stats based on actual data
        this.subjects.forEach(subject => {
            subject.contentCount = this.getSubjectContent(subject.id).length;
            subject.flashcardCount = this.getSubjectFlashcards(subject.id).length;
            subject.quizCount = this.getSubjectQuizzes(subject.id).length;
        });
        this.saveSubjects();
    }

    setCurrentSubject(subjectId) {
        this.currentSubject = subjectId;
        localStorage.setItem('examklar_current_subject', subjectId);
        
        // Update last accessed time
        const subject = this.subjects.find(s => s.id === subjectId);
        if (subject) {
            subject.lastAccessed = new Date().toISOString();
            this.saveSubjects();
        }
    }

    getCurrentSubject() {
        return this.subjects.find(s => s.id === this.currentSubject);
    }

    generateId() {
        return 'subject_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveSubjects() {
        localStorage.setItem('examklar_subjects', JSON.stringify(this.subjects));
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-md);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    toggleSubjectMenu(button) {
        const menu = button.parentElement.parentElement.querySelector('.subject-menu-dropdown');
        const isVisible = menu.style.display !== 'none';
        
        // Close all menus first
        this.closeAllMenus();
        
        // Toggle current menu
        if (!isVisible) {
            menu.style.display = 'block';
        }
    }

    closeAllMenus() {
        document.querySelectorAll('.subject-menu-dropdown').forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// Global functions for template buttons
function toggleSubjectMenu(button) {
    window.subjectManager.toggleSubjectMenu(button);
}

function editSubject(button) {
    const card = button.closest('.subject-card');
    const subjectId = card.dataset.subjectId;
    window.subjectManager.editSubject(subjectId);
}

function duplicateSubject(button) {
    const card = button.closest('.subject-card');
    const subjectId = card.dataset.subjectId;
    window.subjectManager.duplicateSubject(subjectId);
}

function exportSubject(button) {
    const card = button.closest('.subject-card');
    const subjectId = card.dataset.subjectId;
    window.subjectManager.exportSubject(subjectId);
}

function deleteSubject(button) {
    const card = button.closest('.subject-card');
    const subjectId = card.dataset.subjectId;
    window.subjectManager.deleteSubject(subjectId);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subjectManager = new SubjectManager();
});
