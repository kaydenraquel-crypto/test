import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
const NewsFeed = ({ symbol, market }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const fetchNews = async () => {
        if (!symbol)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/news?symbol=${encodeURIComponent(symbol)}&market=${market}&limit=12`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            setArticles(data.news || []);
            setLastUpdate(new Date());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch news');
            console.error('News fetch error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // Auto-refresh news every 5 minutes
    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [symbol, market]);
    const getSentimentIcon = (sentiment) => {
        switch (sentiment.label) {
            case 'bullish':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-green-500" });
            case 'bearish':
                return _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" });
            default:
                return _jsx(Minus, { className: "w-4 h-4 text-gray-400" });
        }
    };
    const getSentimentColor = (sentiment) => {
        switch (sentiment.label) {
            case 'bullish':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'bearish':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };
    const formatDateTime = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            if (diffHours < 1) {
                return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
            }
            else if (diffHours < 24) {
                return `${diffHours}h ago`;
            }
            else {
                return date.toLocaleDateString();
            }
        }
        catch {
            return 'Recently';
        }
    };
    const getSentimentScore = (sentiment) => {
        const score = sentiment.score;
        if (score > 0) {
            return `+${(score * 100).toFixed(0)}%`;
        }
        else if (score < 0) {
            return `${(score * 100).toFixed(0)}%`;
        }
        return '0%';
    };
    if (error) {
        return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "News Feed" }), _jsx("button", { onClick: fetchNews, className: "p-2 text-gray-500 hover:text-gray-700 transition-colors", title: "Refresh news", children: _jsx(RefreshCw, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-red-500 mb-2", children: "Failed to load news" }), _jsx("div", { className: "text-sm text-gray-500 mb-4", children: error }), _jsx("button", { onClick: fetchNews, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: "Try Again" })] })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "News Feed" }), _jsxs("p", { className: "text-sm text-gray-500", children: [symbol, " \u2022 ", articles.length, " articles", lastUpdate && (_jsxs("span", { className: "ml-2", children: ["\u2022 Updated ", formatDateTime(lastUpdate.toISOString())] }))] })] }), _jsx("button", { onClick: fetchNews, disabled: loading, className: "p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50", title: "Refresh news", children: _jsx(RefreshCw, { className: `w-5 h-5 ${loading ? 'animate-spin' : ''}` }) })] }), loading && articles.length === 0 && (_jsxs("div", { className: "p-6 text-center", children: [_jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" }), _jsx("div", { className: "text-gray-600", children: "Loading latest news..." })] })), _jsx("div", { className: "max-h-96 overflow-y-auto", children: articles.map((article, index) => (_jsxs("div", { className: "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-blue-600", children: article.source }), _jsx("span", { className: "text-xs text-gray-400", children: "\u2022" }), _jsxs("div", { className: "flex items-center space-x-1 text-xs text-gray-500", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: formatDateTime(article.datetime) })] })] }), _jsxs("div", { className: `flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getSentimentColor(article.sentiment)}`, children: [getSentimentIcon(article.sentiment), _jsx("span", { className: "font-medium", children: article.sentiment.label }), _jsx("span", { className: "text-xs", children: getSentimentScore(article.sentiment) })] })] }), _jsx("h3", { className: "font-semibold text-gray-900 mb-2 leading-tight", children: article.headline }), article.summary && (_jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: article.summary })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: `inline-block px-2 py-1 text-xs rounded-full ${article.category === 'financial' ? 'bg-blue-100 text-blue-800' :
                                        article.category === 'company' ? 'bg-purple-100 text-purple-800' :
                                            article.category === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`, children: article.category }), article.url && (_jsxs("a", { href: article.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors", children: [_jsx("span", { children: "Read more" }), _jsx(ExternalLink, { className: "w-3 h-3" })] }))] }), _jsx("div", { className: "mt-2 pt-2 border-t border-gray-100", children: _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Sentiment Confidence: ", (article.sentiment.confidence * 100).toFixed(0), "%"] }), _jsx("div", { className: `w-16 h-1 rounded-full ${article.sentiment.label === 'bullish' ? 'bg-green-200' :
                                            article.sentiment.label === 'bearish' ? 'bg-red-200' :
                                                'bg-gray-200'}`, children: _jsx("div", { className: `h-full rounded-full transition-all duration-300 ${article.sentiment.label === 'bullish' ? 'bg-green-500' :
                                                article.sentiment.label === 'bearish' ? 'bg-red-500' :
                                                    'bg-gray-400'}`, style: { width: `${article.sentiment.confidence * 100}%` } }) })] }) })] }, index))) }), !loading && articles.length === 0 && (_jsxs("div", { className: "p-6 text-center", children: [_jsx("div", { className: "text-gray-400 mb-2", children: "No news available" }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Try refreshing or check back later for ", symbol, " news"] })] })), articles.length > 0 && (_jsxs("div", { className: "p-4 bg-gray-50 border-t border-gray-200", children: [_jsx("div", { className: "text-sm text-gray-600 mb-2", children: "Overall Sentiment" }), _jsx("div", { className: "flex items-center space-x-4", children: (() => {
                            const bullishCount = articles.filter(a => a.sentiment.label === 'bullish').length;
                            const bearishCount = articles.filter(a => a.sentiment.label === 'bearish').length;
                            const neutralCount = articles.filter(a => a.sentiment.label === 'neutral').length;
                            return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center space-x-1 text-sm", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-green-600 font-medium", children: bullishCount }), _jsx("span", { className: "text-gray-500", children: "Bullish" })] }), _jsxs("div", { className: "flex items-center space-x-1 text-sm", children: [_jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-red-600 font-medium", children: bearishCount }), _jsx("span", { className: "text-gray-500", children: "Bearish" })] }), _jsxs("div", { className: "flex items-center space-x-1 text-sm", children: [_jsx(Minus, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 font-medium", children: neutralCount }), _jsx("span", { className: "text-gray-500", children: "Neutral" })] })] }));
                        })() })] }))] }));
};
export default NewsFeed;
