import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, BarChart2 } from 'lucide-react';
// Predefined chart themes
export const CHART_THEMES = [
    {
        name: 'Light',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        gridColor: '#f5f5f5',
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        smaColor: '#2196F3',
        emaColor: '#FF6D00',
        rsiColor: '#9C27B0',
        macdColor: '#FF9800',
        volumeColor: '#78909C'
    },
    {
        name: 'Dark',
        backgroundColor: '#1e1e1e',
        textColor: '#ffffff',
        gridColor: '#333333',
        upColor: '#00e676',
        downColor: '#ff5252',
        wickUpColor: '#00e676',
        wickDownColor: '#ff5252',
        smaColor: '#64b5f6',
        emaColor: '#ffb74d',
        rsiColor: '#ba68c8',
        macdColor: '#ffcc02',
        volumeColor: '#90a4ae'
    },
    {
        name: 'TradingView',
        backgroundColor: '#131722',
        textColor: '#d1d4dc',
        gridColor: '#363c4e',
        upColor: '#089981',
        downColor: '#f23645',
        wickUpColor: '#089981',
        wickDownColor: '#f23645',
        smaColor: '#2962ff',
        emaColor: '#ff6d00',
        rsiColor: '#9c27b0',
        macdColor: '#ff9800',
        volumeColor: '#5d606b'
    },
    {
        name: 'Matrix',
        backgroundColor: '#000000',
        textColor: '#00ff00',
        gridColor: '#003300',
        upColor: '#00ff00',
        downColor: '#ff0000',
        wickUpColor: '#00ff00',
        wickDownColor: '#ff0000',
        smaColor: '#00ffff',
        emaColor: '#ffff00',
        rsiColor: '#ff00ff',
        macdColor: '#ffa500',
        volumeColor: '#666666'
    },
    {
        name: 'Minimalist',
        backgroundColor: '#fafafa',
        textColor: '#424242',
        gridColor: '#e0e0e0',
        upColor: '#4caf50',
        downColor: '#f44336',
        wickUpColor: '#4caf50',
        wickDownColor: '#f44336',
        smaColor: '#2196f3',
        emaColor: '#ff9800',
        rsiColor: '#9c27b0',
        macdColor: '#607d8b',
        volumeColor: '#9e9e9e'
    }
];
// Chart type options
export const CHART_TYPES = [
    {
        value: 'candlestick',
        label: 'Candlestick',
        icon: BarChart3
    },
    {
        value: 'line',
        label: 'Line',
        icon: TrendingUp
    },
    {
        value: 'area',
        label: 'Area',
        icon: Activity
    },
    {
        value: 'bars',
        label: 'Bars',
        icon: BarChart2
    }
];
const DEFAULT_SETTINGS = {
    theme: CHART_THEMES[0], // Light theme by default
    chartType: 'candlestick',
    showVolume: true,
    showGrid: true,
    timeFormat: '24h',
    priceFormat: 'auto',
    fontSize: 12,
    lineWidth: 2,
    autoScale: true,
    logScale: false
};
export default function ChartCustomization({ onSettingsChange, initialSettings }) {
    const [settings, setSettings] = useState(() => ({
        ...DEFAULT_SETTINGS,
        ...initialSettings
    }));
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('theme');
    useEffect(() => {
        onSettingsChange(settings);
    }, [settings, onSettingsChange]);
    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };
    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
    };
    const exportSettings = () => {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    const importSettings = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result);
                setSettings({ ...DEFAULT_SETTINGS, ...imported });
            }
            catch (error) {
                console.error('Failed to import settings:', error);
                alert('Invalid settings file');
            }
        };
        reader.readAsText(file);
    };
    return (_jsxs("div", { className: "panel", style: { marginTop: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, children: [_jsx("h3", { style: { margin: 0 }, children: "Chart Customization" }), _jsx("button", { onClick: () => setIsExpanded(!isExpanded), style: {
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, children: isExpanded ? '▲' : '▼' })] }), isExpanded && (_jsxs("div", { children: [_jsx("div", { className: "controls-row", style: { marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }, children: ['theme', 'display', 'format'].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), style: {
                                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text)',
                                border: '1px solid var(--border)',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }, children: tab }, tab))) }), activeTab === 'theme' && (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Theme Presets" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }, children: CHART_THEMES.map(theme => (_jsx("button", { onClick: () => updateSettings({ theme }), style: {
                                                background: settings.theme.name === theme.name ? 'var(--accent)' : theme.backgroundColor,
                                                color: settings.theme.name === theme.name ? 'white' : theme.textColor,
                                                border: `2px solid ${settings.theme.name === theme.name ? 'var(--accent)' : theme.gridColor}`,
                                                padding: '8px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                textAlign: 'center'
                                            }, children: theme.name }, theme.name))) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '12px' }, children: "Background" }), _jsx("input", { type: "color", value: settings.theme.backgroundColor, onChange: (e) => updateSettings({
                                                    theme: { ...settings.theme, backgroundColor: e.target.value }
                                                }), style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '12px' }, children: "Up Color" }), _jsx("input", { type: "color", value: settings.theme.upColor, onChange: (e) => updateSettings({
                                                    theme: { ...settings.theme, upColor: e.target.value, wickUpColor: e.target.value }
                                                }), style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '12px' }, children: "Down Color" }), _jsx("input", { type: "color", value: settings.theme.downColor, onChange: (e) => updateSettings({
                                                    theme: { ...settings.theme, downColor: e.target.value, wickDownColor: e.target.value }
                                                }), style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '12px' }, children: "SMA Color" }), _jsx("input", { type: "color", value: settings.theme.smaColor, onChange: (e) => updateSettings({
                                                    theme: { ...settings.theme, smaColor: e.target.value }
                                                }), style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '12px' }, children: "EMA Color" }), _jsx("input", { type: "color", value: settings.theme.emaColor, onChange: (e) => updateSettings({
                                                    theme: { ...settings.theme, emaColor: e.target.value }
                                                }), style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px' } })] })] })] })), activeTab === 'display' && (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Chart Type" }), _jsxs("select", { value: settings.chartType, onChange: (e) => updateSettings({ chartType: e.target.value }), style: { width: '100%' }, children: [_jsx("option", { value: "candlestick", children: "Candlestick" }), _jsx("option", { value: "line", children: "Line" }), _jsx("option", { value: "area", children: "Area" }), _jsx("option", { value: "bars", children: "Bars" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Font Size" }), _jsx("input", { type: "range", min: "8", max: "16", value: settings.fontSize, onChange: (e) => updateSettings({ fontSize: parseInt(e.target.value) }), style: { width: '100%' } }), _jsxs("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: [settings.fontSize, "px"] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Line Width" }), _jsx("input", { type: "range", min: "1", max: "5", value: settings.lineWidth, onChange: (e) => updateSettings({ lineWidth: parseInt(e.target.value) }), style: { width: '100%' } }), _jsxs("div", { style: { fontSize: '12px', color: 'var(--muted)' }, children: [settings.lineWidth, "px"] })] }), _jsx("div", { children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: settings.showVolume, onChange: (e) => updateSettings({ showVolume: e.target.checked }) }), "Show Volume"] }) }), _jsx("div", { children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: settings.showGrid, onChange: (e) => updateSettings({ showGrid: e.target.checked }) }), "Show Grid"] }) }), _jsx("div", { children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: settings.autoScale, onChange: (e) => updateSettings({ autoScale: e.target.checked }) }), "Auto Scale"] }) }), _jsx("div", { children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: settings.logScale, onChange: (e) => updateSettings({ logScale: e.target.checked }) }), "Log Scale"] }) })] })), activeTab === 'format' && (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Time Format" }), _jsxs("select", { value: settings.timeFormat, onChange: (e) => updateSettings({ timeFormat: e.target.value }), style: { width: '100%' }, children: [_jsx("option", { value: "24h", children: "24 Hour" }), _jsx("option", { value: "12h", children: "12 Hour" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }, children: "Price Precision" }), _jsxs("select", { value: settings.priceFormat, onChange: (e) => updateSettings({ priceFormat: e.target.value }), style: { width: '100%' }, children: [_jsx("option", { value: "auto", children: "Auto" }), _jsx("option", { value: "2", children: "2 Decimals" }), _jsx("option", { value: "4", children: "4 Decimals" }), _jsx("option", { value: "6", children: "6 Decimals" })] })] })] })), _jsxs("div", { className: "controls-row", style: { marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }, children: [_jsx("button", { onClick: resetToDefaults, style: {
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDD04 Reset" }), _jsx("button", { onClick: exportSettings, style: {
                                    background: 'var(--accent)',
                                    border: '1px solid var(--accent)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDCBE Export" }), _jsxs("label", { style: {
                                    background: 'var(--green)',
                                    border: '1px solid var(--green)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-block'
                                }, children: ["\uD83D\uDCC1 Import", _jsx("input", { type: "file", accept: ".json", onChange: importSettings, style: { display: 'none' } })] })] })] }))] }));
}
// Hook for persisting chart settings
export function useChartSettings(key = 'chartSettings') {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        }
        catch {
            return DEFAULT_SETTINGS;
        }
    });
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(settings));
    }, [settings, key]);
    return [settings, setSettings];
}
