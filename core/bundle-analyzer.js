/**
 * Bundle Analyzer for EksamensKlar
 * Analyzes bundle size, dependencies, and provides optimization recommendations
 */

class BundleAnalyzer {
    constructor() {
        this.moduleMap = new Map();
        this.dependencyGraph = new Map();
        this.loadTimes = new Map();
        this.criticalPath = [];
        this.recommendations = [];
        this.init();
    }

    init() {
        this.setupPerformanceObserver();
        this.analyzeStaticAssets();
        this.setupModuleTracking();
    }

    /**
     * Analyze all static assets and their sizes
     */
    async analyzeStaticAssets() {
        const assets = {
            core: [
                '/core/app.js',
                '/core/global.css',
                '/core/performance.js',
                '/core/module-loader.js',
                '/core/cache-strategy.js'
            ],
            modules: [
                '/modules/subjects/subjects.js',
                '/modules/content/content.js',
                '/modules/flashcards/flashcards.js',
                '/modules/quiz/quiz.js',
                '/modules/progress/progress.js',
                '/modules/calendar/calendar.js',
                '/modules/notes/notes.js',
                '/modules/goals/goals.js',
                '/modules/analytics/analytics.js',
                '/modules/collaboration/collaboration.js'
            ],
            styles: [
                '/modules/subjects/subjects.css',
                '/modules/content/content.css',
                '/modules/flashcards/flashcards.css',
                '/modules/quiz/quiz.css',
                '/modules/progress/progress.css'
            ],
            advanced: [
                '/advanced/ai-tutor/ai-tutor.js',
                '/advanced/voice-notes/voice-notes.js',
                '/advanced/offline-sync/offline-sync.js',
                '/advanced/real-time-collab/real-time-collab.js'
            ]
        };

        const analysis = {
            totalSize: 0,
            categories: {},
            largestFiles: [],
            duplicates: [],
            unused: []
        };

        for (const [category, files] of Object.entries(assets)) {
            analysis.categories[category] = {
                files: [],
                totalSize: 0,
                loadTime: 0
            };

            for (const file of files) {
                try {
                    const fileAnalysis = await this.analyzeFile(file);
                    analysis.categories[category].files.push(fileAnalysis);
                    analysis.categories[category].totalSize += fileAnalysis.size;
                    analysis.totalSize += fileAnalysis.size;
                } catch (error) {
                    console.warn(`Could not analyze ${file}:`, error.message);
                }
            }
        }

        // Find largest files
        const allFiles = Object.values(analysis.categories)
            .flatMap(cat => cat.files)
            .sort((a, b) => b.size - a.size);
        
        analysis.largestFiles = allFiles.slice(0, 10);

        // Detect potential duplicates
        analysis.duplicates = this.detectDuplicates(allFiles);

        // Generate recommendations
        this.generateOptimizationRecommendations(analysis);

        this.bundleAnalysis = analysis;
        console.log('📊 Bundle analysis completed:', analysis);
        
        return analysis;
    }

