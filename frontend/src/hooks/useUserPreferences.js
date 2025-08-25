import { useState, useEffect, useCallback } from 'react';
import { userPreferences } from '../lib/userPreferences';
export function useUserPreferences() {
    const [preferences, setPreferences] = useState(userPreferences.getPreferences());
    useEffect(() => {
        // Subscribe to preference changes
        const unsubscribe = userPreferences.subscribe((newPreferences) => {
            setPreferences(newPreferences);
        });
        return unsubscribe;
    }, []);
    const updatePreference = useCallback((key, value) => {
        userPreferences.setPreference(key, value);
    }, []);
    const updatePreferences = useCallback((updates) => {
        userPreferences.updatePreferences(updates);
    }, []);
    const toggleIndicator = useCallback((indicator) => {
        userPreferences.toggleIndicator(indicator);
    }, []);
    const addToWatchlist = useCallback((symbol) => {
        userPreferences.addToWatchlist(symbol);
    }, []);
    const removeFromWatchlist = useCallback((symbol) => {
        userPreferences.removeFromWatchlist(symbol);
    }, []);
    const addRecentSymbol = useCallback((symbol) => {
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
        isIndicatorEnabled: (indicator) => preferences.enabledIndicators[indicator],
        isInWatchlist: (symbol) => preferences.watchlist.includes(symbol),
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
        setTheme: (theme) => updatePreference('chartTheme', theme),
        setType: (type) => updatePreference('chartType', type),
        setInterval: (interval) => updatePreference('chartInterval', interval),
        setShowVolume: (show) => updatePreference('showVolume', show),
        setShowGrid: (show) => updatePreference('showGrid', show),
    };
}
export function useIndicatorPreferences() {
    const { preferences, toggleIndicator, updatePreference } = useUserPreferences();
    return {
        enabled: preferences.enabledIndicators,
        toggle: toggleIndicator,
        isEnabled: (indicator) => preferences.enabledIndicators[indicator],
        setEnabled: (indicator, enabled) => {
            const current = { ...preferences.enabledIndicators };
            current[indicator] = enabled;
            updatePreference('enabledIndicators', current);
        },
    };
}
export function useWatchlistPreferences() {
    const { preferences, addToWatchlist, removeFromWatchlist, updatePreference } = useUserPreferences();
    return {
        watchlist: preferences.watchlist,
        add: addToWatchlist,
        remove: removeFromWatchlist,
        reorder: (symbols) => updatePreference('watchlist', symbols),
        isInWatchlist: (symbol) => preferences.watchlist.includes(symbol),
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
        setCompactMode: (compact) => updatePreference('compactMode', compact),
        setAutoRefresh: (auto) => updatePreference('autoRefresh', auto),
        setRefreshInterval: (interval) => updatePreference('refreshInterval', interval),
        setShowNews: (show) => updatePreference('showNews', show),
        setShowAdvancedIndicators: (show) => updatePreference('showAdvancedIndicators', show),
        setSidebarCollapsed: (collapsed) => updatePreference('sidebarCollapsed', collapsed),
        setPanelLayout: (layout) => updatePreference('panelLayout', layout),
        setFontSize: (size) => updatePreference('fontSize', size),
        setAnimationsEnabled: (enabled) => updatePreference('animationsEnabled', enabled),
    };
}
