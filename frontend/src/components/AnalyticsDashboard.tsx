import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp,
  Database,
  Zap,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAnalytics } from '../lib/analytics';
import { useLogger, logger } from '../lib/logger';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<Props> = ({ isOpen, onClose }) => {
  const analytics = useAnalytics();
  const loggerHook = useLogger();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'logs' | 'performance' | 'errors'>('overview');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Analytics data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [logSummary, setLogSummary] = useState<any>(null);

  // Refresh data
  const refreshData = () => {
    setDashboardData(analytics.getDashboardData());
    setRecentEvents(analytics.getEvents({ limit: 100 }));
    setRecentLogs(loggerHook.getLogs({ limit: 100 }));
    setLogSummary(loggerHook.getLogSummary(24 * 60 * 60 * 1000)); // Last 24 hours
    setLastRefresh(Date.now());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      
      let interval: number | null = null;
      if (autoRefresh) {
        interval = window.setInterval(refreshData, refreshInterval);
      }
      
      return () => {
        if (interval) window.clearInterval(interval);
      };
    }
    return undefined;
  }, [isOpen, autoRefresh, refreshInterval]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!recentLogs) return null;
    
    const perfLogs = recentLogs.filter(log => log.category === 'performance');
    const apiLogs = recentLogs.filter(log => log.category === 'api');
    
    const avgApiResponseTime = apiLogs.length > 0 
      ? apiLogs.reduce((sum, log) => sum + (log.data?.duration || 0), 0) / apiLogs.length 
      : 0;
    
    const successfulApiCalls = apiLogs.filter(log => log.data?.success === true).length;
    const failedApiCalls = apiLogs.filter(log => log.data?.success === false).length;
    const apiSuccessRate = apiLogs.length > 0 ? (successfulApiCalls / apiLogs.length) * 100 : 0;
    
    return {
      avgApiResponseTime: avgApiResponseTime.toFixed(2),
      apiSuccessRate: apiSuccessRate.toFixed(1),
      totalApiCalls: apiLogs.length,
      performanceEvents: perfLogs.length
    };
  }, [recentLogs]);

  // Export functions
  const exportAnalytics = () => {
    const data = JSON.stringify(analytics.getDashboardData() || {});
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novasignal-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportLogs = (format: 'json' | 'csv' = 'json') => {
    const data = logger.exportLogs(format);
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novasignal-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      logger.clearLogs();
      refreshData();
    }
  };

  const clearAnalytics = () => {
    if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      // Note: Analytics data clearing not implemented in current version
      console.log('Analytics data clearing not implemented');
      refreshData();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'events', label: 'Events', icon: Activity },
    { key: 'logs', label: 'Logs', icon: Database },
    { key: 'performance', label: 'Performance', icon: Zap },
    { key: 'errors', label: 'Errors', icon: AlertTriangle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
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
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Session Events</p>
                        <p className="text-2xl font-bold text-blue-900">{dashboardData.session?.events || 0}</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">API Calls</p>
                        <p className="text-2xl font-bold text-green-900">{dashboardData.apiCalls || 0}</p>
                      </div>
                      <Database className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Symbol Views</p>
                        <p className="text-2xl font-bold text-orange-900">{dashboardData.symbolViews || 0}</p>
                      </div>
                      <Eye className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Errors</p>
                        <p className="text-2xl font-bold text-red-900">{dashboardData.errorCount || 0}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                {dashboardData.session && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Session</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Session ID</p>
                        <p className="font-mono text-xs">{dashboardData.session.sessionId?.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p>{Math.round((Date.now() - dashboardData.session.startTime) / 60000)}m</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Page Views</p>
                        <p>{dashboardData.session.pageViews}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Events</p>
                        <p>{dashboardData.session.events}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Metrics */}
                {dashboardData.user && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Sessions</p>
                        <p className="text-lg font-bold">{dashboardData.user.totalSessions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Events</p>
                        <p className="text-lg font-bold">{dashboardData.user.totalEvents}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Session</p>
                        <p className="text-lg font-bold">{Math.round(dashboardData.user.avgSessionDuration / 60000)}m</p>
                      </div>
                    </div>
                    
                    {dashboardData.user.favoriteSymbols?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-500 text-sm mb-2">Favorite Symbols</p>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.user.favoriteSymbols.slice(0, 5).map((symbol: string) => (
                            <span key={symbol} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportAnalytics}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={clearAnalytics}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {recentEvents.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No events recorded</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left">Time</th>
                            <th className="px-4 py-3 text-left">Event</th>
                            <th className="px-4 py-3 text-left">Properties</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentEvents.slice(-50).reverse().map((event, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-3 font-medium">{event.event}</td>
                              <td className="px-4 py-3">
                                <pre className="text-xs text-gray-600 max-w-md overflow-x-auto">
                                  {JSON.stringify(event.properties, null, 1)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && logSummary && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">System Logs</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportLogs('json')}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>JSON</span>
                    </button>
                    <button
                      onClick={() => exportLogs('csv')}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={clearLogs}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Log Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Logs</p>
                    <p className="text-2xl font-bold text-blue-900">{logSummary.total}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-900">{logSummary.byLevel.warn}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600">Errors</p>
                    <p className="text-2xl font-bold text-red-900">{logSummary.byLevel.error}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{logSummary.errorRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {recentLogs.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No logs recorded</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left">Time</th>
                            <th className="px-4 py-3 text-left">Level</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentLogs.slice(-50).reverse().map((log, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded font-medium ${
                                  log.level === 'error' ? 'bg-red-100 text-red-800' :
                                  log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                                  log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {log.level.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{log.category}</td>
                              <td className="px-4 py-3">{log.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && performanceMetrics && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Avg API Response</p>
                    <p className="text-2xl font-bold text-blue-900">{performanceMetrics.avgApiResponseTime}ms</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">API Success Rate</p>
                    <p className="text-2xl font-bold text-green-900">{performanceMetrics.apiSuccessRate}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600">Total API Calls</p>
                    <p className="text-2xl font-bold text-orange-900">{performanceMetrics.totalApiCalls}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Performance Events</p>
                    <p className="text-2xl font-bold text-purple-900">{performanceMetrics.performanceEvents}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && logSummary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Errors</h3>
                
                {logSummary.recentErrors.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                    <div className="text-green-600 mb-2">🎉 No recent errors!</div>
                    <p className="text-sm text-green-700">Your application is running smoothly.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logSummary.recentErrors.map((error: any, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-red-900">{error.message}</p>
                            <p className="text-sm text-red-700 mt-1">
                              {new Date(error.timestamp).toLocaleString()}
                            </p>
                            {error.data && (
                              <pre className="text-xs text-red-600 mt-2 max-w-2xl overflow-x-auto">
                                {JSON.stringify(error.data, null, 2)}
                              </pre>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            error.level === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {error.level.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;