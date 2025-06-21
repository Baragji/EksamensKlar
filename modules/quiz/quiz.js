// Quiz Manager JavaScript
class QuizManager {
    constructor() {
        this.questions = [];
        this.categories = [];
        this.currentEditingId = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.updateStatistics();
        this.renderQuestions();
        this.populateCategoryDropdowns();
        console.log('Quiz Manager initialized');
    }

    // Data Management
    async loadData() {
        try {
            // Load questions
            const questionsResponse = await fetch('./data/questions.json');
            const questionsData = await questionsResponse.json();
            this.questions = questionsData.questions || [];

            // Load categories
            const categoriesResponse = await fetch('./data/categories.json');
            const categoriesData = await categoriesResponse.json();
            this.categories = categoriesData.categories || [];

            console.log(`Loaded ${this.questions.length} questions and ${this.categories.length} categories`);
        } catch (error) {
            console.error('Error loading data:', error);
            this.questions = [];
            this.categories = [];
        }
    }

    async saveData() {
        try {
            // Save questions
            const questionsData = {
                questions: this.questions,
                userQuestions: {
                    note: "All quiz questions are user-generated. No static content is pre-filled.",
                    structure: {
                        id: "unique-question-id",
                        question: "Question text",
                        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                        correct: 1,
                        explanation: "Detailed explanation",
                        difficulty: 2,
                        category: "category-id",
                        tags: ["tag1", "tag2"],
                        hint: "Optional hint",
                        timeLimit: 30,
                        points: 10,
                        created: "timestamp",
                        modified: "timestamp",
                        createdBy: "user-id",
                        statistics: {
                            timesAnswered: 0,
                            timesCorrect: 0,
                            averageTime: 0,
                            difficultyRating: 0
                        }
                    }
                },
                metadata: {
                    totalQuestions: this.questions.length,
                    categories: this.getCategoryStats(),
                    difficulties: this.getDifficultyStats(),
                    lastUpdated: new Date().toISOString(),
                    version: "1.0.0",
                    userGenerated: true
                }
            };

            // In a real app, this would save to a backend
            // For now, we'll use localStorage
            localStorage.setItem('quizQuestions', JSON.stringify(questionsData));

            // Save categories
            const categoriesData = {
                categories: this.categories,
                userCategories: {
                    note: "This will be populated by user-generated content",
                    structure: {
                        id: "category-id",
                        name: "Category Name",
                        description: "Category description",
                        color: "#color-hex",
                        icon: "icon-name",
                        created: "timestamp",
                        modified: "timestamp"
                    }
                },
                totalQuestions: this.questions.length,
                lastUpdated: new Date().toISOString(),
                version: "1.0.0"
            };

            localStorage.setItem('quizCategories', JSON.stringify(categoriesData));

            console.log('Data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Question Management
    createQuestion(questionData) {
        const question = {
            id: this.generateId(),
            question: questionData.question,
            options: questionData.options.filter(opt => opt.trim() !== ''),
            correct: parseInt(questionData.correct),
            explanation: questionData.explanation || '',
            difficulty: parseInt(questionData.difficulty),
            category: questionData.category,
            tags: questionData.tags ? questionData.tags.split(',').map(tag => tag.trim()) : [],
            hint: questionData.hint || '',
            timeLimit: 30,
            points: this.calculatePoints(questionData.difficulty),
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            createdBy: 'user',
            statistics: {
                timesAnswered: 0,
                timesCorrect: 0,
                averageTime: 0,
                difficultyRating: 0
            }
        };

        this.questions.push(question);
        this.saveData();
        this.updateStatistics();
        this.renderQuestions();
        this.showNotification('Spørgsmål oprettet succesfuldt!', 'success');
        
        return question;
    }

    updateQuestion(id, questionData) {
        const index = this.questions.findIndex(q => q.id === id);
        if (index === -1) return false;

        const question = this.questions[index];
        question.question = questionData.question;
        question.options = questionData.options.filter(opt => opt.trim() !== '');
        question.correct = parseInt(questionData.correct);
        question.explanation = questionData.explanation || '';
        question.difficulty = parseInt(questionData.difficulty);
        question.category = questionData.category;
        question.tags = questionData.tags ? questionData.tags.split(',').map(tag => tag.trim()) : [];
        question.hint = questionData.hint || '';
        question.modified = new Date().toISOString();

        this.saveData();
        this.updateStatistics();
        this.renderQuestions();
        this.showNotification('Spørgsmål opdateret succesfuldt!', 'success');
        
        return true;
    }

    deleteQuestion(id) {
        const index = this.questions.findIndex(q => q.id === id);
        if (index === -1) return false;

        if (confirm('Er du sikker på, at du vil slette dette spørgsmål?')) {
            this.questions.splice(index, 1);
            this.saveData();
            this.updateStatistics();
            this.renderQuestions();
            this.showNotification('Spørgsmål slettet', 'info');
            return true;
        }
        return false;
    }

    // Category Management
    createCategory(categoryData) {
        const category = {
            id: this.generateId(),
            name: categoryData.name,
            description: categoryData.description || '',
            color: categoryData.color || '#007bff',
            icon: 'folder',
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        this.categories.push(category);
        this.saveData();
        this.populateCategoryDropdowns();
        this.updateStatistics();
        this.showNotification('Kategori oprettet succesfuldt!', 'success');
        
        return category;
    }

    // Utility Functions
    generateId() {
        return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    calculatePoints(difficulty) {
        return difficulty * 5 + 5; // 10, 15, 20, 25 points
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            1: { name: 'Easy', color: '#28a745' },
            2: { name: 'Medium', color: '#ffc107' },
            3: { name: 'Hard', color: '#fd7e14' },
            4: { name: 'Expert', color: '#dc3545' }
        };
        return labels[difficulty] || labels[2];
    }

    getCategoryStats() {
        const stats = {};
        this.categories.forEach(cat => {
            const questionCount = this.questions.filter(q => q.category === cat.id).length;
            stats[cat.id] = {
                name: cat.name,
                questionCount: questionCount
            };
        });
        return stats;
    }

    getDifficultyStats() {
        const stats = {
            1: { name: 'Easy', count: 0 },
            2: { name: 'Medium', count: 0 },
            3: { name: 'Hard', count: 0 },
            4: { name: 'Expert', count: 0 }
        };

        this.questions.forEach(q => {
            if (stats[q.difficulty]) {
                stats[q.difficulty].count++;
            }
        });

        return stats;
    }

    // UI Functions
    updateStatistics() {
        const totalQuestions = this.questions.length;
        const totalCategories = this.categories.length;
        const averageDifficulty = totalQuestions > 0 ? 
            (this.questions.reduce((sum, q) => sum + q.difficulty, 0) / totalQuestions).toFixed(1) : 0;
        
        document.getElementById('totalQuestions').textContent = totalQuestions;
        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('averageDifficulty').textContent = averageDifficulty;
        document.getElementById('totalQuizzes').textContent = Math.ceil(totalQuestions / 10); // 10 questions per quiz
    }

    renderQuestions() {
        const container = document.getElementById('questionsList');
        
        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>Ingen spørgsmål endnu</h3>
                    <p>Opret dit første quiz spørgsmål for at komme i gang!</p>
                </div>
            `;
            return;
        }

        const questionsHTML = this.questions.map(question => {
            const category = this.categories.find(cat => cat.id === question.category);
            const difficulty = this.getDifficultyLabel(question.difficulty);
            
            return `
                <div class="quiz-item" data-id="${question.id}">
                    <div class="quiz-header">
                        <div class="quiz-title">${question.question}</div>
                        <div class="quiz-difficulty difficulty-${difficulty.name.toLowerCase()}">${difficulty.name}</div>
                    </div>
                    <div class="quiz-stats">
                        <span>📁 ${category ? category.name : 'Ingen kategori'}</span>
                        <span>💡 ${question.options.length} svar</span>
                        <span>⏱️ ${question.statistics.timesAnswered} besvarelser</span>
                        <span>📊 ${question.statistics.timesAnswered > 0 ? 
                            Math.round((question.statistics.timesCorrect / question.statistics.timesAnswered) * 100) : 0}% korrekt</span>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn btn-small" onclick="editQuestion('${question.id}')">
                            ✏️ Rediger
                        </button>
                        <button class="btn btn-small info" onclick="previewQuestion('${question.id}')">
                            👁️ Preview
                        </button>
                        <button class="btn btn-small danger" onclick="quizManager.deleteQuestion('${question.id}')">
                            🗑️ Slet
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = questionsHTML;
    }

    populateCategoryDropdowns() {
        const dropdowns = ['questionCategory', 'categoryFilter'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;

            const currentValue = dropdown.value;
            const isFilter = dropdownId === 'categoryFilter';
            
            dropdown.innerHTML = isFilter ? '<option value="">Alle kategorier</option>' : '<option value="">Vælg kategori</option>';
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });

            dropdown.value = currentValue;
        });
    }

    filterQuestions() {
        const searchTerm = document.getElementById('searchBar').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;

        const filteredQuestions = this.questions.filter(question => {
            const matchesSearch = question.question.toLowerCase().includes(searchTerm) ||
                                question.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || question.category === categoryFilter;
            const matchesDifficulty = !difficultyFilter || question.difficulty.toString() === difficultyFilter;

            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        this.renderFilteredQuestions(filteredQuestions);
    }

    renderFilteredQuestions(questions) {
        const container = document.getElementById('questionsList');
        
        if (questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Ingen resultater</h3>
                    <p>Prøv at justere dine søgekriterier</p>
                </div>
            `;
            return;
        }

        // Use the same rendering logic as renderQuestions but with filtered data
        const originalQuestions = this.questions;
        this.questions = questions;
        this.renderQuestions();
        this.questions = originalQuestions;
    }

    sortQuestions() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.questions.sort((a, b) => {
            switch (sortBy) {
                case 'difficulty':
                    return b.difficulty - a.difficulty;
                case 'category':
                    const catA = this.categories.find(cat => cat.id === a.category)?.name || '';
                    const catB = this.categories.find(cat => cat.id === b.category)?.name || '';
                    return catA.localeCompare(catB);
                case 'title':
                    return a.question.localeCompare(b.question);
                case 'created':
                default:
                    return new Date(b.created) - new Date(a.created);
            }
        });

        this.renderQuestions();
    }

    // Import/Export Functions
    exportData() {
        const data = {
            questions: this.questions,
            categories: this.categories,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `quiz-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('Data eksporteret succesfuldt!', 'success');
    }

    async importData() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Vælg venligst en fil', 'error');
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (data.questions && Array.isArray(data.questions)) {
                // Merge with existing questions
                data.questions.forEach(question => {
                    question.id = this.generateId(); // Generate new IDs to avoid conflicts
                    this.questions.push(question);
                });
            }

            if (data.categories && Array.isArray(data.categories)) {
                // Merge with existing categories
                data.categories.forEach(category => {
                    const existingCategory = this.categories.find(cat => cat.name === category.name);
                    if (!existingCategory) {
                        category.id = this.generateId();
                        this.categories.push(category);
                    }
                });
            }

            await this.saveData();
            this.updateStatistics();
            this.renderQuestions();
            this.populateCategoryDropdowns();
            
            this.showNotification(`Importeret ${data.questions?.length || 0} spørgsmål og ${data.categories?.length || 0} kategorier`, 'success');
            closeModal('importModal');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Fejl under import. Kontroller filformatet.', 'error');
        }
    }

    previewImport() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const preview = document.getElementById('importPreview');
                const content = document.getElementById('previewContent');
                
                content.innerHTML = `
                    <strong>Spørgsmål:</strong> ${data.questions?.length || 0}<br>
                    <strong>Kategorier:</strong> ${data.categories?.length || 0}<br>
                    <strong>Version:</strong> ${data.version || 'Ukendt'}
                `;
                
                preview.style.display = 'block';
            } catch (error) {
                this.showNotification('Ugyldig JSON fil', 'error');
            }
        };
        reader.readAsText(file);
    }

    // UI Helper Functions
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Global Functions
let quizManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    quizManager = new QuizManager();
    
    // Try to load from localStorage if available
    const savedQuestions = localStorage.getItem('quizQuestions');
    const savedCategories = localStorage.getItem('quizCategories');
    
    if (savedQuestions) {
        try {
            const questionsData = JSON.parse(savedQuestions);
            quizManager.questions = questionsData.questions || [];
        } catch (error) {
            console.error('Error loading saved questions:', error);
        }
    }
    
    if (savedCategories) {
        try {
            const categoriesData = JSON.parse(savedCategories);
            quizManager.categories = categoriesData.categories || [];
        } catch (error) {
            console.error('Error loading saved categories:', error);
        }
    }
    
    // Update UI
    quizManager.updateStatistics();
    quizManager.renderQuestions();
    quizManager.populateCategoryDropdowns();
});

