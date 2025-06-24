/**
 * Cache Clearing Script for ExamKlar
 * Similar to deleting build/cache in TypeScript projects
 * This script clears all types of cache that might cause app issues
 */

// Clear Service Worker Cache
async function clearServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
        try {
            // Unregister all service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
                console.log('Service Worker unregistered:', registration.scope);
            }
            
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }
            console.log('✅ Service Worker cache cleared');
        } catch (error) {
            console.error('Error clearing Service Worker cache:', error);
        }
    }
}

// Clear Browser Storage
function clearBrowserStorage() {
    try {
        // Clear localStorage
        if (typeof Storage !== 'undefined' && localStorage) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('examklar') || key.startsWith('app') || key.startsWith('module')) {
                    localStorage.removeItem(key);
                    console.log('Removed localStorage key:', key);
                }
            });
        }
        
        // Clear sessionStorage
        if (typeof Storage !== 'undefined' && sessionStorage) {
            sessionStorage.clear();
        }
        
        console.log('✅ Browser storage cleared');
    } catch (error) {
        console.error('Error clearing browser storage:', error);
    }
}

// Clear Module Cache (if ModuleLoader exists)
function clearModuleCache() {
    try {
        if (window.ModuleLoader && typeof window.ModuleLoader.clearCache === 'function') {
            window.ModuleLoader.clearCache();
            console.log('✅ Module cache cleared');
        }
        
        if (window.CacheStrategy && typeof window.CacheStrategy.clearAll === 'function') {
            window.CacheStrategy.clearAll();
            console.log('✅ Cache strategy cleared');
        }
    } catch (error) {
        console.error('Error clearing module cache:', error);
    }
}

// Clear IndexedDB
async function clearIndexedDB() {
    try {
        if ('indexedDB' in window) {
            // Try to delete common ExamKlar databases
            const dbNames = ['examklar', 'examklar-cache', 'examklar-data'];
            
            for (const dbName of dbNames) {
                try {
                    await new Promise((resolve, reject) => {
                        const deleteReq = indexedDB.deleteDatabase(dbName);
                        deleteReq.onsuccess = () => {
                            console.log('Deleted IndexedDB:', dbName);
                            resolve();
                        };
                        deleteReq.onerror = () => resolve(); // Don't fail if DB doesn't exist
                        deleteReq.onblocked = () => resolve();
                    });
                } catch (error) {
                    // Ignore errors for non-existent databases
                }
            }
        }
        console.log('✅ IndexedDB cleared');
    } catch (error) {
        console.error('Error clearing IndexedDB:', error);
    }
}

// Main cache clearing function
async function clearAllCache() {
    console.log('🧹 Starting cache cleanup...');
    
    await clearServiceWorkerCache();
    clearBrowserStorage();
    clearModuleCache();
    await clearIndexedDB();
    
    console.log('✅ All cache cleared! Please refresh the page.');
    
    // Show user notification
    if (document.body) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = 'Cache cleared! Please refresh the page.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Auto-run if script is loaded directly
if (typeof window !== 'undefined') {
    // Add to global scope for manual calling
    window.clearAllCache = clearAllCache;
    
    // Auto-run if URL contains ?clear-cache
    if (window.location.search.includes('clear-cache')) {
        clearAllCache();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { clearAllCache, clearServiceWorkerCache, clearBrowserStorage, clearModuleCache, clearIndexedDB };
}