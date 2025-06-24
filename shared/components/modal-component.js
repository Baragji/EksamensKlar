/**
 * Modal Component
 * Reusable modal dialog system with accessibility and animations
 */

import { createElement, addEventListener, createFocusTrap } from '../utilities/dom-utils.js';
import { generateId } from '../utilities/validation-utils.js';
import { EVENT_TYPES } from '../constants/app-constants.js';

class ModalComponent {
    constructor(options = {}) {
        this.options = {
            closeOnEscape: true,
            closeOnBackdrop: true,
            showCloseButton: true,
            animationDuration: 300,
            maxWidth: '600px',
            ...options
        };
        
        this.modals = new Map();
        this.activeModal = null;
        this.initialized = false;
        this.originalFocus = null;
        
        this.init();
    }

    /**
     * Initialize modal system
     */
    init() {
        if (this.initialized) return;
        
        this.addStyles();
        this.bindGlobalEvents();
        this.initialized = true;
    }

    /**
     * Add CSS styles for modals
     */
    addStyles() {
        if (document.getElementById('modal-styles')) return;
        
        const styles = createElement('style', {
            id: 'modal-styles'
        });
        
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transition: all ${this.options.animationDuration}ms ease;
            }
            
            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .modal {
                background: var(--bg-primary, #ffffff);
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                max-width: ${this.options.maxWidth};
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                position: relative;
                transform: scale(0.95) translateY(20px);
                transition: all ${this.options.animationDuration}ms ease;
                border: 1px solid var(--border-primary, rgba(0, 0, 0, 0.1));
            }
            
            .modal-overlay.show .modal {
                transform: scale(1) translateY(0);
            }
            
            .modal-header {
                padding: 24px 24px 0 24px;
                border-bottom: 1px solid var(--border-secondary, rgba(0, 0, 0, 0.05));
                position: relative;
            }
            
            .modal-title {
                margin: 0 0 16px 0;
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary, #1f2937);
                line-height: 1.3;
                padding-right: 40px;
            }
            
            .modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-secondary, #6b7280);
                transition: all 0.2s ease;
                font-size: 18px;
                line-height: 1;
            }
            
