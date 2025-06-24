/**
 * DataBridge Real-time Enhancement
 * Provides real-time sync, conflict resolution, data validation and import/export
 */

class DataBridgeRealtime {
    constructor(dataBridge, eventBus) {
        this.dataBridge = dataBridge;
        this.eventBus = eventBus;
        this.syncQueue = [];
        this.conflictResolver = new ConflictResolver();
        this.validator = new DataValidator();
        this.syncStatus = {
            isOnline: navigator.onLine,
            lastSync: null,
            pendingChanges: 0,
            conflicts: []
        };
        
        this.init();
    }

    /**
     * Initialize real-time features
     */
    init() {
        this.setupNetworkMonitoring();
        this.setupAutoSync();
        this.setupConflictDetection();
        this.setupEventListeners();
        
        console.log('🔄 DataBridge Real-time: Initialized');
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.syncStatus.isOnline = true;
            this.eventBus.emit('data', 'network.online', { timestamp: Date.now() });
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.syncStatus.isOnline = false;
            this.eventBus.emit('data', 'network.offline', { timestamp: Date.now() });
        });
    }

    /**
     * Setup automatic synchronization
     */
    setupAutoSync() {
        // Sync every 30 seconds when online
        setInterval(() => {
            if (this.syncStatus.isOnline && this.syncQueue.length > 0) {
                this.processSyncQueue();
            }
        }, 30000);

        // Sync on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.syncStatus.isOnline) {
                this.processSyncQueue();
            }
        });
    }

    /**
     * Setup conflict detection
     */
    setupConflictDetection() {
        this.eventBus.on('data', 'updated', (data) => {
            this.detectConflicts(data);
        });
    }

    /**
     * Setup event listeners for real-time features
     */
    setupEventListeners() {
        // Listen for data changes
        this.eventBus.on('data', 'change', (data) => {
            this.handleDataChange(data);
        });

        // Listen for sync requests
        this.eventBus.on('data', 'sync.request', (data) => {
            this.handleSyncRequest(data);
        });

        // Listen for conflict resolution
        this.eventBus.on('data', 'conflict.resolve', (data) => {
            this.resolveConflict(data);
        });

        // Listen for validation requests
        this.eventBus.on('data', 'validate', (data) => {
            this.validateData(data);
        });
    }

    /**
     * Handle data changes for real-time sync
     * @param {Object} changeData - Data change information
     */
    handleDataChange(changeData) {
        const { type, key, data, timestamp, source } = changeData;
        
        // Validate data before processing
        const validation = this.validator.validate(type, data);
        if (!validation.isValid) {
            this.eventBus.emit('data', 'validation.error', {
                type,
                key,
                errors: validation.errors,
                timestamp: Date.now()
            });
            return;
        }

        // Add to sync queue
        const syncItem = {
            id: this.generateSyncId(),
            type,
            key,
            data,
            timestamp: timestamp || Date.now(),
            source: source || 'local',
            status: 'pending'
        };

        this.syncQueue.push(syncItem);
        this.syncStatus.pendingChanges++;

        // Emit sync status update
        this.eventBus.emit('data', 'sync.status', {
            pendingChanges: this.syncStatus.pendingChanges,
            queueLength: this.syncQueue.length
        });

        // Process immediately if online
        if (this.syncStatus.isOnline) {
            this.processSyncQueue();
        }
    }

    /**
     * Process sync queue
     */
    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;

        console.log(`🔄 Processing ${this.syncQueue.length} sync items`);
        
        const batch = this.syncQueue.splice(0, 10); // Process in batches of 10
        
        for (const item of batch) {
            try {
                await this.syncItem(item);
                item.status = 'synced';
                this.syncStatus.pendingChanges--;
            } catch (error) {
                console.error('🚨 Sync error:', error);
                item.status = 'error';
                item.error = error.message;
                
                // Re-add to queue for retry
                this.syncQueue.push(item);
            }
        }

        this.syncStatus.lastSync = Date.now();
        
        this.eventBus.emit('data', 'sync.completed', {
            processedItems: batch.length,
            pendingChanges: this.syncStatus.pendingChanges,
            lastSync: this.syncStatus.lastSync
        });
    }

    /**
     * Sync individual item
     * @param {Object} item - Sync item
     */
    async syncItem(item) {
        // Simulate real-time sync (in real implementation, this would sync with server)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional sync failures
                if (Math.random() < 0.1) {
                    reject(new Error('Network timeout'));
                } else {
                    resolve();
                }
            }, 100 + Math.random() * 200);
        });
    }

    /**
     * Detect conflicts in data
     * @param {Object} data - Data to check for conflicts
     */
    detectConflicts(data) {
        const { type, timestamp } = data;
        
        // Check for concurrent modifications
        const existingData = this.dataBridge.getTrainingData();
        if (existingData && existingData.meta) {
            const lastModified = new Date(existingData.meta.lastUpdated).getTime();
            const changeTime = timestamp || Date.now();
            
            // If data was modified within 5 seconds, potential conflict
            if (Math.abs(changeTime - lastModified) < 5000) {
                const conflict = {
                    id: this.generateConflictId(),
                    type: 'concurrent_modification',
                    dataType: type,
                    timestamp: Date.now(),
                    localData: existingData,
                    incomingData: data,
                    status: 'pending'
                };
                
                this.syncStatus.conflicts.push(conflict);
                
                this.eventBus.emit('data', 'conflict.detected', conflict);
            }
        }
    }

    /**
     * Resolve data conflict
     * @param {Object} conflictData - Conflict resolution data
     */
    resolveConflict(conflictData) {
        const { conflictId, resolution, mergedData } = conflictData;
        
        const conflict = this.syncStatus.conflicts.find(c => c.id === conflictId);
        if (!conflict) {
            console.warn('🚨 Conflict not found:', conflictId);
            return;
        }

        switch (resolution) {
            case 'use_local':
                // Keep local data, discard incoming
                conflict.resolvedData = conflict.localData;
                break;
                
            case 'use_remote':
                // Use incoming data, discard local
                conflict.resolvedData = conflict.incomingData;
                break;
                
            case 'merge':
                // Use provided merged data
                conflict.resolvedData = mergedData;
                break;
                
            case 'auto_merge':
                // Automatic merge using conflict resolver
                conflict.resolvedData = this.conflictResolver.autoMerge(
                    conflict.localData,
                    conflict.incomingData
                );
                break;
        }

        conflict.status = 'resolved';
        conflict.resolvedAt = Date.now();

        // Apply resolved data
        this.dataBridge.saveTrainingData(conflict.resolvedData);

        this.eventBus.emit('data', 'conflict.resolved', {
            conflictId,
            resolution,
            timestamp: Date.now()
        });
    }

    /**
     * Validate data
     * @param {Object} validationRequest - Validation request
     */
    validateData(validationRequest) {
        const { type, data, requestId } = validationRequest;
        
        const validation = this.validator.validate(type, data);
        
        this.eventBus.emit('data', 'validation.result', {
            requestId,
            type,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings,
            timestamp: Date.now()
        });
    }

    /**
     * Export data
     * @param {Object} exportOptions - Export configuration
     */
    async exportData(exportOptions = {}) {
        const {
            format = 'json',
            includeProgress = true,
            includeHistory = false,
            compress = false
        } = exportOptions;

        try {
            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: '1.0.0',
                    format,
                    source: 'ExamKlar DataBridge'
                },
                onboarding: this.dataBridge.getOnboardingData(),
                training: this.dataBridge.getTrainingData()
            };

            if (includeProgress) {
                exportData.progress = this.dataBridge.getProgressSummary();
            }

            if (includeHistory) {
                exportData.history = this.getSyncHistory();
            }

            let result;
            switch (format) {
                case 'json':
                    result = JSON.stringify(exportData, null, 2);
                    break;
                case 'csv':
                    result = this.convertToCSV(exportData);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            if (compress) {
                // In real implementation, would use compression library
                result = this.compressData(result);
            }

            this.eventBus.emit('data', 'export.completed', {
                format,
                size: result.length,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            this.eventBus.emit('data', 'export.error', {
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Import data
     * @param {string} importData - Data to import
     * @param {Object} importOptions - Import configuration
     */
    async importData(importData, importOptions = {}) {
        const {
            format = 'json',
            merge = false,
            validate = true,
            backup = true
        } = importOptions;

        try {
            // Create backup if requested
            if (backup) {
                await this.createBackup();
            }

            let parsedData;
            switch (format) {
                case 'json':
                    parsedData = JSON.parse(importData);
                    break;
                case 'csv':
                    parsedData = this.parseCSV(importData);
                    break;
                default:
                    throw new Error(`Unsupported import format: ${format}`);
            }

            // Validate imported data
            if (validate) {
                const validation = this.validator.validateImport(parsedData);
                if (!validation.isValid) {
                    throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Import data
            if (merge) {
                await this.mergeImportedData(parsedData);
            } else {
                await this.replaceWithImportedData(parsedData);
            }

            this.eventBus.emit('data', 'import.completed', {
                format,
                merge,
                timestamp: Date.now()
            });

            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            this.eventBus.emit('data', 'import.error', {
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * Create data backup
     */
    async createBackup() {
        const backupData = await this.exportData({ includeHistory: true });
        const backupKey = `examklar_backup_${Date.now()}`;
        
        localStorage.setItem(backupKey, backupData);
        
        // Keep only last 5 backups
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('examklar_backup_'))
            .sort()
            .reverse();
            
        if (backupKeys.length > 5) {
            backupKeys.slice(5).forEach(key => {
                localStorage.removeItem(key);
            });
        }

        this.eventBus.emit('data', 'backup.created', {
            backupKey,
            timestamp: Date.now()
        });
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            ...this.syncStatus,
            queueLength: this.syncQueue.length
        };
    }

    /**
     * Get sync history
     */
    getSyncHistory() {
        // In real implementation, would retrieve from persistent storage
        return {
            totalSyncs: 0,
            lastSync: this.syncStatus.lastSync,
            conflicts: this.syncStatus.conflicts.length,
            errors: 0
        };
    }

    /**
     * Generate unique sync ID
     */
    generateSyncId() {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique conflict ID
     */
    generateConflictId() {
        return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        // Simplified CSV conversion
        return 'CSV export not implemented in demo';
    }

    /**
     * Parse CSV data
     */
    parseCSV(csvData) {
        // Simplified CSV parsing
        throw new Error('CSV import not implemented in demo');
    }

    /**
     * Compress data
     */
    compressData(data) {
        // Simplified compression
        return data;
    }

    /**
     * Merge imported data with existing data
     */
    async mergeImportedData(importedData) {
        const existingData = this.dataBridge.getTrainingData();
        const mergedData = this.conflictResolver.autoMerge(existingData, importedData.training);
        
        this.dataBridge.saveTrainingData(mergedData);
    }

    /**
     * Replace existing data with imported data
     */
    async replaceWithImportedData(importedData) {
        if (importedData.onboarding) {
            localStorage.setItem(
                this.dataBridge.KEYS.ONBOARDING_DATA,
                JSON.stringify(importedData.onboarding)
            );
        }
        
        if (importedData.training) {
            this.dataBridge.saveTrainingData(importedData.training);
        }
    }
}

/**
 * Conflict Resolution System
 */
class ConflictResolver {
    /**
     * Automatically merge two data objects
     * @param {Object} localData - Local data
     * @param {Object} remoteData - Remote data
     */
    autoMerge(localData, remoteData) {
        if (!localData) return remoteData;
        if (!remoteData) return localData;

        const merged = { ...localData };

        // Merge progress data (take highest values)
        if (remoteData.progress && localData.progress) {
            merged.progress = this.mergeProgress(localData.progress, remoteData.progress);
        }

        // Merge completed items (union)
        if (remoteData.content && localData.content) {
            merged.content.completed = [
                ...new Set([...localData.content.completed, ...remoteData.content.completed])
            ];
        }

        // Update metadata
        merged.meta = {
            ...localData.meta,
            lastUpdated: new Date().toISOString(),
            mergedAt: new Date().toISOString(),
            mergeSource: 'auto'
        };

        return merged;
    }

    /**
     * Merge progress data
     */
    mergeProgress(localProgress, remoteProgress) {
        const merged = { ...localProgress };

        Object.keys(remoteProgress).forEach(key => {
            if (typeof remoteProgress[key] === 'number' && typeof localProgress[key] === 'number') {
                merged[key] = Math.max(localProgress[key], remoteProgress[key]);
            } else if (!localProgress[key]) {
                merged[key] = remoteProgress[key];
            }
        });

        return merged;
    }
}

/**
 * Data Validation System
 */
class DataValidator {
    constructor() {
        this.schemas = {
            onboarding: {
                required: ['subject', 'examDate'],
                properties: {
                    subject: { type: 'string', minLength: 1 },
                    examDate: { type: 'string' },
                    subjectEmoji: { type: 'string' },
                    daysToExam: { type: 'number', minimum: 0 }
                }
            },
            training: {
                required: ['subject', 'content', 'flashcards', 'quiz'],
                properties: {
                    subject: { type: 'object' },
                    content: { type: 'object' },
                    flashcards: { type: 'object' },
                    quiz: { type: 'object' },
                    meta: { type: 'object' }
                }
            },
            progress: {
                properties: {
                    totalActivities: { type: 'number', minimum: 0 },
                    completedActivities: { type: 'number', minimum: 0 },
                    streakCount: { type: 'number', minimum: 0 }
                }
            }
        };
    }

    /**
     * Validate data against schema
     * @param {string} type - Data type
     * @param {Object} data - Data to validate
     */
    validate(type, data) {
        const schema = this.schemas[type];
        if (!schema) {
            return { isValid: true, errors: [], warnings: ['Unknown data type'] };
        }

        const errors = [];
        const warnings = [];

        // Check required fields
        if (schema.required) {
            schema.required.forEach(field => {
                if (!data || data[field] === undefined || data[field] === null) {
                    errors.push(`Missing required field: ${field}`);
                }
            });
        }

        // Check property types and constraints
        if (schema.properties && data) {
            Object.keys(schema.properties).forEach(prop => {
                if (data[prop] !== undefined) {
                    const propSchema = schema.properties[prop];
                    const value = data[prop];

                    // Type checking
                    if (propSchema.type && typeof value !== propSchema.type) {
                        errors.push(`Invalid type for ${prop}: expected ${propSchema.type}, got ${typeof value}`);
                    }

                    // String constraints
                    if (propSchema.type === 'string' && typeof value === 'string') {
                        if (propSchema.minLength && value.length < propSchema.minLength) {
                            errors.push(`${prop} is too short (minimum ${propSchema.minLength} characters)`);
                        }
                        if (propSchema.maxLength && value.length > propSchema.maxLength) {
                            warnings.push(`${prop} is very long (${value.length} characters)`);
                        }
                    }

                    // Number constraints
                    if (propSchema.type === 'number' && typeof value === 'number') {
                        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
                            errors.push(`${prop} is below minimum value (${propSchema.minimum})`);
                        }
                        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
                            warnings.push(`${prop} is above maximum value (${propSchema.maximum})`);
                        }
                    }
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate imported data
     * @param {Object} importData - Imported data
     */
    validateImport(importData) {
        const errors = [];
        const warnings = [];

        // Check metadata
        if (!importData.metadata) {
            warnings.push('No metadata found in import');
        }

        // Validate each data section
        if (importData.onboarding) {
            const validation = this.validate('onboarding', importData.onboarding);
            errors.push(...validation.errors.map(e => `Onboarding: ${e}`));
            warnings.push(...validation.warnings.map(w => `Onboarding: ${w}`));
        }

        if (importData.training) {
            const validation = this.validate('training', importData.training);
            errors.push(...validation.errors.map(e => `Training: ${e}`));
            warnings.push(...validation.warnings.map(w => `Training: ${w}`));
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataBridgeRealtime, ConflictResolver, DataValidator };
} else {
    window.DataBridgeRealtime = DataBridgeRealtime;
    window.ConflictResolver = ConflictResolver;
    window.DataValidator = DataValidator;
}