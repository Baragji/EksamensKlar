/**
 * App Fallback JavaScript
 * Emergency functionality when main app.js fails
 */

(function() {
    'use strict';
    
    // Prevent multiple initialization
    if (window.AppFallback) {
        return;
    }
    
    // Basic error logging
    const errorLog = [];
    
    function logError(error, context = 'unknown') {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context: context,
            message: error.message || error,
            stack: error.stack || 'No stack trace',
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        errorLog.push(errorEntry);
        console.error('[AppFallback]', errorEntry);
        
        // Store in localStorage for debugging
        try {
            const stored = JSON.parse(localStorage.getItem('eksamensklar_fallback_errors') || '[]');
            stored.push(errorEntry);
            // Keep only last 50 errors
            if (stored.length > 50) {
                stored.splice(0, stored.length - 50);
            }
            localStorage.setItem('eksamensklar_fallback_errors', JSON.stringify(stored));
        } catch (e) {
            console.warn('[AppFallback] Could not store error in localStorage:', e);
        }
    }
    
    // Basic event bus for communication
    const EventBus = {
        events: {},
        
        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        },
        
        emit(event, data) {
            if (this.events[event]) {
                this.events[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        logError(error, `EventBus.emit(${event})`);
                    }
                });
            }
        },
        
        off(event, callback) {
            if (this.events[event]) {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            }
        }
    };
    
    // Basic navigation handler
    function handleNavigation(href) {
        try {
            // Simple hash-based navigation
            if (href.startsWith('#')) {
                window.location.hash = href;
                return true;
            }
            
            // External links
            if (href.startsWith('http')) {
                window.open(href, '_blank');
                return true;
            }
            
            // Internal navigation
            window.location.href = href;
            return true;
        } catch (error) {
            logError(error, 'handleNavigation');
            return false;
        }
    }
    
    // Basic modal functionality
    function showModal(title, content, options = {}) {
        try {
            // Remove existing modal
            const existingModal = document.querySelector('.fallback-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'fallback-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                max-height: 90%;
                overflow-y: auto;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            `;
            
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 16px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const titleEl = document.createElement('h3');
            titleEl.textContent = title;
            titleEl.style.cssText = 'margin: 0; font-size: 18px; font-weight: 600;';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const body = document.createElement('div');
            body.style.cssText = 'padding: 16px;';
            body.innerHTML = content;
            
            header.appendChild(titleEl);
            header.appendChild(closeBtn);
            dialog.appendChild(header);
            dialog.appendChild(body);
            
            if (options.footer) {
                const footer = document.createElement('div');
                footer.style.cssText = `
                    padding: 16px;
                    border-top: 1px solid #dee2e6;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                `;
                footer.innerHTML = options.footer;
                dialog.appendChild(footer);
            }
            
            modal.appendChild(dialog);
            document.body.appendChild(modal);
            
            // Close handlers
            const closeModal = () => {
                modal.remove();
                if (options.onClose) {
                    options.onClose();
                }
            };
            
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // ESC key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            return modal;
        } catch (error) {
            logError(error, 'showModal');
            // Fallback to alert
            alert(title + '\n\n' + content.replace(/<[^>]*>/g, ''));
        }
    }
    
    // Basic notification system
    function showNotification(message, type = 'info', duration = 5000) {
        try {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                max-width: 300px;
                word-wrap: break-word;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: opacity 0.3s;
            `;
            
            // Set background color based on type
            const colors = {
                info: '#17a2b8',
                success: '#28a745',
                warning: '#ffc107',
                error: '#dc3545',
                danger: '#dc3545'
            };
            
            notification.style.backgroundColor = colors[type] || colors.info;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Auto remove
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
            
            // Click to dismiss
            notification.addEventListener('click', () => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
            
        } catch (error) {
            logError(error, 'showNotification');
            console.log('[Notification]', message);
        }
    }
    
    // Basic form validation
    function validateForm(form) {
        try {
            const errors = [];
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    errors.push(`${input.name || input.id || 'Field'} is required`);
                    input.style.borderColor = '#dc3545';
                } else {
                    input.style.borderColor = '';
                }
                
                // Email validation
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        errors.push('Please enter a valid email address');
                        input.style.borderColor = '#dc3545';
                    }
                }
            });
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        } catch (error) {
            logError(error, 'validateForm');
            return { isValid: false, errors: ['Form validation failed'] };
        }
    }
    
    // Basic localStorage wrapper
    const Storage = {
        get(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (error) {
                logError(error, `Storage.get(${key})`);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                logError(error, `Storage.set(${key})`);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                logError(error, `Storage.remove(${key})`);
                return false;
            }
        }
    };
    
    // Basic theme support
    function applyTheme(theme = 'light') {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            Storage.set('eksamensklar_theme', theme);
            EventBus.emit('theme-changed', theme);
        } catch (error) {
            logError(error, 'applyTheme');
        }
    }
    
    // Initialize fallback functionality
    function init() {
        try {
            // Apply saved theme
            const savedTheme = Storage.get('eksamensklar_theme', 'light');
            applyTheme(savedTheme);
            
            // Set up basic navigation
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href], [data-nav]');
                if (link) {
                    const href = link.getAttribute('href') || link.getAttribute('data-nav');
                    if (href && !link.hasAttribute('data-external')) {
                        e.preventDefault();
                        handleNavigation(href);
                    }
                }
            });
            
            // Set up form handling
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.tagName === 'FORM' && !form.hasAttribute('data-no-validate')) {
                    const validation = validateForm(form);
                    if (!validation.isValid) {
                        e.preventDefault();
                        showNotification(validation.errors.join('\n'), 'error');
                    }
                }
            });
            
            // Show fallback notice
            showNotification('Running in fallback mode. Some features may be limited.', 'warning', 8000);
            
            // Emit ready event
            EventBus.emit('fallback-ready');
            
            console.log('[AppFallback] Initialized successfully');
            
        } catch (error) {
            logError(error, 'init');
        }
    }
    
    // Export fallback API
    window.AppFallback = {
        version: '1.0.0',
        EventBus: EventBus,
        showModal: showModal,
        showNotification: showNotification,
        validateForm: validateForm,
        Storage: Storage,
        applyTheme: applyTheme,
        handleNavigation: handleNavigation,
        logError: logError,
        getErrorLog: () => [...errorLog],
        init: init
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();