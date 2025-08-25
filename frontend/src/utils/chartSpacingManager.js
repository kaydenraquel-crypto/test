// Chart spacing management utility - JavaScript version to bypass TS compilation issues
console.log('🚀 CHART SPACING MANAGER LOADED')

class ChartSpacingManager {
  constructor() {
    this.charts = new Map()
    this.observers = new Map()
    this.spacingConfig = {
      baseSpacing: 35,
      minSpacing: 20, 
      maxSpacing: 60,
      rightOffset: 30,
      autoResize: true
    }
    console.log('📊 ChartSpacingManager initialized with config:', this.spacingConfig)
  }

  // Register a chart for spacing management
  registerChart(chartId, chartInstance, dataLength = 0) {
    console.log(`🔗 Registering chart ${chartId} with ${dataLength} data points`)
    
    if (!chartInstance) {
      console.warn(`⚠️ Chart instance is null for ${chartId}`)
      return false
    }

    this.charts.set(chartId, {
      instance: chartInstance,
      dataLength: dataLength,
      lastSpacing: null,
      spacingApplied: false
    })

    // Apply initial spacing immediately
    this.applySpacing(chartId)

    // DISABLED: Mutation observer causes flashing - spacing will be applied on data changes only
    // this.setupMutationObserver(chartId)
    
    return true
  }

  // Apply spacing to a specific chart
  applySpacing(chartId, force = false) {
    const chartData = this.charts.get(chartId)
    if (!chartData) {
      console.warn(`⚠️ Chart ${chartId} not found in registry`)
      return false
    }

    try {
      const { instance, dataLength } = chartData
      
      // Calculate dynamic spacing - improved for better readability
      let spacing = this.spacingConfig.baseSpacing
      if (dataLength < 10) spacing = 35
      else if (dataLength < 25) spacing = 30  
      else if (dataLength < 50) spacing = 25
      else if (dataLength < 100) spacing = 20
      else if (dataLength < 200) spacing = 18
      else if (dataLength < 500) spacing = 16
      else if (dataLength < 1000) spacing = 14
      else spacing = 12 // Better spacing for 1000+ candles

      // Ensure minimum readability spacing for 1m charts
      spacing = Math.max(spacing, 12)
      
      console.log(`🎯 APPLYING SPACING: ${spacing}px to chart ${chartId} (${dataLength} candles, force: ${force})`)

      // Apply spacing configuration
      if (instance && instance.timeScale) {
        instance.timeScale().applyOptions({
          barSpacing: spacing,
          minBarSpacing: 4,
          rightOffset: dataLength < 100 ? 15 : 20, // Optimized right offset
          fixLeftEdge: false,
          fixRightEdge: false,
          timeVisible: true,
          secondsVisible: false,
          shiftVisibleRangeOnNewBar: true, // Always auto-scroll for live updates
          lockVisibleTimeRangeOnResize: false
        })
        
        // Smart view management based on dataset size
        if (force) {
          setTimeout(() => {
            try {
              if (dataLength < 100) {
                // Small datasets: show all data
                instance.timeScale().fitContent()
                console.log(`📐 Fitted ${dataLength} candles to full view`)
              } else {
                // Large datasets: use scrollToPosition to focus on recent data
                instance.timeScale().scrollToPosition(0, false) // Scroll to latest (rightmost)
                console.log(`📐 Scrolled to latest candles for ${dataLength} total candles`)
              }
            } catch (fitError) {
              console.warn(`⚠️ Could not adjust chart view:`, fitError)
            }
          }, 50) // Faster application
        }

        // Update tracking
        chartData.lastSpacing = spacing
        chartData.spacingApplied = true

        // DISABLED: fitContent() causes flashing and conflicts with spacing
        // if (force && dataLength < 50) {
        //   setTimeout(() => {
        //     try {
        //       instance.timeScale().fitContent()
        //       console.log(`📐 Fitted ${dataLength} candles to screen for ${chartId}`)
        //     } catch (fitError) {
        //       console.warn(`⚠️ Could not fit content for ${chartId}:`, fitError)
        //     }
        //   }, 100)
        // }

        console.log(`✅ SUCCESS: Applied ${spacing}px spacing to ${chartId}`)
        return true
      } else {
        console.error(`❌ Chart instance or timeScale not available for ${chartId}`)
        return false
      }
    } catch (error) {
      console.error(`❌ Error applying spacing to ${chartId}:`, error)
      return false
    }
  }

