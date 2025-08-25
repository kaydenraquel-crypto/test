interface UserPreferences {
  // Chart preferences
  chartTheme: string;
  chartType: string;
  chartInterval: string;
  showVolume: boolean;
  showGrid: boolean;
  
  // Technical indicators
  enabledIndicators: {
    sma: boolean;
    ema: boolean;
    rsi: boolean;
    macd: boolean;
    bollinger: boolean;
    stochastic: boolean;
    williamsR: boolean;
    fibonacci: boolean;
  };
  
  // Display preferences
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showNews: boolean;
  showAdvancedIndicators: boolean;
  
  // Data preferences  
  defaultSymbol: string;
  watchlist: string[];
  recentSymbols: string[];
  
  // UI preferences
  sidebarCollapsed: boolean;
  panelLayout: 'vertical' | 'horizontal';
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  
  // Notification preferences
  enableNotifications: boolean;
  priceAlerts: Array<{
    symbol: string;
    type: 'above' | 'below';
    price: number;
    enabled: boolean;
  }>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
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
  defaultSymbol: 'BTCUSDT',
  watchlist: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT'],
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
  private static STORAGE_KEY = 'novasignal_preferences';
  private preferences: UserPreferences;
  private listeners: Set<(preferences: UserPreferences) => void> = new Set();

  constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(UserPreferencesManager.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new preferences in updates
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(
        UserPreferencesManager.STORAGE_KEY,
        JSON.stringify(this.preferences)
      );
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.preferences });
      } catch (error) {
        console.error('Error in preference listener:', error);
      }
    });
  }

  // Get methods
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }

  // Set methods
  setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.savePreferences();
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  // Chart preferences
  setChartTheme(theme: string): void {
    this.setPreference('chartTheme', theme);
  }

  setChartType(type: string): void {
    this.setPreference('chartType', type);
  }

  setChartInterval(interval: string): void {
    this.setPreference('chartInterval', interval);
  }

  // Indicator preferences
  toggleIndicator(indicator: keyof UserPreferences['enabledIndicators']): void {
    const current = this.preferences.enabledIndicators[indicator];
    this.preferences.enabledIndicators[indicator] = !current;
    this.savePreferences();
  }

  setIndicatorEnabled(
    indicator: keyof UserPreferences['enabledIndicators'],
    enabled: boolean
  ): void {
    this.preferences.enabledIndicators[indicator] = enabled;
    this.savePreferences();
  }

  // Watchlist management
  addToWatchlist(symbol: string): void {
    if (!this.preferences.watchlist.includes(symbol)) {
      this.preferences.watchlist.push(symbol);
      this.savePreferences();
    }
  }

  removeFromWatchlist(symbol: string): void {
    this.preferences.watchlist = this.preferences.watchlist.filter(s => s !== symbol);
    this.savePreferences();
  }

  reorderWatchlist(symbols: string[]): void {
    this.preferences.watchlist = symbols;
    this.savePreferences();
  }

  // Recent symbols management
  addRecentSymbol(symbol: string): void {
    const recent = this.preferences.recentSymbols.filter(s => s !== symbol);
    recent.unshift(symbol);
    this.preferences.recentSymbols = recent.slice(0, 10); // Keep last 10
    this.savePreferences();
  }

  // Price alerts
  addPriceAlert(alert: {
    symbol: string;
    type: 'above' | 'below';
    price: number;
  }): void {
    this.preferences.priceAlerts.push({ ...alert, enabled: true });
    this.savePreferences();
  }

  removePriceAlert(index: number): void {
    this.preferences.priceAlerts.splice(index, 1);
    this.savePreferences();
  }

  togglePriceAlert(index: number): void {
    if (this.preferences.priceAlerts[index]) {
      this.preferences.priceAlerts[index].enabled = 
        !this.preferences.priceAlerts[index].enabled;
      this.savePreferences();
    }
  }

  // Event listeners
  subscribe(listener: (preferences: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Reset preferences
  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }

  // Export/Import preferences
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  importPreferences(preferencesJson: string): boolean {
    try {
      const imported = JSON.parse(preferencesJson);
      // Validate structure
      if (typeof imported === 'object' && imported !== null) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...imported };
        this.savePreferences();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  // Utility methods
  isIndicatorEnabled(indicator: keyof UserPreferences['enabledIndicators']): boolean {
    return this.preferences.enabledIndicators[indicator];
  }

  isInWatchlist(symbol: string): boolean {
    return this.preferences.watchlist.includes(symbol);
  }

  // Storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const used = new Blob([localStorage.getItem(UserPreferencesManager.STORAGE_KEY) || '']).size;
      const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Create singleton instance
export const userPreferences = new UserPreferencesManager();

// React hook for using preferences in components
export { type UserPreferences, DEFAULT_PREFERENCES };