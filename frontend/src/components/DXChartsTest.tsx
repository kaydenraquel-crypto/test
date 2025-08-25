// Simple DXCharts import test
import React, { useState, useEffect } from 'react'

export default function DXChartsTest() {
  const [testResults, setTestResults] = useState({
    available: false,
    error: '',
    exports: [],
    packageInfo: ''
  })

  useEffect(() => {
    // Test multiple import methods
    const runTests = async () => {
      const results = {
        available: false,
        error: '',
        exports: [],
        packageInfo: ''
      }

      try {
        // Method 1: ES6 import
        console.log('🧪 Testing ES6 import...')
        const { createChart } = await import('@devexperts/dxcharts-lite')
        if (typeof createChart === 'function') {
          results.available = true
          results.exports.push('createChart (function)')
          console.log('✅ ES6 import successful')
        }
      } catch (error1) {
        console.warn('⚠️ ES6 import failed:', error1.message)
        results.error += `ES6: ${error1.message}; `
        
        try {
          // Method 2: CommonJS require
          console.log('🧪 Testing CommonJS require...')
          const dxcharts = require('@devexperts/dxcharts-lite')
          if (dxcharts && typeof dxcharts.createChart === 'function') {
            results.available = true
            results.exports.push('createChart (via require)')
            console.log('✅ CommonJS require successful')
          }
          results.exports.push(...Object.keys(dxcharts || {}))
        } catch (error2) {
          console.warn('⚠️ CommonJS require failed:', error2.message)
          results.error += `CommonJS: ${error2.message}; `
          
          try {
            // Method 3: Check if installed
            console.log('🧪 Testing package availability...')
            const pkg = require('@devexperts/dxcharts-lite/package.json')
            results.packageInfo = `v${pkg.version}`
            console.log('📦 Package found:', pkg.name, pkg.version)
          } catch (error3) {
            console.error('❌ Package not found:', error3.message)
            results.error += `Package: ${error3.message}; `
          }
        }
      }

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      borderRadius: '8px',
      border: '2px solid #333',
      margin: '10px 0'
    }}>
      <h3>🧪 DXCharts Import Test</h3>
      <div style={{ marginTop: '10px' }}>
        <strong>Status:</strong> {testResults.available ? 
          <span style={{ color: '#4caf50' }}>✅ Available</span> : 
          <span style={{ color: '#f44336' }}>❌ Failed</span>
        }
      </div>
      
      {testResults.packageInfo && (
        <div style={{ marginTop: '10px' }}>
          <strong>Version:</strong> {testResults.packageInfo}
        </div>
      )}
      
      {testResults.exports.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Exports:</strong> {testResults.exports.join(', ')}
        </div>
      )}
      
      {testResults.error && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#2d1b1b',
          borderRadius: '4px',
          color: '#f44336'
        }}>
          <strong>Errors:</strong> {testResults.error}
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#888' }}>
        This test verifies that @devexperts/dxcharts-lite can be imported successfully.
        <br />Check browser console for detailed logs.
      </div>
    </div>
  )
}