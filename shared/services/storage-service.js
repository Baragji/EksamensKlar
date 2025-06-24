/**
 * Storage Service
 * Centralized storage management with encryption and validation
 */

import { STORAGE_KEYS } from '../constants/app-constants.js';
import { deepClone, isEmpty } from '../utilities/validation-utils.js';

class StorageService {
    constructor() {
        this.prefix = 'eksamensklar_';
        this.encryptionKey = null;
        this.compressionEnabled = false;
        this.listeners = new Map();
        
        // Initialize storage event listener
        this.initStorageListener();
    }

    /**
     * Initialize storage event listener for cross-tab communication
     */
    initStorageListener() {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key && event.key.startsWith(this.prefix)) {
                    const key = event.key.replace(this.prefix, '');
                    const listeners = this.listeners.get(key);
                    
                    if (listeners) {
                        const newValue = this.parseValue(event.newValue);
                        const oldValue = this.parseValue(event.oldValue);
                        
                        listeners.forEach(callback => {
                            try {
                                callback(newValue, oldValue, key);
                            } catch (error) {
                                console.error('Storage listener error:', error);
                            }
                        });
                    }
                }
            });
        }
    }

    /**
     * Set encryption key for sensitive data
     * @param {string} key - Encryption key
     */
    setEncryptionKey(key) {
        this.encryptionKey = key;
    }

    /**
     * Enable/disable compression
     * @param {boolean} enabled - Compression enabled
     */
    setCompression(enabled) {
        this.compressionEnabled = enabled;
    }

    /**
     * Generate storage key with prefix
     * @param {string} key - Original key
     * @returns {string} Prefixed key
     */
    getStorageKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Check if storage is available
     * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
     * @returns {boolean} Storage availability
     */
    isStorageAvailable(type = 'localStorage') {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Serialize value for storage
     * @param {any} value - Value to serialize
     * @param {boolean} encrypt - Whether to encrypt the value
     * @returns {string} Serialized value
     */
    serializeValue(value, encrypt = false) {
        try {
            let serialized = JSON.stringify({
                data: value,
                timestamp: Date.now(),
                type: typeof value,
                encrypted: encrypt
            });

            if (encrypt && this.encryptionKey) {
                serialized = this.encrypt(serialized);
            }

            if (this.compressionEnabled) {
                serialized = this.compress(serialized);
            }

            return serialized;
        } catch (error) {
            console.error('Serialization error:', error);
            return null;
        }
    }

    /**
     * Parse value from storage
     * @param {string} value - Serialized value
     * @returns {any} Parsed value
     */
    parseValue(value) {
        if (!value) return null;

        try {
            let parsed = value;

            if (this.compressionEnabled) {
                parsed = this.decompress(parsed);
            }

            const data = JSON.parse(parsed);

            if (data.encrypted && this.encryptionKey) {
                const decrypted = this.decrypt(data.data);
                data.data = JSON.parse(decrypted).data;
            }

            return data.data;
        } catch (error) {
            console.error('Parse error:', error);
            // Try to return raw value as fallback
            return value;
        }
    }

    /**
     * Simple encryption (for demo purposes - use proper encryption in production)
     * @param {string} text - Text to encrypt
     * @returns {string} Encrypted text
     */
    encrypt(text) {
        if (!this.encryptionKey) return text;
        
        // Simple XOR encryption (NOT secure for production)
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            );
        }
        return btoa(result);
    }

    /**
     * Simple decryption
     * @param {string} encryptedText - Encrypted text
     * @returns {string} Decrypted text
     */
    decrypt(encryptedText) {
        if (!this.encryptionKey) return encryptedText;
        
        try {
            const text = atob(encryptedText);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            return result;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedText;
        }
    }

    /**
     * Simple compression using LZ-string-like algorithm
     * @param {string} text - Text to compress
     * @returns {string} Compressed text
     */
    compress(text) {
        // Simple run-length encoding for demo
        return text.replace(/(.)\1+/g, (match, char) => {
            return char + match.length;
        });
    }

    /**
     * Simple decompression
     * @param {string} compressed - Compressed text
     * @returns {string} Decompressed text
     */
    decompress(compressed) {
        // Reverse run-length encoding
        return compressed.replace(/(.)\d+/g, (match, char) => {
            const count = parseInt(match.slice(1));
            return char.repeat(count);
        });
    }

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    setItem(key, value, options = {}) {
        const {
            encrypt = false,
            storage = 'localStorage',
            ttl = null
        } = options;

        if (!this.isStorageAvailable(storage)) {
            console.warn(`${storage} is not available`);
            return false;
        }

        try {
            const storageKey = this.getStorageKey(key);
            let dataToStore = value;

            // Add TTL if specified
            if (ttl) {
                dataToStore = {
                    value: value,
                    expires: Date.now() + ttl
                };
            }

            const serialized = this.serializeValue(dataToStore, encrypt);
            if (serialized === null) return false;

            window[storage].setItem(storageKey, serialized);
            
            // Notify listeners
            this.notifyListeners(key, value, null);
            
            return true;
        } catch (error) {
            console.error('Storage setItem error:', error);
            return false;
        }
    }

    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @returns {any} Stored value or null
     */
    getItem(key, options = {}) {
        const {
            defaultValue = null,
            storage = 'localStorage'
        } = options;

        if (!this.isStorageAvailable(storage)) {
            return defaultValue;
        }

        try {
            const storageKey = this.getStorageKey(key);
            const stored = window[storage].getItem(storageKey);
            
            if (!stored) return defaultValue;

            const parsed = this.parseValue(stored);
            if (parsed === null) return defaultValue;

            // Check TTL
            if (parsed && typeof parsed === 'object' && parsed.expires) {
                if (Date.now() > parsed.expires) {
                    this.removeItem(key, { storage });
                    return defaultValue;
                }
                return parsed.value;
            }

            return parsed;
        } catch (error) {
            console.error('Storage getItem error:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    removeItem(key, options = {}) {
        const { storage = 'localStorage' } = options;

        if (!this.isStorageAvailable(storage)) {
            return false;
        }

        try {
            const storageKey = this.getStorageKey(key);
            const oldValue = this.getItem(key, options);
            
            window[storage].removeItem(storageKey);
            
            // Notify listeners
            this.notifyListeners(key, null, oldValue);
            
            return true;
        } catch (error) {
            console.error('Storage removeItem error:', error);
            return false;
        }
    }

    /**
     * Clear all items with prefix
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    clear(options = {}) {
        const { storage = 'localStorage' } = options;

        if (!this.isStorageAvailable(storage)) {
            return false;
        }

        try {
            const storageObj = window[storage];
            const keysToRemove = [];

            for (let i = 0; i < storageObj.length; i++) {
                const key = storageObj.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                storageObj.removeItem(key);
            });

            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Get all keys with prefix
     * @param {Object} options - Storage options
     * @returns {Array} Array of keys
     */
    keys(options = {}) {
        const { storage = 'localStorage' } = options;

        if (!this.isStorageAvailable(storage)) {
            return [];
        }

        try {
            const storageObj = window[storage];
            const keys = [];

            for (let i = 0; i < storageObj.length; i++) {
                const key = storageObj.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.replace(this.prefix, ''));
                }
            }

            return keys;
        } catch (error) {
            console.error('Storage keys error:', error);
            return [];
        }
    }

    /**
     * Get storage size
     * @param {Object} options - Storage options
     * @returns {number} Storage size in bytes
     */
    getSize(options = {}) {
        const { storage = 'localStorage' } = options;

        if (!this.isStorageAvailable(storage)) {
            return 0;
        }

        try {
            const storageObj = window[storage];
            let size = 0;

            for (let i = 0; i < storageObj.length; i++) {
                const key = storageObj.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const value = storageObj.getItem(key);
                    size += key.length + (value ? value.length : 0);
                }
            }

            return size;
        } catch (error) {
            console.error('Storage getSize error:', error);
            return 0;
        }
    }

    /**
     * Add change listener
     * @param {string} key - Storage key to watch
     * @param {Function} callback - Callback function
     */
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }

    /**
     * Remove change listener
     * @param {string} key - Storage key
     * @param {Function} callback - Callback function
     */
    removeListener(key, callback) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.listeners.delete(key);
            }
        }
    }

    /**
     * Notify listeners of changes
     * @param {string} key - Storage key
     * @param {any} newValue - New value
     * @param {any} oldValue - Old value
     */
    notifyListeners(key, newValue, oldValue) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('Storage listener error:', error);
                }
            });
        }
    }

    /**
     * Backup storage data
     * @param {Object} options - Backup options
     * @returns {Object} Backup data
     */
    backup(options = {}) {
        const { storage = 'localStorage' } = options;
        const keys = this.keys({ storage });
        const backup = {};

        keys.forEach(key => {
            backup[key] = this.getItem(key, { storage });
        });

        return {
            timestamp: Date.now(),
            data: backup
        };
    }

    /**
     * Restore storage data from backup
     * @param {Object} backup - Backup data
     * @param {Object} options - Restore options
     * @returns {boolean} Success status
     */
    restore(backup, options = {}) {
        const { storage = 'localStorage', clearFirst = false } = options;

        if (!backup || !backup.data) {
            return false;
        }

        try {
            if (clearFirst) {
                this.clear({ storage });
            }

            Object.entries(backup.data).forEach(([key, value]) => {
                this.setItem(key, value, { storage });
            });

            return true;
        } catch (error) {
            console.error('Storage restore error:', error);
            return false;
        }
    }
}

// Create and export singleton instance
export const storageService = new StorageService();
export default storageService;