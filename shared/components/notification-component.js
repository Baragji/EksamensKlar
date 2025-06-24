/**
 * Notification Component
 * Reusable notification system with multiple types and animations
 */

import { createElement, addEventListener } from '../utilities/dom-utils.js';
import { generateId } from '../utilities/validation-utils.js';
import { EVENT_TYPES } from '../constants/app-constants.js';

class NotificationComponent {
    constructor(options = {}) {
        this.options = {
            container: document.body,
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            maxNotifications: 5,
            defaultDuration: 5000,
            animationDuration: 300,
            stackSpacing: 10,
            ...options
        };
        
        this.notifications = new Map();
        this.container = null;
        this.initialized = false;
        
        this.init();
    }

    /**
     * Initialize notification system
     */
    init() {
        if (this.initialized) return;
        
        this.createContainer();
        this.bindEvents();
        this.initialized = true;
    }

    /**
     * Create notification container
     */
    createContainer() {
        this.container = createElement('div', {
            className: `notification-container notification-${this.options.position}`,
            'aria-live': 'polite',
            'aria-label': 'Notifikationer',
            role: 'region'
        });
        
        this.options.container.appendChild(this.container);
        this.addContainerStyles();
    }

    /**
     * Add CSS styles for container
     */
    addContainerStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const styles = createElement('style', {
            id: 'notification-styles'
        });
        
        styles.textContent = `
            .notification-container {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                max-width: 400px;
                width: 100%;
            }
            
            .notification-top-right {
                top: 20px;
                right: 20px;
            }
            
            .notification-top-left {
                top: 20px;
                left: 20px;
            }
            
            .notification-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .notification-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .notification-top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification-bottom-center {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification {
                pointer-events: auto;
                margin-bottom: ${this.options.stackSpacing}px;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all ${this.options.animationDuration}ms ease;
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
                margin-bottom: 0;
                padding-top: 0;
                padding-bottom: 0;
                max-height: 0;
            }
            
            .notification-success {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9));
                color: white;
            }
            
            .notification-error {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9));
                color: white;
            }
            
            .notification-warning {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.9));
                color: white;
            }
            
            .notification-info {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
                color: white;
            }
            
            .notification-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                margin-top: 2px;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                margin: 0 0 4px 0;
                line-height: 1.4;
            }
            
            .notification-message {
                font-size: 13px;
                margin: 0;
                line-height: 1.4;
                opacity: 0.9;
            }
            
            .notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            .notification-action {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .notification-action:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }
            
            @media (max-width: 480px) {
                .notification-container {
                    left: 10px !important;
                    right: 10px !important;
                    max-width: none;
                    transform: none !important;
                }
                
                .notification {
                    margin-bottom: 8px;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .notification {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Listen for custom notification events
        document.addEventListener(EVENT_TYPES.NOTIFICATION_SHOW, (event) => {
            this.show(event.detail);
        });
        
        document.addEventListener(EVENT_TYPES.NOTIFICATION_HIDE, (event) => {
            this.hide(event.detail.id);
        });
        
        document.addEventListener(EVENT_TYPES.NOTIFICATION_CLEAR, () => {
            this.clearAll();
        });
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} SVG icon
     */
    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>`,
            error: `<svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>`,
            warning: `<svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>`,
            info: `<svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>`
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Create notification element
     * @param {Object} options - Notification options
     * @returns {HTMLElement} Notification element
     */
    createNotification(options) {
        const {
            id,
            type = 'info',
            title,
            message,
            actions = [],
            closable = true,
            duration
        } = options;
        
        const notification = createElement('div', {
            className: `notification notification-${type}`,
            id: `notification-${id}`,
            role: 'alert',
            'aria-labelledby': title ? `notification-title-${id}` : null,
            'aria-describedby': message ? `notification-message-${id}` : null
        });
        
        // Icon
        const icon = createElement('div', {
            className: 'notification-icon',
            innerHTML: this.getIcon(type),
            'aria-hidden': 'true'
        });
        
        // Content
        const content = createElement('div', {
            className: 'notification-content'
        });
        
        if (title) {
            const titleEl = createElement('h4', {
                className: 'notification-title',
                id: `notification-title-${id}`,
                textContent: title
            });
            content.appendChild(titleEl);
        }
        
        if (message) {
            const messageEl = createElement('p', {
                className: 'notification-message',
                id: `notification-message-${id}`,
                textContent: message
            });
            content.appendChild(messageEl);
        }
        
        // Actions
        if (actions.length > 0) {
            const actionsEl = createElement('div', {
                className: 'notification-actions'
            });
            
            actions.forEach(action => {
                const button = createElement('button', {
                    className: 'notification-action',
                    textContent: action.label,
                    'aria-label': action.ariaLabel || action.label
                });
                
                addEventListener(button, 'click', () => {
                    if (action.handler) {
                        action.handler();
                    }
                    if (action.closeOnClick !== false) {
                        this.hide(id);
                    }
                });
                
                actionsEl.appendChild(button);
            });
            
            content.appendChild(actionsEl);
        }
        
        // Close button
        if (closable) {
            const closeBtn = createElement('button', {
                className: 'notification-close',
                innerHTML: '×',
                'aria-label': 'Luk notifikation',
                title: 'Luk notifikation'
            });
            
            addEventListener(closeBtn, 'click', () => {
                this.hide(id);
            });
            
            notification.appendChild(closeBtn);
        }
        
        // Progress bar for timed notifications
        if (duration && duration > 0) {
            const progress = createElement('div', {
                className: 'notification-progress'
            });
            notification.appendChild(progress);
        }
        
        notification.appendChild(icon);
        notification.appendChild(content);
        
        return notification;
    }

