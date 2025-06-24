/**
 * EksamensKlar EventBus Integration Helper
 * Connects EventBus with existing systems and provides integration utilities
 */

class EventBusIntegration {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.integrations = new Map();
        this.bridgeConnections = new Map();
        
        console.log('🔗 EventBus: Integration helper initialized');
    }

    /**
     * Integrate with DataBridge system
     */
    integrateWithDataBridge(dataBridge) {
        const integration = {
            name: 'DataBridge',
            instance: dataBridge,
            events: {
                // Data events
                'data.onboarding.saved': (data) => dataBridge.saveOnboardingData?.(data),
                'data.training.saved': (data) => dataBridge.saveUnifiedTrainingData?.(data),
                'data.progress.updated': (data) => dataBridge.updateProgress?.(data),
                
                // Content events
                'content.initialized': (data) => dataBridge.initializeContent?.(data),
                'content.updated': (data) => dataBridge.updateContent?.(data),
                
                // Quiz events
                'quiz.initialized': (data) => dataBridge.initializeQuizzes?.(data),
                'quiz.completed': (data) => dataBridge.saveQuizResult?.(data),
                
                // Flashcard events
                'flashcard.initialized': (data) => dataBridge.initializeFlashcards?.(data),
                'flashcard.reviewed': (data) => dataBridge.saveFlashcardProgress?.(data)
            }
        };

        // Register event listeners
        Object.entries(integration.events).forEach(([eventType, handler]) => {
            this.eventBus.on('data', eventType, handler);
        });

        // Add DataBridge event emitters
        if (dataBridge.emit) {
            dataBridge.originalEmit = dataBridge.emit;
            dataBridge.emit = (eventType, data) => {
                this.eventBus.emit('data', eventType, data);
                return dataBridge.originalEmit?.(eventType, data);
            };
        }

        this.integrations.set('DataBridge', integration);
        console.log('✅ EventBus: DataBridge integration complete');
        
        return integration;
    }

    /**
     * Integrate with localStorage for persistence
     */
    integrateWithLocalStorage(options = {}) {
        const {
            prefix = 'eksamensklar_',
            persistEvents = ['data.saved', 'progress.updated', 'settings.changed'],
            autoRestore = true
        } = options;

        const integration = {
            name: 'LocalStorage',
            prefix,
            persistEvents,
            
            save: (key, data) => {
                try {
                    localStorage.setItem(prefix + key, JSON.stringify(data));
                    this.eventBus.emit('storage', 'data.persisted', { key, data });
                } catch (error) {
                    this.eventBus.emit('storage', 'error.persist', { key, error: error.message });
                }
            },
            
            load: (key) => {
                try {
                    const data = localStorage.getItem(prefix + key);
                    return data ? JSON.parse(data) : null;
                } catch (error) {
                    this.eventBus.emit('storage', 'error.load', { key, error: error.message });
                    return null;
                }
            },
            
            remove: (key) => {
                localStorage.removeItem(prefix + key);
                this.eventBus.emit('storage', 'data.removed', { key });
            }
        };

        // Auto-persist specified events
        persistEvents.forEach(eventType => {
            this.eventBus.on('*', eventType, (data, event) => {
                const key = `${event.namespace}_${eventType}_${Date.now()}`;
                integration.save(key, { event, data, timestamp: Date.now() });
            });
        });

        // Storage event listeners
        this.eventBus.on('storage', 'save', ({ key, data }) => integration.save(key, data));
        this.eventBus.on('storage', 'load', ({ key }) => integration.load(key));
        this.eventBus.on('storage', 'remove', ({ key }) => integration.remove(key));

        // Auto-restore on initialization
        if (autoRestore) {
            this.restoreFromStorage(integration);
        }

        this.integrations.set('LocalStorage', integration);
        console.log('✅ EventBus: LocalStorage integration complete');
        
        return integration;
    }

    /**
     * Integrate with DOM events
     */
    integrateWithDOM(options = {}) {
        const {
            autoCapture = ['click', 'submit', 'change'],
            selector = '[data-event]',
            namespace = 'ui'
        } = options;

        const integration = {
            name: 'DOM',
            listeners: new Map(),
            
            addListener: (element, eventType, handler) => {
                const wrappedHandler = (domEvent) => {
                    const eventData = {
                        type: domEvent.type,
                        target: domEvent.target,
                        timestamp: Date.now(),
                        data: this.extractEventData(domEvent.target)
                    };
                    
                    this.eventBus.emit(namespace, eventType, eventData);
                    
                    if (handler) {
                        handler(domEvent, eventData);
                    }
                };
                
                element.addEventListener(eventType, wrappedHandler);
                
                const key = `${element.id || 'anonymous'}_${eventType}`;
                integration.listeners.set(key, { element, eventType, handler: wrappedHandler });
            },
            
            removeListener: (element, eventType) => {
                const key = `${element.id || 'anonymous'}_${eventType}`;
                const listener = integration.listeners.get(key);
                
                if (listener) {
                    element.removeEventListener(eventType, listener.handler);
                    integration.listeners.delete(key);
                }
            }
        };

        // Auto-capture specified DOM events
        autoCapture.forEach(eventType => {
            document.addEventListener(eventType, (domEvent) => {
                if (domEvent.target.matches(selector)) {
                    const customEventType = domEvent.target.dataset.event || eventType;
                    const eventData = {
                        domEvent: eventType,
                        customType: customEventType,
                        element: domEvent.target,
                        data: this.extractEventData(domEvent.target)
                    };
                    
                    this.eventBus.emit(namespace, customEventType, eventData);
                }
            }, true);
        });

        this.integrations.set('DOM', integration);
        console.log('✅ EventBus: DOM integration complete');
        
        return integration;
    }

    /**
     * Create bridge between different namespaces
     */
    createBridge(fromNamespace, toNamespace, eventMappings = {}) {
        const bridgeId = `${fromNamespace}->${toNamespace}`;
        
        const bridge = {
            id: bridgeId,
            from: fromNamespace,
            to: toNamespace,
            mappings: eventMappings,
            active: true,
            
            forward: (eventType, data, originalEvent) => {
                if (!bridge.active) return;
                
                const mappedType = eventMappings[eventType] || eventType;
                const bridgedData = {
                    ...data,
                    _bridged: {
                        from: fromNamespace,
                        originalType: eventType,
                        bridgeId
                    }
                };
                
                this.eventBus.emit(toNamespace, mappedType, bridgedData);
            }
        };

        // Listen to all events in source namespace
        this.eventBus.on(fromNamespace, '*', bridge.forward);
        
        this.bridgeConnections.set(bridgeId, bridge);
        console.log(`🌉 EventBus: Bridge created ${bridgeId}`);
        
        return bridge;
    }

    /**
     * Extract event data from DOM elements
     */
    extractEventData(element) {
        const data = {};
        
        // Extract data attributes
        Object.keys(element.dataset).forEach(key => {
            if (key.startsWith('event')) {
                const dataKey = key.replace('event', '').toLowerCase();
                data[dataKey] = element.dataset[key];
            }
        });
        
        // Extract form data if applicable
        if (element.tagName === 'FORM') {
            const formData = new FormData(element);
            data.formData = Object.fromEntries(formData.entries());
        }
        
        // Extract input value if applicable
        if (element.value !== undefined) {
            data.value = element.value;
        }
        
        return data;
    }

    /**
     * Restore events from localStorage
     */
    restoreFromStorage(storageIntegration) {
        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith(storageIntegration.prefix));
        
        keys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.event && data.timestamp) {
                    this.eventBus.emit('storage', 'data.restored', {
                        key: key.replace(storageIntegration.prefix, ''),
                        data,
                        restoredAt: Date.now()
                    });
                }
            } catch (error) {
                console.warn(`Failed to restore event from ${key}:`, error);
            }
        });
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        const status = {
            active: Array.from(this.integrations.keys()),
            bridges: Array.from(this.bridgeConnections.values()).map(bridge => ({
                id: bridge.id,
                from: bridge.from,
                to: bridge.to,
                active: bridge.active
            })),
            eventBusStats: this.eventBus.getStats()
        };
        
        return status;
    }

    /**
     * Disconnect integration
     */
    disconnect(integrationName) {
        const integration = this.integrations.get(integrationName);
        
        if (integration) {
            // Clean up based on integration type
            if (integrationName === 'DOM' && integration.listeners) {
                integration.listeners.forEach(({ element, eventType, handler }) => {
                    element.removeEventListener(eventType, handler);
                });
            }
            
            this.integrations.delete(integrationName);
            console.log(`🔌 EventBus: ${integrationName} integration disconnected`);
        }
    }

    /**
     * Disconnect bridge
     */
    disconnectBridge(bridgeId) {
        const bridge = this.bridgeConnections.get(bridgeId);
        
        if (bridge) {
            bridge.active = false;
            this.eventBus.off(bridge.from, '*', bridge.forward);
            this.bridgeConnections.delete(bridgeId);
            console.log(`🌉 EventBus: Bridge ${bridgeId} disconnected`);
        }
    }

    /**
     * Clean up all integrations
     */
    cleanup() {
        // Disconnect all integrations
        Array.from(this.integrations.keys()).forEach(name => {
            this.disconnect(name);
        });
        
        // Disconnect all bridges
        Array.from(this.bridgeConnections.keys()).forEach(bridgeId => {
            this.disconnectBridge(bridgeId);
        });
        
        console.log('🧹 EventBus: All integrations cleaned up');
    }
}

// Export integration helper
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBusIntegration;
}

// Global access
window.EventBusIntegration = EventBusIntegration;

console.log('🔗 EventBus: Integration helper loaded');