/**
 * Monitoring Dashboard Component
 * Real-time dashboard for performance, errors, and analytics
 */

class MonitoringDashboard {
    constructor(config = {}) {
        this.config = {
            enableRealTimeUpdates: true,
            updateInterval: 5000,
            maxDataPoints: 50,
            enableCharts: true,
            enableExport: true,
            position: 'bottom-right',
            minimized: true,
            theme: 'dark',
            ...config
        };

        this.isVisible = false;
        this.isMinimized = this.config.minimized;
        this.performanceMonitor = null;
        this.errorReporter = null;
        this.analyticsService = null;
        this.updateTimer = null;
        this.chartData = {
            performance: [],
            errors: [],
            analytics: []
        };

        this.init();
    }

    /**
     * Initialize the dashboard
     */
    init() {
        this.createDashboard();
        this.setupEventListeners();
        
        if (this.config.enableRealTimeUpdates) {
            this.startRealTimeUpdates();
        }
    }

    /**
     * Set monitoring services
     */
    setServices(performanceMonitor, errorReporter, analyticsService) {
        this.performanceMonitor = performanceMonitor;
        this.errorReporter = errorReporter;
        this.analyticsService = analyticsService;
        this.updateDashboard();
    }

    /**
     * Create dashboard HTML structure
     */
    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'monitoring-dashboard';
        dashboard.className = `monitoring-dashboard ${this.config.theme} ${this.config.position}`;
        
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>📊 Monitoring Dashboard</h3>
                <div class="dashboard-controls">
                    <button class="btn-minimize" title="Minimize/Maximize">−</button>
                    <button class="btn-export" title="Export Data">📥</button>
                    <button class="btn-close" title="Close">×</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="performance">Performance</button>
                    <button class="tab-btn" data-tab="errors">Errors</button>
                    <button class="tab-btn" data-tab="analytics">Analytics</button>
                </div>
                
                <div class="tab-content">
                    <div class="tab-panel active" id="overview-panel">
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-label">Page Load Time</div>
                                <div class="metric-value" id="load-time">--</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Memory Usage</div>
                                <div class="metric-value" id="memory-usage">--</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Error Count</div>
                                <div class="metric-value" id="error-count">--</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-label">Session Duration</div>
                                <div class="metric-value" id="session-duration">--</div>
                            </div>
                        </div>
                        