            .modal-close:hover {
                background: var(--bg-secondary, #f3f4f6);
                color: var(--text-primary, #1f2937);
            }
            
            .modal-close:focus {
                outline: 2px solid var(--accent-primary, #3b82f6);
                outline-offset: 2px;
            }
            
            .modal-body {
                padding: 24px;
                overflow-y: auto;
                max-height: calc(90vh - 140px);
            }
            
            .modal-footer {
                padding: 0 24px 24px 24px;
                border-top: 1px solid var(--border-secondary, rgba(0, 0, 0, 0.05));
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-wrap: wrap;
            }
            
            .modal-button {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
                min-width: 80px;
                text-align: center;
            }
            
            .modal-button-primary {
                background: var(--accent-primary, #3b82f6);
                color: white;
                border-color: var(--accent-primary, #3b82f6);
            }
            
            .modal-button-primary:hover {
                background: var(--accent-primary-hover, #2563eb);
                border-color: var(--accent-primary-hover, #2563eb);
                transform: translateY(-1px);
            }
            
            .modal-button-secondary {
                background: var(--bg-secondary, #f3f4f6);
                color: var(--text-primary, #1f2937);
                border-color: var(--border-primary, rgba(0, 0, 0, 0.1));
            }
            
            .modal-button-secondary:hover {
                background: var(--bg-tertiary, #e5e7eb);
                transform: translateY(-1px);
            }
            
            .modal-button-danger {
                background: var(--error-primary, #ef4444);
                color: white;
                border-color: var(--error-primary, #ef4444);
            }
            
            .modal-button-danger:hover {
                background: var(--error-primary-hover, #dc2626);
                border-color: var(--error-primary-hover, #dc2626);
                transform: translateY(-1px);
            }
            
            .modal-button:focus {
                outline: 2px solid var(--accent-primary, #3b82f6);
                outline-offset: 2px;
            }
            
            .modal-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
            }
            
            .modal-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: var(--text-secondary, #6b7280);
            }
            
            .modal-spinner {
                width: 24px;
                height: 24px;
                border: 2px solid var(--border-secondary, rgba(0, 0, 0, 0.1));
                border-top: 2px solid var(--accent-primary, #3b82f6);
                border-radius: 50%;
                animation: modal-spin 1s linear infinite;
                margin-right: 12px;
            }
            
            @keyframes modal-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @media (max-width: 640px) {
                .modal-overlay {
                    padding: 10px;
                }
                
                .modal {
                    max-height: 95vh;
                }
                
                .modal-header,
                .modal-body,
                .modal-footer {
                    padding-left: 16px;
                    padding-right: 16px;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-button {
                    width: 100%;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .modal-overlay,
                .modal,
                .modal-button {
                    transition: none;
                }
                
                .modal-spinner {
                    animation: none;
                }
            }
            
            /* Dark theme support */
            @media (prefers-color-scheme: dark) {
                .modal {
                    background: var(--bg-primary-dark, #1f2937);
                    border-color: var(--border-primary-dark, rgba(255, 255, 255, 0.1));
                }
                
                .modal-title {
                    color: var(--text-primary-dark, #f9fafb);
                }
                
                .modal-close {
                    color: var(--text-secondary-dark, #9ca3af);
                }
                
                .modal-close:hover {
                    background: var(--bg-secondary-dark, #374151);
                    color: var(--text-primary-dark, #f9fafb);
                }
                
                .modal-button-secondary {
                    background: var(--bg-secondary-dark, #374151);
                    color: var(--text-primary-dark, #f9fafb);
                    border-color: var(--border-primary-dark, rgba(255, 255, 255, 0.1));
                }
                
                .modal-button-secondary:hover {
                    background: var(--bg-tertiary-dark, #4b5563);
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Bind global events
     */
    bindGlobalEvents() {
        // Escape key handler
        addEventListener(document, 'keydown', (event) => {
            if (event.key === 'Escape' && this.activeModal && this.options.closeOnEscape) {
                this.close(this.activeModal);
            }
        });
        
        // Custom events
        document.addEventListener(EVENT_TYPES.MODAL_SHOW, (event) => {
            this.show(event.detail);
        });
        
        document.addEventListener(EVENT_TYPES.MODAL_HIDE, (event) => {
            this.close(event.detail.id);
        });
    }

    /**
     * Create modal element
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    createModal(options) {
        const {
            id,
            title,
            content,
            buttons = [],
            loading = false,
            className = ''
        } = options;
        
        // Create overlay
        const overlay = createElement('div', {
            className: 'modal-overlay',
            id: `modal-overlay-${id}`,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': title ? `modal-title-${id}` : null,
            'aria-describedby': `modal-body-${id}`
        });
        
        // Create modal
        const modal = createElement('div', {
            className: `modal ${className}`.trim()
        });
        
        // Header
        if (title || this.options.showCloseButton) {
            const header = createElement('div', {
                className: 'modal-header'
            });
            
            if (title) {
                const titleEl = createElement('h2', {
                    className: 'modal-title',
                    id: `modal-title-${id}`,
                    textContent: title
                });
                header.appendChild(titleEl);
            }
            
            if (this.options.showCloseButton) {
                const closeBtn = createElement('button', {
                    className: 'modal-close',
                    innerHTML: '×',
                    'aria-label': 'Luk dialog',
                    title: 'Luk dialog'
                });
                
                addEventListener(closeBtn, 'click', () => {
                    this.close(id);
                });
                
                header.appendChild(closeBtn);
            }
            
            modal.appendChild(header);
        }
        
        // Body
        const body = createElement('div', {
            className: 'modal-body',
            id: `modal-body-${id}`
        });
        
        if (loading) {
            const loadingEl = createElement('div', {
                className: 'modal-loading'
            });
            
            const spinner = createElement('div', {
                className: 'modal-spinner',
                'aria-hidden': 'true'
            });
            
            const text = createElement('span', {
                textContent: 'Indlæser...'
            });
            
            loadingEl.appendChild(spinner);
            loadingEl.appendChild(text);
            body.appendChild(loadingEl);
        } else if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        
        modal.appendChild(body);
        
        // Footer
        if (buttons.length > 0) {
            const footer = createElement('div', {
                className: 'modal-footer'
            });
            
            buttons.forEach(button => {
                const btn = createElement('button', {
                    className: `modal-button modal-button-${button.type || 'secondary'}`,
                    textContent: button.text,
                    disabled: button.disabled || false,
                    'aria-label': button.ariaLabel || button.text
                });
                
                addEventListener(btn, 'click', async () => {
                    if (button.handler) {
                        try {
                            const result = await button.handler();
                            if (result !== false && button.closeOnClick !== false) {
                                this.close(id);
                            }
                        } catch (error) {
                            console.error('Modal button handler error:', error);
                        }
                    } else if (button.closeOnClick !== false) {
                        this.close(id);
                    }
                });
                
                footer.appendChild(btn);
            });
            
            modal.appendChild(footer);
        }
        
        // Backdrop click handler
        if (this.options.closeOnBackdrop) {
            addEventListener(overlay, 'click', (event) => {
                if (event.target === overlay) {
                    this.close(id);
                }
            });
        }
        
        overlay.appendChild(modal);
        
        return overlay;
    }

    /**
     * Show modal
     * @param {Object} options - Modal options
     * @returns {string} Modal ID
     */
    show(options = {}) {
        const id = options.id || generateId();
        
        // Close existing modal if any
        if (this.activeModal) {
            this.close(this.activeModal);
        }
        
        // Store original focus
        this.originalFocus = document.activeElement;
        
        // Create modal
        const modal = this.createModal({ ...options, id });
        
        // Store modal data
        this.modals.set(id, {
            element: modal,
            options,
            focusTrap: null
        });
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show modal with animation
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // Set up focus trap
        const focusTrap = createFocusTrap(modal);
        this.modals.get(id).focusTrap = focusTrap;
        
        // Focus first focusable element
        setTimeout(() => {
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, this.options.animationDuration);
        
        this.activeModal = id;
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent(EVENT_TYPES.MODAL_SHOWN, {
            detail: { id, options }
        }));
        
        return id;
    }

    /**
     * Close modal
     * @param {string} id - Modal ID
     */
    close(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;
        
        const { element, focusTrap } = modalData;
        
        // Remove focus trap
        if (focusTrap && focusTrap.deactivate) {
            focusTrap.deactivate();
        }
        
        // Hide modal with animation
        element.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            this.modals.delete(id);
            
            // Restore body scroll if no more modals
            if (this.modals.size === 0) {
                document.body.style.overflow = '';
            }
            
            // Restore focus
            if (this.originalFocus && this.activeModal === id) {
                this.originalFocus.focus();
                this.originalFocus = null;
            }
            
            this.activeModal = null;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent(EVENT_TYPES.MODAL_HIDDEN, {
                detail: { id }
            }));
        }, this.options.animationDuration);
    }

    /**
     * Update modal content
     * @param {string} id - Modal ID
     * @param {Object} updates - Updates to apply
     */
    update(id, updates) {
        const modalData = this.modals.get(id);
        if (!modalData) return;
        
        const { element, options } = modalData;
        const newOptions = { ...options, ...updates };
        
        // Update title
        if (updates.title !== undefined) {
            const titleEl = element.querySelector('.modal-title');
            if (titleEl) {
                titleEl.textContent = updates.title;
            }
        }
        
        // Update content
        if (updates.content !== undefined) {
            const bodyEl = element.querySelector('.modal-body');
            if (bodyEl) {
                if (typeof updates.content === 'string') {
                    bodyEl.innerHTML = updates.content;
                } else if (updates.content instanceof HTMLElement) {
                    bodyEl.innerHTML = '';
                    bodyEl.appendChild(updates.content);
                }
            }
        }
        
        // Update loading state
        if (updates.loading !== undefined) {
            const bodyEl = element.querySelector('.modal-body');
            if (updates.loading) {
                const loadingEl = createElement('div', {
                    className: 'modal-loading'
                });
                
                const spinner = createElement('div', {
                    className: 'modal-spinner',
                    'aria-hidden': 'true'
                });
                
                const text = createElement('span', {
                    textContent: 'Indlæser...'
                });
                
                loadingEl.appendChild(spinner);
                loadingEl.appendChild(text);
                
                bodyEl.innerHTML = '';
                bodyEl.appendChild(loadingEl);
            }
        }
        
        // Update stored options
        modalData.options = newOptions;
    }

    /**
     * Check if modal exists
     * @param {string} id - Modal ID
     * @returns {boolean} Exists status
     */
    exists(id) {
        return this.modals.has(id);
    }

    /**
     * Get active modal ID
     * @returns {string|null} Active modal ID
     */
    getActiveModal() {
        return this.activeModal;
    }

    /**
     * Close all modals
     */
    closeAll() {
        const ids = Array.from(this.modals.keys());
        ids.forEach(id => this.close(id));
    }

    /**
     * Destroy modal system
     */
    destroy() {
        this.closeAll();
        
        const styles = document.getElementById('modal-styles');
        if (styles && styles.parentNode) {
            styles.parentNode.removeChild(styles);
        }
        
        document.body.style.overflow = '';
        this.modals.clear();
        this.initialized = false;
    }

    // Convenience methods
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            this.show({
                ...options,
                title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        text: 'Annuller',
                        type: 'secondary',
                        handler: () => resolve(false)
                    },
                    {
                        text: 'Bekræft',
                        type: 'primary',
                        handler: () => resolve(true)
                    }
                ]
            });
        });
    }
    
    alert(title, message, options = {}) {
        return new Promise((resolve) => {
            this.show({
                ...options,
                title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        text: 'OK',
                        type: 'primary',
                        handler: () => resolve(true)
                    }
                ]
            });
        });
    }
}

// Create and export singleton instance
export const modalComponent = new ModalComponent();
export default ModalComponent;