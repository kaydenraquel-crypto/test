export class DataExporter {
    // CSV Export functionality
    static exportToCSV(data, filename) {
        const csvContent = this.generateCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename || `${data.symbol}_${data.timestamp}.csv`);
    }
    static generateCSV(data) {
        let csv = `# ${data.symbol} Trading Data Export\n`;
        csv += `# Market: ${data.market}\n`;
        csv += `# Timeframe: ${data.timeframe}\n`;
        csv += `# Exported: ${data.timestamp}\n\n`;
        // OHLCV Data
        if (data.data && data.data.length > 0) {
            csv += '# Price Data (OHLCV)\n';
            csv += 'Timestamp,Date,Open,High,Low,Close,Volume\n';
            data.data.forEach((candle) => {
                const date = new Date(candle.time * 1000).toISOString();
                csv += `${candle.time},${date},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume || ''}\n`;
            });
            csv += '\n';
        }
        // Indicators
        if (data.indicators) {
            csv += '# Technical Indicators\n';
            // SMA
            if (data.indicators.sma && data.indicators.sma.length > 0) {
                csv += 'Timestamp,Date,SMA_20,SMA_50\n';
                data.indicators.sma.forEach((item) => {
                    const date = new Date(item.time * 1000).toISOString();
                    csv += `${item.time},${date},${item.sma_20 || ''},${item.sma_50 || ''}\n`;
                });
                csv += '\n';
            }
            // EMA
            if (data.indicators.ema && data.indicators.ema.length > 0) {
                csv += 'Timestamp,Date,EMA_12,EMA_26\n';
                data.indicators.ema.forEach((item) => {
                    const date = new Date(item.time * 1000).toISOString();
                    csv += `${item.time},${date},${item.ema_12 || ''},${item.ema_26 || ''}\n`;
                });
                csv += '\n';
            }
            // RSI
            if (data.indicators.rsi && data.indicators.rsi.length > 0) {
                csv += 'Timestamp,Date,RSI\n';
                data.indicators.rsi.forEach((item) => {
                    const date = new Date(item.time * 1000).toISOString();
                    csv += `${item.time},${date},${item.value || ''}\n`;
                });
                csv += '\n';
            }
            // Bollinger Bands
            if (data.indicators.bollinger && data.indicators.bollinger.length > 0) {
                csv += 'Timestamp,Date,BB_Upper,BB_Middle,BB_Lower\n';
                data.indicators.bollinger.forEach((item) => {
                    const date = new Date(item.time * 1000).toISOString();
                    csv += `${item.time},${date},${item.upper || ''},${item.middle || ''},${item.lower || ''}\n`;
                });
                csv += '\n';
            }
        }
        // Signals
        if (data.signals && data.signals.length > 0) {
            csv += '# Trading Signals\n';
            csv += 'Timestamp,Date,Signal_Type,Description,Price,Strength\n';
            data.signals.forEach((signal) => {
                const date = new Date(signal.time * 1000).toISOString();
                csv += `${signal.time},${date},${signal.type || ''},${signal.text || ''},${signal.price || ''},${signal.strength || ''}\n`;
            });
            csv += '\n';
        }
        // News
        if (data.news && data.news.length > 0) {
            csv += '# News Data\n';
            csv += 'Timestamp,Date,Title,Summary,URL,Source\n';
            data.news.forEach((item) => {
                const date = item.timestamp ? new Date(item.timestamp).toISOString() : '';
                const title = (item.title || '').replace(/"/g, '""'); // Escape quotes
                const summary = (item.summary || '').replace(/"/g, '""');
                csv += `${item.timestamp || ''},${date},"${title}","${summary}",${item.url || ''},${item.source || ''}\n`;
            });
        }
        return csv;
    }
    // PDF Export functionality (using browser's print API)
    static async exportToPDF(data, filename) {
        const htmlContent = this.generateHTML(data);
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            throw new Error('Could not open print window. Please check popup blocker.');
        }
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Wait for content to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    }
    static generateHTML(data) {
        const timestamp = new Date(data.timestamp).toLocaleString();
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.symbol} Trading Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { border-bottom: 2px solid #00d4aa; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #00d4aa; margin: 0; }
          .meta { color: #666; margin: 5px 0; }
          .section { margin: 20px 0; page-break-inside: avoid; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary-stats { display: flex; flex-wrap: wrap; gap: 20px; margin: 15px 0; }
          .stat-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; min-width: 120px; }
          .stat-value { font-size: 18px; font-weight: bold; color: #00d4aa; }
          .stat-label { font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.symbol} Trading Analysis Report</h1>
          <div class="meta">Market: ${data.market} | Timeframe: ${data.timeframe}</div>
          <div class="meta">Generated: ${timestamp}</div>
        </div>

        ${this.generateSummarySection(data)}
        ${this.generatePriceDataSection(data)}
        ${this.generateIndicatorsSection(data)}
        ${this.generateSignalsSection(data)}
        ${this.generateNewsSection(data)}
        
        <div class="section">
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            Generated by NovaSignal Trading Platform
          </p>
        </div>
      </body>
      </html>
    `;
    }
    static generateSummarySection(data) {
        if (!data.data || data.data.length === 0)
            return '';
        const latest = data.data[data.data.length - 1];
        const oldest = data.data[0];
        const priceChange = latest.close - oldest.open;
        const priceChangePercent = ((priceChange / oldest.open) * 100).toFixed(2);
        return `
      <div class="section">
        <h2>📊 Summary Statistics</h2>
        <div class="summary-stats">
          <div class="stat-box">
            <div class="stat-value">${latest.close.toFixed(4)}</div>
            <div class="stat-label">Current Price</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" style="color: ${priceChange >= 0 ? '#00c853' : '#ff5252'}">${priceChangePercent}%</div>
            <div class="stat-label">Period Change</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${Math.max(...data.data.map((d) => d.high)).toFixed(4)}</div>
            <div class="stat-label">Period High</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${Math.min(...data.data.map((d) => d.low)).toFixed(4)}</div>
            <div class="stat-label">Period Low</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${data.data.length}</div>
            <div class="stat-label">Data Points</div>
          </div>
        </div>
      </div>
    `;
    }
    static generatePriceDataSection(data) {
        if (!data.data || data.data.length === 0)
            return '';
        // Show first 10 and last 10 rows for PDF
        const displayData = data.data.length > 20
            ? [...data.data.slice(0, 10), ...data.data.slice(-10)]
            : data.data;
        const rows = displayData.map((candle) => {
            const date = new Date(candle.time * 1000).toLocaleDateString();
            const time = new Date(candle.time * 1000).toLocaleTimeString();
            return `
        <tr>
          <td>${date}</td>
          <td>${time}</td>
          <td>${candle.open.toFixed(4)}</td>
          <td>${candle.high.toFixed(4)}</td>
          <td>${candle.low.toFixed(4)}</td>
          <td>${candle.close.toFixed(4)}</td>
          <td>${candle.volume || '-'}</td>
        </tr>
      `;
        }).join('');
        return `
      <div class="section">
        <h2>💹 Price Data (OHLCV)</h2>
        ${data.data.length > 20 ? '<p><em>Showing first 10 and last 10 entries</em></p>' : ''}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
    }
    static generateIndicatorsSection(data) {
        if (!data.indicators)
            return '';
        let html = '<div class="section"><h2>📈 Technical Indicators</h2>';
        // Add indicator summaries
        if (data.indicators.rsi && data.indicators.rsi.length > 0) {
            const latest = data.indicators.rsi[data.indicators.rsi.length - 1];
            const rsiLevel = latest.value > 70 ? 'Overbought' : latest.value < 30 ? 'Oversold' : 'Neutral';
            html += `<p><strong>RSI:</strong> ${latest.value.toFixed(2)} (${rsiLevel})</p>`;
        }
        if (data.indicators.sma && data.indicators.sma.length > 0) {
            const latest = data.indicators.sma[data.indicators.sma.length - 1];
            html += `<p><strong>Simple Moving Averages:</strong> SMA20: ${latest.sma_20?.toFixed(4) || 'N/A'}, SMA50: ${latest.sma_50?.toFixed(4) || 'N/A'}</p>`;
        }
        html += '</div>';
        return html;
    }
    static generateSignalsSection(data) {
        if (!data.signals || data.signals.length === 0)
            return '';
        const rows = data.signals.slice(-20).map((signal) => {
            const date = new Date(signal.time * 1000).toLocaleDateString();
            const time = new Date(signal.time * 1000).toLocaleTimeString();
            return `
        <tr>
          <td>${date} ${time}</td>
          <td>${signal.type || 'N/A'}</td>
          <td>${signal.text || 'N/A'}</td>
          <td>${signal.price?.toFixed(4) || 'N/A'}</td>
        </tr>
      `;
        }).join('');
        return `
      <div class="section">
        <h2>🎯 Trading Signals</h2>
        <p><em>Showing latest 20 signals</em></p>
        <table>
          <thead>
            <tr>
              <th>DateTime</th>
              <th>Type</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
    }
    static generateNewsSection(data) {
        if (!data.news || data.news.length === 0)
            return '';
        const rows = data.news.slice(0, 10).map((item) => {
            const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A';
            return `
        <tr>
          <td>${date}</td>
          <td>${item.title || 'N/A'}</td>
          <td>${item.summary || 'N/A'}</td>
          <td>${item.source || 'N/A'}</td>
        </tr>
      `;
        }).join('');
        return `
      <div class="section">
        <h2>📰 Recent News</h2>
        <p><em>Showing latest 10 news items</em></p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Summary</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
    }
    // Helper method to download files
    static downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    // Export chart as image (PNG)
    static async exportChartAsPNG(chartContainer, filename) {
        try {
            // Dynamic import of html2canvas
            const html2canvas = await import('html2canvas');
            const canvas = await html2canvas.default(chartContainer, {
                backgroundColor: '#1a1a1a',
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true
            });
            const blob = await new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 0.9);
            });
            this.downloadFile(blob, filename || `chart_${Date.now()}.png`);
        }
        catch (error) {
            console.error('Failed to export chart as PNG:', error);
            throw error;
        }
    }
}
export default DataExporter;
