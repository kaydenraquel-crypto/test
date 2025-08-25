import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Eye, EyeOff } from 'lucide-react';
const KeyIndicators = ({ indicators, symbol, onToggleOverlay }) => {
    const [overlayStates, setOverlayStates] = useState({
        stochastic: false,
        williamsR: false,
        fibonacci: false
    });
    // Get latest values from indicator arrays
    const getLatestValue = (indicator) => {
        if (!indicator || !Array.isArray(indicator) || indicator.length === 0)
            return null;
        const latest = indicator[indicator.length - 1];
        return latest !== null && latest !== undefined ? latest : null;
    };
    // Get previous value for trend calculation
    const getPreviousValue = (indicator) => {
        if (!indicator || !Array.isArray(indicator) || indicator.length < 2)
            return null;
        const previous = indicator[indicator.length - 2];
        return previous !== null && previous !== undefined ? previous : null;
    };
    // Calculate trend direction
    const getTrend = (current, previous) => {
        if (current === null || previous === null)
            return 'neutral';
        if (current > previous)
            return 'up';
        if (current < previous)
            return 'down';
        return 'neutral';
    };
    // Format value for display
    const formatValue = (value, precision = 2) => {
        if (value === null || value === undefined)
            return 'N/A';
        return value.toFixed(precision);
    };
    // Stochastic analysis
    const stochastic = useMemo(() => {
        const k = getLatestValue(indicators.stoch_k);
        const d = getLatestValue(indicators.stoch_d);
        const kPrev = getPreviousValue(indicators.stoch_k);
        const dPrev = getPreviousValue(indicators.stoch_d);
        let signal = 'neutral';
        let strength = 'weak';
        let zone = 'neutral';
        if (k !== null && d !== null) {
            // Determine zones
            if (k > 80 && d > 80)
                zone = 'overbought';
            else if (k < 20 && d < 20)
                zone = 'oversold';
            // Signal analysis
            if (kPrev !== null && dPrev !== null) {
                // Bullish crossover
                if (k > d && kPrev <= dPrev && k < 80) {
                    signal = 'bullish';
                    strength = k < 20 ? 'strong' : 'moderate';
                }
                // Bearish crossover
                else if (k < d && kPrev >= dPrev && k > 20) {
                    signal = 'bearish';
                    strength = k > 80 ? 'strong' : 'moderate';
                }
            }
        }
        return {
            k, d, kPrev, dPrev,
            signal, strength, zone,
            trend: getTrend(k, kPrev)
        };
    }, [indicators.stoch_k, indicators.stoch_d]);
    // Williams %R analysis
    const williamsR = useMemo(() => {
        const value = getLatestValue(indicators.williams_r);
        const prevValue = getPreviousValue(indicators.williams_r);
        let signal = 'neutral';
        let zone = 'neutral';
        let strength = 'weak';
        if (value !== null) {
            // Determine zones (Williams %R is negative, so -20 is overbought, -80 is oversold)
            if (value > -20)
                zone = 'overbought';
            else if (value < -80)
                zone = 'oversold';
            // Signal analysis
            if (prevValue !== null) {
                // Bullish signal (moving up from oversold)
                if (value > -80 && prevValue <= -80) {
                    signal = 'bullish';
                    strength = 'strong';
                }
                // Bearish signal (moving down from overbought)
                else if (value < -20 && prevValue >= -20) {
                    signal = 'bearish';
                    strength = 'strong';
                }
                // Momentum signals
                else if (value > prevValue && value < -50) {
                    signal = 'bullish';
                    strength = 'moderate';
                }
                else if (value < prevValue && value > -50) {
                    signal = 'bearish';
                    strength = 'moderate';
                }
            }
        }
        return {
            value, prevValue,
            signal, zone, strength,
            trend: getTrend(value, prevValue)
        };
    }, [indicators.williams_r]);
    // Fibonacci analysis
    const fibonacci = useMemo(() => {
        const fib236 = getLatestValue(indicators['fib_23.6']);
        const fib382 = getLatestValue(indicators['fib_38.2']);
        const fib500 = getLatestValue(indicators['fib_50.0']);
        const fib618 = getLatestValue(indicators['fib_61.8']);
        const currentPrice = indicators.summary?.last_price;
        let supportLevel = null;
        let resistanceLevel = null;
        let signal = 'neutral';
        if (currentPrice && fib236 && fib382 && fib500 && fib618) {
            const fibLevels = [
                { level: 23.6, value: fib236 },
                { level: 38.2, value: fib382 },
                { level: 50.0, value: fib500 },
                { level: 61.8, value: fib618 }
            ].sort((a, b) => a.value - b.value);
            // Find support and resistance
            for (let i = 0; i < fibLevels.length; i++) {
                if (currentPrice > fibLevels[i].value) {
                    supportLevel = fibLevels[i];
                }
                else {
                    resistanceLevel = fibLevels[i];
                    break;
                }
            }
            // Generate signals based on proximity to levels
            if (supportLevel && Math.abs(currentPrice - supportLevel.value) / currentPrice < 0.01) {
                signal = 'support';
            }
            else if (resistanceLevel && Math.abs(currentPrice - resistanceLevel.value) / currentPrice < 0.01) {
                signal = 'resistance';
            }
        }
        return {
            levels: { fib236, fib382, fib500, fib618 },
            currentPrice,
            supportLevel,
            resistanceLevel,
            signal
        };
    }, [indicators['fib_23.6'], indicators['fib_38.2'], indicators['fib_50.0'], indicators['fib_61.8'], indicators.summary]);
    const toggleOverlay = (indicator) => {
        const newState = !overlayStates[indicator];
        setOverlayStates(prev => ({
            ...prev,
            [indicator]: newState
        }));
        onToggleOverlay?.(indicator, newState);
    };
    const getSignalColor = (signal) => {
        switch (signal) {
            case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
            case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
            case 'support': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'resistance': return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    const getZoneColor = (zone) => {
        switch (zone) {
            case 'overbought': return 'text-red-600 bg-red-50';
            case 'oversold': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return _jsx(TrendingUp, { className: "w-4 h-4 text-green-500" });
            case 'down': return _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" });
            default: return _jsx(Activity, { className: "w-4 h-4 text-gray-400" });
        }
    };
    return (_jsxs("div", { className: "panel", style: { marginTop: 8 }, children: [_jsx("h3", { style: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }, children: "Key Technical Indicators" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }, children: [_jsxs("div", { className: "card", style: { padding: '16px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Stochastic Oscillator" }), getTrendIcon(stochastic.trend)] }), _jsx("button", { onClick: () => toggleOverlay('stochastic'), style: {
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: overlayStates.stochastic ? 'var(--accent)' : 'var(--muted)'
                                        }, title: "Toggle chart overlay", children: overlayStates.stochastic ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "%K" }), _jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }, children: formatValue(stochastic.k, 1) })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "%D" }), _jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }, children: formatValue(stochastic.d, 1) })] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium border ${getZoneColor(stochastic.zone)}`, children: stochastic.zone.charAt(0).toUpperCase() + stochastic.zone.slice(1) }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium border ${getSignalColor(stochastic.signal)}`, children: stochastic.signal === 'neutral' ? 'No Signal' :
                                            `${stochastic.signal.charAt(0).toUpperCase() + stochastic.signal.slice(1)} (${stochastic.strength})` })] }), _jsx("div", { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }, children: "Momentum oscillator (0-100). Overbought >80, Oversold <20" })] }), _jsxs("div", { className: "card", style: { padding: '16px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Williams %R" }), getTrendIcon(williamsR.trend)] }), _jsx("button", { onClick: () => toggleOverlay('williamsR'), style: {
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: overlayStates.williamsR ? 'var(--accent)' : 'var(--muted)'
                                        }, title: "Toggle chart overlay", children: overlayStates.williamsR ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "Current Value" }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }, children: formatValue(williamsR.value, 1) })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getZoneColor(williamsR.zone)}`, children: williamsR.zone.charAt(0).toUpperCase() + williamsR.zone.slice(1) }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium border ${getSignalColor(williamsR.signal)}`, children: williamsR.signal === 'neutral' ? 'No Signal' :
                                            `${williamsR.signal.charAt(0).toUpperCase() + williamsR.signal.slice(1)} (${williamsR.strength})` })] }), _jsx("div", { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }, children: "Momentum oscillator (-100 to 0). Overbought >-20, Oversold <-80" })] }), _jsxs("div", { className: "card", style: { padding: '16px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '16px', fontWeight: '600' }, children: "Fibonacci Levels" }), _jsx("button", { onClick: () => toggleOverlay('fibonacci'), style: {
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: overlayStates.fibonacci ? 'var(--accent)' : 'var(--muted)'
                                        }, title: "Toggle chart overlay", children: overlayStates.fibonacci ? _jsx(Eye, { className: "w-4 h-4" }) : _jsx(EyeOff, { className: "w-4 h-4" }) })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: "Current Price" }), _jsxs("div", { style: { fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }, children: ["$", formatValue(fibonacci.currentPrice, 2)] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }, children: [_jsxs("div", { style: { padding: '6px', background: 'var(--card)', borderRadius: '4px' }, children: [_jsx("div", { style: { color: 'var(--muted)' }, children: "23.6%" }), _jsxs("div", { style: { fontWeight: '600' }, children: ["$", formatValue(fibonacci.levels.fib236, 2)] })] }), _jsxs("div", { style: { padding: '6px', background: 'var(--card)', borderRadius: '4px' }, children: [_jsx("div", { style: { color: 'var(--muted)' }, children: "38.2%" }), _jsxs("div", { style: { fontWeight: '600' }, children: ["$", formatValue(fibonacci.levels.fib382, 2)] })] }), _jsxs("div", { style: { padding: '6px', background: 'var(--card)', borderRadius: '4px' }, children: [_jsx("div", { style: { color: 'var(--muted)' }, children: "50.0%" }), _jsxs("div", { style: { fontWeight: '600' }, children: ["$", formatValue(fibonacci.levels.fib500, 2)] })] }), _jsxs("div", { style: { padding: '6px', background: 'var(--card)', borderRadius: '4px' }, children: [_jsx("div", { style: { color: 'var(--muted)' }, children: "61.8%" }), _jsxs("div", { style: { fontWeight: '600' }, children: ["$", formatValue(fibonacci.levels.fib618, 2)] })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [fibonacci.supportLevel && (_jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("span", { style: { color: 'var(--muted)' }, children: "Support: " }), _jsxs("span", { style: { fontWeight: '600', color: 'var(--green)' }, children: [fibonacci.supportLevel.level, "% ($", formatValue(fibonacci.supportLevel.value, 2), ")"] })] })), fibonacci.resistanceLevel && (_jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("span", { style: { color: 'var(--muted)' }, children: "Resistance: " }), _jsxs("span", { style: { fontWeight: '600', color: 'var(--red)' }, children: [fibonacci.resistanceLevel.level, "% ($", formatValue(fibonacci.resistanceLevel.value, 2), ")"] })] })), fibonacci.signal !== 'neutral' && (_jsxs("span", { className: `px-2 py-1 rounded text-xs font-medium border ${getSignalColor(fibonacci.signal)}`, children: ["Near ", fibonacci.signal, " Level"] }))] }), _jsx("div", { style: { fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }, children: "Dynamic retracement levels based on 50-period range" })] })] })] }));
};
export default KeyIndicators;
