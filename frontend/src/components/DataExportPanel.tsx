// Data export panel component
import React, { useState } from 'react'
import { DataExporter, type ExportData } from '../lib/dataExporter'
import { useAnalytics } from '../lib/analytics'
import { useLogger } from '../lib/logger'

interface DataExportPanelProps {
  symbol: string
  market: 'crypto' | 'stocks'
  timeframe: string
  data: any[]
  indicators?: any
  signals?: any[]
  news?: any[]
  chartContainer?: HTMLElement
  style?: React.CSSProperties
}

export const DataExportPanel = ({
  symbol,
  market,
  timeframe,
  data,
  indicators,
  signals,
  news,
  chartContainer,
  style
}: DataExportPanelProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('')
  const analytics = useAnalytics()
  const logger = useLogger()

  const prepareExportData = (): ExportData => ({
    symbol,
    market,
    timeframe,
    data,
    indicators,
    signals,
    news,
    timestamp: new Date().toISOString()
  })

  const handleCSVExport = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    setExportStatus('Preparing CSV export...')
    
    try {
      const exportData = prepareExportData()
      const filename = `${symbol}_${market}_${timeframe}_${Date.now()}.csv`
      
      DataExporter.exportToCSV(exportData, filename)
      
      setExportStatus('CSV exported successfully!')
      analytics.track('data_export', { 
        format: 'csv', 
        symbol, 
        market, 
        dataPoints: data.length 
      })
      logger.info(`Data exported to CSV: ${filename}`, { symbol, market, format: 'csv' })
      
      setTimeout(() => setExportStatus(''), 3000)
    } catch (error) {
      console.error('CSV export failed:', error)
      setExportStatus('CSV export failed. Please try again.')
      analytics.track('data_export_error', { format: 'csv', error: error?.toString() })
      setTimeout(() => setExportStatus(''), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePDFExport = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    setExportStatus('Generating PDF report...')
    
    try {
      const exportData = prepareExportData()
      await DataExporter.exportToPDF(exportData)
      
      setExportStatus('PDF report generated!')
      analytics.track('data_export', { 
        format: 'pdf', 
        symbol, 
        market, 
        dataPoints: data.length 
      })
      logger.info(`Data exported to PDF`, { symbol, market, format: 'pdf' })
      
      setTimeout(() => setExportStatus(''), 3000)
    } catch (error) {
      console.error('PDF export failed:', error)
      setExportStatus('PDF export failed. Please check popup settings.')
      analytics.track('data_export_error', { format: 'pdf', error: error?.toString() })
      setTimeout(() => setExportStatus(''), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const handleChartExport = async () => {
    if (isExporting || !chartContainer) return
    
    setIsExporting(true)
    setExportStatus('Capturing chart image...')
    
    try {
      const filename = `${symbol}_chart_${Date.now()}.png`
      await DataExporter.exportChartAsPNG(chartContainer, filename)
      
      setExportStatus('Chart image saved!')
      analytics.track('chart_export', { symbol, market })
      logger.info(`Chart exported as PNG: ${filename}`, { symbol, market })
      
      setTimeout(() => setExportStatus(''), 3000)
    } catch (error) {
      console.error('Chart export failed:', error)
      setExportStatus('Chart export not available.')
      setTimeout(() => setExportStatus(''), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const getDataSummary = () => {
    const summary = []
    if (data?.length) summary.push(`${data.length} price points`)
    if (indicators?.rsi?.length) summary.push(`${indicators.rsi.length} RSI values`)
    if (indicators?.sma?.length) summary.push(`${indicators.sma.length} SMA values`)
    if (signals?.length) summary.push(`${signals.length} signals`)
    if (news?.length) summary.push(`${news.length} news items`)
    return summary.join(', ') || 'No data available'
  }

  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '16px',
      color: 'white',
      ...style
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '18px' }}>📤</span>
        <h3 style={{ margin: 0, color: '#00d4aa' }}>Export Data</h3>
      </div>

      <div style={{
        fontSize: '14px',
        color: '#aaa',
        marginBottom: '16px',
        lineHeight: '1.4'
      }}>
        <div><strong>{symbol}</strong> ({market}) • {timeframe}</div>
        <div>{getDataSummary()}</div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 767 ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <button
          onClick={handleCSVExport}
          disabled={isExporting || !data?.length}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '4px',
            cursor: isExporting || !data?.length ? 'not-allowed' : 'pointer',
            opacity: isExporting || !data?.length ? 0.6 : 1,
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          title="Export all data as CSV spreadsheet"
        >
          📊 CSV
        </button>

        <button
          onClick={handlePDFExport}
          disabled={isExporting || !data?.length}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '4px',
            cursor: isExporting || !data?.length ? 'not-allowed' : 'pointer',
            opacity: isExporting || !data?.length ? 0.6 : 1,
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          title="Generate PDF trading report"
        >
          📄 PDF
        </button>

        <button
          onClick={handleChartExport}
          disabled={isExporting || !chartContainer}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '4px',
            cursor: isExporting || !chartContainer ? 'not-allowed' : 'pointer',
            opacity: isExporting || !chartContainer ? 0.6 : 1,
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          title="Export chart as PNG image"
        >
          📈 PNG
        </button>
      </div>

      {exportStatus && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: exportStatus.includes('failed') || exportStatus.includes('not available') 
            ? '#722f37' 
            : exportStatus.includes('successfully') || exportStatus.includes('generated') || exportStatus.includes('saved')
            ? '#1e4d32'
            : '#3d4145',
          border: `1px solid ${exportStatus.includes('failed') || exportStatus.includes('not available') 
            ? '#f5c6cb' 
            : exportStatus.includes('successfully') || exportStatus.includes('generated') || exportStatus.includes('saved')
            ? '#c3e6cb'
            : '#6c757d'}`,
          borderRadius: '4px',
          fontSize: '12px',
          textAlign: 'center',
          color: exportStatus.includes('failed') || exportStatus.includes('not available')
            ? '#f8d7da'
            : exportStatus.includes('successfully') || exportStatus.includes('generated') || exportStatus.includes('saved')
            ? '#d4edda'
            : '#e2e3e5'
        }}>
          {exportStatus}
        </div>
      )}

      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#666',
        textAlign: 'center'
      }}>
        💡 Tip: Use Ctrl+Shift+E for quick export
      </div>
    </div>
  )
}

export default DataExportPanel