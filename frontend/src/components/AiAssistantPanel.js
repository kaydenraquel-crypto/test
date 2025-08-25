import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Enhanced AI Financial Advisor Panel
import { useState, useEffect } from 'react';
import { API } from '../lib/api';
import { Brain, AlertTriangle, Target, DollarSign, BarChart3, Zap } from 'lucide-react';
export default function AiAssistantPanel(props) {
    const { style, symbol, market, interval, provider, indicators, signals, news } = props;
    const [analysisMode, setAnalysisMode] = useState('comprehensive');
    const [customPrompt, setCustomPrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(false);
    // Auto-update when symbol changes
    useEffect(() => {
        if (autoUpdate && symbol) {
            runComprehensiveAnalysis();
        }
    }, [symbol, autoUpdate]);
    async function runComprehensiveAnalysis() {
        setLoading(true);
        try {
            const summary = `Comprehensive financial analysis for ${symbol} (${market})`;
            const res = await API.analyzeLLM({
                symbol,
                market,
                summary,
                indicators,
                signals,
                news,
            });
            setAnalysisResult(res);
        }
        catch (e) {
            setAnalysisResult({
                analysis: `Analysis error: ${e?.message || e}`,
                error: e?.message || e
            });
        }
        finally {
            setLoading(false);
        }
    }
    async function runCustomAnalysis() {
        if (!customPrompt.trim())
            return;
        setLoading(true);
        try {
            const summary = `${customPrompt}. Context: Symbol: ${symbol}, Market: ${market}, Interval: ${interval}m`;
            const res = await API.analyzeLLM({
                symbol,
                market,
                summary,
                indicators,
                signals,
                news,
            });
            setAnalysisResult(res);
        }
        catch (e) {
            setAnalysisResult({
                analysis: `Analysis error: ${e?.message || e}`,
                error: e?.message || e
            });
        }
        finally {
            setLoading(false);
        }
    }
    const getConfidenceColor = (confidence) => {
        const conf = parseFloat(confidence || '0');
        if (conf >= 70)
            return 'text-green-600';
        if (conf >= 50)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getRecommendationColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'buy': return 'text-green-600 bg-green-50 border-green-200';
            case 'sell': return 'text-red-600 bg-red-50 border-red-200';
            case 'watch': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-lg shadow", style: style, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Brain, { className: "w-5 h-5 text-blue-600" }), _jsx("h3", { className: "text-xl font-bold text-gray-900", children: "AI Financial Advisor" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("label", { className: "flex items-center space-x-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: autoUpdate, onChange: (e) => setAutoUpdate(e.target.checked), className: "rounded" }), _jsx("span", { children: "Auto-update" })] }) })] }), _jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "flex space-x-4", children: [_jsxs("button", { onClick: () => setAnalysisMode('comprehensive'), className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${analysisMode === 'comprehensive'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: [_jsx(BarChart3, { className: "w-4 h-4 inline mr-1" }), "Comprehensive Analysis"] }), _jsxs("button", { onClick: () => setAnalysisMode('custom'), className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${analysisMode === 'custom'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: [_jsx(Brain, { className: "w-4 h-4 inline mr-1" }), "Custom Query"] })] }) }), _jsx("div", { className: "p-4 border-b border-gray-200", children: analysisMode === 'comprehensive' ? (_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-600 mb-3", children: ["Get a complete financial advisory analysis including market outlook, technical analysis, risk assessment, trading strategy, and hot moment detection for ", symbol, "."] }), _jsx("button", { onClick: runComprehensiveAnalysis, disabled: loading, className: `w-full py-2 px-4 rounded-md font-medium transition-colors ${loading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}`, children: loading ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Analyzing..." })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "Generate Financial Analysis" })] })) })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Ask the AI Financial Advisor" }), _jsx("textarea", { value: customPrompt, onChange: (e) => setCustomPrompt(e.target.value), rows: 3, placeholder: "Ask about trading strategies, market conditions, risk analysis, entry/exit points, etc.", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("button", { onClick: runCustomAnalysis, disabled: loading || !customPrompt.trim(), className: `mt-2 w-full py-2 px-4 rounded-md font-medium transition-colors ${loading || !customPrompt.trim()
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'}`, children: loading ? 'Analyzing...' : 'Ask AI Advisor' })] })) }), analysisResult && (_jsxs("div", { className: "max-h-96 overflow-y-auto", children: [analysisResult.trading_recommendation && (_jsx("div", { className: "p-4 border-b border-gray-200", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: `p-3 rounded-lg border ${getRecommendationColor(analysisResult.trading_recommendation.action)}`, children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(Target, { className: "w-4 h-4" }), _jsx("span", { className: "font-medium text-sm", children: "Recommendation" })] }), _jsx("div", { className: "text-lg font-bold", children: analysisResult.trading_recommendation.action?.toUpperCase() }), _jsx("div", { className: "text-xs", children: analysisResult.trading_recommendation.timeframe })] }), analysisResult.confidence_score && (_jsxs("div", { className: "p-3 rounded-lg border border-gray-200 bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(BarChart3, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "font-medium text-sm text-gray-700", children: "Confidence" })] }), _jsx("div", { className: `text-lg font-bold ${getConfidenceColor(analysisResult.confidence_score)}`, children: analysisResult.confidence_score })] })), analysisResult.trading_recommendation.risk_level && (_jsxs("div", { className: "p-3 rounded-lg border border-gray-200 bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "font-medium text-sm text-gray-700", children: "Risk Level" })] }), _jsx("div", { className: "text-lg font-bold text-gray-900", children: analysisResult.trading_recommendation.risk_level?.toUpperCase() }), _jsxs("div", { className: "text-xs text-gray-600", children: ["Size: ", analysisResult.trading_recommendation.position_size] })] }))] }) })), analysisResult.hot_moments && analysisResult.hot_moments.length > 0 && (_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-3 flex items-center space-x-2", children: [_jsx(Zap, { className: "w-4 h-4 text-orange-500" }), _jsx("span", { children: "Hot Moments Detected" })] }), _jsx("div", { className: "space-y-2", children: analysisResult.hot_moments.map((moment, index) => (_jsxs("div", { className: `p-3 rounded-lg border ${moment.urgency === 'high'
                                        ? 'border-red-200 bg-red-50'
                                        : moment.urgency === 'medium'
                                            ? 'border-yellow-200 bg-yellow-50'
                                            : 'border-blue-200 bg-blue-50'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-medium text-sm", children: [moment.alert_type?.toUpperCase(), " - ", moment.urgency?.toUpperCase()] }), _jsxs("span", { className: "text-xs text-gray-600", children: [Math.round(moment.probability * 100), "% probability"] })] }), _jsx("p", { className: "text-sm text-gray-700 mt-1", children: moment.description })] }, index))) })] })), analysisResult.trading_recommendation && analysisResult.trading_recommendation.entry_price && (_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-3 flex items-center space-x-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-green-500" }), _jsx("span", { children: "Trading Levels" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Entry:" }), _jsxs("div", { className: "font-medium", children: ["$", analysisResult.trading_recommendation.entry_price?.toFixed(2)] })] }), analysisResult.trading_recommendation.stop_loss && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Stop Loss:" }), _jsxs("div", { className: "font-medium text-red-600", children: ["$", analysisResult.trading_recommendation.stop_loss?.toFixed(2)] })] })), analysisResult.trading_recommendation.take_profit && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Take Profit:" }), _jsxs("div", { className: "font-medium text-green-600", children: ["$", analysisResult.trading_recommendation.take_profit?.toFixed(2)] })] }))] })] })), _jsxs("div", { className: "p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Detailed Analysis" }), _jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("div", { className: "text-sm leading-relaxed whitespace-pre-wrap text-gray-700", style: { fontSize: '13px', lineHeight: '1.5' }, children: analysisResult.analysis }) })] })] })), analysisResult?.error && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg m-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-red-700 font-medium", children: "Analysis Error" })] }), _jsx("p", { className: "text-red-600 text-sm mt-1", children: analysisResult.error })] })), !analysisResult && !loading && (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Brain, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsxs("p", { className: "text-lg font-medium mb-2", children: ["Ready to Analyze ", symbol] }), _jsx("p", { className: "text-sm", children: analysisMode === 'comprehensive'
                            ? 'Click "Generate Financial Analysis" for a complete market assessment'
                            : 'Ask any question about trading strategies, market conditions, or risk analysis' })] })), _jsx("div", { className: "p-4 border-t border-gray-200 bg-gray-50", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\u26A0\uFE0F AI analysis is for educational purposes only. Not financial advice. Always do your own research." }) })] }));
}