                        <div class="status-indicators">
                            <div class="status-item">
                                <span class="status-dot" id="performance-status"></span>
                                <span>Performance</span>
                            </div>
                            <div class="status-item">
                                <span class="status-dot" id="error-status"></span>
                                <span>Error Rate</span>
                            </div>
                            <div class="status-item">
                                <span class="status-dot" id="analytics-status"></span>
                                <span>Analytics</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="performance-panel">
                        <div class="chart-container">
                            <canvas id="performance-chart"></canvas>
                        </div>
                        <div class="performance-details">
                            <div class="detail-item">
                                <span>FCP:</span>
                                <span id="fcp-value">--</span>
                            </div>
                            <div class="detail-item">
                                <span>LCP:</span>
                                <span id="lcp-value">--</span>
                            </div>
                            <div class="detail-item">
                                <span>FID:</span>
                                <span id="fid-value">--</span>
                            </div>
                            <div class="detail-item">
                                <span>CLS:</span>
                                <span id="cls-value">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="errors-panel">
                        <div class="error-summary">
                            <div class="error-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Total Errors:</span>
                                    <span class="stat-value" id="total-errors">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">JS Errors:</span>
                                    <span class="stat-value" id="js-errors">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Network Errors:</span>
                                    <span class="stat-value" id="network-errors">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="error-list" id="error-list">
                            <!-- Error items will be populated here -->
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="analytics-panel">
                        <div class="analytics-summary">
                            <div class="analytics-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Page Views:</span>
                                    <span class="stat-value" id="page-views">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Events:</span>
                                    <span class="stat-value" id="events-count">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Conversions:</span>
                                    <span class="stat-value" id="conversions-count">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="recent-events" id="recent-events">
                            <!-- Recent events will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-footer">
                <span class="last-updated">Last updated: <span id="last-updated">--</span></span>
                <span class="connection-status" id="connection-status">🟢 Online</span>
            </div>
        `;

        this.addStyles();
        document.body.appendChild(dashboard);
        this.dashboardElement = dashboard;

        if (this.isMinimized) {
            this.minimize();
        }
    }

    /**
     * Add CSS styles for the dashboard
     */
    addStyles() {
        if (document.getElementById('monitoring-dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'monitoring-dashboard-styles';
        styles.textContent = `
            .monitoring-dashboard {
                position: fixed;
                width: 400px;
                max-height: 600px;
                background: var(--dashboard-bg, #1a1a1a);
                border: 1px solid var(--dashboard-border, #333);
                border-radius: 8px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                color: var(--dashboard-text, #fff);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .monitoring-dashboard.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .monitoring-dashboard.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .monitoring-dashboard.top-right {
                top: 20px;
                right: 20px;
            }
            
            .monitoring-dashboard.top-left {
                top: 20px;
                left: 20px;
            }
            
            .monitoring-dashboard.minimized {
                height: 40px;
                overflow: hidden;
            }
            
            .monitoring-dashboard.dark {
                --dashboard-bg: #1a1a1a;
                --dashboard-border: #333;
                --dashboard-text: #fff;
                --dashboard-accent: #007acc;
            }
            
            .monitoring-dashboard.light {
                --dashboard-bg: #fff;
                --dashboard-border: #ddd;
                --dashboard-text: #333;
                --dashboard-accent: #007acc;
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: var(--dashboard-accent, #007acc);
                cursor: move;
            }
            
            .dashboard-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 4px;
            }
            
            .dashboard-controls button {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .dashboard-controls button:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .dashboard-content {
                max-height: 520px;
                overflow-y: auto;
            }
            
            .dashboard-tabs {
                display: flex;
                background: var(--dashboard-border, #333);
            }
            
            .tab-btn {
                flex: 1;
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: var(--dashboard-text, #fff);
                cursor: pointer;
                font-size: 11px;
                transition: background 0.2s;
            }
            
            .tab-btn:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .tab-btn.active {
                background: var(--dashboard-accent, #007acc);
            }
            
            .tab-panel {
                display: none;
                padding: 12px;
            }
            
            .tab-panel.active {
                display: block;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .metric-card {
                background: rgba(255,255,255,0.05);
                padding: 8px;
                border-radius: 4px;
                text-align: center;
            }
            
            .metric-label {
                font-size: 10px;
                opacity: 0.7;
                margin-bottom: 4px;
            }
            
            .metric-value {
                font-size: 16px;
                font-weight: 600;
                color: var(--dashboard-accent, #007acc);
            }
            
            .status-indicators {
                display: flex;
                justify-content: space-around;
                margin-top: 12px;
            }
            
            .status-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #666;
            }
            
            .status-dot.good { background: #4CAF50; }
            .status-dot.warning { background: #FF9800; }
            .status-dot.error { background: #F44336; }
            
            .chart-container {
                height: 200px;
                margin-bottom: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .performance-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 8px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                font-size: 11px;
            }
            
            .error-summary, .analytics-summary {
                margin-bottom: 12px;
            }
            
            .error-stats, .analytics-stats {
                display: flex;
                justify-content: space-between;
                background: rgba(255,255,255,0.05);
                padding: 8px;
                border-radius: 4px;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-label {
                display: block;
                font-size: 10px;
                opacity: 0.7;
            }
            
            .stat-value {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: var(--dashboard-accent, #007acc);
            }
            
            .error-list, .recent-events {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .error-item, .event-item {
                padding: 6px 8px;
                margin-bottom: 4px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                font-size: 10px;
                border-left: 3px solid var(--dashboard-accent, #007acc);
            }
            
            .error-item.error {
                border-left-color: #F44336;
            }
            
            .error-item.warning {
                border-left-color: #FF9800;
            }
            
            .error-message {
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .error-details {
                opacity: 0.7;
                font-size: 9px;
            }
            
            .dashboard-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 12px;
                background: rgba(255,255,255,0.05);
                font-size: 10px;
                opacity: 0.7;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const dashboard = this.dashboardElement;
        
        // Tab switching
        dashboard.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Control buttons
        dashboard.querySelector('.btn-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });
        
        dashboard.querySelector('.btn-export').addEventListener('click', () => {
            this.exportData();
        });
        
        dashboard.querySelector('.btn-close').addEventListener('click', () => {
            this.hide();
        });
        
        // Make draggable
        this.makeDraggable();
        
        // Network status
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
    }

    /**
     * Make dashboard draggable
     */
    makeDraggable() {
        const header = this.dashboardElement.querySelector('.dashboard-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                this.dashboardElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /**
     * Switch active tab
     */
    switchTab(tabName) {
        // Update tab buttons
        this.dashboardElement.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        this.dashboardElement.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
        
        // Update content for active tab
        this.updateTabContent(tabName);
    }

    /**
     * Update content for specific tab
     */
    updateTabContent(tabName) {
        switch (tabName) {
            case 'performance':
                this.updatePerformanceTab();
                break;
            case 'errors':
                this.updateErrorsTab();
                break;
            case 'analytics':
                this.updateAnalyticsTab();
                break;
        }
    }

    /**
     * Update performance tab
     */
    updatePerformanceTab() {
        if (!this.performanceMonitor) return;
        
        const summary = this.performanceMonitor.getPerformanceSummary();
        
        this.updateElement('fcp-value', summary.firstContentfulPaint ? `${Math.round(summary.firstContentfulPaint)}ms` : '--');
        this.updateElement('lcp-value', '--'); // Will be updated by performance monitor
        this.updateElement('fid-value', '--'); // Will be updated by performance monitor
        this.updateElement('cls-value', '--'); // Will be updated by performance monitor
    }

    /**
     * Update errors tab
     */
    updateErrorsTab() {
        if (!this.errorReporter) return;
        
        const stats = this.errorReporter.getErrorStats();
        
        this.updateElement('total-errors', stats.totalErrors);
        this.updateElement('js-errors', stats.errorTypes.javascript_error || 0);
        this.updateElement('network-errors', stats.errorTypes.network_error || 0);
        
        // Update error list
        const errorList = this.dashboardElement.querySelector('#error-list');
        const errors = this.errorReporter.loadStoredErrors().slice(-10); // Last 10 errors
        
        errorList.innerHTML = errors.map(error => `
            <div class="error-item ${this.getErrorSeverity(error.type)}">
                <div class="error-message">${error.message}</div>
                <div class="error-details">${error.type} • ${new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    /**
     * Update analytics tab
     */
    updateAnalyticsTab() {
        if (!this.analyticsService) return;
        
        const summary = this.analyticsService.getAnalyticsSummary();
        
        this.updateElement('page-views', summary.pageViewsCount);
        this.updateElement('events-count', summary.eventsCount);
        this.updateElement('conversions-count', summary.conversionsCount);
        
        // Update recent events (mock data for now)
        const recentEvents = this.dashboardElement.querySelector('#recent-events');
        recentEvents.innerHTML = `
            <div class="event-item">
                <div class="error-message">Page View</div>
                <div class="error-details">navigation • ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
    }

    /**
     * Get error severity class
     */
    getErrorSeverity(errorType) {
        const severityMap = {
            'javascript_error': 'error',
            'unhandled_promise_rejection': 'error',
            'resource_error': 'warning',
            'network_error': 'warning'
        };
        return severityMap[errorType] || 'error';
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        this.updateTimer = setInterval(() => {
            this.updateDashboard();
        }, this.config.updateInterval);
    }

    /**
     * Stop real-time updates
     */
    stopRealTimeUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    /**
     * Update entire dashboard
     */
    updateDashboard() {
        this.updateOverviewTab();
        this.updateLastUpdated();
        this.updateConnectionStatus(navigator.onLine);
        
        // Update active tab content
        const activeTab = this.dashboardElement.querySelector('.tab-btn.active');
        if (activeTab) {
            this.updateTabContent(activeTab.dataset.tab);
        }
    }

    /**
     * Update overview tab
     */
    updateOverviewTab() {
        // Update load time
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = Math.round(navigation.loadEventEnd - navigation.navigationStart);
            this.updateElement('load-time', `${loadTime}ms`);
        }
        
        // Update memory usage
        if (performance.memory) {
            const memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            this.updateElement('memory-usage', `${memoryUsed}MB`);
        }
        
        // Update error count
        if (this.errorReporter) {
            const stats = this.errorReporter.getErrorStats();
            this.updateElement('error-count', stats.totalErrors);
        }
        
        // Update session duration
        if (this.analyticsService) {
            const summary = this.analyticsService.getAnalyticsSummary();
            const duration = Math.round(summary.sessionDuration / 1000);
            this.updateElement('session-duration', `${duration}s`);
        }
        
        // Update status indicators
        this.updateStatusIndicators();
    }

    /**
     * Update status indicators
     */
    updateStatusIndicators() {
        // Performance status
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.navigationStart;
            const perfStatus = loadTime < 2000 ? 'good' : loadTime < 5000 ? 'warning' : 'error';
            this.updateStatusDot('performance-status', perfStatus);
        }
        
        // Error status
        if (this.errorReporter) {
            const stats = this.errorReporter.getErrorStats();
            const errorStatus = stats.totalErrors === 0 ? 'good' : stats.totalErrors < 5 ? 'warning' : 'error';
            this.updateStatusDot('error-status', errorStatus);
        }
        
        // Analytics status
        if (this.analyticsService) {
            const summary = this.analyticsService.getAnalyticsSummary();
            const analyticsStatus = summary.consentGiven ? 'good' : 'warning';
            this.updateStatusDot('analytics-status', analyticsStatus);
        }
    }

    /**
     * Update status dot
     */
    updateStatusDot(elementId, status) {
        const dot = this.dashboardElement.querySelector(`#${elementId}`);
        if (dot) {
            dot.className = `status-dot ${status}`;
        }
    }

    /**
     * Update element text content
     */
    updateElement(elementId, value) {
        const element = this.dashboardElement.querySelector(`#${elementId}`);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        this.updateElement('last-updated', new Date().toLocaleTimeString());
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(isOnline) {
        const status = this.dashboardElement.querySelector('#connection-status');
        if (status) {
            status.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
        }
    }

    /**
     * Toggle minimize/maximize
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.minimize();
        } else {
            this.maximize();
        }
    }

    /**
     * Minimize dashboard
     */
    minimize() {
        this.dashboardElement.classList.add('minimized');
        this.dashboardElement.querySelector('.btn-minimize').textContent = '+';
        this.isMinimized = true;
    }

    /**
     * Maximize dashboard
     */
    maximize() {
        this.dashboardElement.classList.remove('minimized');
        this.dashboardElement.querySelector('.btn-minimize').textContent = '−';
        this.isMinimized = false;
    }

    /**
     * Show dashboard
     */
    show() {
        this.dashboardElement.style.display = 'block';
        this.isVisible = true;
        
        if (this.config.enableRealTimeUpdates && !this.updateTimer) {
            this.startRealTimeUpdates();
        }
    }

    /**
     * Hide dashboard
     */
    hide() {
        this.dashboardElement.style.display = 'none';
        this.isVisible = false;
        this.stopRealTimeUpdates();
    }

    /**
     * Toggle dashboard visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Export dashboard data
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            performance: this.performanceMonitor?.getPerformanceSummary() || null,
            errors: this.errorReporter?.exportErrors() || null,
            analytics: this.analyticsService?.getAnalyticsSummary() || null
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Destroy dashboard
     */
    destroy() {
        this.stopRealTimeUpdates();
        
        if (this.dashboardElement) {
            this.dashboardElement.remove();
        }
        
        const styles = document.getElementById('monitoring-dashboard-styles');
        if (styles) {
            styles.remove();
        }
    }
}

export default MonitoringDashboard;