    /**
     * Analyze individual file
     */
    async analyzeFile(filePath) {
        const startTime = performance.now();
        
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            const size = parseInt(response.headers.get('content-length') || '0');
            const lastModified = response.headers.get('last-modified');
            const contentType = response.headers.get('content-type');
            
            const loadTime = performance.now() - startTime;
            
            const analysis = {
                path: filePath,
                size,
                loadTime,
                lastModified: lastModified ? new Date(lastModified) : null,
                contentType,
                compressed: response.headers.get('content-encoding') === 'gzip',
                cached: response.headers.get('cache-control') ? true : false
            };

            // Analyze content if it's a JavaScript file
            if (contentType && contentType.includes('javascript')) {
                analysis.dependencies = await this.analyzeJSDependencies(filePath);
                analysis.complexity = await this.analyzeComplexity(filePath);
            }

            return analysis;
        } catch (error) {
            // Estimate size for files that can't be fetched
            return {
                path: filePath,
                size: this.estimateFileSize(filePath),
                loadTime: 0,
                error: error.message,
                estimated: true
            };
        }
    }

    /**
     * Analyze JavaScript dependencies
     */
    async analyzeJSDependencies(filePath) {
        try {
            const response = await fetch(filePath);
            const content = await response.text();
            
            const dependencies = {
                imports: [],
                exports: [],
                globals: [],
                functions: [],
                classes: []
            };

            // Extract imports
            const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                dependencies.imports.push(match[1]);
            }

            // Extract exports
            const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = exportRegex.exec(content)) !== null) {
                dependencies.exports.push(match[1]);
            }

            // Extract global variables
            const globalRegex = /window\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = globalRegex.exec(content)) !== null) {
                dependencies.globals.push(match[1]);
            }

            // Extract function declarations
            const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = functionRegex.exec(content)) !== null) {
                dependencies.functions.push(match[1]);
            }

            // Extract class declarations
            const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            while ((match = classRegex.exec(content)) !== null) {
                dependencies.classes.push(match[1]);
            }

            return dependencies;
        } catch (error) {
            console.warn(`Could not analyze dependencies for ${filePath}:`, error);
            return { error: error.message };
        }
    }

    /**
     * Analyze code complexity
     */
    async analyzeComplexity(filePath) {
        try {
            const response = await fetch(filePath);
            const content = await response.text();
            
            const lines = content.split('\n');
            const complexity = {
                lines: lines.length,
                codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
                functions: (content.match(/function\s+/g) || []).length,
                classes: (content.match(/class\s+/g) || []).length,
                conditionals: (content.match(/\b(if|else|switch|case)\b/g) || []).length,
                loops: (content.match(/\b(for|while|do)\b/g) || []).length,
                complexity: 0
            };

            // Calculate cyclomatic complexity (simplified)
            complexity.complexity = 1 + complexity.conditionals + complexity.loops;

            return complexity;
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Detect potential duplicate code
     */
    detectDuplicates(files) {
        const duplicates = [];
        const sizeGroups = new Map();

        // Group files by size
        files.forEach(file => {
            if (!sizeGroups.has(file.size)) {
                sizeGroups.set(file.size, []);
            }
            sizeGroups.get(file.size).push(file);
        });

        // Find potential duplicates (same size)
        sizeGroups.forEach((group, size) => {
            if (group.length > 1 && size > 1024) { // Only consider files > 1KB
                duplicates.push({
                    size,
                    files: group.map(f => f.path),
                    potentialSavings: size * (group.length - 1)
                });
            }
        });

        return duplicates;
    }

    /**
     * Generate optimization recommendations
     */
    generateOptimizationRecommendations(analysis) {
        this.recommendations = [];

        // Large file recommendations
        const largeFiles = analysis.largestFiles.filter(f => f.size > 100 * 1024); // > 100KB
        if (largeFiles.length > 0) {
            this.recommendations.push({
                type: 'size',
                priority: 'high',
                title: 'Large Files Detected',
                description: `${largeFiles.length} files are larger than 100KB`,
                files: largeFiles.map(f => f.path),
                suggestions: [
                    'Consider code splitting for large modules',
                    'Implement lazy loading for non-critical features',
                    'Minify and compress large JavaScript files',
                    'Use dynamic imports for advanced features'
                ]
            });
        }

        // Duplicate recommendations
        if (analysis.duplicates.length > 0) {
            const totalSavings = analysis.duplicates.reduce((sum, dup) => sum + dup.potentialSavings, 0);
            this.recommendations.push({
                type: 'duplicates',
                priority: 'medium',
                title: 'Potential Duplicate Files',
                description: `Could save ${this.formatSize(totalSavings)} by removing duplicates`,
                duplicates: analysis.duplicates,
                suggestions: [
                    'Review files with identical sizes',
                    'Extract common functionality into shared modules',
                    'Use module bundling to eliminate duplicates'
                ]
            });
        }

        // Bundle size recommendations
        if (analysis.totalSize > 2 * 1024 * 1024) { // > 2MB
            this.recommendations.push({
                type: 'bundle-size',
                priority: 'high',
                title: 'Large Total Bundle Size',
                description: `Total bundle size is ${this.formatSize(analysis.totalSize)}`,
                suggestions: [
                    'Implement aggressive code splitting',
                    'Load advanced features only when needed',
                    'Use tree shaking to remove unused code',
                    'Consider using a CDN for large libraries'
                ]
            });
        }

        // Module-specific recommendations
        Object.entries(analysis.categories).forEach(([category, data]) => {
            if (data.totalSize > 500 * 1024) { // > 500KB per category
                this.recommendations.push({
                    type: 'category-size',
                    priority: 'medium',
                    title: `Large ${category} Category`,
                    description: `${category} files total ${this.formatSize(data.totalSize)}`,
                    category,
                    suggestions: [
                        `Split ${category} into smaller chunks`,
                        `Lazy load non-critical ${category} features`,
                        `Review if all ${category} files are necessary`
                    ]
                });
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource') {
                        this.trackResourceLoad(entry);
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
        }
    }

    /**
     * Track resource loading performance
     */
    trackResourceLoad(entry) {
        const resourceData = {
            name: entry.name,
            size: entry.transferSize || entry.encodedBodySize || 0,
            loadTime: entry.responseEnd - entry.startTime,
            cached: entry.transferSize === 0 && entry.encodedBodySize > 0,
            type: this.getResourceType(entry.name)
        };

        this.loadTimes.set(entry.name, resourceData);

        // Track slow loading resources
        if (resourceData.loadTime > 1000) { // > 1 second
            console.warn(`🐌 Slow loading resource: ${entry.name} (${resourceData.loadTime.toFixed(0)}ms)`);
        }
    }

    /**
     * Setup module loading tracking
     */
    setupModuleTracking() {
        // Override dynamic import to track module loading
        const originalImport = window.import || (() => {});
        
        window.trackModuleLoad = (moduleName, loadPromise) => {
            const startTime = performance.now();
            
            return loadPromise.then(module => {
                const loadTime = performance.now() - startTime;
                this.moduleMap.set(moduleName, {
                    loadTime,
                    timestamp: Date.now(),
                    size: this.estimateModuleSize(module)
                });
                
                console.log(`📦 Module '${moduleName}' loaded in ${loadTime.toFixed(0)}ms`);
                return module;
            }).catch(error => {
                console.error(`❌ Failed to load module '${moduleName}':`, error);
                throw error;
            });
        };
    }

    /**
     * Estimate file size based on path
     */
    estimateFileSize(filePath) {
        const estimates = {
            '.js': 15000,   // 15KB average
            '.css': 8000,   // 8KB average
            '.html': 3000,  // 3KB average
            '.json': 2000   // 2KB average
        };

        const extension = filePath.substring(filePath.lastIndexOf('.'));
        return estimates[extension] || 5000; // 5KB default
    }

    /**
     * Estimate module size
     */
    estimateModuleSize(module) {
        try {
            return JSON.stringify(module).length * 2; // Rough estimate
        } catch (error) {
            return 10000; // 10KB default
        }
    }

    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.includes('.js')) return 'javascript';
        if (url.includes('.css')) return 'stylesheet';
        if (url.includes('.html')) return 'document';
        if (url.includes('.json')) return 'data';
        if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
        return 'other';
    }

    /**
     * Format file size
     */
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

    /**
     * Generate optimization report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            analysis: this.bundleAnalysis,
            recommendations: this.recommendations,
            modulePerformance: Object.fromEntries(this.moduleMap),
            resourcePerformance: Object.fromEntries(this.loadTimes),
            summary: {
                totalSize: this.bundleAnalysis?.totalSize || 0,
                totalFiles: Object.values(this.bundleAnalysis?.categories || {})
                    .reduce((sum, cat) => sum + cat.files.length, 0),
                highPriorityIssues: this.recommendations.filter(r => r.priority === 'high').length,
                mediumPriorityIssues: this.recommendations.filter(r => r.priority === 'medium').length
            }
        };

        console.log('📊 Bundle Analysis Report:', report);
        return report;
    }

    /**
     * Export report as JSON
     */
    exportReport() {
        const report = this.generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `examklar-bundle-analysis-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📄 Bundle analysis report exported');
    }

    /**
     * Get optimization suggestions for a specific file
     */
    getFileOptimizations(filePath) {
        const suggestions = [];
        
        const fileData = this.loadTimes.get(filePath);
        if (!fileData) return suggestions;

        if (fileData.size > 100 * 1024) {
            suggestions.push('Consider code splitting this large file');
        }

        if (fileData.loadTime > 1000) {
            suggestions.push('Optimize loading performance (>1s load time)');
        }

        if (!fileData.cached) {
            suggestions.push('Enable caching for this resource');
        }

        return suggestions;
    }
}

// Initialize bundle analyzer
const bundleAnalyzer = new BundleAnalyzer();

// Export for global use
window.bundleAnalyzer = bundleAnalyzer;

// Auto-analyze after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => bundleAnalyzer.analyzeStaticAssets(), 2000);
    });
} else {
    setTimeout(() => bundleAnalyzer.analyzeStaticAssets(), 2000);
}

export default bundleAnalyzer;