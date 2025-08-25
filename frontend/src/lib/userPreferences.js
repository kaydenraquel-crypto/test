const DEFAULT_PREFERENCES = {
    // Chart defaults
    chartTheme: 'TradingView',
    chartType: 'candlestick',
    chartInterval: '1h',
    showVolume: true,
    showGrid: true,
    // Indicators defaults
    enabledIndicators: {
        sma: true,
        ema: true,
        rsi: true,
        macd: true,
        bollinger: true,
        stochastic: false,
        williamsR: false,
        fibonacci: false,
    },
    // Display defaults
    compactMode: false,
    autoRefresh: true,
    refreshInterval: 30,
    showNews: true,
    showAdvancedIndicators: false,
    // Data defaults
    defaultSymbol: 'AAPL',
    watchlist: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
    recentSymbols: [],
    // UI defaults
    sidebarCollapsed: false,
    panelLayout: 'vertical',
    fontSize: 'medium',
    animationsEnabled: true,
    // Notification defaults
    enableNotifications: false,
    priceAlerts: [],
};
class UserPreferencesManager {
    constructor() {
        this.listeners = new Set();
        this.preferences = this.loadPreferences();
    }
    loadPreferences() {
        try {
            const stored = localStorage.getItem(UserPreferencesManager.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle new preferences in updates
                return { ...DEFAULT_PREFERENCES, ...parsed };
            }
        }
        catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
        return { ...DEFAULT_PREFERENCES };
    }
    savePreferences() {
        try {
            localStorage.setItem(UserPreferencesManager.STORAGE_KEY, JSON.stringify(this.preferences));
            this.notifyListeners();
        }
        catch (error) {
            console.error('Failed to save user preferences:', error);
        }
    }
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener({ ...this.preferences });
            }
            catch (error) {
                console.error('Error in preference listener:', error);
            }
        });
    }
    // Get methods
    getPreferences() {
        return { ...this.preferences };
    }
    getPreference(key) {
        return this.preferences[key];
    }
    // Set methods
    setPreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
    }
    updatePreferences(updates) {
        this.preferences = { ...this.preferences, ...updates };
        this.savePreferences();
    }
    // Chart preferences
    setChartTheme(theme) {
        this.setPreference('chartTheme', theme);
    }
    setChartType(type) {
        this.setPreference('chartType', type);
    }
    setChartInterval(interval) {
        this.setPreference('chartInterval', interval);
    }
    // Indicator preferences
    toggleIndicator(indicator) {
        const current = this.preferences.enabledIndicators[indicator];
        this.preferences.enabledIndicators[indicator] = !current;
        this.savePreferences();
    }
    setIndicatorEnabled(indicator, enabled) {
        this.preferences.enabledIndicators[indicator] = enabled;
        this.savePreferences();
    }
    // Watchlist management
    addToWatchlist(symbol) {
        if (!this.preferences.watchlist.includes(symbol)) {
            this.preferences.watchlist.push(symbol);
            this.savePreferences();
        }
    }
    removeFromWatchlist(symbol) {
        this.preferences.watchlist = this.preferences.watchlist.filter(s => s !== symbol);
        this.savePreferences();
    }
    reorderWatchlist(symbols) {
        this.preferences.watchlist = symbols;
        this.savePreferences();
    }
    // Recent symbols management
    addRecentSymbol(symbol) {
        const recent = this.preferences.recentSymbols.filter(s => s !== symbol);
        recent.unshift(symbol);
        this.preferences.recentSymbols = recent.slice(0, 10); // Keep last 10
        this.savePreferences();
    }
    // Price alerts
    addPriceAlert(alert) {
        this.preferences.priceAlerts.push({ ...alert, enabled: true });
        this.savePreferences();
    }
    removePriceAlert(index) {
        this.preferences.priceAlerts.splice(index, 1);
        this.savePreferences();
    }
    togglePriceAlert(index) {
        if (this.preferences.priceAlerts[index]) {
            this.preferences.priceAlerts[index].enabled =
                !this.preferences.priceAlerts[index].enabled;
            this.savePreferences();
        }
    }
    // Event listeners
    subscribe(listener) {
        this.listeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    // Reset preferences
    resetToDefaults() {
        this.preferences = { ...DEFAULT_PREFERENCES };
        this.savePreferences();
    }
    // Export/Import preferences
    exportPreferences() {
        return JSON.stringify(this.preferences, null, 2);
    }
    importPreferences(preferencesJson) {
        try {
            const imported = JSON.parse(preferencesJson);
            // Validate structure
            if (typeof imported === 'object' && imported !== null) {
                this.preferences = { ...DEFAULT_PREFERENCES, ...imported };
                this.savePreferences();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Failed to import preferences:', error);
            return false;
        }
    }
    // Utility methods
    isIndicatorEnabled(indicator) {
        return this.preferences.enabledIndicators[indicator];
    }
    isInWatchlist(symbol) {
        return this.preferences.watchlist.includes(symbol);
    }
    // Storage usage info
    getStorageInfo() {
        try {
            const used = new Blob([localStorage.getItem(UserPreferencesManager.STORAGE_KEY) || '']).size;
            const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
            const percentage = (used / available) * 100;
            return { used, available, percentage };
        }
        catch {
            return { used: 0, available: 0, percentage: 0 };
        }
    }
}
UserPreferencesManager.STORAGE_KEY = 'novasignal_preferences';
// Create singleton instance
export const userPreferences = new UserPreferencesManager();
// React hook for using preferences in components
export { DEFAULT_PREFERENCES };
