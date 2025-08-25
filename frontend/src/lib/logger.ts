type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'general' | 'api' | 'websocket' | 'chart' | 'user' | 'performance' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  sessionId: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  maxEntries: number;
  persistToStorage: boolean;
  consoleOutput: boolean;
  categories: Set<LogCategory>;
}

class Logger {
  private logs: LogEntry[] = [];
  private config: LoggerConfig;
  private sessionId: string;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: 'info',
      maxEntries: 5000,
      persistToStorage: true,
      consoleOutput: typeof window !== 'undefined' && (window as any).__NODE_ENV === 'development',
      categories: new Set(['general', 'api', 'websocket', 'chart', 'user', 'performance', 'error']),
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.loadPersistedLogs();
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `log_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPersistedLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      const stored = localStorage.getItem('novasignal_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logs = parsed.slice(-this.config.maxEntries);
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  private persistLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      const logsToStore = this.logs.slice(-this.config.maxEntries);
      localStorage.setItem('novasignal_logs', JSON.stringify(logsToStore));
    } catch (error) {
      console.warn('Failed to persist logs:', error);
    }
  }

  private setupGlobalErrorHandling(): void {
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

  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    if ('performance' in window && 'navigation' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
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
        const memInfo = (performance as any).memory;
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

  private log(level: LogLevel, category: LogCategory, message: string, data?: any): void {
    // Check if logging is enabled for this level and category
    if (this.logLevels[level] < this.logLevels[this.config.minLevel]) return;
    if (!this.config.categories.has(category)) return;

    const entry: LogEntry = {
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
  debug(message: string, data?: any, category: LogCategory = 'general'): void {
    this.log('debug', category, message, data);
  }

  info(message: string, data?: any, category: LogCategory = 'general'): void {
    this.log('info', category, message, data);
  }

  warn(message: string, data?: any, category: LogCategory = 'general'): void {
    this.log('warn', category, message, data);
  }

  error(message: string, data?: any, category: LogCategory = 'error'): void {
    this.log('error', category, message, data);
  }

  // Specialized logging methods
  api(message: string, data?: any, level: LogLevel = 'info'): void {
    this.log(level, 'api', message, data);
  }

  websocket(message: string, data?: any, level: LogLevel = 'info'): void {
    this.log(level, 'websocket', message, data);
  }

  chart(message: string, data?: any, level: LogLevel = 'info'): void {
    this.log(level, 'chart', message, data);
  }

  user(message: string, data?: any, level: LogLevel = 'info'): void {
    this.log(level, 'user', message, data);
  }

  performance(message: string, data?: any): void {
    this.log('info', 'performance', message, data);
  }

  // API call logging helper
  logApiCall(
    method: string,
    url: string,
    duration: number,
    status: number,
    success: boolean,
    responseSize?: number
  ): void {
    const level: LogLevel = success ? 'info' : 'warn';
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
  logWebSocketEvent(
    event: string,
    data?: any,
    connectionStatus?: string
  ): void {
    this.websocket(`WebSocket: ${event}`, {
      event,
      data,
      connectionStatus,
      timestamp: Date.now()
    });
  }

  // Chart interaction logging
  logChartAction(
    action: string,
    symbol: string,
    details?: any
  ): void {
    this.chart(`Chart Action: ${action}`, {
      action,
      symbol,
      ...details,
      timestamp: Date.now()
    });
  }

  // User action logging
  logUserAction(
    action: string,
    context?: any
  ): void {
    this.user(`User Action: ${action}`, {
      action,
      ...context,
      timestamp: Date.now()
    });
  }

  // Performance measurement utilities
  time(label: string, category: LogCategory = 'performance'): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.performance(`Timer: ${label}`, { duration, label });
    };
  }

  timeAsync<T>(
    label: string,
    promise: Promise<T>,
    category: LogCategory = 'performance'
  ): Promise<T> {
    const start = performance.now();
    return promise.finally(() => {
      const duration = performance.now() - start;
      this.performance(`Async Timer: ${label}`, { duration, label });
    });
  }

  // Error handling utilities
  logError(error: Error, context?: any, category: LogCategory = 'error'): void {
    this.error(`Error: ${error.message}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    }, category);
  }

  logApiError(
    url: string,
    method: string,
    error: Error,
    status?: number
  ): void {
    this.api(`API Error: ${method} ${url}`, {
      url,
      method,
      error: error.message,
      stack: error.stack,
      status
    }, 'error');
  }

  // Query and analysis methods
  getLogs(filter?: {
    level?: LogLevel;
    category?: LogCategory;
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
  }): LogEntry[] {
    let filtered = this.logs;

    if (filter?.level) {
      const minLevel = this.logLevels[filter.level];
      filtered = filtered.filter(log => this.logLevels[log.level] >= minLevel);
    }

    if (filter?.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }

    if (filter?.until) {
      filtered = filtered.filter(log => log.timestamp <= filter.until!);
    }

    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.data).toLowerCase().includes(searchTerm)
      );
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  getLogSummary(timeRange?: number): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    errorRate: number;
    recentErrors: LogEntry[];
  } {
    const since = timeRange ? Date.now() - timeRange : 0;
    const logs = this.getLogs({ since });

    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    };

    const byCategory: Record<LogCategory, number> = {
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
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
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

  clearLogs(): void {
    this.logs = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem('novasignal_logs');
    }
    this.info('Logs cleared');
  }

  // Configuration
  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
    this.info(`Log level set to ${level}`);
  }

  enableCategory(category: LogCategory): void {
    this.config.categories.add(category);
    this.info(`Logging enabled for category: ${category}`);
  }

  disableCategory(category: LogCategory): void {
    this.config.categories.delete(category);
    this.info(`Logging disabled for category: ${category}`);
  }

  // Cleanup
  destroy(): void {
    this.persistLogs();
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const logInfo = (message: string, data?: any, category?: LogCategory) => 
  logger.info(message, data, category);

export const logWarn = (message: string, data?: any, category?: LogCategory) => 
  logger.warn(message, data, category);

export const logError = (message: string, data?: any, category?: LogCategory) => 
  logger.error(message, data, category);

export const logDebug = (message: string, data?: any, category?: LogCategory) => 
  logger.debug(message, data, category);

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

// Export types
export type { LogLevel, LogCategory, LogEntry };