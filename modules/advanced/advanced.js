/**
 * ExamKlar Advanced Features
 * Handles export/import, search, themes, and advanced settings
 */

class AdvancedFeatures {
    constructor() {
        this.activeFilters = new Set(['all']);
        this.searchTimeout = null;
        this.init();
    }

    init() {
        // Initialize theme
        this.initializeTheme();
        
        // Initialize search filters
        this.initializeSearchFilters();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Advanced Features initialized');
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('examklar-theme');
        const savedMode = localStorage.getItem('examklar-theme-mode') || 'system';
        
        if (savedTheme && savedMode === 'manual') {
            this.setTheme(savedTheme);
        } else {
            this.setSystemTheme();
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const mode = localStorage.getItem('examklar-theme-mode');
            if (mode === 'system' || !mode) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('examklar-theme', theme);
        
        // Update theme toggle button icon
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme }
        }));
        
        this.showStatus('themeStatus', `Theme changed to ${theme}`, 'success');
    }

    setSystemTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
        localStorage.setItem('examklar-theme-mode', 'system');
    }

    toggleTheme() {
        const current = this.getCurrentTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        localStorage.setItem('examklar-theme-mode', 'manual');
    }

    setCustomAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        localStorage.setItem('examklar-accent-color', color);
        this.showStatus('themeStatus', `Accent color updated to ${color}`, 'success');
    }

    resetThemeSettings() {
        localStorage.removeItem('examklar-theme');
        localStorage.removeItem('examklar-theme-mode');
        localStorage.removeItem('examklar-accent-color');
        document.documentElement.style.removeProperty('--accent-color');
        document.getElementById('accentColor').value = '#007bff';
        this.setSystemTheme();
        this.showStatus('themeStatus', 'Theme settings reset to defaults', 'success');
    }

    // Export/Import Functionality
    async exportAllData() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                app: "ExamKlar",
                modules: {
                    content: this.getContentData(),
                    flashcards: this.getFlashcardData(),
                    quiz: this.getQuizData(),
                    dashboard: this.getDashboardData()
                },
                settings: this.getSettingsData()
            };
            
            const exportString = JSON.stringify(data, null, 2);
            document.getElementById('exportData').value = exportString;
            this.showStatus('exportStatus', 'All data exported successfully', 'success');
            return exportString;
        } catch (error) {
            this.showStatus('exportStatus', `Export failed: ${error.message}`, 'error');
            return null;
        }
    }

    async exportContent() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                app: "ExamKlar",
                modules: {
                    content: this.getContentData()
                }
            };
            
            const exportString = JSON.stringify(data, null, 2);
            document.getElementById('exportData').value = exportString;
            this.showStatus('exportStatus', 'Content data exported', 'success');
        } catch (error) {
            this.showStatus('exportStatus', `Content export failed: ${error.message}`, 'error');
        }
    }

    async exportFlashcards() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                app: "ExamKlar",
                modules: {
                    flashcards: this.getFlashcardData()
                }
            };
            
            const exportString = JSON.stringify(data, null, 2);
            document.getElementById('exportData').value = exportString;
            this.showStatus('exportStatus', 'Flashcard data exported', 'success');
        } catch (error) {
            this.showStatus('exportStatus', `Flashcard export failed: ${error.message}`, 'error');
        }
    }

    async exportQuizzes() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                app: "ExamKlar",
                modules: {
                    quiz: this.getQuizData()
                }
            };
            
            const exportString = JSON.stringify(data, null, 2);
            document.getElementById('exportData').value = exportString;
            this.showStatus('exportStatus', 'Quiz data exported', 'success');
        } catch (error) {
            this.showStatus('exportStatus', `Quiz export failed: ${error.message}`, 'error');
        }
    }

    downloadExport() {
        const exportData = document.getElementById('exportData').value;
        if (!exportData.trim()) {
            this.showStatus('exportStatus', 'No data to download', 'warning');
            return;
        }
        
        try {
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `examklar-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('exportStatus', 'Export downloaded successfully', 'success');
        } catch (error) {
            this.showStatus('exportStatus', `Download failed: ${error.message}`, 'error');
        }
    }

    async copyToClipboard(textareaId) {
        const textarea = document.getElementById(textareaId);
        try {
            await navigator.clipboard.writeText(textarea.value);
            this.showStatus('exportStatus', 'Copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            textarea.select();
            document.execCommand('copy');
            this.showStatus('exportStatus', 'Copied to clipboard!', 'success');
        }
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('importData').value = e.target.result;
            this.showStatus('importStatus', 'File loaded. Click Import Data to proceed.', 'success');
        };
        reader.onerror = () => {
            this.showStatus('importStatus', 'Failed to read file', 'error');
        };
        reader.readAsText(file);
    }

    validateImportData() {
        const importData = document.getElementById('importData').value.trim();
        if (!importData) {
            this.showStatus('importStatus', 'No data to validate', 'warning');
            return false;
        }
        
        try {
            const data = JSON.parse(importData);
            
            // Check required fields
            if (!data.modules || typeof data.modules !== 'object') {
                throw new Error('Invalid data structure: missing modules');
            }
            
            if (!data.version) {
                throw new Error('Invalid data structure: missing version');
            }
            
            // Count items
            let itemCount = 0;
            Object.keys(data.modules).forEach(module => {
                if (data.modules[module]) {
                    if (data.modules[module].items) itemCount += data.modules[module].items.length;
                    if (data.modules[module].cards) itemCount += data.modules[module].cards.length;
                    if (data.modules[module].questions) itemCount += data.modules[module].questions.length;
                }
            });
            
            this.showStatus('importStatus', 
                `✅ Valid import data found: ${Object.keys(data.modules).length} modules, ~${itemCount} items`, 
                'success');
            return true;
            
        } catch (error) {
            this.showStatus('importStatus', `❌ Invalid data: ${error.message}`, 'error');
            return false;
        }
    }

    async importData() {
        if (!this.validateImportData()) return;
        
        const importData = document.getElementById('importData').value.trim();
        
        try {
            const data = JSON.parse(importData);
            
            // Import data to respective modules
            if (data.modules.content) {
                this.importContentData(data.modules.content);
            }
            
            if (data.modules.flashcards) {
                this.importFlashcardData(data.modules.flashcards);
            }
            
            if (data.modules.quiz) {
                this.importQuizData(data.modules.quiz);
            }
            
            if (data.modules.dashboard) {
                this.importDashboardData(data.modules.dashboard);
            }
            
            if (data.settings) {
                this.importSettingsData(data.settings);
            }
            
            this.showStatus('importStatus', 'Data imported successfully!', 'success');
            
            // Clear import data after successful import
            setTimeout(() => {
                this.clearImportData();
            }, 2000);
            
        } catch (error) {
            this.showStatus('importStatus', `Import failed: ${error.message}`, 'error');
        }
    }

    clearImportData() {
        document.getElementById('importData').value = '';
        document.getElementById('importFile').value = '';
        this.showStatus('importStatus', 'Import data cleared', 'success');
    }

    // Search Functionality
    initializeSearchFilters() {
        const filters = ['all', 'content', 'flashcards', 'quiz', 'notes'];
        filters.forEach(filter => {
            const element = document.getElementById(`filter-${filter}`);
            if (element) {
                if (filter === 'all') {
                    element.classList.add('active');
                } else {
                    element.classList.add('inactive');
                }
            }
        });
    }

    toggleFilter(filterType) {
        const filterElement = document.getElementById(`filter-${filterType}`);
        
        if (filterType === 'all') {
            // Toggle all filters
            this.activeFilters.clear();
            this.activeFilters.add('all');
            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.classList.remove('active');
                chip.classList.add('inactive');
            });
            filterElement.classList.remove('inactive');
            filterElement.classList.add('active');
        } else {
            // Remove 'all' if specific filter is selected
            this.activeFilters.delete('all');
            document.getElementById('filter-all').classList.remove('active');
            document.getElementById('filter-all').classList.add('inactive');
            
            // Toggle specific filter
            if (this.activeFilters.has(filterType)) {
                this.activeFilters.delete(filterType);
                filterElement.classList.remove('active');
                filterElement.classList.add('inactive');
            } else {
                this.activeFilters.add(filterType);
                filterElement.classList.remove('inactive');
                filterElement.classList.add('active');
            }
            
            // If no specific filters, activate 'all'
            if (this.activeFilters.size === 0) {
                this.activeFilters.add('all');
                document.getElementById('filter-all').classList.remove('inactive');
                document.getElementById('filter-all').classList.add('active');
            }
        }
        
        // Re-run search with new filters
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput && searchInput.value.trim()) {
            this.performGlobalSearch(searchInput.value);
        }
    }

    performGlobalSearch(query) {
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.executeSearch(query);
        }, 300);
    }

    executeSearch(query) {
        const resultsContainer = document.getElementById('globalSearchResults');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div class="search-result-item">
                    <div class="result-title">Start typing to search...</div>
                    <div class="result-snippet">Search across all your ExamKlar content</div>
                </div>
            `;
            return;
        }
        
        const allData = this.getAllSearchableData();
        const results = this.searchData(query, allData);
        
        // Apply filters
        const filteredResults = this.applySearchFilters(results);
        
        this.displaySearchResults(filteredResults, query);
        
        // Store search in history
        this.storeSearchHistory(query, filteredResults.length);
    }

    searchData(query, data) {
        const lowercaseQuery = query.toLowerCase();
        const queryWords = lowercaseQuery.split(' ').filter(word => word.length > 0);
        
        return data.map(item => {
            const searchableText = [
                item.title || '',
                item.content || '',
                item.front || '',
                item.back || '',
                item.question || '',
                item.answer || ''
            ].join(' ').toLowerCase();
            
            // Calculate relevance score
            let score = 0;
            queryWords.forEach(word => {
                if (searchableText.includes(word)) {
                    score += 1;
                    // Bonus for exact title matches
                    if ((item.title || '').toLowerCase().includes(word)) {
                        score += 0.5;
                    }
                }
            });
            
            const relevance = score / queryWords.length;
            
            if (relevance > 0) {
                return { ...item, relevance, searchableText };
            }
            return null;
        }).filter(item => item !== null)
          .sort((a, b) => b.relevance - a.relevance);
    }

    applySearchFilters(results) {
        if (this.activeFilters.has('all')) {
            return results;
        }
        
        return results.filter(item => {
            return this.activeFilters.has(item.type);
        });
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('globalSearchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item">
                    <div class="result-title">No results found</div>
                    <div class="result-snippet">Try different keywords or adjust your filters</div>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = results.slice(0, 20).map(item => {
            const title = item.title || item.front || item.question || 'Untitled';
            const snippet = item.content || item.back || item.answer || '';
            const highlightedTitle = this.highlightText(title, query);
            const highlightedSnippet = this.highlightText(snippet.substring(0, 150) + '...', query);
            
            return `
                <div class="search-result-item" onclick="openSearchResult('${item.type}', '${item.id}')">
                    <div class="result-title">${highlightedTitle}</div>
                    <div class="result-snippet">${highlightedSnippet}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                        ${item.type} • ${item.date || 'No date'} • Relevance: ${Math.round(item.relevance * 100)}%
                    </div>
                </div>
            `;
        }).join('');
    }

    highlightText(text, query) {
        const words = query.toLowerCase().split(' ').filter(word => word.length > 0);
        let highlighted = text;
        
        words.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark style="background: yellow; font-weight: bold;">$1</mark>');
        });
        
        return highlighted;
    }

    storeSearchHistory(query, resultCount) {
        let history = JSON.parse(localStorage.getItem('examklar-search-history') || '[]');
        
        // Remove existing entry for this query
        history = history.filter(item => item.query !== query);
        
        // Add new entry at the beginning
        history.unshift({
            query,
            resultCount,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 searches
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('examklar-search-history', JSON.stringify(history));
    }

    // Language Management
    setLanguage(lang) {
        localStorage.setItem('examklar-language', lang);
        this.showStatus('languageStatus', `Language set to ${lang === 'da' ? 'Danish' : 'English'}`, 'success');
        
        // In a real implementation, this would trigger a page reload or dynamic content update
        setTimeout(() => {
            this.showStatus('languageStatus', 'Please reload the page for language changes to take effect', 'warning');
        }, 1000);
    }

    // Data Retrieval Methods
    getContentData() {
        return JSON.parse(localStorage.getItem('examklar-content') || '{"items": [], "progress": {}}');
    }

    getFlashcardData() {
        return JSON.parse(localStorage.getItem('examklar-flashcards') || '{"cards": [], "stats": {}}');
    }

    getQuizData() {
        return JSON.parse(localStorage.getItem('examklar-quiz') || '{"questions": [], "results": {}}');
    }

    getDashboardData() {
        return JSON.parse(localStorage.getItem('examklar-dashboard') || '{"streaks": {}, "goals": {}, "achievements": []}');
    }

    getSettingsData() {
        return {
            theme: localStorage.getItem('examklar-theme') || 'light',
            themeMode: localStorage.getItem('examklar-theme-mode') || 'system',
            language: localStorage.getItem('examklar-language') || 'da',
            accentColor: localStorage.getItem('examklar-accent-color') || '#007bff'
        };
    }

    getAllSearchableData() {
        const data = [];
        
        // Content
        const content = this.getContentData();
        if (content.items) {
            content.items.forEach(item => {
                data.push({
                    ...item,
                    type: 'content',
                    date: item.created || item.date
                });
            });
        }
        
        // Flashcards
        const flashcards = this.getFlashcardData();
        if (flashcards.cards) {
            flashcards.cards.forEach(card => {
                data.push({
                    ...card,
                    type: 'flashcards',
                    date: card.created || card.date
                });
            });
        }
        
        // Quiz
        const quiz = this.getQuizData();
        if (quiz.questions) {
            quiz.questions.forEach(question => {
                data.push({
                    ...question,
                    type: 'quiz',
                    date: question.created || question.date
                });
            });
        }
        
        return data;
    }

    // Data Import Methods
    importContentData(data) {
        const existing = this.getContentData();
        const merged = {
            items: [...(existing.items || []), ...(data.items || [])],
            progress: { ...(existing.progress || {}), ...(data.progress || {}) }
        };
        localStorage.setItem('examklar-content', JSON.stringify(merged));
    }

    importFlashcardData(data) {
        const existing = this.getFlashcardData();
        const merged = {
            cards: [...(existing.cards || []), ...(data.cards || [])],
            stats: { ...(existing.stats || {}), ...(data.stats || {}) }
        };
        localStorage.setItem('examklar-flashcards', JSON.stringify(merged));
    }

    importQuizData(data) {
        const existing = this.getQuizData();
        const merged = {
            questions: [...(existing.questions || []), ...(data.questions || [])],
            results: { ...(existing.results || {}), ...(data.results || {}) }
        };
        localStorage.setItem('examklar-quiz', JSON.stringify(merged));
    }

    importDashboardData(data) {
        const existing = this.getDashboardData();
        const merged = {
            streaks: { ...(existing.streaks || {}), ...(data.streaks || {}) },
            goals: { ...(existing.goals || {}), ...(data.goals || {}) },
            achievements: [...new Set([...(existing.achievements || []), ...(data.achievements || [])])]
        };
        localStorage.setItem('examklar-dashboard', JSON.stringify(merged));
    }

    importSettingsData(data) {
        if (data.theme) this.setTheme(data.theme);
        if (data.language) this.setLanguage(data.language);
        if (data.accentColor) this.setCustomAccentColor(data.accentColor);
    }

    // Event Listeners
    setupEventListeners() {
        // Modal close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
            
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearchModal();
            }
            
            // Ctrl/Cmd + T for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Utility Methods
    showStatus(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.innerHTML = `
            <div class="status-message status-${type}">
                ${message}
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.innerHTML = '';
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function openExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

function openSearchModal() {
    document.getElementById('searchModal').style.display = 'block';
    setTimeout(() => {
        document.getElementById('globalSearchInput').focus();
    }, 100);
}

function openThemeModal() {
    document.getElementById('themeModal').style.display = 'block';
}

function openLanguageModal() {
    document.getElementById('languageModal').style.display = 'block';
}

function openAdvancedSettings() {
    alert('Advanced settings panel would open here. This could include performance settings, data management, notifications, etc.');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleTheme() {
    window.advancedFeatures.toggleTheme();
}

function setTheme(theme) {
    if (theme === 'auto') {
        window.advancedFeatures.setSystemTheme();
    } else {
        window.advancedFeatures.setTheme(theme);
        localStorage.setItem('examklar-theme-mode', 'manual');
    }
}

function setCustomAccentColor(color) {
    window.advancedFeatures.setCustomAccentColor(color);
}

function resetThemeSettings() {
    window.advancedFeatures.resetThemeSettings();
}

function exportAllData() {
    window.advancedFeatures.exportAllData();
}

function exportContent() {
    window.advancedFeatures.exportContent();
}

function exportFlashcards() {
    window.advancedFeatures.exportFlashcards();
}

function exportQuizzes() {
    window.advancedFeatures.exportQuizzes();
}

function downloadExport() {
    window.advancedFeatures.downloadExport();
}

function copyToClipboard(textareaId) {
    window.advancedFeatures.copyToClipboard(textareaId);
}

function handleFileImport(event) {
    window.advancedFeatures.handleFileImport(event);
}

function validateImportData() {
    window.advancedFeatures.validateImportData();
}

function importData() {
    window.advancedFeatures.importData();
}

function clearImportData() {
    window.advancedFeatures.clearImportData();
}

function toggleFilter(filterType) {
    window.advancedFeatures.toggleFilter(filterType);
}

function performGlobalSearch(query) {
    window.advancedFeatures.performGlobalSearch(query);
}

function setLanguage(lang) {
    window.advancedFeatures.setLanguage(lang);
}

function openSearchResult(type, id) {
    // Navigate to the appropriate module and item
    const baseUrl = '../../modules/';
    let url = '';
    
    switch (type) {
        case 'content':
            url = `${baseUrl}content/reader.html?id=${id}`;
            break;
        case 'flashcards':
            url = `${baseUrl}flashcards/player.html?id=${id}`;
            break;
        case 'quiz':
            url = `${baseUrl}quiz/index.html?question=${id}`;
            break;
        default:
            url = `${baseUrl}${type}/index.html`;
    }
    
    window.open(url, '_blank');
}

// Modal Functions
function openAnalyticsModal() {
    // Create and show analytics modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content luxury-card">
            <div class="modal-header">
                <h2>📊 Learning Analytics</h2>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>Advanced learning analytics and insights will be available here.</p>
                <div class="analytics-placeholder">
                    <div class="stat-card">
                        <h3>Study Time</h3>
                        <p>Coming soon...</p>
                    </div>
                    <div class="stat-card">
                        <h3>Progress Tracking</h3>
                        <p>Coming soon...</p>
                    </div>
                    <div class="stat-card">
                        <h3>Performance Metrics</h3>
                        <p>Coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.querySelector('.modal-close'));
    });
}

function openCustomizationModal() {
    // Create and show customization modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content luxury-card">
            <div class="modal-header">
                <h2>🎨 Customization</h2>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>Customize your ExamKlar experience with advanced settings.</p>
                <div class="customization-options">
                    <div class="option-group">
                        <h3>Theme Settings</h3>
                        <p>Advanced theme customization options coming soon...</p>
                    </div>
                    <div class="option-group">
                        <h3>Layout Preferences</h3>
                        <p>Personalize your dashboard layout...</p>
                    </div>
                    <div class="option-group">
                        <h3>Notification Settings</h3>
                        <p>Configure your learning reminders...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.querySelector('.modal-close'));
    });
}

function openIntegrationsModal() {
    // Create and show integrations modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content luxury-card">
            <div class="modal-header">
                <h2>🔗 Integrations</h2>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>Connect ExamKlar with your favorite learning tools and platforms.</p>
                <div class="integrations-list">
                    <div class="integration-item">
                        <h3>📚 Study Platforms</h3>
                        <p>Connect with popular study platforms...</p>
                    </div>
                    <div class="integration-item">
                        <h3>📅 Calendar Apps</h3>
                        <p>Sync your study schedule...</p>
                    </div>
                    <div class="integration-item">
                        <h3>📊 Analytics Tools</h3>
                        <p>Export data to external analytics...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.querySelector('.modal-close'));
    });
}

function closeModal(closeButton) {
    const modal = closeButton.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.advancedFeatures = new AdvancedFeatures();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedFeatures;
}