  // Set up mutation observer to detect chart changes
  setupMutationObserver(chartId) {
    const chartData = this.charts.get(chartId)
    if (!chartData || !chartData.instance) return

    try {
      // Find the chart container in the DOM
      const containers = document.querySelectorAll('[class*="chart"], [id*="chart"]')
      let chartContainer = null

      for (const container of containers) {
        if (container.querySelector('canvas')) {
          chartContainer = container
          break
        }
      }

      if (!chartContainer) {
        console.warn(`⚠️ Chart container not found for ${chartId}`)
        return
      }

      // Create mutation observer
      const observer = new MutationObserver((mutations) => {
        let shouldReapply = false

        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            console.log(`🔄 DOM change detected for chart ${chartId}`, mutation.type)
            shouldReapply = true
          }
        })

        if (shouldReapply) {
          // Longer delay and less frequent reapplication to reduce flashing
          setTimeout(() => {
            console.log(`🔧 Reapplying spacing for ${chartId} due to DOM changes`)
            this.applySpacing(chartId, false) // Use false to avoid force refresh
          }, 300)
        }
      })

      // Start observing
      observer.observe(chartContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })

      this.observers.set(chartId, observer)
      console.log(`👁️ Mutation observer set up for chart ${chartId}`)

    } catch (error) {
      console.error(`❌ Error setting up observer for ${chartId}:`, error)
    }
  }

  // Update data length for a chart and reapply spacing
  updateDataLength(chartId, newDataLength) {
    const chartData = this.charts.get(chartId)
    if (chartData) {
      console.log(`📊 Updating data length for ${chartId}: ${chartData.dataLength} → ${newDataLength}`)
      chartData.dataLength = newDataLength
      
      // Apply spacing immediately - no follow-up to prevent flashing
      this.applySpacing(chartId, true)
      
      console.log(`🔥 Applied spacing update for ${chartId}`)
      return true
    }
    return false
  }

  // Force reapply spacing to all registered charts
  reapplyAllSpacing() {
    console.log('🔄 Reapplying spacing to all registered charts')
    for (const chartId of this.charts.keys()) {
      this.applySpacing(chartId, true)
    }
  }

  // Clean up chart registration
  unregisterChart(chartId) {
    console.log(`🗑️ Unregistering chart ${chartId}`)
    
    const observer = this.observers.get(chartId)
    if (observer) {
      observer.disconnect()
      this.observers.delete(chartId)
    }
    
    this.charts.delete(chartId)
  }

  // Get current spacing info for debugging
  getSpacingInfo(chartId) {
    const chartData = this.charts.get(chartId)
    if (!chartData) return null

    return {
      chartId,
      dataLength: chartData.dataLength,
      lastSpacing: chartData.lastSpacing,
      spacingApplied: chartData.spacingApplied,
      hasInstance: !!chartData.instance,
      hasTimeScale: !!(chartData.instance && chartData.instance.timeScale)
    }
  }

  // Get all registered charts info
  getAllChartsInfo() {
    const info = {}
    for (const chartId of this.charts.keys()) {
      info[chartId] = this.getSpacingInfo(chartId)
    }
    return info
  }
}

// Create global instance
window.chartSpacingManager = new ChartSpacingManager()

// Auto-reapply spacing on window resize
window.addEventListener('resize', () => {
  console.log('🔧 Window resized, reapplying chart spacing')
  window.chartSpacingManager.reapplyAllSpacing()
})

// DISABLED: Periodic spacing maintenance (was causing resets)
// setInterval(() => {
//   if (window.chartSpacingManager && window.chartSpacingManager.charts.size > 0) {
//     console.log('🔄 Periodic spacing maintenance')
//     window.chartSpacingManager.reapplyAllSpacing()
//   }
// }, 5000)

// DISABLED: Aggressive spacing to prevent flashing
// let aggressiveCount = 0
// const aggressiveInterval = setInterval(() => {
//   if (window.chartSpacingManager && window.chartSpacingManager.charts.size > 0) {
//     window.chartSpacingManager.reapplyAllSpacing()
//     aggressiveCount++
//     
//     if (aggressiveCount >= 3) { // 3 attempts * 2 seconds = 6 seconds  
//       clearInterval(aggressiveInterval)
//       console.log('⏰ Stopped aggressive chart spacing maintenance')
//     }
//   }
// }, 2000)

console.log('✅ Chart Spacing Manager ready - accessible via window.chartSpacingManager')

export default window.chartSpacingManager