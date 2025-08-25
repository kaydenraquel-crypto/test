import { useState, useEffect, useCallback } from 'react';
import { userPreferences, type UserPreferences } from '../lib/userPreferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(
    userPreferences.getPreferences()
  );

  useEffect(() => {
    // Subscribe to preference changes
    const unsubscribe = userPreferences.subscribe((newPreferences) => {
      setPreferences(newPreferences);
    });

    return unsubscribe;
  }, []);

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    userPreferences.setPreference(key, value);
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    userPreferences.updatePreferences(updates);
  }, []);

  const toggleIndicator = useCallback((indicator: keyof UserPreferences['enabledIndicators']) => {
    userPreferences.toggleIndicator(indicator);
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    userPreferences.addToWatchlist(symbol);
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    userPreferences.removeFromWatchlist(symbol);
  }, []);

  const addRecentSymbol = useCallback((symbol: string) => {
    userPreferences.addRecentSymbol(symbol);
  }, []);

  const resetToDefaults = useCallback(() => {
    userPreferences.resetToDefaults();
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    toggleIndicator,
    addToWatchlist,
    removeFromWatchlist,
    addRecentSymbol,
    resetToDefaults,
    // Convenience getters
    chartTheme: preferences.chartTheme,
    chartType: preferences.chartType,
    enabledIndicators: preferences.enabledIndicators,
    watchlist: preferences.watchlist,
    isIndicatorEnabled: (indicator: keyof UserPreferences['enabledIndicators']) => 
      preferences.enabledIndicators[indicator],
    isInWatchlist: (symbol: string) => preferences.watchlist.includes(symbol),
  };
}

// Specialized hooks for specific preference categories
export function useChartPreferences() {
  const { preferences, updatePreference } = useUserPreferences();
  
  return {
    theme: preferences.chartTheme,
    type: preferences.chartType,
    interval: preferences.chartInterval,
    showVolume: preferences.showVolume,
    showGrid: preferences.showGrid,
    setTheme: (theme: string) => updatePreference('chartTheme', theme),
    setType: (type: string) => updatePreference('chartType', type),
    setInterval: (interval: string) => updatePreference('chartInterval', interval),
    setShowVolume: (show: boolean) => updatePreference('showVolume', show),
    setShowGrid: (show: boolean) => updatePreference('showGrid', show),
  };
}

export function useIndicatorPreferences() {
  const { preferences, toggleIndicator, updatePreference } = useUserPreferences();
  
  return {
    enabled: preferences.enabledIndicators,
    toggle: toggleIndicator,
    isEnabled: (indicator: keyof UserPreferences['enabledIndicators']) => 
      preferences.enabledIndicators[indicator],
    setEnabled: (indicator: keyof UserPreferences['enabledIndicators'], enabled: boolean) => {
      const current = { ...preferences.enabledIndicators };
      current[indicator] = enabled;
      updatePreference('enabledIndicators', current);
    },
  };
}

export function useWatchlistPreferences() {
  const { 
    preferences, 
    addToWatchlist, 
    removeFromWatchlist, 
    updatePreference 
  } = useUserPreferences();
  
  return {
    watchlist: preferences.watchlist || [],
    add: addToWatchlist,
    remove: removeFromWatchlist,
    reorder: (symbols: string[]) => updatePreference('watchlist', symbols),
    isInWatchlist: (symbol: string) => (preferences.watchlist || []).includes(symbol),
  };
}

export function useDisplayPreferences() {
  const { preferences, updatePreference } = useUserPreferences();
  
  return {
    compactMode: preferences.compactMode,
    autoRefresh: preferences.autoRefresh,
    refreshInterval: preferences.refreshInterval,
    showNews: preferences.showNews,
    showAdvancedIndicators: preferences.showAdvancedIndicators,
    sidebarCollapsed: preferences.sidebarCollapsed,
    panelLayout: preferences.panelLayout,
    fontSize: preferences.fontSize,
    animationsEnabled: preferences.animationsEnabled,
    
    setCompactMode: (compact: boolean) => updatePreference('compactMode', compact),
    setAutoRefresh: (auto: boolean) => updatePreference('autoRefresh', auto),
    setRefreshInterval: (interval: number) => updatePreference('refreshInterval', interval),
    setShowNews: (show: boolean) => updatePreference('showNews', show),
    setShowAdvancedIndicators: (show: boolean) => updatePreference('showAdvancedIndicators', show),
    setSidebarCollapsed: (collapsed: boolean) => updatePreference('sidebarCollapsed', collapsed),
    setPanelLayout: (layout: 'vertical' | 'horizontal') => updatePreference('panelLayout', layout),
    setFontSize: (size: 'small' | 'medium' | 'large') => updatePreference('fontSize', size),
    setAnimationsEnabled: (enabled: boolean) => updatePreference('animationsEnabled', enabled),
  };
}