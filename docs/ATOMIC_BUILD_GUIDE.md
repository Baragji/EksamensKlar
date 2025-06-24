# ⚡ Atomic Build Implementation Guide

## 🎯 Immediate Action Plan (Uge 1)

Denne guide giver step-by-step instruktioner for de første kritiske atomic builds.

---

## 🚨 KRITISK PRIORITET: Atomic Build 1.0

### Build 1.0.1: Fix Content Module Integration (2 timer)

**Problem:** Content modulet mangler script tags og DataBridge integration

**Løsning:**
```html
<!-- Tilføj til /modules/content/index.html før </body> -->
<script>
    // Dark Mode Toggle System (kopieret fra andre moduler)
    function initializeDarkMode() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        const savedTheme = localStorage.getItem('examklar-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);
        
        themeToggle?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('examklar-theme', newTheme);
            updateThemeIcon(newTheme);
            
            themeToggle.style.transform = 'scale(0.8)';
            setTimeout(() => themeToggle.style.transform = 'scale(1)', 150);
        });
    }
    
    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        initializeDarkMode();
    });
</script>

<script src="../../core/utils.js"></script>
<script src="../../core/data-bridge.js"></script>
<script src="content.js"></script>
```

**Test:**
- [ ] Content module loader korrekt
- [ ] Dark mode toggle fungerer
- [ ] DataBridge tilgængelig i content.js

---

## 🏗️ BUILD 1.1: Design System Foundation

### Build 1.1.1: CSS Design Tokens (4 timer)

**Opret:** `/styles/design-system/tokens/`

**1. Colors.css:**
```css
/* /styles/design-system/tokens/colors.css */
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Theme-specific mappings */
  --color-background: var(--color-gray-50);
  --color-surface: #ffffff;
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-border: var(--color-gray-200);
}

[data-theme="dark"] {
  --color-background: var(--color-gray-900);
  --color-surface: var(--color-gray-800);
  --color-text-primary: var(--color-gray-100);
  --color-text-secondary: var(--color-gray-400);
  --color-border: var(--color-gray-700);
}
```

**2. Typography.css:**
```css
/* /styles/design-system/tokens/typography.css */
:root {
  /* Font Families */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

**3. Spacing.css:**
```css
/* /styles/design-system/tokens/spacing.css */
:root {
  /* Spacing Scale (4px base) */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
  
  /* Semantic Spacing */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
}
```

**4. Shadows.css:**
```css
/* /styles/design-system/tokens/shadows.css */
:root {
  /* Shadow System */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Semantic Shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-modal: var(--shadow-xl);
  --shadow-dropdown: var(--shadow-lg);
}

[data-theme="dark"] {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
}
```

**5. Master Import File:**
```css
/* /styles/design-system/index.css */
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/shadows.css';
@import './tokens/animations.css';

@import './components/buttons.css';
@import './components/cards.css';
@import './components/forms.css';
@import './components/navigation.css';
```

**Test:**
- [ ] Alle CSS custom properties tilgængelige
- [ ] Dark mode tokens fungerer korrekt
- [ ] Konsistent spacing på tværs af komponenter

---

## 🔧 BUILD 1.2: Core System Enhancement

### Build 1.2.1: EventBus System (3 timer)

**Opret:** `/core/EventBus.js`

```javascript
/**
 * Enterprise Event Bus System
 * Centralized event management for cross-module communication
 */
class EventBus {
    constructor() {
        this.events = new Map();
        this.middlewares = [];
        this.debugMode = localStorage.getItem('examklar-debug') === 'true';
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Event handler
     * @param {object} options - Subscription options
     */
    on(event, callback, options = {}) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        const subscription = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            namespace: options.namespace || 'default',
            id: this.generateId()
        };

        this.events.get(event).add(subscription);

        if (this.debugMode) {
            console.log(`📡 EventBus: Subscribed to '${event}'`, subscription);
        }

