import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
const Portfolio = ({ currentSymbol, currentMarket, currentPrice, style }) => {
    const [positions, setPositions] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPosition, setNewPosition] = useState({
        symbol: '',
        market: 'crypto',
        quantity: '',
        entryPrice: ''
    });
    // Load portfolio from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('novasignal_portfolio');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPositions(parsed);
            }
            catch (error) {
                console.error('Failed to load portfolio:', error);
            }
        }
    }, []);
    // Save portfolio to localStorage
    const savePortfolio = (newPositions) => {
        try {
            localStorage.setItem('novasignal_portfolio', JSON.stringify(newPositions));
            setPositions(newPositions);
        }
        catch (error) {
            console.error('Failed to save portfolio:', error);
        }
    };
    // Add a new position
    const addPosition = () => {
        if (!newPosition.symbol.trim() || !newPosition.quantity || !newPosition.entryPrice) {
            return;
        }
        const position = {
            symbol: newPosition.symbol.toUpperCase().trim(),
            market: newPosition.market,
            quantity: parseFloat(newPosition.quantity),
            entryPrice: parseFloat(newPosition.entryPrice),
            entryDate: Date.now(),
            currentPrice: currentSymbol === newPosition.symbol.toUpperCase().trim() ? currentPrice : undefined,
            lastUpdated: Date.now()
        };
        // Check if position already exists
        const existingIndex = positions.findIndex(p => p.symbol === position.symbol && p.market === position.market);
        let updatedPositions;
        if (existingIndex >= 0) {
            // Update existing position (average price)
            const existing = positions[existingIndex];
            const totalQuantity = existing.quantity + position.quantity;
            const totalValue = (existing.quantity * existing.entryPrice) + (position.quantity * position.entryPrice);
            const averagePrice = totalValue / totalQuantity;
            updatedPositions = [...positions];
            updatedPositions[existingIndex] = {
                ...existing,
                quantity: totalQuantity,
                entryPrice: averagePrice,
                lastUpdated: Date.now()
            };
        }
        else {
            // Add new position
            updatedPositions = [...positions, position];
        }
        savePortfolio(updatedPositions);
        // Reset form
        setNewPosition({
            symbol: '',
            market: 'crypto',
            quantity: '',
            entryPrice: ''
        });
        setShowAddForm(false);
    };
    // Remove a position
    const removePosition = (symbol, market) => {
        const updatedPositions = positions.filter(p => !(p.symbol === symbol && p.market === market));
        savePortfolio(updatedPositions);
    };
    // Calculate portfolio statistics
    const stats = useMemo(() => {
        let totalValue = 0;
        let totalCost = 0;
        let topGainer;
        let topLoser;
        positions.forEach(position => {
            const cost = position.quantity * position.entryPrice;
            const value = position.quantity * (position.currentPrice || position.entryPrice);
            const gainPercent = ((value - cost) / cost) * 100;
            totalCost += cost;
            totalValue += value;
            const positionWithGain = { ...position, gainPercent };
            if (!topGainer || gainPercent > topGainer.gainPercent) {
                topGainer = positionWithGain;
            }
            if (!topLoser || gainPercent < topLoser.gainPercent) {
                topLoser = positionWithGain;
            }
        });
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
        return {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            topGainer,
            topLoser,
            positions: positions.length
        };
    }, [positions]);
    // Quick add current symbol
    const addCurrentSymbol = () => {
        if (currentSymbol && currentMarket && currentPrice) {
            setNewPosition({
                symbol: currentSymbol,
                market: currentMarket,
                quantity: '1',
                entryPrice: currentPrice.toString()
            });
            setShowAddForm(true);
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };
    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };
    return (_jsxs("div", { className: "panel", style: style, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, children: [_jsxs("h3", { style: { margin: 0, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Portfolio"] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [currentSymbol && currentPrice && (_jsxs("button", { onClick: addCurrentSymbol, style: {
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }, title: `Add ${currentSymbol} position`, children: ["+ Add ", currentSymbol] })), _jsx("button", { onClick: () => setShowAddForm(!showAddForm), style: {
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    backgroundColor: 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }, children: showAddForm ? 'Cancel' : '+ Position' })] })] }), positions.length > 0 && (_jsxs("div", { style: {
                    backgroundColor: '#f8f9fa',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    border: '1px solid #e9ecef'
                }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: 4 }, children: "Total Value" }), _jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: '#333' }, children: formatCurrency(stats.totalValue) })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: 4 }, children: "Total P&L" }), _jsxs("div", { style: {
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: stats.totalGainLoss >= 0 ? '#4caf50' : '#f44336',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }, children: [stats.totalGainLoss >= 0 ? _jsx(TrendingUp, { className: "w-4 h-4" }) : _jsx(TrendingDown, { className: "w-4 h-4" }), formatCurrency(stats.totalGainLoss), " (", formatPercent(stats.totalGainLossPercent), ")"] })] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 12,
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid #e9ecef'
                        }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#666' }, children: "Total Cost" }), _jsx("div", { style: { fontSize: '14px', fontWeight: '500' }, children: formatCurrency(stats.totalCost) })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '11px', color: '#666' }, children: "Positions" }), _jsx("div", { style: { fontSize: '14px', fontWeight: '500' }, children: stats.positions })] })] })] })), showAddForm && (_jsxs("div", { style: {
                    backgroundColor: '#f5f5f5',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    border: '1px solid #ddd'
                }, children: [_jsx("h4", { style: { margin: '0 0 12px 0', fontSize: '14px' }, children: "Add Position" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }, children: [_jsxs("select", { value: newPosition.market, onChange: e => setNewPosition(prev => ({ ...prev, market: e.target.value })), style: { fontSize: '12px', padding: '4px' }, children: [_jsx("option", { value: "crypto", children: "Crypto" }), _jsx("option", { value: "stocks", children: "Stocks" })] }), _jsx("input", { type: "text", value: newPosition.symbol, onChange: e => setNewPosition(prev => ({ ...prev, symbol: e.target.value.toUpperCase() })), placeholder: newPosition.market === 'crypto' ? 'BTC/USD' : 'AAPL', style: { fontSize: '12px', padding: '4px' } })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }, children: [_jsx("input", { type: "number", value: newPosition.quantity, onChange: e => setNewPosition(prev => ({ ...prev, quantity: e.target.value })), placeholder: "Quantity", step: "any", min: "0", style: { fontSize: '12px', padding: '4px' } }), _jsx("input", { type: "number", value: newPosition.entryPrice, onChange: e => setNewPosition(prev => ({ ...prev, entryPrice: e.target.value })), placeholder: "Entry Price", step: "any", min: "0", style: { fontSize: '12px', padding: '4px' } })] }), _jsx("button", { onClick: addPosition, style: {
                            width: '100%',
                            fontSize: '12px',
                            padding: '6px 12px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, children: "Add Position" })] })), _jsx("div", { style: { maxHeight: 400, overflowY: 'auto' }, children: positions.length === 0 ? (_jsxs("div", { style: {
                        textAlign: 'center',
                        padding: 32,
                        color: '#666',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 8,
                        border: '2px dashed #dee2e6'
                    }, children: [_jsx(Target, { className: "w-8 h-8 mx-auto mb-3 opacity-50" }), _jsx("div", { style: { fontSize: '14px', marginBottom: 8 }, children: "No positions yet" }), _jsx("div", { style: { fontSize: '12px', color: '#999' }, children: "Add your first position to start tracking your portfolio" })] })) : (positions.map((position, index) => {
                    const cost = position.quantity * position.entryPrice;
                    const currentValue = position.quantity * (position.currentPrice || position.entryPrice);
                    const gainLoss = currentValue - cost;
                    const gainLossPercent = (gainLoss / cost) * 100;
                    const isCurrentSymbol = position.symbol === currentSymbol && position.market === currentMarket;
                    return (_jsxs("div", { style: {
                            padding: 12,
                            backgroundColor: isCurrentSymbol ? '#e3f2fd' : index % 2 === 0 ? '#f9f9f9' : 'white',
                            border: '1px solid #eee',
                            borderRadius: 8,
                            marginBottom: 8,
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: position.symbol }), _jsx("span", { style: {
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            backgroundColor: position.market === 'crypto' ? '#ff9800' : '#2196f3',
                                                            color: 'white',
                                                            borderRadius: '10px',
                                                            textTransform: 'uppercase'
                                                        }, children: position.market }), isCurrentSymbol && (_jsx("span", { style: {
                                                            fontSize: '10px',
                                                            color: '#4caf50',
                                                            fontWeight: 'bold'
                                                        }, children: "ACTIVE" }))] }), _jsxs("div", { style: { fontSize: '12px', color: '#666', marginBottom: 8 }, children: [position.quantity, " shares @ ", formatCurrency(position.entryPrice)] }), _jsxs("div", { style: { fontSize: '12px' }, children: [_jsxs("div", { children: ["Cost: ", _jsx("strong", { children: formatCurrency(cost) })] }), _jsxs("div", { children: ["Value: ", _jsx("strong", { children: formatCurrency(currentValue) })] }), position.currentPrice && (_jsxs("div", { style: { fontSize: '11px', color: '#888' }, children: ["Current: ", formatCurrency(position.currentPrice)] }))] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("div", { style: {
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: gainLoss >= 0 ? '#4caf50' : '#f44336',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    gap: 4,
                                                    marginBottom: 4
                                                }, children: [gainLoss >= 0 ? _jsx(TrendingUp, { className: "w-3 h-3" }) : _jsx(TrendingDown, { className: "w-3 h-3" }), formatPercent(gainLossPercent)] }), _jsx("div", { style: {
                                                    fontSize: '12px',
                                                    color: gainLoss >= 0 ? '#4caf50' : '#f44336'
                                                }, children: formatCurrency(gainLoss) }), _jsx("button", { onClick: () => removePosition(position.symbol, position.market), style: {
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #f44336',
                                                    color: '#f44336',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    marginTop: 8
                                                }, title: "Remove position", children: "Remove" })] })] }), _jsxs("div", { style: { fontSize: '10px', color: '#999', marginTop: 8 }, children: ["Added: ", new Date(position.entryDate).toLocaleDateString()] })] }, `${position.symbol}-${position.market}-${position.entryDate}`));
                })) }), positions.length > 1 && (stats.topGainer || stats.topLoser) && (_jsxs("div", { style: {
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #e9ecef'
                }, children: [_jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: 8, fontWeight: 'bold' }, children: "Performance Highlights" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '11px' }, children: [stats.topGainer && (_jsxs("div", { children: [_jsx("div", { style: { color: '#4caf50', fontWeight: 'bold', marginBottom: 2 }, children: "\uD83D\uDE80 Top Gainer" }), _jsxs("div", { children: [stats.topGainer.symbol, ": ", formatPercent(stats.topGainer.gainPercent)] })] })), stats.topLoser && (_jsxs("div", { children: [_jsx("div", { style: { color: '#f44336', fontWeight: 'bold', marginBottom: 2 }, children: "\uD83D\uDCC9 Top Loser" }), _jsxs("div", { children: [stats.topLoser.symbol, ": ", formatPercent(stats.topLoser.gainPercent)] })] }))] })] }))] }));
};
export default Portfolio;
