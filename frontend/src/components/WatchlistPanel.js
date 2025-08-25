import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/WatchlistPanel.tsx
import { useState } from 'react';
import { useWatchlistPreferences } from '../hooks/useUserPreferences';
// Popular symbols by market
const POPULAR_SYMBOLS = {
    crypto: ['BTC/USD', 'ETH/USD', 'ADA/USD', 'SOL/USD', 'DOT/USD', 'LINK/USD'],
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
};
export default function WatchlistPanel({ currentSymbol, currentMarket, onSymbolSelect, style }) {
    const { watchlist, add: addToWatchlistPref, remove: removeFromWatchlistPref, isInWatchlist } = useWatchlistPreferences();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSymbol, setNewSymbol] = useState('');
    const [newMarket, setNewMarket] = useState('crypto');
    // Convert simple watchlist to WatchlistItem format
    const watchlistItems = watchlist.map(symbol => ({
        symbol,
        market: symbol.includes('/') ? 'crypto' : 'stocks',
        addedAt: Date.now() // Simplified - could be enhanced to track actual add times
    }));
    const addToWatchlist = () => {
        if (!newSymbol.trim())
            return;
        const symbolToAdd = newSymbol.toUpperCase();
        if (!isInWatchlist(symbolToAdd)) {
            addToWatchlistPref(symbolToAdd);
        }
        setNewSymbol('');
        setShowAddForm(false);
    };
    const removeFromWatchlist = (symbol, market) => {
        removeFromWatchlistPref(symbol);
    };
    const addCurrentSymbol = () => {
        if (!isInWatchlist(currentSymbol)) {
            addToWatchlistPref(currentSymbol);
        }
    };
    const addPopularSymbol = (symbol, market) => {
        if (!isInWatchlist(symbol)) {
            addToWatchlistPref(symbol);
        }
    };
    return (_jsxs("div", { className: "panel", style: style, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0 }, children: "Watchlist" }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: addCurrentSymbol, style: { fontSize: '12px', padding: '4px 8px' }, title: "Add current symbol to watchlist", children: "+ Add" }), _jsx("button", { onClick: () => setShowAddForm(!showAddForm), style: { fontSize: '12px', padding: '4px 8px' }, children: showAddForm ? 'Cancel' : '+ Custom' })] })] }), showAddForm && (_jsx("div", { style: {
                    backgroundColor: '#f5f5f5',
                    padding: 8,
                    borderRadius: 4,
                    marginBottom: 12,
                    border: '1px solid #ddd'
                }, children: _jsxs("div", { style: { display: 'flex', gap: 4, marginBottom: 8 }, children: [_jsxs("select", { value: newMarket, onChange: e => setNewMarket(e.target.value), style: { fontSize: '12px' }, children: [_jsx("option", { value: "crypto", children: "Crypto" }), _jsx("option", { value: "stocks", children: "Stocks" })] }), _jsx("input", { type: "text", value: newSymbol, onChange: e => setNewSymbol(e.target.value.toUpperCase()), placeholder: newMarket === 'crypto' ? 'ETH/USD' : 'AAPL', style: { fontSize: '12px', flex: 1 }, onKeyPress: e => e.key === 'Enter' && addToWatchlist() }), _jsx("button", { onClick: addToWatchlist, style: { fontSize: '12px', padding: '2px 6px' }, children: "Add" })] }) })), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: 4 }, children: "Popular:" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 4 }, children: (POPULAR_SYMBOLS[currentMarket] || POPULAR_SYMBOLS.stocks).slice(0, 4).map(symbol => (_jsxs("button", { onClick: () => addPopularSymbol(symbol, currentMarket), style: {
                                fontSize: '10px',
                                padding: '2px 6px',
                                backgroundColor: '#e3f2fd',
                                border: '1px solid #90caf9',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }, title: `Add ${symbol} to watchlist`, children: ["+", symbol.replace('/USD', '').replace('-USD', '')] }, symbol))) })] }), _jsx("div", { style: { maxHeight: 300, overflowY: 'auto' }, children: watchlistItems.length === 0 ? (_jsx("div", { style: { color: '#333', fontSize: '14px', textAlign: 'center', padding: 20 }, children: "No symbols in watchlist" })) : (watchlistItems.map((item, index) => (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: item.symbol === currentSymbol && item.market === currentMarket
                            ? '#e3f2fd'
                            : index % 2 === 0 ? '#f9f9f9' : 'white',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        marginBottom: 4,
                        cursor: 'pointer',
                        color: '#333' // Fix text color
                    }, onClick: () => onSymbolSelect(item.symbol, item.market), children: [_jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 'bold', fontSize: '14px', color: '#333' }, children: [item.symbol, _jsx("span", { style: {
                                                fontSize: '10px',
                                                color: '#666',
                                                marginLeft: 4,
                                                textTransform: 'uppercase'
                                            }, children: item.market })] }), item.lastPrice && (_jsxs("div", { style: { fontSize: '12px', color: '#555' }, children: ["$", item.lastPrice.toFixed(2), item.changePercent && (_jsxs("span", { style: {
                                                color: item.changePercent >= 0 ? '#4caf50' : '#f44336',
                                                marginLeft: 4
                                            }, children: [item.changePercent >= 0 ? '+' : '', item.changePercent.toFixed(2), "%"] }))] }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4 }, children: [item.symbol === currentSymbol && item.market === currentMarket && (_jsx("span", { style: {
                                        fontSize: '10px',
                                        color: '#1976d2',
                                        fontWeight: 'bold'
                                    }, children: "ACTIVE" })), _jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        removeFromWatchlist(item.symbol, item.market);
                                    }, style: {
                                        fontSize: '10px',
                                        padding: '2px 4px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#f44336',
                                        cursor: 'pointer'
                                    }, title: "Remove from watchlist", children: "\u00D7" })] })] }, `${item.symbol}-${item.market}`)))) }), watchlistItems.length > 0 && (_jsxs("div", { style: {
                    fontSize: '12px',
                    color: '#555',
                    marginTop: 8,
                    textAlign: 'center',
                    borderTop: '1px solid #eee',
                    paddingTop: 8
                }, children: [watchlistItems.length, " symbols \u2022 Click to switch"] }))] }));
}
