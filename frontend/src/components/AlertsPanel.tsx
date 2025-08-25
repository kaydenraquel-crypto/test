// Price Alerts and Notifications System
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, Plus, Trash2, Eye, EyeOff, AlertTriangle, TrendingUp, TrendingDown, Target, Volume2, Activity, Mail, Smartphone } from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  market: 'crypto' | 'stocks';
  type: 'price' | 'indicator' | 'volume' | 'portfolio';
  condition: 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'equals';
  value: number;
  targetValue?: number; // For range alerts
  indicator?: string; // RSI, MACD, etc.
  message?: string;
  isEnabled: boolean;
  isTriggered: boolean;
  createdAt: number;
  triggeredAt?: number;
  notificationMethods: ('browser' | 'sound' | 'email')[];
  priority: 'low' | 'medium' | 'high';
}

interface AlertHistory {
  id: string;
  alertId: string;
  symbol: string;
  message: string;
  triggeredAt: number;
  price?: number;
  acknowledged: boolean;
}

interface Props {
  currentSymbol?: string;
  currentMarket?: 'crypto' | 'stocks';
  currentPrice?: number;
  indicators?: any;
  style?: React.CSSProperties;
}

const AlertsPanel: React.FC<Props> = ({ 
  currentSymbol, 
  currentMarket, 
  currentPrice, 
  indicators,
  style 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    market: 'crypto' as 'crypto' | 'stocks',
    type: 'price' as Alert['type'],
    condition: 'above' as Alert['condition'],
    value: '',
    targetValue: '',
    indicator: 'rsi',
    message: '',
    notificationMethods: ['browser'] as Alert['notificationMethods'],
    priority: 'medium' as Alert['priority']
  });

  // Load alerts from localStorage
  useEffect(() => {
    const storedAlerts = localStorage.getItem('novasignal_alerts');
    const storedHistory = localStorage.getItem('novasignal_alert_history');
    
    if (storedAlerts) {
      try {
        setAlerts(JSON.parse(storedAlerts));
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    }
    
    if (storedHistory) {
      try {
        setAlertHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Failed to load alert history:', error);
      }
    }
  }, []);

  // Save alerts to localStorage
  const saveAlerts = useCallback((newAlerts: Alert[]) => {
    try {
      localStorage.setItem('novasignal_alerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }, []);

  // Save alert history
  const saveAlertHistory = useCallback((newHistory: AlertHistory[]) => {
    try {
      localStorage.setItem('novasignal_alert_history', JSON.stringify(newHistory));
      setAlertHistory(newHistory);
    } catch (error) {
      console.error('Failed to save alert history:', error);
    }
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Trigger notification
  const triggerNotification = useCallback((alert: Alert, currentPrice: number) => {
    const message = alert.message || `${alert.symbol} ${alert.condition} ${alert.value}`;
    
    // Browser notification
    if (alert.notificationMethods.includes('browser') && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`NovaSignal Alert: ${alert.symbol}`, {
        body: `${message}\nCurrent Price: $${currentPrice.toFixed(2)}`,
        icon: '/favicon.ico',
        tag: alert.id
      });
    }
    
    // Sound notification
    if (alert.notificationMethods.includes('sound')) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H...'); // Alert sound
      audio.play().catch(() => {
        // Fallback to simple beep if audio fails
        console.log('🔔 Alert triggered for', alert.symbol);
      });
    }
  }, []);

  // Check alerts against current data
  const checkAlerts = useCallback(() => {
    if (!currentSymbol || !currentPrice) return;

    const updatedAlerts = [...alerts];
    const newHistoryEntries: AlertHistory[] = [];

    alerts.forEach((alert, index) => {
      if (!alert.isEnabled || alert.isTriggered) return;
      if (alert.symbol !== currentSymbol || alert.market !== currentMarket) return;

      let shouldTrigger = false;
      let alertMessage = alert.message || '';

      switch (alert.type) {
        case 'price':
          switch (alert.condition) {
            case 'above':
              shouldTrigger = currentPrice > alert.value;
              alertMessage = alertMessage || `${alert.symbol} price is above $${alert.value}`;
              break;
            case 'below':
              shouldTrigger = currentPrice < alert.value;
              alertMessage = alertMessage || `${alert.symbol} price is below $${alert.value}`;
              break;
            case 'equals':
              const tolerance = alert.value * 0.01; // 1% tolerance
              shouldTrigger = Math.abs(currentPrice - alert.value) <= tolerance;
              alertMessage = alertMessage || `${alert.symbol} price reached $${alert.value}`;
              break;
          }
          break;

        case 'indicator':
          if (indicators && indicators[alert.indicator]) {
            const indicatorValue = indicators[alert.indicator]?.[indicators[alert.indicator].length - 1];
            if (indicatorValue !== undefined) {
              switch (alert.condition) {
                case 'above':
                  shouldTrigger = indicatorValue > alert.value;
                  alertMessage = alertMessage || `${alert.symbol} ${alert.indicator.toUpperCase()} is above ${alert.value}`;
                  break;
                case 'below':
                  shouldTrigger = indicatorValue < alert.value;
                  alertMessage = alertMessage || `${alert.symbol} ${alert.indicator.toUpperCase()} is below ${alert.value}`;
                  break;
              }
            }
          }
          break;

        case 'volume':
          // Volume alerts would need volume data
          break;
      }

      if (shouldTrigger) {
        // Mark alert as triggered
        updatedAlerts[index] = {
          ...alert,
          isTriggered: true,
          triggeredAt: Date.now()
        };

        // Add to history
        const historyEntry: AlertHistory = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          alertId: alert.id,
          symbol: alert.symbol,
          message: alertMessage,
          triggeredAt: Date.now(),
          price: currentPrice,
          acknowledged: false
        };
        newHistoryEntries.push(historyEntry);

        // Trigger notification
        triggerNotification(alert, currentPrice);
      }
    });

    if (newHistoryEntries.length > 0) {
      saveAlerts(updatedAlerts);
      saveAlertHistory([...alertHistory, ...newHistoryEntries]);
    }
  }, [alerts, alertHistory, currentSymbol, currentMarket, currentPrice, indicators, saveAlerts, saveAlertHistory, triggerNotification]);

  // Check alerts when price or indicators change
  useEffect(() => {
    const timeoutId = setTimeout(checkAlerts, 1000); // Debounce checks
    return () => clearTimeout(timeoutId);
  }, [checkAlerts]);

  // Create new alert
  const createAlert = useCallback(() => {
    if (!newAlert.symbol || !newAlert.value) return;

    const alert: Alert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      symbol: newAlert.symbol.toUpperCase(),
      market: newAlert.market,
      type: newAlert.type,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
      targetValue: newAlert.targetValue ? parseFloat(newAlert.targetValue) : undefined,
      indicator: newAlert.indicator,
      message: newAlert.message.trim() || undefined,
      isEnabled: true,
      isTriggered: false,
      createdAt: Date.now(),
      notificationMethods: newAlert.notificationMethods,
      priority: newAlert.priority
    };

    saveAlerts([...alerts, alert]);

    // Reset form
    setNewAlert({
      symbol: '',
      market: 'crypto',
      type: 'price',
      condition: 'above',
      value: '',
      targetValue: '',
      indicator: 'rsi',
      message: '',
      notificationMethods: ['browser'],
      priority: 'medium'
    });
    setShowCreateForm(false);
  }, [alerts, newAlert, saveAlerts]);

  // Quick create alert for current symbol
  const createQuickAlert = useCallback(() => {
    if (currentSymbol && currentMarket && currentPrice) {
      setNewAlert({
        ...newAlert,
        symbol: currentSymbol,
        market: currentMarket,
        value: currentPrice.toString()
      });
      setShowCreateForm(true);
    }
  }, [currentSymbol, currentMarket, currentPrice, newAlert]);

  // Toggle alert enabled/disabled
  const toggleAlert = useCallback((alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, isEnabled: !alert.isEnabled } : alert
    );
    saveAlerts(updatedAlerts);
  }, [alerts, saveAlerts]);

  // Delete alert
  const deleteAlert = useCallback((alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    saveAlerts(updatedAlerts);
  }, [alerts, saveAlerts]);

  // Reset triggered alert
  const resetAlert = useCallback((alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, isTriggered: false, triggeredAt: undefined } : alert
    );
    saveAlerts(updatedAlerts);
  }, [alerts, saveAlerts]);

  // Acknowledge alert in history
  const acknowledgeAlert = useCallback((historyId: string) => {
    const updatedHistory = alertHistory.map(item =>
      item.id === historyId ? { ...item, acknowledged: true } : item
    );
    saveAlertHistory(updatedHistory);
  }, [alertHistory, saveAlertHistory]);

  // Stats
  const stats = useMemo(() => {
    const activeAlerts = alerts.filter(alert => alert.isEnabled && !alert.isTriggered).length;
    const triggeredAlerts = alerts.filter(alert => alert.isTriggered).length;
    const unacknowledgedAlerts = alertHistory.filter(item => !item.acknowledged).length;

    return {
      total: alerts.length,
      active: activeAlerts,
      triggered: triggeredAlerts,
      unacknowledged: unacknowledgedAlerts
    };
  }, [alerts, alertHistory]);

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />;
      case 'indicator': return <Activity className="w-4 h-4" />;
      case 'volume': return <Volume2 className="w-4 h-4" />;
      case 'portfolio': return <Target className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="panel" style={style}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell className="w-5 h-5" />
          Alerts
          {stats.unacknowledged > 0 && (
            <span style={{
              fontSize: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {stats.unacknowledged}
            </span>
          )}
        </h3>
        
        <div style={{ display: 'flex', gap: 4 }}>
          {currentSymbol && currentPrice && (
            <button
              onClick={createQuickAlert}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title={`Quick alert for ${currentSymbol}`}
            >
              + {currentSymbol}
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : '+ Alert'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        border: '1px solid #e9ecef'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Total</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>{stats.active}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Active</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>{stats.triggered}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Triggered</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>{stats.unacknowledged}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>Pending</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button
          onClick={() => setViewMode('active')}
          style={{
            fontSize: '11px',
            padding: '4px 12px',
            backgroundColor: viewMode === 'active' ? '#2196f3' : '#f5f5f5',
            color: viewMode === 'active' ? 'white' : '#666',
            border: '1px solid #ddd',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Active Alerts ({stats.active + stats.triggered})
        </button>
        <button
          onClick={() => setViewMode('history')}
          style={{
            fontSize: '11px',
            padding: '4px 12px',
            backgroundColor: viewMode === 'history' ? '#2196f3' : '#f5f5f5',
            color: viewMode === 'history' ? 'white' : '#666',
            border: '1px solid #ddd',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          History ({alertHistory.length})
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #ddd'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Create Alert</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
            <select
              value={newAlert.market}
              onChange={e => setNewAlert(prev => ({ ...prev, market: e.target.value as any }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="crypto">Crypto</option>
              <option value="stocks">Stocks</option>
            </select>
            <input
              type="text"
              value={newAlert.symbol}
              onChange={e => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              placeholder={newAlert.market === 'crypto' ? 'BTC/USD' : 'AAPL'}
              style={{ fontSize: '12px', padding: '4px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <select
              value={newAlert.type}
              onChange={e => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="price">Price Alert</option>
              <option value="indicator">Technical Indicator</option>
              <option value="volume">Volume Alert</option>
            </select>
            
            <select
              value={newAlert.condition}
              onChange={e => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="equals">Equals</option>
              <option value="crosses_up">Crosses Up</option>
              <option value="crosses_down">Crosses Down</option>
            </select>
          </div>
          
          {newAlert.type === 'indicator' && (
            <div style={{ marginBottom: 8 }}>
              <select
                value={newAlert.indicator}
                onChange={e => setNewAlert(prev => ({ ...prev, indicator: e.target.value }))}
                style={{ width: '100%', fontSize: '12px', padding: '4px' }}
              >
                <option value="rsi">RSI</option>
                <option value="macd_hist">MACD Histogram</option>
                <option value="macd_signal">MACD Signal</option>
                <option value="sma">SMA</option>
                <option value="ema">EMA</option>
                <option value="bb_high">Bollinger Upper</option>
                <option value="bb_low">Bollinger Lower</option>
              </select>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              value={newAlert.value}
              onChange={e => setNewAlert(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Alert Value"
              step="any"
              style={{ fontSize: '12px', padding: '4px' }}
            />
            
            <select
              value={newAlert.priority}
              onChange={e => setNewAlert(prev => ({ ...prev, priority: e.target.value as any }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            
            <select
              value={newAlert.notificationMethods[0]}
              onChange={e => setNewAlert(prev => ({ ...prev, notificationMethods: [e.target.value as any] }))}
              style={{ fontSize: '12px', padding: '4px' }}
            >
              <option value="browser">🔔 Browser</option>
              <option value="sound">🔊 Sound</option>
            </select>
          </div>
          
          <input
            type="text"
            value={newAlert.message}
            onChange={e => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Custom message (optional)"
            style={{ width: '100%', fontSize: '12px', padding: '4px', marginBottom: 12 }}
          />
          
          <button
            onClick={createAlert}
            disabled={!newAlert.symbol || !newAlert.value}
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '8px',
              backgroundColor: newAlert.symbol && newAlert.value ? '#4caf50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: newAlert.symbol && newAlert.value ? 'pointer' : 'not-allowed'
            }}
          >
            Create Alert
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {viewMode === 'active' ? (
          // Active Alerts
          alerts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 32,
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              border: '2px dashed #dee2e6'
            }}>
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <div style={{ fontSize: '14px', marginBottom: 8 }}>No alerts configured</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Create your first alert to monitor prices and indicators
              </div>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: 12,
                  backgroundColor: alert.isTriggered ? '#ffebee' : alert.isEnabled ? 'white' : '#f5f5f5',
                  border: `1px solid ${alert.isTriggered ? '#ffcdd2' : '#eee'}`,
                  borderLeft: `4px solid ${getPriorityColor(alert.priority)}`,
                  borderRadius: 8,
                  marginBottom: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {getTypeIcon(alert.type)}
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {alert.symbol}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: alert.market === 'crypto' ? '#ff9800' : '#2196f3',
                        color: 'white',
                        borderRadius: '10px',
                        textTransform: 'uppercase'
                      }}>
                        {alert.market}
                      </span>
                      {alert.isTriggered && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          borderRadius: '10px'
                        }}>
                          TRIGGERED
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                      {alert.type === 'indicator' ? alert.indicator?.toUpperCase() : 'Price'} {alert.condition} {alert.value}
                      {alert.message && (
                        <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: 4 }}>
                          "{alert.message}"
                        </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      Created: {new Date(alert.createdAt).toLocaleDateString()}
                      {alert.triggeredAt && (
                        <span> • Triggered: {new Date(alert.triggeredAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      style={{
                        fontSize: '10px',
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      title={alert.isEnabled ? 'Disable' : 'Enable'}
                    >
                      {alert.isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    
                    {alert.isTriggered && (
                      <button
                        onClick={() => resetAlert(alert.id)}
                        style={{
                          fontSize: '10px',
                          padding: '4px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Reset alert"
                      >
                        Reset
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      style={{
                        fontSize: '10px',
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: '1px solid #f44336',
                        color: '#f44336',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      title="Delete alert"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          // Alert History
          alertHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 32,
              color: '#666'
            }}>
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <div style={{ fontSize: '14px' }}>No alert history yet</div>
            </div>
          ) : (
            alertHistory
              .sort((a, b) => b.triggeredAt - a.triggeredAt)
              .map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: 12,
                    backgroundColor: item.acknowledged ? '#f8f9fa' : '#fff3cd',
                    border: `1px solid ${item.acknowledged ? '#e9ecef' : '#ffeaa7'}`,
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: 4 }}>
                        {item.symbol}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                        {item.message}
                      </div>
                      {item.price && (
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          Price: ${item.price.toFixed(2)}
                        </div>
                      )}
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        {new Date(item.triggeredAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {!item.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(item.id)}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Ack
                      </button>
                    )}
                  </div>
                </div>
              ))
          )
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;