import React, { useState, useCallback } from 'react'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Image, 
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Share2,
  Archive,
  Copy
} from 'lucide-react'

interface ExportFormat {
  id: 'csv' | 'json' | 'excel' | 'pdf' | 'png' | 'clipboard'
  name: string
  icon: React.FC<any>
  description: string
  available: boolean
}

interface ExportOption {
  id: string
  label: string
  checked: boolean
  description?: string
}

interface DataExportProps {
  selectedSymbol?: string
  currentPrice?: number
}

const DataExportEnhanced: React.FC<DataExportProps> = ({ 
  selectedSymbol = 'BTCUSDT',
  currentPrice = 43250
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [lastExport, setLastExport] = useState<Date | null>(null)
  
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    { id: 'priceData', label: 'Price Data (OHLCV)', checked: true, description: 'Candlestick and volume data' },
    { id: 'indicators', label: 'Technical Indicators', checked: true, description: 'SMA, EMA, RSI, MACD, etc.' },
    { id: 'trades', label: 'Trade History', checked: true, description: 'All executed trades and orders' },
    { id: 'portfolio', label: 'Portfolio Positions', checked: true, description: 'Current holdings and P&L' },
    { id: 'watchlist', label: 'Watchlist Symbols', checked: false, description: 'Tracked symbols and alerts' },
    { id: 'news', label: 'News & Sentiment', checked: false, description: 'Recent news with AI analysis' },
    { id: 'scanner', label: 'Scanner Results', checked: false, description: 'Market opportunities found' },
    { id: 'analytics', label: 'Performance Analytics', checked: true, description: 'Trading stats and metrics' },
    { id: 'settings', label: 'Chart Settings', checked: false, description: 'Custom themes and configs' }
  ])

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      icon: FileSpreadsheet,
      description: 'Spreadsheet compatible format',
      available: true
    },
    {
      id: 'json',
      name: 'JSON',
      icon: FileJson,
      description: 'Structured data format',
      available: true
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: FileText,
      description: 'Microsoft Excel workbook',
      available: true
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: FileText,
      description: 'Professional trading report',
      available: true
    },
    {
      id: 'png',
      name: 'Chart Image',
      icon: Image,
      description: 'High-res chart screenshot',
      available: true
    },
    {
      id: 'clipboard',
      name: 'Copy to Clipboard',
      icon: Copy,
      description: 'Quick copy for sharing',
      available: true
    }
  ]

  const toggleOption = useCallback((optionId: string) => {
    setExportOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, checked: !opt.checked } : opt
    ))
  }, [])

  const selectAllOptions = useCallback(() => {
    setExportOptions(prev => prev.map(opt => ({ ...opt, checked: true })))
  }, [])

  const deselectAllOptions = useCallback(() => {
    setExportOptions(prev => prev.map(opt => ({ ...opt, checked: false })))
  }, [])

  // Generate sample data for export
  const generateExportData = useCallback(() => {
    const selectedOptions = exportOptions.filter(opt => opt.checked)
    const data: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        symbol: selectedSymbol,
        currentPrice: currentPrice,
        platform: 'NovaSignal v0.2',
        exportedBy: 'User'
      }
    }

    // Add price data
    if (selectedOptions.find(o => o.id === 'priceData')) {
      data.priceData = Array.from({ length: 100 }, (_, i) => {
        const timestamp = Date.now() - (100 - i) * 3600000
        const open = 42000 + Math.random() * 2000
        const close = open + (Math.random() - 0.5) * 500
        const high = Math.max(open, close) + Math.random() * 200
        const low = Math.min(open, close) - Math.random() * 200
        const volume = Math.random() * 1000000
        
        return { timestamp, open, high, low, close, volume }
      })
    }

    // Add indicators
    if (selectedOptions.find(o => o.id === 'indicators')) {
      data.indicators = {
        sma20: 42800,
        sma50: 42500,
        ema20: 42900,
        ema50: 42600,
        rsi: 58.5,
        macd: { value: 150, signal: 120, histogram: 30 },
        bollingerBands: { upper: 44000, middle: 43000, lower: 42000 }
      }
    }

    // Add trades
    if (selectedOptions.find(o => o.id === 'trades')) {
      data.trades = Array.from({ length: 20 }, (_, i) => ({
        id: `T${1000 + i}`,
        timestamp: Date.now() - Math.random() * 86400000 * 7,
        symbol: selectedSymbol,
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        quantity: Math.random() * 0.5,
        price: 40000 + Math.random() * 5000,
        fee: Math.random() * 10,
        pnl: (Math.random() - 0.5) * 500
      }))
    }

    // Add portfolio
    if (selectedOptions.find(o => o.id === 'portfolio')) {
      data.portfolio = {
        totalValue: 50000,
        totalPnL: 2500,
        positions: [
          { symbol: 'BTCUSDT', quantity: 0.5, avgPrice: 42000, currentValue: 21625 },
          { symbol: 'ETHUSDT', quantity: 3, avgPrice: 2500, currentValue: 7740 },
          { symbol: 'BNBUSDT', quantity: 10, avgPrice: 310, currentValue: 3156 }
        ]
      }
    }

    // Add analytics
    if (selectedOptions.find(o => o.id === 'analytics')) {
      data.analytics = {
        totalTrades: 150,
        winRate: 62.5,
        profitFactor: 1.8,
        sharpeRatio: 1.2,
        maxDrawdown: -3500,
        avgWin: 350,
        avgLoss: -200
      }
    }

    return data
  }, [exportOptions, selectedSymbol, currentPrice])

  // Export functions
  const exportToCSV = useCallback((data: any) => {
    const rows: string[] = []
    
    // Add metadata
    rows.push('NovaSignal Export Report')
    rows.push(`Symbol,${data.metadata.symbol}`)
    rows.push(`Export Date,${new Date(data.metadata.exportDate).toLocaleString()}`)
    rows.push('')

    // Add price data
    if (data.priceData) {
      rows.push('Timestamp,Open,High,Low,Close,Volume')
      data.priceData.forEach((candle: any) => {
        rows.push(`${new Date(candle.timestamp).toISOString()},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}`)
      })
    }

    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novasignal-${selectedSymbol}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedSymbol])

  const exportToJSON = useCallback((data: any) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novasignal-${selectedSymbol}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedSymbol])

  const copyToClipboard = useCallback(async (data: any) => {
    const text = JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(text)
  }, [])

  const handleExport = useCallback(async () => {
    if (isExporting) return
    
    const selectedOptions = exportOptions.filter(opt => opt.checked)
    if (selectedOptions.length === 0) {
      alert('Please select at least one data type to export')
      return
    }

    setIsExporting(true)
    setExportStatus('exporting')

    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const data = generateExportData()
      
      switch (selectedFormat) {
        case 'csv':
          exportToCSV(data)
          break
        case 'json':
          exportToJSON(data)
          break
        case 'clipboard':
          await copyToClipboard(data)
          break
        default:
          // For other formats, just export as JSON for now
          exportToJSON(data)
      }

      setExportStatus('success')
      setLastExport(new Date())
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      setTimeout(() => {
        setExportStatus('idle')
      }, 3000)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, exportOptions, selectedFormat, generateExportData, exportToCSV, exportToJSON, copyToClipboard])

  const getStatusMessage = () => {
    switch (exportStatus) {
      case 'exporting':
        return 'Preparing export...'
      case 'success':
        return 'Export completed successfully!'
      case 'error':
        return 'Export failed. Please try again.'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (exportStatus) {
      case 'success':
        return '#00d4aa'
      case 'error':
        return '#ff6b6b'
      default:
        return '#888'
    }
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ 
              color: '#ef4444', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database style={{ width: '18px', height: '18px' }} />
              Data Export
            </h3>
            <div style={{ 
              color: '#888', 
              fontSize: '12px'
            }}>
              Export your trading data in multiple formats
            </div>
          </div>
          
          {lastExport && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#666',
              fontSize: '11px'
            }}>
              <Clock style={{ width: '12px', height: '12px' }} />
              Last export: {lastExport.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Format Selection */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        backgroundColor: '#0a0a0a'
      }}>
        <h4 style={{ 
          color: 'white', 
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Select Export Format
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px'
        }}>
          {exportFormats.map(format => {
            const Icon = format.icon
            const isSelected = selectedFormat === format.id
            
            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                disabled={!format.available}
                style={{
                  backgroundColor: isSelected ? '#ef4444' : '#2a2a2a',
                  border: `1px solid ${isSelected ? '#ef4444' : '#333'}`,
                  borderRadius: '8px',
                  padding: '12px 8px',
                  cursor: format.available ? 'pointer' : 'not-allowed',
                  opacity: format.available ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{
                  width: '20px',
                  height: '20px',
                  margin: '0 auto 4px',
                  color: isSelected ? 'white' : '#888'
                }} />
                <div style={{
                  color: isSelected ? 'white' : '#ccc',
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}>
                  {format.name}
                </div>
                <div style={{
                  color: isSelected ? '#fca5a5' : '#666',
                  fontSize: '10px',
                  marginTop: '2px'
                }}>
                  {format.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Data Selection */}
      <div style={{
        padding: '20px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h4 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Select Data to Export
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={selectAllOptions}
              style={{
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Select All
            </button>
            <button
              onClick={deselectAllOptions}
              style={{
                padding: '4px 8px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gap: '8px'
        }}>
          {exportOptions.map(option => (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              style={{
                backgroundColor: option.checked ? '#1a1a1a' : '#0a0a0a',
                border: `1px solid ${option.checked ? '#ef4444' : '#333'}`,
                borderRadius: '6px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      backgroundColor: option.checked ? '#ef4444' : 'transparent',
                      border: `2px solid ${option.checked ? '#ef4444' : '#666'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {option.checked && (
                        <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                      )}
                    </div>
                    <span style={{
                      color: option.checked ? 'white' : '#ccc',
                      fontSize: '13px',
                      fontWeight: option.checked ? 'bold' : 'normal'
                    }}>
                      {option.label}
                    </span>
                  </div>
                  {option.description && (
                    <div style={{
                      marginLeft: '24px',
                      marginTop: '4px',
                      color: '#666',
                      fontSize: '11px'
                    }}>
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid #333'
      }}>
        {/* Status Message */}
        {exportStatus !== 'idle' && (
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: exportStatus === 'success' ? '#0a3326' : exportStatus === 'error' ? '#3a1a1a' : '#1a1a1a',
            border: `1px solid ${getStatusColor()}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {exportStatus === 'exporting' && (
              <Archive style={{ width: '14px', height: '14px', color: '#888', animation: 'spin 1s linear infinite' }} />
            )}
            {exportStatus === 'success' && (
              <CheckCircle style={{ width: '14px', height: '14px', color: '#00d4aa' }} />
            )}
            {exportStatus === 'error' && (
              <AlertCircle style={{ width: '14px', height: '14px', color: '#ff6b6b' }} />
            )}
            <span style={{
              color: getStatusColor(),
              fontSize: '12px'
            }}>
              {getStatusMessage()}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#666'
          }}>
            {exportOptions.filter(o => o.checked).length} data types selected
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#888',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 style={{ width: '14px', height: '14px' }} />
              Share
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting || exportOptions.filter(o => o.checked).length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: isExporting ? '#666' : '#ef4444',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: exportOptions.filter(o => o.checked).length === 0 ? 0.5 : 1
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataExportEnhanced