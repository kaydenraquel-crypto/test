import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Activity, AlertTriangle, Database, Zap, Eye, Download, Trash2, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../lib/analytics';
import { useLogger, logger } from '../lib/logger';
const AnalyticsDashboard = ({ isOpen, onClose }) => {
    const analytics = useAnalytics();
    const loggerHook = useLogger();
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    // Analytics data
    const [dashboardData, setDashboardData] = useState(null);
    const [recentEvents, setRecentEvents] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [logSummary, setLogSummary] = useState(null);
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
            let interval = null;
            if (autoRefresh) {
                interval = setInterval(refreshData, refreshInterval);
            }
            return () => {
                if (interval)
                    clearInterval(interval);
            };
        }
    }, [isOpen, autoRefresh, refreshInterval]);
    // Performance metrics
    const performanceMetrics = useMemo(() => {
        if (!recentLogs)
            return null;
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
        const data = analytics.exportData?.() || '{}';
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
    const exportLogs = (format = 'json') => {
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
            analytics.clearData?.();
            refreshData();
        }
    };
    if (!isOpen)
        return null;
    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'events', label: 'Events', icon: Activity },
        { key: 'logs', label: 'Logs', icon: Database },
        { key: 'performance', label: 'Performance', icon: Zap },
        { key: 'errors', label: 'Errors', icon: AlertTriangle }
    ];
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-gray-600" }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Analytics Dashboard" }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Last updated: ", new Date(lastRefresh).toLocaleTimeString()] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: refreshData, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", title: "Refresh data", children: _jsx(RefreshCw, { className: "w-4 h-4 text-gray-600" }) }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), _jsx("span", { className: "text-sm", children: "Auto-refresh" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx("span", { className: "text-gray-500", children: "\u2715" }) })] })] }), _jsxs("div", { className: "flex", children: [_jsx("div", { className: "w-48 bg-gray-50 border-r border-gray-200", children: _jsx("nav", { className: "p-2", children: tabs.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.key), className: `w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.key))) }) }), _jsxs("div", { className: "flex-1 p-6 overflow-y-auto max-h-[70vh]", children: [activeTab === 'overview' && dashboardData && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-600", children: "Session Events" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: dashboardData.session?.events || 0 })] }), _jsx(Activity, { className: "w-8 h-8 text-blue-500" })] }) }), _jsx("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-600", children: "API Calls" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: dashboardData.apiCalls || 0 })] }), _jsx(Database, { className: "w-8 h-8 text-green-500" })] }) }), _jsx("div", { className: "bg-orange-50 rounded-lg p-4 border border-orange-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-orange-600", children: "Symbol Views" }), _jsx("p", { className: "text-2xl font-bold text-orange-900", children: dashboardData.symbolViews || 0 })] }), _jsx(Eye, { className: "w-8 h-8 text-orange-500" })] }) }), _jsx("div", { className: "bg-red-50 rounded-lg p-4 border border-red-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-600", children: "Errors" }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: dashboardData.errorCount || 0 })] }), _jsx(AlertTriangle, { className: "w-8 h-8 text-red-500" })] }) })] }), dashboardData.session && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Current Session" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Session ID" }), _jsx("p", { className: "font-mono text-xs", children: dashboardData.session.sessionId?.slice(-8) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Duration" }), _jsxs("p", { children: [Math.round((Date.now() - dashboardData.session.startTime) / 60000), "m"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Page Views" }), _jsx("p", { children: dashboardData.session.pageViews })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Events" }), _jsx("p", { children: dashboardData.session.events })] })] })] })), dashboardData.user && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "User Statistics" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Total Sessions" }), _jsx("p", { className: "text-lg font-bold", children: dashboardData.user.totalSessions })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Total Events" }), _jsx("p", { className: "text-lg font-bold", children: dashboardData.user.totalEvents })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Avg Session" }), _jsxs("p", { className: "text-lg font-bold", children: [Math.round(dashboardData.user.avgSessionDuration / 60000), "m"] })] })] }), dashboardData.user.favoriteSymbols?.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "text-gray-500 text-sm mb-2", children: "Favorite Symbols" }), _jsx("div", { className: "flex flex-wrap gap-2", children: dashboardData.user.favoriteSymbols.slice(0, 5).map((symbol) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded", children: symbol }, symbol))) })] }))] }))] })), activeTab === 'events' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Events" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: exportAnalytics, className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] }), _jsxs("button", { onClick: clearAnalytics, className: "flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "Clear" })] })] })] }), _jsx("div", { className: "bg-white border rounded-lg overflow-hidden", children: _jsx("div", { className: "max-h-96 overflow-y-auto", children: recentEvents.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "No events recorded" })) : (_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50 sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Time" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Event" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Properties" })] }) }), _jsx("tbody", { children: recentEvents.slice(-50).reverse().map((event, index) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-gray-500", children: new Date(event.timestamp).toLocaleTimeString() }), _jsx("td", { className: "px-4 py-3 font-medium", children: event.event }), _jsx("td", { className: "px-4 py-3", children: _jsx("pre", { className: "text-xs text-gray-600 max-w-md overflow-x-auto", children: JSON.stringify(event.properties, null, 1) }) })] }, index))) })] })) }) })] })), activeTab === 'logs' && logSummary && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "System Logs" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: () => exportLogs('json'), className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "JSON" })] }), _jsxs("button", { onClick: () => exportLogs('csv'), className: "flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "CSV" })] }), _jsxs("button", { onClick: clearLogs, className: "flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "Clear" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-600", children: "Total Logs" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: logSummary.total })] }), _jsxs("div", { className: "bg-yellow-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-yellow-600", children: "Warnings" }), _jsx("p", { className: "text-2xl font-bold text-yellow-900", children: logSummary.byLevel.warn })] }), _jsxs("div", { className: "bg-red-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-red-600", children: "Errors" }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: logSummary.byLevel.error })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Error Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [logSummary.errorRate.toFixed(1), "%"] })] })] }), _jsx("div", { className: "bg-white border rounded-lg overflow-hidden", children: _jsx("div", { className: "max-h-96 overflow-y-auto", children: recentLogs.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "No logs recorded" })) : (_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50 sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Time" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Level" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Category" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Message" })] }) }), _jsx("tbody", { children: recentLogs.slice(-50).reverse().map((log, index) => (_jsxs("tr", { className: "border-t hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-gray-500", children: new Date(log.timestamp).toLocaleTimeString() }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 text-xs rounded font-medium ${log.level === 'error' ? 'bg-red-100 text-red-800' :
                                                                                log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                                                                        'bg-gray-100 text-gray-800'}`, children: log.level.toUpperCase() }) }), _jsx("td", { className: "px-4 py-3 text-gray-600", children: log.category }), _jsx("td", { className: "px-4 py-3", children: log.message })] }, index))) })] })) }) })] })), activeTab === 'performance' && performanceMetrics && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Performance Metrics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-600", children: "Avg API Response" }), _jsxs("p", { className: "text-2xl font-bold text-blue-900", children: [performanceMetrics.avgApiResponseTime, "ms"] })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-green-600", children: "API Success Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-900", children: [performanceMetrics.apiSuccessRate, "%"] })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-orange-600", children: "Total API Calls" }), _jsx("p", { className: "text-2xl font-bold text-orange-900", children: performanceMetrics.totalApiCalls })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-purple-600", children: "Performance Events" }), _jsx("p", { className: "text-2xl font-bold text-purple-900", children: performanceMetrics.performanceEvents })] })] })] })), activeTab === 'errors' && logSummary && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Recent Errors" }), logSummary.recentErrors.length === 0 ? (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-8 text-center", children: [_jsx("div", { className: "text-green-600 mb-2", children: "\uD83C\uDF89 No recent errors!" }), _jsx("p", { className: "text-sm text-green-700", children: "Your application is running smoothly." })] })) : (_jsx("div", { className: "space-y-3", children: logSummary.recentErrors.map((error, index) => (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-red-900", children: error.message }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: new Date(error.timestamp).toLocaleString() }), error.data && (_jsx("pre", { className: "text-xs text-red-600 mt-2 max-w-2xl overflow-x-auto", children: JSON.stringify(error.data, null, 2) }))] }), _jsx("span", { className: `px-2 py-1 text-xs rounded font-medium ${error.level === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`, children: error.level.toUpperCase() })] }) }, index))) }))] }))] })] })] }) }));
};
export default AnalyticsDashboard;