// Modal Functions
function openCreateQuestionModal() {
    document.getElementById('createQuestionModal').style.display = 'block';
    document.getElementById('questionForm').reset();
    quizManager.currentEditingId = null;
}

function openCreateCategoryModal() {
    document.getElementById('createCategoryModal').style.display = 'block';
    document.getElementById('categoryForm').reset();
}

function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
    document.getElementById('importFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Form Handlers
function saveQuestion(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const questionData = {
        question: document.getElementById('questionText').value,
        options: [
            document.getElementById('option0').value,
            document.getElementById('option1').value,
            document.getElementById('option2').value,
            document.getElementById('option3').value
        ],
        correct: formData.get('correctAnswer'),
        explanation: document.getElementById('explanation').value,
        difficulty: document.getElementById('questionDifficulty').value,
        category: document.getElementById('questionCategory').value,
        hint: document.getElementById('questionHint').value,
        tags: document.getElementById('questionTags').value
    };

    if (!questionData.correct) {
        quizManager.showNotification('Vælg venligst det rigtige svar', 'error');
        return;
    }

    if (quizManager.currentEditingId) {
        quizManager.updateQuestion(quizManager.currentEditingId, questionData);
    } else {
        quizManager.createQuestion(questionData);
    }
    
    closeModal('createQuestionModal');
}

function saveCategory(event) {
    event.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        color: document.getElementById('categoryColor').value
    };

    quizManager.createCategory(categoryData);
    closeModal('createCategoryModal');
}

