import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  BarChart3, 
  Eye, 
  Bell, 
  Download, 
  Upload,
  RotateCcw,
  X,
  Check,
  Monitor,
  Smartphone,
  Grid3X3,
  Volume2,
  RefreshCw,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  useUserPreferences,
  useChartPreferences,
  useIndicatorPreferences,
  useDisplayPreferences,
  useWatchlistPreferences
} from '../hooks/useUserPreferences';
import { userPreferences } from '../lib/userPreferences';
import { CHART_THEMES, CHART_TYPES } from './ChartCustomization';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'indicators' | 'display' | 'data' | 'notifications'>('chart');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { preferences, resetToDefaults } = useUserPreferences();
  const chartPrefs = useChartPreferences();
  const indicatorPrefs = useIndicatorPreferences();
  const displayPrefs = useDisplayPreferences();
  const watchlistPrefs = useWatchlistPreferences();

  if (!isOpen) return null;

  const exportPreferences = () => {
    const data = userPreferences.exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novasignal-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (userPreferences.importPreferences(content)) {
        alert('Preferences imported successfully!');
      } else {
        alert('Failed to import preferences. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetToDefaults();
      setShowResetConfirm(false);
      alert('Preferences reset to defaults!');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const tabs = [
    { key: 'chart', label: 'Chart', icon: BarChart3 },
    { key: 'indicators', label: 'Indicators', icon: TrendingUp },
    { key: 'display', label: 'Display', icon: Eye },
    { key: 'data', label: 'Data', icon: Activity },
    { key: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-200">
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="p-2 border-t border-gray-200 mt-4">
              <button
                onClick={exportPreferences}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              
              <button
                onClick={handleReset}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  showResetConfirm
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {showResetConfirm ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Reset</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {/* Chart Settings */}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Preferences</h3>
                  
                  {/* Theme Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chart Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CHART_THEMES.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => chartPrefs.setTheme(theme.name)}
                          className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                            chartPrefs.theme === theme.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium">{theme.name}</span>
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.backgroundColor }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Chart Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => chartPrefs.setType(type.value)}
                          className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                            chartPrefs.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Show Volume</span>
                      </label>
                      <button
                        onClick={() => chartPrefs.setShowVolume(!chartPrefs.showVolume)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          chartPrefs.showVolume ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            chartPrefs.showVolume ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <Grid3X3 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Show Grid</span>
                      </label>
                      <button
                        onClick={() => chartPrefs.setShowGrid(!chartPrefs.showGrid)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          chartPrefs.showGrid ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            chartPrefs.showGrid ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicators Settings */}
            {activeTab === 'indicators' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Indicators</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(indicatorPrefs.enabled).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Zap className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {key.toUpperCase().replace('_', ' ')}
                          </span>
                        </div>
                        <button
                          onClick={() => indicatorPrefs.toggle(key as any)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Compact Mode</span>
                      </label>
                      <button
                        onClick={() => displayPrefs.setCompactMode(!displayPrefs.compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          displayPrefs.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            displayPrefs.compactMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
                      </label>
                      <button
                        onClick={() => displayPrefs.setAutoRefresh(!displayPrefs.autoRefresh)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          displayPrefs.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            displayPrefs.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {displayPrefs.autoRefresh && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Refresh Interval (seconds)
                        </label>
                        <select
                          value={displayPrefs.refreshInterval}
                          onChange={(e) => displayPrefs.setRefreshInterval(Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value={15}>15 seconds</option>
                          <option value={30}>30 seconds</option>
                          <option value={60}>1 minute</option>
                          <option value={300}>5 minutes</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => displayPrefs.setFontSize(size as any)}
                            className={`p-2 border rounded-lg text-sm font-medium transition-colors ${
                              displayPrefs.fontSize === size
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Settings */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Symbol
                      </label>
                      <input
                        type="text"
                        value={preferences.defaultSymbol}
                        onChange={(e) => userPreferences.setPreference('defaultSymbol', e.target.value.toUpperCase())}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="AAPL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Watchlist ({watchlistPrefs.watchlist.length} symbols)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {watchlistPrefs.watchlist.map((symbol) => (
                          <span
                            key={symbol}
                            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {symbol}
                            <button
                              onClick={() => watchlistPrefs.remove(symbol)}
                              className="ml-2 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {preferences.recentSymbols.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recent Symbols
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {preferences.recentSymbols.map((symbol) => (
                            <span
                              key={symbol}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Alerts</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
                    </label>
                    <button
                      onClick={() => userPreferences.setPreference('enableNotifications', !preferences.enableNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="text-center text-gray-500 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Price alerts will be implemented in a future update.</p>
                    <p className="text-xs text-gray-400 mt-1">Stay tuned for this feature!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importPreferences}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Settings;