    /**
     * Show notification
     * @param {Object} options - Notification options
     * @returns {string} Notification ID
     */
    show(options = {}) {
        const id = options.id || generateId();
        const duration = options.duration !== undefined ? options.duration : this.options.defaultDuration;
        
        // Remove oldest notification if at max capacity
        if (this.notifications.size >= this.options.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.hide(oldestId);
        }
        
        const notification = this.createNotification({ ...options, id });
        
        // Store notification data
        this.notifications.set(id, {
            element: notification,
            options,
            timer: null,
            startTime: Date.now()
        });
        
        // Add to container
        this.container.appendChild(notification);
        
        // Trigger show animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Set auto-hide timer
        if (duration > 0) {
            this.setAutoHideTimer(id, duration);
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent(EVENT_TYPES.NOTIFICATION_SHOWN, {
            detail: { id, options }
        }));
        
        return id;
    }

    /**
     * Set auto-hide timer with progress bar
     * @param {string} id - Notification ID
     * @param {number} duration - Duration in milliseconds
     */
    setAutoHideTimer(id, duration) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;
        
        const { element } = notificationData;
        const progressBar = element.querySelector('.notification-progress');
        
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = `${duration}ms`;
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }
        
        notificationData.timer = setTimeout(() => {
            this.hide(id);
        }, duration);
    }

    /**
     * Hide notification
     * @param {string} id - Notification ID
     */
    hide(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;
        
        const { element, timer } = notificationData;
        
        // Clear timer
        if (timer) {
            clearTimeout(timer);
        }
        
        // Trigger hide animation
        element.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent(EVENT_TYPES.NOTIFICATION_HIDDEN, {
                detail: { id }
            }));
        }, this.options.animationDuration);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        const ids = Array.from(this.notifications.keys());
        ids.forEach(id => this.hide(id));
    }

    /**
     * Update notification
     * @param {string} id - Notification ID
     * @param {Object} updates - Updates to apply
     */
    update(id, updates) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;
        
        const { element, options } = notificationData;
        const newOptions = { ...options, ...updates };
        
        // Create new notification element
        const newElement = this.createNotification({ ...newOptions, id });
        
        // Replace old element
        element.parentNode.replaceChild(newElement, element);
        
        // Update stored data
        notificationData.element = newElement;
        notificationData.options = newOptions;
        
        // Show new element
        requestAnimationFrame(() => {
            newElement.classList.add('show');
        });
    }

    /**
     * Get notification count
     * @returns {number} Number of active notifications
     */
    getCount() {
        return this.notifications.size;
    }

    /**
     * Check if notification exists
     * @param {string} id - Notification ID
     * @returns {boolean} Exists status
     */
    exists(id) {
        return this.notifications.has(id);
    }

    /**
     * Destroy notification system
     */
    destroy() {
        this.clearAll();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        const styles = document.getElementById('notification-styles');
        if (styles && styles.parentNode) {
            styles.parentNode.removeChild(styles);
        }
        
        this.notifications.clear();
        this.initialized = false;
    }

    // Convenience methods
    success(title, message, options = {}) {
        return this.show({ ...options, type: 'success', title, message });
    }
    
    error(title, message, options = {}) {
        return this.show({ ...options, type: 'error', title, message });
    }
    
    warning(title, message, options = {}) {
        return this.show({ ...options, type: 'warning', title, message });
    }
    
    info(title, message, options = {}) {
        return this.show({ ...options, type: 'info', title, message });
    }
}

// Create and export singleton instance
export const notificationComponent = new NotificationComponent();
export default NotificationComponent;