// Question Actions
function editQuestion(id) {
    const question = quizManager.questions.find(q => q.id === id);
    if (!question) return;

    quizManager.currentEditingId = id;
    
    // Populate form
    document.getElementById('questionText').value = question.question;
    document.getElementById('option0').value = question.options[0] || '';
    document.getElementById('option1').value = question.options[1] || '';
    document.getElementById('option2').value = question.options[2] || '';
    document.getElementById('option3').value = question.options[3] || '';
    document.querySelector(`input[name="correctAnswer"][value="${question.correct}"]`).checked = true;
    document.getElementById('explanation').value = question.explanation;
    document.getElementById('questionDifficulty').value = question.difficulty;
    document.getElementById('questionCategory').value = question.category;
    document.getElementById('questionHint').value = question.hint;
    document.getElementById('questionTags').value = question.tags.join(', ');

    openCreateQuestionModal();
}

function previewQuestion(id) {
    const question = quizManager.questions.find(q => q.id === id);
    if (!question) return;

    const difficulty = quizManager.getDifficultyLabel(question.difficulty);
    const category = quizManager.categories.find(cat => cat.id === question.category);
    
    alert(`Spørgsmål: ${question.question}\n\nSvarmuligheder:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nRigtigt svar: ${question.options[question.correct]}\n\nForklaring: ${question.explanation}\n\nKategori: ${category ? category.name : 'Ingen'}\nSværhedsgrad: ${difficulty.name}`);
}

// Filter and Search Functions
function filterQuestions() {
    quizManager.filterQuestions();
}

function sortQuestions() {
    quizManager.sortQuestions();
}

function exportData() {
    quizManager.exportData();
}

function importData() {
    quizManager.importData();
}

function previewImport() {
    quizManager.previewImport();
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            openModal.style.display = 'none';
        }
    }
});
