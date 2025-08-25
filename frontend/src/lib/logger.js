class Logger {
    constructor(config = {}) {
        this.logs = [];
        this.logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.config = {
            minLevel: 'info',
            maxEntries: 5000,
            persistToStorage: true,
            consoleOutput: process.env.NODE_ENV === 'development',
            categories: new Set(['general', 'api', 'websocket', 'chart', 'user', 'performance', 'error']),
            ...config
        };
        this.sessionId = this.generateSessionId();
        this.loadPersistedLogs();
        this.setupGlobalErrorHandling();
        this.setupPerformanceMonitoring();
    }
    generateSessionId() {
        return `log_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    loadPersistedLogs() {
        if (!this.config.persistToStorage)
            return;
        try {
            const stored = localStorage.getItem('novasignal_logs');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    this.logs = parsed.slice(-this.config.maxEntries);
                }
            }
        }
        catch (error) {
            console.warn('Failed to load persisted logs:', error);
        }
    }
    persistLogs() {
        if (!this.config.persistToStorage)
            return;
        try {
            const logsToStore = this.logs.slice(-this.config.maxEntries);
            localStorage.setItem('novasignal_logs', JSON.stringify(logsToStore));
        }
        catch (error) {
            console.warn('Failed to persist logs:', error);
        }
    }
    setupGlobalErrorHandling() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.error('Unhandled JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise.toString()
            });
        });
    }
    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window && 'navigation' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    this.performance('Page Load Performance', {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        totalTime: perfData.loadEventEnd - perfData.fetchStart,
                        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcpConnect: perfData.connectEnd - perfData.connectStart,
                        serverResponse: perfData.responseEnd - perfData.requestStart
                    });
                }, 1000);
            });
        }
        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo) {
                    this.performance('Memory Usage', {
                        usedJSHeapSize: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
                        totalJSHeapSize: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
                        jsHeapSizeLimit: Math.round(memInfo.jsHeapSizeLimit / 1048576) // MB
                    });
                }
            }, 60000); // Every minute
        }
    }
    log(level, category, message, data) {
        // Check if logging is enabled for this level and category
        if (this.logLevels[level] < this.logLevels[this.config.minLevel])
            return;
        if (!this.config.categories.has(category))
            return;
        const entry = {
            timestamp: Date.now(),
            level,
            category,
            message,
            data,
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        // Add stack trace for errors
        if (level === 'error') {
            entry.stackTrace = new Error().stack;
        }
        this.logs.push(entry);
        // Keep logs within limit
        if (this.logs.length > this.config.maxEntries) {
            this.logs = this.logs.slice(-this.config.maxEntries);
        }
        // Console output
        if (this.config.consoleOutput) {
            const timestamp = new Date(entry.timestamp).toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
            switch (level) {
                case 'debug':
                    console.debug(prefix, message, data);
                    break;
                case 'info':
                    console.info(prefix, message, data);
                    break;
                case 'warn':
                    console.warn(prefix, message, data);
                    break;
                case 'error':
                    console.error(prefix, message, data);
                    break;
            }
        }
        // Persist logs periodically
        if (this.logs.length % 50 === 0) {
            this.persistLogs();
        }
    }
    // Public logging methods
    debug(message, data, category = 'general') {
        this.log('debug', category, message, data);
    }
    info(message, data, category = 'general') {
        this.log('info', category, message, data);
    }
    warn(message, data, category = 'general') {
        this.log('warn', category, message, data);
    }
    error(message, data, category = 'error') {
        this.log('error', category, message, data);
    }
    // Specialized logging methods
    api(message, data, level = 'info') {
        this.log(level, 'api', message, data);
    }
    websocket(message, data, level = 'info') {
        this.log(level, 'websocket', message, data);
    }
    chart(message, data, level = 'info') {
        this.log(level, 'chart', message, data);
    }
    user(message, data, level = 'info') {
        this.log(level, 'user', message, data);
    }
    performance(message, data) {
        this.log('info', 'performance', message, data);
    }
    // API call logging helper
    logApiCall(method, url, duration, status, success, responseSize) {
        const level = success ? 'info' : 'warn';
        this.api(`API Call: ${method} ${url}`, {
            method,
            url,
            duration,
            status,
            success,
            responseSize
        }, level);
    }
    // WebSocket event logging
    logWebSocketEvent(event, data, connectionStatus) {
        this.websocket(`WebSocket: ${event}`, {
            event,
            data,
            connectionStatus,
            timestamp: Date.now()
        });
    }
    // Chart interaction logging
    logChartAction(action, symbol, details) {
        this.chart(`Chart Action: ${action}`, {
            action,
            symbol,
            ...details,
            timestamp: Date.now()
        });
    }
    // User action logging
    logUserAction(action, context) {
        this.user(`User Action: ${action}`, {
            action,
            ...context,
            timestamp: Date.now()
        });
    }
    // Performance measurement utilities
    time(label, category = 'performance') {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            this.performance(`Timer: ${label}`, { duration, label });
        };
    }
    timeAsync(label, promise, category = 'performance') {
        const start = performance.now();
        return promise.finally(() => {
            const duration = performance.now() - start;
            this.performance(`Async Timer: ${label}`, { duration, label });
        });
    }
    // Error handling utilities
    logError(error, context, category = 'error') {
        this.error(`Error: ${error.message}`, {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...context
        }, category);
    }
    logApiError(url, method, error, status) {
        this.api(`API Error: ${method} ${url}`, {
            url,
            method,
            error: error.message,
            stack: error.stack,
            status
        }, 'error');
    }
    // Query and analysis methods
    getLogs(filter) {
        let filtered = this.logs;
        if (filter?.level) {
            const minLevel = this.logLevels[filter.level];
            filtered = filtered.filter(log => this.logLevels[log.level] >= minLevel);
        }
        if (filter?.category) {
            filtered = filtered.filter(log => log.category === filter.category);
        }
        if (filter?.since) {
            filtered = filtered.filter(log => log.timestamp >= filter.since);
        }
        if (filter?.until) {
            filtered = filtered.filter(log => log.timestamp <= filter.until);
        }
        if (filter?.search) {
            const searchTerm = filter.search.toLowerCase();
            filtered = filtered.filter(log => log.message.toLowerCase().includes(searchTerm) ||
                JSON.stringify(log.data).toLowerCase().includes(searchTerm));
        }
        if (filter?.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        return filtered;
    }
    getLogSummary(timeRange) {
        const since = timeRange ? Date.now() - timeRange : 0;
        const logs = this.getLogs({ since });
        const byLevel = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0
        };
        const byCategory = {
            general: 0,
            api: 0,
            websocket: 0,
            chart: 0,
            user: 0,
            performance: 0,
            error: 0
        };
        logs.forEach(log => {
            byLevel[log.level]++;
            byCategory[log.category]++;
        });
        const total = logs.length;
        const errorCount = byLevel.error + byLevel.warn;
        const errorRate = total > 0 ? (errorCount / total) * 100 : 0;
        const recentErrors = this.getLogs({
            level: 'warn',
            since: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
            limit: 10
        });
        return {
            total,
            byLevel,
            byCategory,
            errorRate,
            recentErrors
        };
    }
    // Export and maintenance
    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }
        else {
            // CSV format
            const headers = ['timestamp', 'level', 'category', 'message', 'data', 'sessionId', 'url'];
            const rows = [headers.join(',')];
            this.logs.forEach(log => {
                const row = [
                    new Date(log.timestamp).toISOString(),
                    log.level,
                    log.category,
                    `"${log.message.replace(/"/g, '""')}"`,
                    `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`,
                    log.sessionId,
                    log.url || ''
                ];
                rows.push(row.join(','));
            });
            return rows.join('\n');
        }
    }
    clearLogs() {
        this.logs = [];
        if (this.config.persistToStorage) {
            localStorage.removeItem('novasignal_logs');
        }
        this.info('Logs cleared');
    }
    // Configuration
    setLogLevel(level) {
        this.config.minLevel = level;
        this.info(`Log level set to ${level}`);
    }
    enableCategory(category) {
        this.config.categories.add(category);
        this.info(`Logging enabled for category: ${category}`);
    }
    disableCategory(category) {
        this.config.categories.delete(category);
        this.info(`Logging disabled for category: ${category}`);
    }
    // Cleanup
    destroy() {
        this.persistLogs();
    }
}
// Create singleton instance
export const logger = new Logger();
// Convenience functions
export const logInfo = (message, data, category) => logger.info(message, data, category);
export const logWarn = (message, data, category) => logger.warn(message, data, category);
export const logError = (message, data, category) => logger.error(message, data, category);
export const logDebug = (message, data, category) => logger.debug(message, data, category);
// React hook for logging
export const useLogger = () => {
    return {
        info: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        error: logger.error.bind(logger),
        debug: logger.debug.bind(logger),
        api: logger.api.bind(logger),
        websocket: logger.websocket.bind(logger),
        chart: logger.chart.bind(logger),
        user: logger.user.bind(logger),
        performance: logger.performance.bind(logger),
        logError: logger.logError.bind(logger),
        logApiCall: logger.logApiCall.bind(logger),
        logApiError: logger.logApiError.bind(logger),
        logUserAction: logger.logUserAction.bind(logger),
        getLogs: logger.getLogs.bind(logger),
        getLogSummary: logger.getLogSummary.bind(logger)
    };
};
