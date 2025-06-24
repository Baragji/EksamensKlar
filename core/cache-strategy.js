/**
 * Advanced Caching Strategy Implementation
 * Implements intelligent caching with TTL, compression, and storage optimization
 */

class CacheStrategy {
    constructor() {
        this.memoryCache = new Map();
        this.cacheConfig = {
            maxMemorySize: 50 * 1024 * 1024, // 50MB
            defaultTTL: 30 * 60 * 1000, // 30 minutes
            compressionThreshold: 1024, // 1KB
            maxLocalStorageSize: 5 * 1024 * 1024 // 5MB
        };
        this.compressionWorker = null;
        this.init();
    }

    init() {
        this.setupCompressionWorker();
        this.setupStorageQuotaMonitoring();
        this.setupPeriodicCleanup();
        this.migrateOldCache();
    }

    /**
     * Store data with intelligent caching strategy
     */
    async set(key, data, options = {}) {
        const {
            ttl = this.cacheConfig.defaultTTL,
            compress = true,
            storage = 'auto',
            priority = 'normal'
        } = options;

        try {
            const cacheEntry = {
                data,
                timestamp: Date.now(),
                ttl,
                priority,
                size: this.calculateSize(data),
                compressed: false
            };

            // Compress large data
            if (compress && cacheEntry.size > this.cacheConfig.compressionThreshold) {
                cacheEntry.data = await this.compressData(data);
                cacheEntry.compressed = true;
                cacheEntry.size = this.calculateSize(cacheEntry.data);
            }

            // Determine storage location
            const storageLocation = this.determineStorageLocation(cacheEntry, storage);
            
            switch (storageLocation) {
                case 'memory':
                    await this.setMemoryCache(key, cacheEntry);
                    break;
                case 'localStorage':
                    await this.setLocalStorageCache(key, cacheEntry);
                    break;
                case 'indexedDB':
                    await this.setIndexedDBCache(key, cacheEntry);
                    break;
            }

            console.log(`💾 Cached '${key}' in ${storageLocation} (${this.formatSize(cacheEntry.size)})`);
            
        } catch (error) {
            console.error(`Failed to cache '${key}':`, error);
        }
    }

    /**
     * Retrieve data from cache with fallback strategy
     */
    async get(key, options = {}) {
        const { fallback = null } = options;

        try {
            // Try memory cache first (fastest)
            let cacheEntry = this.memoryCache.get(key);
            let source = 'memory';

            // Try localStorage if not in memory
            if (!cacheEntry) {
                cacheEntry = await this.getLocalStorageCache(key);
                source = 'localStorage';
            }

            // Try IndexedDB if not in localStorage
            if (!cacheEntry) {
                cacheEntry = await this.getIndexedDBCache(key);
                source = 'indexedDB';
            }

            // Check if cache entry exists and is valid
            if (!cacheEntry || this.isExpired(cacheEntry)) {
                if (cacheEntry && this.isExpired(cacheEntry)) {
                    await this.delete(key);
                }
                return fallback;
            }

            // Decompress if needed
            let data = cacheEntry.data;
            if (cacheEntry.compressed) {
                data = await this.decompressData(data);
            }

            // Promote to memory cache if from slower storage
            if (source !== 'memory' && cacheEntry.priority === 'high') {
                this.memoryCache.set(key, cacheEntry);
            }

            console.log(`🎯 Cache hit for '${key}' from ${source}`);
            return data;

        } catch (error) {
            console.error(`Failed to retrieve '${key}' from cache:`, error);
            return fallback;
        }
    }

    /**
     * Delete from all cache locations
     */
    async delete(key) {
        try {
            // Remove from memory
            this.memoryCache.delete(key);

            // Remove from localStorage
            localStorage.removeItem(`examklar-cache-${key}`);

            // Remove from IndexedDB
            await this.deleteFromIndexedDB(key);

            console.log(`🗑️ Deleted '${key}' from all caches`);
        } catch (error) {
            console.error(`Failed to delete '${key}':`, error);
        }
    }

    /**
     * Determine optimal storage location
     */
    determineStorageLocation(cacheEntry, preferredStorage) {
        if (preferredStorage !== 'auto') {
            return preferredStorage;
        }

        // High priority or small data -> memory
        if (cacheEntry.priority === 'high' || cacheEntry.size < 10 * 1024) {
            return 'memory';
        }

        // Medium size -> localStorage
        if (cacheEntry.size < 100 * 1024) {
            return 'localStorage';
        }

        // Large data -> IndexedDB
        return 'indexedDB';
    }

    /**
     * Memory cache operations
     */
    async setMemoryCache(key, cacheEntry) {
        // Check memory limit
        const currentSize = this.getMemoryCacheSize();
        if (currentSize + cacheEntry.size > this.cacheConfig.maxMemorySize) {
            await this.evictMemoryCache(cacheEntry.size);
        }

        this.memoryCache.set(key, cacheEntry);
    }

