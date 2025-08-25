class AnalyticsManager {
    constructor() {
        this.events = [];
        this.isEnabled = true;
        this.maxEvents = 1000; // Keep last 1000 events
        this.flushInterval = null;
        this.sessionData = this.initSession();
        this.loadStoredEvents();
        this.startPeriodicFlush();
        this.setupPageVisibilityTracking();
    }
    initSession() {
        const sessionId = this.generateSessionId();
        const session = {
            sessionId,
            startTime: Date.now(),
            lastActivity: Date.now(),
            pageViews: 1,
            events: 0,
            userAgent: navigator.userAgent,
            referrer: document.referrer || undefined
        };
        // Store session data
        localStorage.setItem('novasignal_current_session', JSON.stringify(session));
        return session;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    loadStoredEvents() {
        try {
            const stored = localStorage.getItem('novasignal_analytics_events');
            if (stored) {
                this.events = JSON.parse(stored).slice(-this.maxEvents);
            }
        }
        catch (error) {
            console.warn('Failed to load stored analytics events:', error);
            this.events = [];
        }
    }
    saveEvents() {
        try {
            // Only store the most recent events
            const eventsToStore = this.events.slice(-this.maxEvents);
            localStorage.setItem('novasignal_analytics_events', JSON.stringify(eventsToStore));
            // Update session data
            localStorage.setItem('novasignal_current_session', JSON.stringify(this.sessionData));
        }
        catch (error) {
            console.warn('Failed to save analytics events:', error);
        }
    }
    startPeriodicFlush() {
        // Save events every 30 seconds
        this.flushInterval = setInterval(() => {
            this.saveEvents();
        }, 30000);
    }
    setupPageVisibilityTracking() {
        // Track when user leaves/returns to the tab
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_blur', { timestamp: Date.now() });
            }
            else {
                this.track('page_focus', { timestamp: Date.now() });
                this.sessionData.lastActivity = Date.now();
            }
        });
        // Track when user is leaving the page
        window.addEventListener('beforeunload', () => {
            this.track('page_unload', {
                sessionDuration: Date.now() - this.sessionData.startTime,
                totalEvents: this.sessionData.events
            });
            this.saveEvents(); // Force save on page unload
        });
    }
    // Main tracking method
    track(event, properties) {
        if (!this.isEnabled)
            return;
        const analyticsEvent = {
            event,
            timestamp: Date.now(),
            properties: { ...properties },
            sessionId: this.sessionData.sessionId,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        this.events.push(analyticsEvent);
        this.sessionData.events++;
        this.sessionData.lastActivity = Date.now();
        // Keep only recent events in memory
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics]', event, properties);
        }
    }
    // Trading-specific tracking methods
    trackSymbolView(symbol, market) {
        this.track('symbol_view', {
            symbol,
            market,
            timestamp: Date.now()
        });
    }
    trackChartInteraction(action, details) {
        this.track('chart_interaction', {
            action,
            ...details,
            timestamp: Date.now()
        });
    }
    trackIndicatorToggle(indicator, enabled) {
        this.track('indicator_toggle', {
            indicator,
            enabled,
            timestamp: Date.now()
        });
    }
    trackWebSocketEvent(event, details) {
        this.track('websocket_event', {
            event,
            ...details,
            timestamp: Date.now()
        });
    }
    trackApiCall(endpoint, duration, success) {
        this.track('api_call', {
            endpoint,
            duration,
            success,
            timestamp: Date.now()
        });
    }
    trackUserAction(action, context) {
        this.track('user_action', {
            action,
            ...context,
            timestamp: Date.now()
        });
    }
    trackError(error, context) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            ...context,
            timestamp: Date.now()
        });
    }
    trackPerformance(metric, value, context) {
        this.track('performance', {
            metric,
            value,
            ...context,
            timestamp: Date.now()
        });
    }
    // Settings and preferences tracking
    trackSettingsChange(setting, oldValue, newValue) {
        this.track('settings_change', {
            setting,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
    }
    // Portfolio tracking
    trackPortfolioAction(action, details) {
        this.track('portfolio_action', {
            action,
            ...details,
            timestamp: Date.now()
        });
    }
    // Analytics query methods
    getEvents(filter) {
        let filtered = this.events;
        if (filter?.event) {
            filtered = filtered.filter(e => e.event === filter.event);
        }
        if (filter?.since) {
            filtered = filtered.filter(e => e.timestamp >= filter.since);
        }
        if (filter?.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        return filtered;
    }
    getSessionStats() {
        return { ...this.sessionData };
    }
    getUserMetrics() {
        const now = Date.now();
        const dayAgo = now - (24 * 60 * 60 * 1000);
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        // Count symbol views
        const symbolEvents = this.getEvents({ event: 'symbol_view', since: weekAgo });
        const symbolCounts = new Map();
        symbolEvents.forEach(event => {
            const symbol = event.properties?.symbol;
            if (symbol) {
                symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
            }
        });
        const favoriteSymbols = Array.from(symbolCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([symbol]) => symbol);
        // Count feature usage
        const featureEvents = this.getEvents({ since: weekAgo });
        const featureCounts = new Map();
        featureEvents.forEach(event => {
            featureCounts.set(event.event, (featureCounts.get(event.event) || 0) + 1);
        });
        const mostUsedFeatures = Array.from(featureCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([feature]) => feature);
        // Get stored user data
        let storedData = {};
        try {
            const stored = localStorage.getItem('novasignal_user_metrics');
            if (stored) {
                storedData = JSON.parse(stored);
            }
        }
        catch (error) {
            console.warn('Failed to load user metrics:', error);
        }
        const metrics = {
            totalSessions: (storedData.totalSessions || 0) + 1,
            totalEvents: (storedData.totalEvents || 0) + this.sessionData.events,
            lastSeen: now,
            firstSeen: storedData.firstSeen || this.sessionData.startTime,
            favoriteSymbols,
            mostUsedFeatures,
            avgSessionDuration: storedData.avgSessionDuration ||
                (now - this.sessionData.startTime)
        };
        // Update stored metrics
        try {
            localStorage.setItem('novasignal_user_metrics', JSON.stringify(metrics));
        }
        catch (error) {
            console.warn('Failed to save user metrics:', error);
        }
        return metrics;
    }
    // Analytics dashboard data
    getDashboardData() {
        const now = Date.now();
        const hourAgo = now - (60 * 60 * 1000);
        const dayAgo = now - (24 * 60 * 60 * 1000);
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        return {
            session: this.getSessionStats(),
            user: this.getUserMetrics(),
            recentEvents: this.getEvents({ limit: 50 }),
            hourlyEvents: this.getEvents({ since: hourAgo }).length,
            dailyEvents: this.getEvents({ since: dayAgo }).length,
            weeklyEvents: this.getEvents({ since: weekAgo }).length,
            errorCount: this.getEvents({ event: 'error', since: dayAgo }).length,
            apiCalls: this.getEvents({ event: 'api_call', since: hourAgo }).length,
            symbolViews: this.getEvents({ event: 'symbol_view', since: dayAgo }).length,
            chartInteractions: this.getEvents({ event: 'chart_interaction', since: dayAgo }).length
        };
    }
    // Privacy controls
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (enabled) {
            this.track('analytics_enabled');
        }
        else {
            this.track('analytics_disabled');
            this.saveEvents(); // Save final state
        }
    }
    clearData() {
        this.events = [];
        this.sessionData.events = 0;
        localStorage.removeItem('novasignal_analytics_events');
        localStorage.removeItem('novasignal_user_metrics');
        localStorage.removeItem('novasignal_current_session');
        this.track('analytics_cleared');
    }
    exportData() {
        const data = {
            events: this.events,
            session: this.sessionData,
            user: this.getUserMetrics(),
            exportedAt: Date.now()
        };
        return JSON.stringify(data, null, 2);
    }
    // Cleanup
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.saveEvents();
    }
}
// Create singleton instance
export const analytics = new AnalyticsManager();
// Utility functions for common tracking patterns
export const trackPageView = (page) => {
    analytics.track('page_view', { page });
};
export const trackButtonClick = (buttonId, context) => {
    analytics.trackUserAction('button_click', { buttonId, ...context });
};
export const trackFormSubmit = (formId, success, context) => {
    analytics.trackUserAction('form_submit', { formId, success, ...context });
};
export const trackFeatureUsage = (feature, context) => {
    analytics.trackUserAction('feature_usage', { feature, ...context });
};
// Performance monitoring utilities
export const measurePerformance = (name, fn, context) => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    analytics.trackPerformance(name, duration, context);
    return result;
};
export const measureAsyncPerformance = async (name, fn, context) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    analytics.trackPerformance(name, duration, context);
    return result;
};
// React hook for analytics in components
export const useAnalytics = () => {
    return {
        track: analytics.track.bind(analytics),
        trackSymbolView: analytics.trackSymbolView.bind(analytics),
        trackChartInteraction: analytics.trackChartInteraction.bind(analytics),
        trackIndicatorToggle: analytics.trackIndicatorToggle.bind(analytics),
        trackUserAction: analytics.trackUserAction.bind(analytics),
        trackError: analytics.trackError.bind(analytics),
        trackApiCall: analytics.trackApiCall.bind(analytics),
        trackPortfolioAction: analytics.trackPortfolioAction.bind(analytics),
        trackSettingsChange: analytics.trackSettingsChange.bind(analytics),
        getDashboardData: () => analytics.getDashboardData(),
        getEvents: analytics.getEvents.bind(analytics)
    };
};
