// Flashcard Management System
class FlashcardManager {
    constructor() {
        this.storageKey = 'examklar-flashcards';
        this.data = this.loadData();
        this.spacedRepetition = new SpacedRepetitionEngine();
        this.init();
    }

    init() {
        this.renderStats();
        this.renderCards();
        this.setupEventListeners();
        this.loadCategories();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            flashcards: [],
            categories: [
                {
                    id: "custom",
                    name: "Custom Cards",
                    description: "User-created flashcards",
                    color: "#3498db"
                }
            ],
            settings: {
                defaultCategory: "custom",
                spacedRepetitionEnabled: true,
                showHints: true,
                autoAdvance: false
            },
            metadata: {
                version: "1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                totalCards: 0
            }
        };
    }

    saveData() {
        this.data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
        this.data.metadata.totalCards = this.data.flashcards.length;
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    setupEventListeners() {
        // Auto-save form state
        ['cardFront', 'cardBack', 'cardHint', 'cardTags'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.saveFormState());
        });

        // Modal escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCreateCard();
            }
        });
    }

    // Card Creation
    showCreateCard() {
        document.getElementById('createCardModal').style.display = 'flex';
        document.getElementById('cardFront').focus();
        this.loadFormState();
    }

    hideCreateCard() {
        document.getElementById('createCardModal').style.display = 'none';
        this.clearForm();
    }

    createCard() {
        const front = document.getElementById('cardFront').value.trim();
        const back = document.getElementById('cardBack').value.trim();
        const category = document.getElementById('cardCategory').value;
        const difficulty = parseInt(document.getElementById('cardDifficulty').value);
        const hint = document.getElementById('cardHint').value.trim();
        const tags = document.getElementById('cardTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!front || !back) {
            this.showNotification('Please fill in both front and back of the card!', 'error');
            return;
        }

        const newCard = {
            id: Date.now().toString(),
            front,
            back,
            category,
            difficulty,
            hint,
            tags,
            created: new Date().toISOString(),
            // Spaced repetition data
            repetitions: 0,
            easiness: 2.5,
            interval: 1,
            nextReview: new Date(),
            lastReviewed: null,
            // Statistics
            totalReviews: 0,
            correctReviews: 0,
            streak: 0,
            mastered: false
        };

        this.data.flashcards.push(newCard);
        this.saveData();
        this.renderStats();
        this.renderCards();
        this.hideCreateCard();
        
        this.showNotification('Flashcard created successfully!', 'success');
    }

    // Card Display
    renderCards() {
        const container = document.getElementById('cardsList');
        const filteredCards = this.getFilteredCards();

        if (filteredCards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🗂️</div>
                    <h3>No flashcards found</h3>
                    <p>${this.data.flashcards.length === 0 ? 'Create your first flashcard to get started!' : 'Try adjusting your filters.'}</p>
                    <button onclick="flashcardManager.showCreateCard()" class="btn-primary">Create First Card</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredCards.map(card => `
            <div class="card-item" data-id="${card.id}">
                <div class="card-preview">
                    <div class="card-front-preview">
                        <div class="card-label">Front:</div>
                        <div class="card-text">${this.markdownToHtml(card.front)}</div>
                    </div>
                    <div class="card-back-preview">
                        <div class="card-label">Back:</div>
                        <div class="card-text">${this.markdownToHtml(card.back)}</div>
                    </div>
                </div>
                
                <div class="card-meta">
                    <div class="card-info">
                        <span class="difficulty">${'⭐'.repeat(card.difficulty)}</span>
                        <span class="category">${this.getCategoryName(card.category)}</span>
                        ${card.mastered ? '<span class="mastered">🏆 Mastered</span>' : ''}
                    </div>
                    
                    <div class="card-stats">
                        <small>Reviews: ${card.totalReviews}</small>
                        <small>Success: ${card.totalReviews > 0 ? Math.round((card.correctReviews / card.totalReviews) * 100) : 0}%</small>
                        ${card.nextReview ? `<small>Next: ${this.formatDate(card.nextReview)}</small>` : ''}
                    </div>
                </div>

                ${card.tags.length > 0 ? `
                    <div class="card-tags">
                        ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="card-actions">
                    <button onclick="flashcardManager.editCard('${card.id}')" class="btn-small">✏️ Edit</button>
                    <button onclick="flashcardManager.previewCard('${card.id}')" class="btn-small">👁️ Preview</button>
                    <button onclick="flashcardManager.deleteCard('${card.id}')" class="btn-small btn-danger">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    getFilteredCards() {
        let filtered = [...this.data.flashcards];

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter').value;
        if (categoryFilter) {
            filtered = filtered.filter(card => card.category === categoryFilter);
        }

        // Difficulty filter
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        if (difficultyFilter) {
            filtered = filtered.filter(card => card.difficulty == difficultyFilter);
        }

        // Search filter
        const searchTerm = document.getElementById('searchCards').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(card => 
                card.front.toLowerCase().includes(searchTerm) ||
                card.back.toLowerCase().includes(searchTerm) ||
                card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    // Statistics
    renderStats() {
        const totalCards = this.data.flashcards.length;
        const dueCards = this.getDueCards().length;
        const masteredCards = this.data.flashcards.filter(card => card.mastered).length;
        const totalReviews = this.data.flashcards.reduce((sum, card) => sum + card.totalReviews, 0);
        const correctReviews = this.data.flashcards.reduce((sum, card) => sum + card.correctReviews, 0);
        const successRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

        document.getElementById('totalCards').textContent = totalCards;
        document.getElementById('dueCards').textContent = dueCards;
        document.getElementById('masteredCards').textContent = masteredCards;
        document.getElementById('successRate').textContent = `${successRate}%`;

        // Update review button
        const reviewBtn = document.getElementById('reviewBtn');
        if (dueCards > 0) {
            reviewBtn.textContent = `🎯 Review ${dueCards} Cards`;
            reviewBtn.disabled = false;
        } else {
            reviewBtn.textContent = '✅ All Caught Up!';
            reviewBtn.disabled = true;
        }
    }

    getDueCards() {
        const now = new Date();
        return this.data.flashcards.filter(card => 
            !card.mastered && new Date(card.nextReview) <= now
        );
    }

    // Card Management
    editCard(cardId) {
        const card = this.data.flashcards.find(c => c.id === cardId);
        if (!card) return;

        // Populate form
        document.getElementById('cardFront').value = card.front;
        document.getElementById('cardBack').value = card.back;
        document.getElementById('cardCategory').value = card.category;
        document.getElementById('cardDifficulty').value = card.difficulty;
        document.getElementById('cardHint').value = card.hint || '';
        document.getElementById('cardTags').value = card.tags.join(', ');

        // Change modal title and button
        document.querySelector('#createCardModal .modal-header h2').textContent = '✏️ Edit Flashcard';
        document.querySelector('#createCardModal .modal-footer .btn-primary').textContent = 'Update Card';
        document.querySelector('#createCardModal .modal-footer .btn-primary').onclick = () => this.updateCard(cardId);

        this.showCreateCard();
    }

    updateCard(cardId) {
        const card = this.data.flashcards.find(c => c.id === cardId);
        if (!card) return;

        const front = document.getElementById('cardFront').value.trim();
        const back = document.getElementById('cardBack').value.trim();

        if (!front || !back) {
            this.showNotification('Please fill in both front and back of the card!', 'error');
            return;
        }

        // Update card
        card.front = front;
        card.back = back;
        card.category = document.getElementById('cardCategory').value;
        card.difficulty = parseInt(document.getElementById('cardDifficulty').value);
        card.hint = document.getElementById('cardHint').value.trim();
        card.tags = document.getElementById('cardTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        card.updated = new Date().toISOString();

        this.saveData();
        this.renderCards();
        this.hideCreateCard();
        this.resetModalToCreate();
        
        this.showNotification('Flashcard updated successfully!', 'success');
    }

    deleteCard(cardId) {
        if (!confirm('Are you sure you want to delete this flashcard?')) return;

        const cardIndex = this.data.flashcards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        this.data.flashcards.splice(cardIndex, 1);
        this.saveData();
        this.renderStats();
        this.renderCards();
        
        this.showNotification('Flashcard deleted successfully!', 'info');
    }

    previewCard(cardId) {
        const card = this.data.flashcards.find(c => c.id === cardId);
        if (!card) return;

        // Open preview in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview: Flashcard</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                           max-width: 600px; margin: 0 auto; padding: 20px; }
                    .preview-card { perspective: 1000px; width: 400px; height: 250px; margin: 20px auto; }
                    .card-inner { width: 100%; height: 100%; transition: transform 0.6s; 
                                transform-style: preserve-3d; cursor: pointer; }
                    .card-inner.flipped { transform: rotateY(180deg); }
                    .card-face { position: absolute; width: 100%; height: 100%; 
                               backface-visibility: hidden; border-radius: 10px; 
                               display: flex; align-items: center; justify-content: center;
                               padding: 20px; box-sizing: border-box; text-align: center; }
                    .card-front { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                    .card-back { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                               color: white; transform: rotateY(180deg); }
                    button { margin: 10px 5px; padding: 10px 20px; border: none; 
                           border-radius: 5px; cursor: pointer; font-weight: bold; }
                    .btn-primary { background: #007bff; color: white; }
                </style>
            </head>
            <body>
                <h1>Flashcard Preview</h1>
                <div class="preview-card">
                    <div class="card-inner" onclick="this.classList.toggle('flipped')">
                        <div class="card-face card-front">
                            <div>${this.markdownToHtml(card.front)}</div>
                        </div>
                        <div class="card-face card-back">
                            <div>${this.markdownToHtml(card.back)}</div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <button class="btn-primary" onclick="document.querySelector('.card-inner').classList.toggle('flipped')">
                        🔄 Flip Card
                    </button>
                    <p><strong>Difficulty:</strong> ${'⭐'.repeat(card.difficulty)}</p>
                    ${card.hint ? `<p><strong>Hint:</strong> ${card.hint}</p>` : ''}
                    ${card.tags.length > 0 ? `<p><strong>Tags:</strong> ${card.tags.join(', ')}</p>` : ''}
                </div>
            </body>
            </html>
        `);
    }

    // Review System
    startReview() {
        const dueCards = this.getDueCards();
        if (dueCards.length === 0) {
            this.showNotification('No cards due for review!', 'info');
            return;
        }

        // Navigate to review page
        localStorage.setItem('examklar-review-session', JSON.stringify({
            cards: dueCards.map(card => card.id),
            started: new Date().toISOString()
        }));
        
        window.location.href = 'player.html';
    }

    // Utility Functions
    markdownToHtml(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        if (diff > 0) return `In ${diff} days`;
        return `${Math.abs(diff)} days ago`;
    }

    getCategoryName(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    loadCategories() {
        const select = document.getElementById('categoryFilter');
        const createSelect = document.getElementById('cardCategory');
        
        this.data.categories.forEach(category => {
            const option1 = new Option(category.name, category.id);
            const option2 = new Option(category.name, category.id);
            select.appendChild(option1);
            createSelect.appendChild(option2);
        });
    }

    // Form State Management
    saveFormState() {
        const formState = {
            front: document.getElementById('cardFront').value,
            back: document.getElementById('cardBack').value,
            hint: document.getElementById('cardHint').value,
            tags: document.getElementById('cardTags').value
        };
        localStorage.setItem('examklar-card-form-state', JSON.stringify(formState));
    }

    loadFormState() {
        const formState = localStorage.getItem('examklar-card-form-state');
        if (formState) {
            const state = JSON.parse(formState);
            document.getElementById('cardFront').value = state.front || '';
            document.getElementById('cardBack').value = state.back || '';
            document.getElementById('cardHint').value = state.hint || '';
            document.getElementById('cardTags').value = state.tags || '';
        }
    }

    clearForm() {
        document.getElementById('cardFront').value = '';
        document.getElementById('cardBack').value = '';
        document.getElementById('cardHint').value = '';
        document.getElementById('cardTags').value = '';
        document.getElementById('cardCategory').value = 'custom';
        document.getElementById('cardDifficulty').value = '2';
        localStorage.removeItem('examklar-card-form-state');
    }

    resetModalToCreate() {
        document.querySelector('#createCardModal .modal-header h2').textContent = '➕ Create New Flashcard';
        document.querySelector('#createCardModal .modal-footer .btn-primary').textContent = 'Create Card';
        document.querySelector('#createCardModal .modal-footer .btn-primary').onclick = () => this.createCard();
    }

    // Import/Export
    exportCards() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `examklar-flashcards-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Flashcards exported successfully!', 'success');
    }

    importCards(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.flashcards && Array.isArray(importedData.flashcards)) {
                    // Merge or replace data
                    const shouldMerge = confirm('Merge with existing cards? (Cancel to replace all cards)');
                    
                    if (shouldMerge) {
                        // Add imported cards with new IDs
                        importedData.flashcards.forEach(card => {
                            card.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                            this.data.flashcards.push(card);
                        });
                    } else {
                        this.data = importedData;
                    }
                    
                    this.saveData();
                    this.renderStats();
                    this.renderCards();
                    this.loadCategories();
                    this.showNotification('Flashcards imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing file. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        input.value = '';
    }

    clearAllCards() {
        if (!confirm('Are you sure you want to delete ALL flashcards? This cannot be undone!')) return;

        this.data.flashcards = [];
        this.saveData();
        this.renderStats();
        this.renderCards();
        this.showNotification('All flashcards deleted!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Spaced Repetition Engine (same as in tests but production ready)
class SpacedRepetitionEngine {
    processAnswer(card, quality) {
        // quality: 0=again, 1=hard, 2=good, 3=easy
        const prevEasiness = card.easiness;
        
        // Update easiness factor (SuperMemo 2 algorithm)
        card.easiness = Math.max(1.3, 
            card.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        // Reset repetitions if quality < 2
        if (quality < 2) {
            card.repetitions = 0;
            card.interval = 1;
        } else {
            card.repetitions++;
            
            if (card.repetitions === 1) {
                card.interval = 1;
            } else if (card.repetitions === 2) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easiness);
            }
        }

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + card.interval);
        card.nextReview = nextReview;

        // Update statistics
        card.totalReviews++;
        if (quality >= 2) {
            card.correctReviews++;
            card.streak++;
        } else {
            card.streak = 0;
        }

        // Update difficulty based on performance
        if (quality === 0) card.difficulty = Math.min(5, card.difficulty + 1);
        else if (quality === 3) card.difficulty = Math.max(1, card.difficulty - 1);

        // Mark as mastered if consistently easy
        if (card.streak >= 5 && card.easiness > 2.8) {
            card.mastered = true;
        }

        card.lastReviewed = new Date().toISOString();

        return card;
    }
}

// Global functions for HTML onclick handlers
let flashcardManager;

function showCreateCard() {
    flashcardManager.showCreateCard();
}

function hideCreateCard() {
    flashcardManager.hideCreateCard();
}

function createCard() {
    flashcardManager.createCard();
}

function startReview() {
    flashcardManager.startReview();
}

function filterCards() {
    flashcardManager.renderCards();
}

function exportCards() {
    flashcardManager.exportCards();
}

function importCards(input) {
    flashcardManager.importCards(input);
}

function clearAllCards() {
    flashcardManager.clearAllCards();
}

function showImportExport() {
    // Could open a modal with import/export options
    alert('Use the Import/Export buttons at the bottom of the page!');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    flashcardManager = new FlashcardManager();
});
