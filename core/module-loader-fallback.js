/**
 * Module Loader Fallback JavaScript
 * Emergency module loading when main module-loader.js fails
 */

(function() {
    'use strict';
    
    // Prevent multiple initialization
    if (window.ModuleLoaderFallback) {
        return;
    }
    
    // Basic error logging
    function logError(error, context = 'unknown') {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context: context,
            message: error.message || error,
            stack: error.stack || 'No stack trace'
        };
        
        console.error('[ModuleLoaderFallback]', errorEntry);
        
        // Store in localStorage for debugging
        try {
            const stored = JSON.parse(localStorage.getItem('eksamensklar_module_fallback_errors') || '[]');
            stored.push(errorEntry);
            if (stored.length > 20) {
                stored.splice(0, stored.length - 20);
            }
            localStorage.setItem('eksamensklar_module_fallback_errors', JSON.stringify(stored));
        } catch (e) {
            console.warn('[ModuleLoaderFallback] Could not store error:', e);
        }
    }
    
    // Simple module cache
    const moduleCache = new Map();
    const loadingModules = new Set();
    const failedModules = new Set();
    
    // Basic module configurations
    const moduleConfigs = {
        'home': {
            path: 'modules/home/home.js',
            css: 'modules/home/home.css',
            critical: true
        },
        'content': {
            path: 'modules/content/content.js',
            css: 'modules/content/content.css',
            critical: true
        },
        'flashcards': {
            path: 'modules/flashcards/flashcards.js',
            css: 'modules/flashcards/flashcards.css',
            dependencies: ['content']
        },
        'quiz': {
            path: 'modules/quiz/quiz.js',
            css: 'modules/quiz/quiz.css',
            dependencies: ['content']
        },
        'dashboard': {
            path: 'modules/dashboard/dashboard.js',
            css: 'modules/dashboard/dashboard.css'
        },
        'subjects': {
            path: 'modules/subjects/subjects.js',
            css: 'modules/subjects/subjects.css'
        },
        'ai-assistant': {
            path: 'modules/ai-assistant/ai-assistant.js',
            css: 'modules/ai-assistant/ai-assistant.css'
        },
        'advanced': {
            path: 'modules/advanced/advanced.js',
            css: 'modules/advanced/advanced.css'
        },
        'onboarding': {
            path: 'modules/onboarding/onboarding.js',
            css: 'modules/onboarding/onboarding.css',
            critical: true
        }
    };
    
    // Load CSS file
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            try {
                // Check if already loaded
                const existing = document.querySelector(`link[href="${href}"]`);
                if (existing) {
                    resolve();
                    return;
                }
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                
                link.onload = () => resolve();
                link.onerror = () => {
                    logError(new Error(`Failed to load CSS: ${href}`), 'loadCSS');
                    resolve(); // Don't fail module loading for CSS
                };
                
                document.head.appendChild(link);
            } catch (error) {
                logError(error, 'loadCSS');
                resolve(); // Don't fail module loading for CSS
            }
        });
    }
    
    // Load JavaScript file
    function loadJS(src) {
        return new Promise((resolve, reject) => {
            try {
                // Check if already loaded
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = () => resolve();
                script.onerror = () => {
                    const error = new Error(`Failed to load script: ${src}`);
                    logError(error, 'loadJS');
                    reject(error);
                };
                
                document.head.appendChild(script);
            } catch (error) {
                logError(error, 'loadJS');
                reject(error);
            }
        });
    }
    
    // Load dependencies
    async function loadDependencies(dependencies) {
        if (!dependencies || dependencies.length === 0) {
            return;
        }
        
        try {
            const dependencyPromises = dependencies.map(dep => loadModule(dep));
            await Promise.all(dependencyPromises);
        } catch (error) {
            logError(error, 'loadDependencies');
            throw error;
        }
    }
    
    // Main module loading function
    async function loadModule(moduleName) {
        try {
            // Check if already loaded
            if (moduleCache.has(moduleName)) {
                return moduleCache.get(moduleName);
            }
            
            // Check if currently loading
            if (loadingModules.has(moduleName)) {
                // Wait for loading to complete
                return new Promise((resolve, reject) => {
                    const checkLoaded = () => {
                        if (moduleCache.has(moduleName)) {
                            resolve(moduleCache.get(moduleName));
                        } else if (failedModules.has(moduleName)) {
                            reject(new Error(`Module ${moduleName} failed to load`));
                        } else {
                            setTimeout(checkLoaded, 100);
                        }
                    };
                    checkLoaded();
                });
            }
            
            // Check if previously failed
            if (failedModules.has(moduleName)) {
                throw new Error(`Module ${moduleName} previously failed to load`);
            }
            
            // Get module configuration
            const config = moduleConfigs[moduleName];
            if (!config) {
                throw new Error(`Unknown module: ${moduleName}`);
            }
            
            loadingModules.add(moduleName);
            
            try {
                // Load dependencies first
                if (config.dependencies) {
                    await loadDependencies(config.dependencies);
                }
                
                // Load CSS if specified
                if (config.css) {
                    await loadCSS(config.css);
                }
                
                // Load JavaScript
                await loadJS(config.path);
                
                // Mark as loaded
                const moduleData = {
                    name: moduleName,
                    config: config,
                    loadedAt: new Date().toISOString()
                };
                
                moduleCache.set(moduleName, moduleData);
                loadingModules.delete(moduleName);
                
                console.log(`[ModuleLoaderFallback] Successfully loaded module: ${moduleName}`);
                
                // Emit event if EventBus is available
                if (window.AppFallback && window.AppFallback.EventBus) {
                    window.AppFallback.EventBus.emit('module-loaded', {
                        module: moduleName,
                        fallback: true
                    });
                }
                
                return moduleData;
                
            } catch (error) {
                loadingModules.delete(moduleName);
                failedModules.add(moduleName);
                
                logError(error, `loadModule(${moduleName})`);
                
                // Emit error event if EventBus is available
                if (window.AppFallback && window.AppFallback.EventBus) {
                    window.AppFallback.EventBus.emit('module-error', {
                        module: moduleName,
                        error: error.message,
                        fallback: true
                    });
                }
                
                throw error;
            }
            
        } catch (error) {
            logError(error, `loadModule(${moduleName})`);
            throw error;
        }
    }
    
    // Preload critical modules
    async function preloadCriticalModules() {
        try {
            const criticalModules = Object.keys(moduleConfigs)
                .filter(name => moduleConfigs[name].critical);
            
            console.log('[ModuleLoaderFallback] Preloading critical modules:', criticalModules);
            
            const preloadPromises = criticalModules.map(async (moduleName) => {
                try {
                    await loadModule(moduleName);
                } catch (error) {
                    console.warn(`[ModuleLoaderFallback] Failed to preload critical module ${moduleName}:`, error);
                }
            });
            
            await Promise.allSettled(preloadPromises);
            
        } catch (error) {
            logError(error, 'preloadCriticalModules');
        }
    }
    
    // Check if module is loaded
    function isModuleLoaded(moduleName) {
        return moduleCache.has(moduleName);
    }
    
    // Get loaded modules
    function getLoadedModules() {
        return Array.from(moduleCache.keys());
    }
    
    // Get failed modules
    function getFailedModules() {
        return Array.from(failedModules);
    }
    
    // Clear module cache
    function clearCache() {
        moduleCache.clear();
        loadingModules.clear();
        failedModules.clear();
        console.log('[ModuleLoaderFallback] Cache cleared');
    }
    
    // Retry failed module
    async function retryModule(moduleName) {
        try {
            failedModules.delete(moduleName);
            return await loadModule(moduleName);
        } catch (error) {
            logError(error, `retryModule(${moduleName})`);
            throw error;
        }
    }
    
    // Get module status
    function getModuleStatus(moduleName) {
        if (moduleCache.has(moduleName)) {
            return 'loaded';
        } else if (loadingModules.has(moduleName)) {
            return 'loading';
        } else if (failedModules.has(moduleName)) {
            return 'failed';
        } else {
            return 'not-loaded';
        }
    }
    
    // Initialize fallback module loader
    function init() {
        try {
            console.log('[ModuleLoaderFallback] Initializing fallback module loader');
            
            // Show notification if AppFallback is available
            if (window.AppFallback && window.AppFallback.showNotification) {
                window.AppFallback.showNotification(
                    'Module loader running in fallback mode',
                    'warning',
                    6000
                );
            }
            
            // Preload critical modules
            preloadCriticalModules();
            
        } catch (error) {
            logError(error, 'init');
        }
    }
    
    // Export fallback module loader API
    window.ModuleLoaderFallback = {
        version: '1.0.0',
        loadModule: loadModule,
        preloadCriticalModules: preloadCriticalModules,
        isModuleLoaded: isModuleLoaded,
        getLoadedModules: getLoadedModules,
        getFailedModules: getFailedModules,
        getModuleStatus: getModuleStatus,
        retryModule: retryModule,
        clearCache: clearCache,
        moduleConfigs: moduleConfigs,
        init: init
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();