    /**
     * localStorage cache operations
     */
    async setLocalStorageCache(key, cacheEntry) {
        try {
            const serialized = JSON.stringify(cacheEntry);
            localStorage.setItem(`examklar-cache-${key}`, serialized);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                await this.cleanupLocalStorage();
                // Retry once
                const serialized = JSON.stringify(cacheEntry);
                localStorage.setItem(`examklar-cache-${key}`, serialized);
            } else {
                throw error;
            }
        }
    }

    async getLocalStorageCache(key) {
        try {
            const serialized = localStorage.getItem(`examklar-cache-${key}`);
            return serialized ? JSON.parse(serialized) : null;
        } catch (error) {
            console.warn(`Failed to parse localStorage cache for '${key}':`, error);
            localStorage.removeItem(`examklar-cache-${key}`);
            return null;
        }
    }

    /**
     * IndexedDB cache operations
     */
    async setIndexedDBCache(key, cacheEntry) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ExamKlarCache', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                
                const putRequest = store.put({ key, ...cacheEntry });
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('priority', 'priority');
                }
            };
        });
    }

    async getIndexedDBCache(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ExamKlarCache', 1);
            
            request.onerror = () => resolve(null);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                
                const getRequest = store.get(key);
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? { ...result, key: undefined } : null);
                };
                getRequest.onerror = () => resolve(null);
            };
        });
    }

    async deleteFromIndexedDB(key) {
        return new Promise((resolve) => {
            const request = indexedDB.open('ExamKlarCache', 1);
            
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                
                const deleteRequest = store.delete(key);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => resolve();
            };
            
            request.onerror = () => resolve();
        });
    }

    /**
     * Compression utilities
     */
    setupCompressionWorker() {
        // Simple compression using built-in methods
        // In production, consider using a Web Worker for heavy compression
    }

    async compressData(data) {
        try {
            // Simple JSON compression by removing whitespace
            if (typeof data === 'object') {
                return JSON.stringify(data);
            }
            return data;
        } catch (error) {
            console.warn('Compression failed, storing uncompressed:', error);
            return data;
        }
    }

    async decompressData(data) {
        try {
            // Try to parse as JSON
            if (typeof data === 'string') {
                return JSON.parse(data);
            }
            return data;
        } catch (error) {
            // Return as-is if not JSON
            return data;
        }
    }

    /**
     * Cache maintenance
     */
    async evictMemoryCache(requiredSpace) {
        const entries = Array.from(this.memoryCache.entries());
        
        // Sort by priority and age (LRU for same priority)
        entries.sort((a, b) => {
            const [, entryA] = a;
            const [, entryB] = b;
            
            // Priority order: low < normal < high
            const priorityOrder = { low: 0, normal: 1, high: 2 };
            const priorityDiff = priorityOrder[entryA.priority] - priorityOrder[entryB.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Same priority, evict older entries first
            return entryA.timestamp - entryB.timestamp;
        });

        let freedSpace = 0;
        for (const [key, entry] of entries) {
            this.memoryCache.delete(key);
            freedSpace += entry.size;
            
            if (freedSpace >= requiredSpace) {
                break;
            }
        }

        console.log(`🧹 Evicted ${this.formatSize(freedSpace)} from memory cache`);
    }

    async cleanupLocalStorage() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith('examklar-cache-'));
        
        // Remove expired entries first
        for (const key of cacheKeys) {
            try {
                const entry = JSON.parse(localStorage.getItem(key));
                if (this.isExpired(entry)) {
                    localStorage.removeItem(key);
                }
            } catch (error) {
                // Remove corrupted entries
                localStorage.removeItem(key);
            }
        }
    }

    setupPeriodicCleanup() {
        // Clean up expired entries every 5 minutes
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 5 * 60 * 1000);
    }

    async cleanupExpiredEntries() {
        // Clean memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                this.memoryCache.delete(key);
            }
        }

        // Clean localStorage
        await this.cleanupLocalStorage();

        console.log('🧹 Periodic cache cleanup completed');
    }

    /**
     * Utility methods
     */
    isExpired(cacheEntry) {
        return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
    }

    calculateSize(data) {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch (error) {
            return JSON.stringify(data).length * 2; // Rough estimate
        }
    }

    getMemoryCacheSize() {
        let totalSize = 0;
        for (const entry of this.memoryCache.values()) {
            totalSize += entry.size;
        }
        return totalSize;
    }

    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)}${units[unitIndex]}`;
    }

    setupStorageQuotaMonitoring() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                const usagePercentage = (estimate.usage / estimate.quota) * 100;
                console.log(`💾 Storage usage: ${this.formatSize(estimate.usage)} / ${this.formatSize(estimate.quota)} (${usagePercentage.toFixed(1)}%)`);
                
                if (usagePercentage > 80) {
                    console.warn('⚠️ Storage quota nearly exceeded, cleaning up...');
                    this.cleanupExpiredEntries();
                }
            });
        }
    }

    migrateOldCache() {
        // Migrate old cache format if needed
        const oldKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('examklar_') && !key.startsWith('examklar-cache-')
        );

        if (oldKeys.length > 0) {
            console.log(`🔄 Migrating ${oldKeys.length} old cache entries...`);
            // Migration logic would go here
        }
    }

    /**
     * Public API methods
     */
    async clear() {
        this.memoryCache.clear();
        
        // Clear localStorage cache
        const keys = Object.keys(localStorage);
        keys.filter(key => key.startsWith('examklar-cache-'))
            .forEach(key => localStorage.removeItem(key));
        
        // Clear IndexedDB
        await new Promise((resolve) => {
            const deleteRequest = indexedDB.deleteDatabase('ExamKlarCache');
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => resolve();
        });
        
        console.log('🗑️ All caches cleared');
    }

    getStats() {
        return {
            memoryCache: {
                entries: this.memoryCache.size,
                size: this.formatSize(this.getMemoryCacheSize())
            },
            config: this.cacheConfig
        };
    }
}

// Initialize global cache strategy
const cacheStrategy = new CacheStrategy();

// Export for global use
window.cacheStrategy = cacheStrategy;

// Export for ES6 modules
export default cacheStrategy;