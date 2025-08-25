import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';

interface HotMoment {
  symbol: string;
  market: string;
  hot_moments: any[];
  urgency: string;
}

interface ScanResult {
  scan_timestamp: string;
  opportunities: HotMoment[];
  total_alerts: number;
}

const MarketScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoScan, setAutoScan] = useState(false);

  const runScan = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/llm/scan');
      const data = await response.json();
      setScanResult(data);
    } catch (error) {
      console.error('Market scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scan every 5 minutes if enabled
  useEffect(() => {
    if (autoScan) {
      const interval = setInterval(runScan, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoScan]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Market Scanner</h3>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scan</span>
          </label>
          <button
            onClick={runScan}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Scan Markets</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div>
          {/* Summary */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Last scan: {formatTime(scanResult.scan_timestamp)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    {scanResult.total_alerts} opportunities found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities */}
          <div className="max-h-64 overflow-y-auto">
            {scanResult.opportunities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No Hot Moments Detected</p>
                <p className="text-sm">All scanned assets appear to be in normal trading conditions.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {scanResult.opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg text-gray-900">
                          {opportunity.symbol}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {opportunity.market}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getUrgencyColor(opportunity.urgency)}`}>
                          {opportunity.urgency.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    
                    <div className="space-y-2">
                      {opportunity.hot_moments.map((moment, momentIndex) => (
                        <div key={momentIndex} className="pl-4 border-l-2 border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="font-medium text-sm text-gray-800">
                              {moment.alert_type?.toUpperCase()} SIGNAL
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.round(moment.probability * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{moment.description}</p>
                          <p className="text-xs text-green-600 mt-1">{moment.expected_move}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!scanResult && !loading && (
        <div className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Market Scanner Ready</p>
          <p className="text-sm mb-4">
            Scan popular assets for high-probability trading opportunities and hot moments.
          </p>
          <button
            onClick={runScan}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Start Market Scan
          </button>
        </div>
      )}

      {/* Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          🔍 Scans BTC, ETH, AAPL, TSLA, NVDA, SPY for breakouts, squeezes, and momentum signals
        </p>
      </div>
    </div>
  );
};

export default MarketScanner;