        // Return unsubscribe function
        return () => this.off(event, subscription.id);
    }

    /**
     * Subscribe to an event once
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }

    /**
     * Unsubscribe from an event
     */
    off(event, subscriptionId) {
        if (!this.events.has(event)) return;

        const subscriptions = this.events.get(event);
        for (const subscription of subscriptions) {
            if (subscription.id === subscriptionId) {
                subscriptions.delete(subscription);
                if (this.debugMode) {
                    console.log(`📡 EventBus: Unsubscribed from '${event}'`, subscriptionId);
                }
                break;
            }
        }

        // Clean up empty event sets
        if (subscriptions.size === 0) {
            this.events.delete(event);
        }
    }

    /**
     * Emit an event
     */
    async emit(event, data = {}, options = {}) {
        if (!this.events.has(event)) {
            if (this.debugMode) {
                console.log(`📡 EventBus: No subscribers for '${event}'`);
            }
            return;
        }

        const eventData = {
            type: event,
            data,
            timestamp: Date.now(),
            source: options.source || 'unknown'
        };

        // Apply middlewares
        for (const middleware of this.middlewares) {
            try {
                await middleware(eventData);
            } catch (error) {
                console.error('EventBus middleware error:', error);
            }
        }

        if (this.debugMode) {
            console.log(`📡 EventBus: Emitting '${event}'`, eventData);
        }

        // Get and sort subscriptions by priority
        const subscriptions = Array.from(this.events.get(event))
            .sort((a, b) => b.priority - a.priority);

        // Execute callbacks
        const promises = subscriptions.map(async (subscription) => {
            try {
                await subscription.callback(eventData);
                
                // Remove one-time subscriptions
                if (subscription.once) {
                    this.off(event, subscription.id);
                }
            } catch (error) {
                console.error(`EventBus callback error for '${event}':`, error);
            }
        });

        if (options.waitForAll) {
            await Promise.all(promises);
        }
    }

    /**
     * Add middleware
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Clear all subscriptions for a namespace
     */
    clearNamespace(namespace) {
        for (const [event, subscriptions] of this.events) {
            for (const subscription of subscriptions) {
                if (subscription.namespace === namespace) {
                    subscriptions.delete(subscription);
                }
            }
            
            if (subscriptions.size === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        const info = {
            totalEvents: this.events.size,
            totalSubscriptions: 0,
            events: {}
        };

        for (const [event, subscriptions] of this.events) {
            info.totalSubscriptions += subscriptions.size;
            info.events[event] = {
                subscriptions: subscriptions.size,
                namespaces: [...new Set(Array.from(subscriptions).map(s => s.namespace))]
            };
        }

        return info;
    }

    generateId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create global instance
const eventBus = new EventBus();

// Add common middlewares
eventBus.use(async (eventData) => {
    // Performance tracking
    if (eventData.type.startsWith('performance:')) {
        // Track performance events
    }
});

eventBus.use(async (eventData) => {
    // Progress tracking
    if (eventData.type.startsWith('progress:')) {
        DataBridge?.recordProgress?.(eventData.type.split(':')[1], eventData.data);
    }
});

// Export for global use
window.EventBus = eventBus;

// Standard events
const EVENTS = {
    // Module lifecycle
    MODULE_LOADED: 'module:loaded',
    MODULE_UNLOADED: 'module:unloaded',
    
    // Data events
    DATA_UPDATED: 'data:updated',
    DATA_SYNCED: 'data:synced',
    
    // Progress events
    PROGRESS_UPDATED: 'progress:updated',
    STREAK_UPDATED: 'streak:updated',
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
    
    // UI events
    THEME_CHANGED: 'ui:theme-changed',
    NAVIGATION_CHANGED: 'ui:navigation-changed',
    
    // Learning events
    CONTENT_COMPLETED: 'learning:content-completed',
    FLASHCARD_REVIEWED: 'learning:flashcard-reviewed',
    QUIZ_COMPLETED: 'learning:quiz-completed'
};

window.EVENTS = EVENTS;
```

**Integration i eksisterende moduler:**
```javascript
// Eksempel: I dashboard.js
EventBus.on(EVENTS.PROGRESS_UPDATED, (eventData) => {
    updateDashboardStats(eventData.data);
});

// Eksempel: I content.js
function completeContent(contentId) {
    // ... existing logic
    
    EventBus.emit(EVENTS.CONTENT_COMPLETED, {
        contentId,
        timeSpent: getTimeSpent(),
        score: getScore()
    }, { source: 'content-module' });
}
```

**Test:**
- [ ] EventBus tilgængelig globalt
- [ ] Cross-module events fungerer
- [ ] Middleware system fungerer
- [ ] Debug mode viser korrekt information

---

## 🔄 BUILD 1.3: DataBridge Enhancement

### Build 1.3.1: Real-time Sync System (4 timer)

**Udvid:** `/core/data-bridge.js`

```javascript
// Tilføj til DataBridge object
const DataBridge = {
    // ... existing code ...
    
    /**
     * Real-time data synchronization
     */
    enableRealTimeSync() {
        // Listen for storage changes across tabs
        window.addEventListener('storage', (e) => {
            if (e.key?.startsWith('examklar_')) {
                this.handleExternalDataChange(e.key, e.newValue, e.oldValue);
            }
        });
        
        // Listen for EventBus data events
        EventBus.on(EVENTS.DATA_UPDATED, (eventData) => {
            this.syncDataAcrossModules(eventData.data);
        });
        
        console.log('🔄 DataBridge: Real-time sync enabled');
    },
    
    /**
     * Handle external data changes (from other tabs)
     */
    handleExternalDataChange(key, newValue, oldValue) {
        if (!newValue) return;
        
        try {
            const data = JSON.parse(newValue);
            const changeType = this.detectChangeType(key, data, oldValue ? JSON.parse(oldValue) : null);
            
            EventBus.emit(EVENTS.DATA_SYNCED, {
                key,
                data,
                changeType,
                source: 'external'
            });
            
            console.log(`🔄 DataBridge: External change detected for ${key}`, changeType);
        } catch (error) {
            console.error('DataBridge sync error:', error);
        }
    },
    
    /**
     * Sync data across all modules
     */
    syncDataAcrossModules(changeData) {
        const { module, type, data } = changeData;
        
        // Update unified training data
        const trainingData = this.getTrainingData();
        if (trainingData && trainingData[module]) {
            this.mergeModuleData(trainingData[module], type, data);
            this.saveTrainingData(trainingData);
        }
        
        // Update progress tracker
        this.updateProgressTracker(module, {
            type,
            timestamp: Date.now(),
            data
        });
        
        // Notify other modules
        EventBus.emit(EVENTS.PROGRESS_UPDATED, {
            module,
            type,
            data
        }, { source: 'data-bridge' });
    },
    
    /**
     * Intelligent data merging
     */
    mergeModuleData(moduleData, type, newData) {
        switch (type) {
            case 'content_completed':
                if (!moduleData.completed.includes(newData.id)) {
                    moduleData.completed.push(newData.id);
                }
                moduleData.progress[newData.id] = {
                    completedAt: new Date().toISOString(),
                    timeSpent: newData.timeSpent || 0,
                    score: newData.score || 0
                };
                break;
                
            case 'flashcard_reviewed':
                moduleData.stats.totalReviewed += 1;
                if (newData.score) {
                    const currentAvg = moduleData.stats.averageScore || 0;
                    const totalReviews = moduleData.stats.totalReviewed;
                    moduleData.stats.averageScore = 
                        (currentAvg * (totalReviews - 1) + newData.score) / totalReviews;
                }
                break;
                
            case 'quiz_completed':
                moduleData.stats.totalQuizzes += 1;
                if (newData.score > (moduleData.stats.bestScore || 0)) {
                    moduleData.stats.bestScore = newData.score;
                }
                break;
        }
    },
    
    /**
     * Conflict resolution
     */
    resolveConflict(localData, remoteData, strategy = 'merge') {
        switch (strategy) {
            case 'merge':
                return this.deepMerge(localData, remoteData);
            case 'local_wins':
                return localData;
            case 'remote_wins':
                return remoteData;
            case 'timestamp':
                const localTime = new Date(localData.meta?.lastUpdated || 0);
                const remoteTime = new Date(remoteData.meta?.lastUpdated || 0);
                return localTime > remoteTime ? localData : remoteData;
            default:
                return this.deepMerge(localData, remoteData);
        }
    },
    
    /**
     * Deep merge utility
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else if (Array.isArray(source[key])) {
                result[key] = [...new Set([...(result[key] || []), ...source[key]])];
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    },
    
    /**
     * Data validation
     */
    validateData(data, schema) {
        // Basic validation - can be extended with JSON Schema
        const errors = [];
        
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in data)) {
                    errors.push(`Missing required field: ${field}`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    /**
     * Export data for backup
     */
    exportAllData() {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        // Export all ExamKlar data
        for (const key of Object.values(this.KEYS)) {
            const data = localStorage.getItem(key);
            if (data) {
                exportData.data[key] = JSON.parse(data);
            }
        }
        
        return exportData;
    },
    
    /**
     * Import data from backup
     */
    importData(importData, options = {}) {
        const { overwrite = false, validate = true } = options;
        
        if (validate && importData.version !== '1.0') {
            throw new Error('Incompatible data version');
        }
        
        const results = {
            imported: 0,
            skipped: 0,
            errors: []
        };
        
        for (const [key, data] of Object.entries(importData.data)) {
            try {
                const exists = localStorage.getItem(key);
                
                if (exists && !overwrite) {
                    results.skipped++;
                    continue;
                }
                
                localStorage.setItem(key, JSON.stringify(data));
                results.imported++;
            } catch (error) {
                results.errors.push(`Failed to import ${key}: ${error.message}`);
            }
        }
        
        // Trigger sync after import
        EventBus.emit(EVENTS.DATA_SYNCED, {
            source: 'import',
            results
        });
        
        return results;
    }
};

// Auto-enable real-time sync
document.addEventListener('DOMContentLoaded', () => {
    DataBridge.enableRealTimeSync();
});
```

**Test:**
- [ ] Real-time sync fungerer på tværs af tabs
- [ ] Data merging håndterer konflikter korrekt
- [ ] Export/import funktionalitet fungerer
- [ ] Validation system fungerer

---

## 📋 Implementation Checklist

### Dag 1: Kritiske Fixes
- [ ] Fix content module script tags
- [ ] Test content module loader
- [ ] Verificer DataBridge integration

### Dag 2: Design System Foundation
- [ ] Opret design token files
- [ ] Test CSS custom properties
- [ ] Verificer dark mode support

### Dag 3: EventBus Implementation
- [ ] Implementer EventBus system
- [ ] Integrer i eksisterende moduler
- [ ] Test cross-module kommunikation

### Dag 4: DataBridge Enhancement
- [ ] Implementer real-time sync
- [ ] Test conflict resolution
- [ ] Verificer data validation

### Dag 5: Integration Testing
- [ ] End-to-end testing af alle builds
- [ ] Performance testing
- [ ] Bug fixes og optimering

---

## 🚀 Next Steps

Efter disse atomic builds er implementeret:

1. **Uge 2:** Component library implementation
2. **Uge 3:** Module migration til design system
3. **Uge 4:** Advanced features implementation

**Success Metrics:**
- Alle moduler loader korrekt
- Cross-module kommunikation fungerer
- Design tokens bruges konsistent
- Real-time sync fungerer på tværs af tabs

*Denne guide sikrer systematisk implementation af de mest kritiske forbedringer først.*