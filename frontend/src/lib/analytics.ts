interface AnalyticsEvent {
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  userAgent?: string;
  url?: string;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  userAgent: string;
  referrer?: string;
}

interface UserMetrics {
  totalSessions: number;
  totalEvents: number;
  lastSeen: number;
  firstSeen: number;
  favoriteSymbols: string[];
  mostUsedFeatures: string[];
  avgSessionDuration: number;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private sessionData: SessionData;
  private isEnabled: boolean = true;
  private maxEvents: number = 1000; // Keep last 1000 events
  private flushInterval: number | null = null;
  
  constructor() {
    this.sessionData = this.initSession();
    this.loadStoredEvents();
    this.startPeriodicFlush();
    this.setupPageVisibilityTracking();
  }

  private initSession(): SessionData {
    const sessionId = this.generateSessionId();
    const session: SessionData = {
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

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('novasignal_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored).slice(-this.maxEvents);
      }
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      // Only store the most recent events
      const eventsToStore = this.events.slice(-this.maxEvents);
      localStorage.setItem('novasignal_analytics_events', JSON.stringify(eventsToStore));
      
      // Update session data
      localStorage.setItem('novasignal_current_session', JSON.stringify(this.sessionData));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  private startPeriodicFlush(): void {
    // Save events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.saveEvents();
    }, 30000);
  }

  private setupPageVisibilityTracking(): void {
    // Track when user leaves/returns to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_blur', { timestamp: Date.now() });
      } else {
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
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
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
    if (typeof window !== 'undefined' && (window as any).__NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
  }

  // Trading-specific tracking methods
  trackSymbolView(symbol: string, market: string): void {
    this.track('symbol_view', {
      symbol,
      market,
      timestamp: Date.now()
    });
  }

  trackChartInteraction(action: string, details?: Record<string, any>): void {
    this.track('chart_interaction', {
      action,
      ...details,
      timestamp: Date.now()
    });
  }

  trackIndicatorToggle(indicator: string, enabled: boolean): void {
    this.track('indicator_toggle', {
      indicator,
      enabled,
      timestamp: Date.now()
    });
  }

  trackWebSocketEvent(event: string, details?: Record<string, any>): void {
    this.track('websocket_event', {
      event,
      ...details,
      timestamp: Date.now()
    });
  }

  trackApiCall(endpoint: string, duration?: number, success?: boolean): void {
    this.track('api_call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    });
  }

  trackUserAction(action: string, context?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...context,
      timestamp: Date.now()
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: Date.now()
    });
  }

  trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      ...context,
      timestamp: Date.now()
    });
  }

  // Settings and preferences tracking
  trackSettingsChange(setting: string, oldValue: any, newValue: any): void {
    this.track('settings_change', {
      setting,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
  }

  // Portfolio tracking
  trackPortfolioAction(action: string, details?: Record<string, any>): void {
    this.track('portfolio_action', {
      action,
      ...details,
      timestamp: Date.now()
    });
  }

  // Analytics query methods
  getEvents(filter?: {
    event?: string;
    since?: number;
    limit?: number;
  }): AnalyticsEvent[] {
    let filtered = this.events;

    if (filter?.event) {
      filtered = filtered.filter(e => e.event === filter.event);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  getSessionStats(): SessionData {
    return { ...this.sessionData };
  }

  getUserMetrics(): UserMetrics {
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Count symbol views
    const symbolEvents = this.getEvents({ event: 'symbol_view', since: weekAgo });
    const symbolCounts = new Map<string, number>();
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
    const featureCounts = new Map<string, number>();
    featureEvents.forEach(event => {
      featureCounts.set(event.event, (featureCounts.get(event.event) || 0) + 1);
    });

    const mostUsedFeatures = Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([feature]) => feature);

    // Get stored user data
    let storedData: any = {};
    try {
      const stored = localStorage.getItem('novasignal_user_metrics');
      if (stored) {
        storedData = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user metrics:', error);
    }

    const metrics: UserMetrics = {
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
    } catch (error) {
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
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.track('analytics_enabled');
    } else {
      this.track('analytics_disabled');
      this.saveEvents(); // Save final state
    }
  }

  clearData(): void {
    this.events = [];
    this.sessionData.events = 0;
    localStorage.removeItem('novasignal_analytics_events');
    localStorage.removeItem('novasignal_user_metrics');
    localStorage.removeItem('novasignal_current_session');
    this.track('analytics_cleared');
  }

  exportData(): string {
    const data = {
      events: this.events,
      session: this.sessionData,
      user: this.getUserMetrics(),
      exportedAt: Date.now()
    };
    return JSON.stringify(data, null, 2);
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.saveEvents();
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

// Utility functions for common tracking patterns
export const trackPageView = (page: string) => {
  analytics.track('page_view', { page });
};

export const trackButtonClick = (buttonId: string, context?: Record<string, any>) => {
  analytics.trackUserAction('button_click', { buttonId, ...context });
};

export const trackFormSubmit = (formId: string, success: boolean, context?: Record<string, any>) => {
  analytics.trackUserAction('form_submit', { formId, success, ...context });
};

export const trackFeatureUsage = (feature: string, context?: Record<string, any>) => {
  analytics.trackUserAction('feature_usage', { feature, ...context });
};

// Performance monitoring utilities
export const measurePerformance = <T>(
  name: string, 
  fn: () => T, 
  context?: Record<string, any>
): T => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  analytics.trackPerformance(name, duration, context);
  return result;
};

export const measureAsyncPerformance = async <T>(
  name: string, 
  fn: () => Promise<T>, 
  context?: Record<string, any>
): Promise<T> => {
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

// Export types for use in other files
export type { AnalyticsEvent, SessionData, UserMetrics };