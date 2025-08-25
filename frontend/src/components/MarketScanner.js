import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';
const MarketScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoScan, setAutoScan] = useState(false);
    const runScan = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/llm/scan');
            const data = await response.json();
            setScanResult(data);
        }
        catch (error) {
            console.error('Market scan failed:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Auto-scan every 5 minutes if enabled
    useEffect(() => {
        if (autoScan) {
            const interval = setInterval(runScan, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [autoScan]);
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-5 h-5 text-purple-600" }), _jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Market Scanner" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center space-x-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: autoScan, onChange: (e) => setAutoScan(e.target.checked), className: "rounded" }), _jsx("span", { children: "Auto-scan" })] }), _jsx("button", { onClick: runScan, disabled: loading, className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${loading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'}`, children: loading ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Scanning..." })] })) : (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: "Scan Markets" })] })) })] })] }), scanResult && (_jsxs("div", { children: [_jsx("div", { className: "p-4 border-b border-gray-200 bg-gray-50", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Last scan: ", formatTime(scanResult.scan_timestamp)] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-orange-500" }), _jsxs("span", { className: "text-sm font-medium", children: [scanResult.total_alerts, " opportunities found"] })] })] }) }) }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: scanResult.opportunities.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Search, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-lg font-medium mb-2", children: "No Hot Moments Detected" }), _jsx("p", { className: "text-sm", children: "All scanned assets appear to be in normal trading conditions." })] })) : (_jsx("div", { className: "space-y-1", children: scanResult.opportunities.map((opportunity, index) => (_jsxs("div", { className: "p-4 border-b border-gray-100 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "font-bold text-lg text-gray-900", children: opportunity.symbol }), _jsx("span", { className: "text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded", children: opportunity.market }), _jsxs("span", { className: `text-xs px-2 py-1 rounded-full border font-medium ${getUrgencyColor(opportunity.urgency)}`, children: [opportunity.urgency.toUpperCase(), " PRIORITY"] })] }), _jsx(TrendingUp, { className: "w-5 h-5 text-green-500" })] }), _jsx("div", { className: "space-y-2", children: opportunity.hot_moments.map((moment, momentIndex) => (_jsxs("div", { className: "pl-4 border-l-2 border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Zap, { className: "w-3 h-3 text-orange-500" }), _jsxs("span", { className: "font-medium text-sm text-gray-800", children: [moment.alert_type?.toUpperCase(), " SIGNAL"] }), _jsxs("span", { className: "text-xs text-gray-500", children: [Math.round(moment.probability * 100), "% confidence"] })] }), _jsx("p", { className: "text-sm text-gray-600", children: moment.description }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: moment.expected_move })] }, momentIndex))) })] }, index))) })) })] })), !scanResult && !loading && (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Search, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-lg font-medium mb-2", children: "Market Scanner Ready" }), _jsx("p", { className: "text-sm mb-4", children: "Scan popular assets for high-probability trading opportunities and hot moments." }), _jsx("button", { onClick: runScan, className: "px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors", children: "Start Market Scan" })] })), _jsx("div", { className: "p-4 border-t border-gray-200 bg-gray-50", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\uD83D\uDD0D Scans BTC, ETH, AAPL, TSLA, NVDA, SPY for breakouts, squeezes, and momentum signals" }) })] }));
};
export default MarketScanner;
