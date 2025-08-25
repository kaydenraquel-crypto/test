// Performance monitoring utilities
export interface PerformanceMetrics {
  renderTime: number
  loadTime: number
  componentMount: number
  bundleSize: number
  memoryUsage: number
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`)
              this.recordMetric('longTask', entry.duration)
            }
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        console.warn('Long task observer not supported:', e)
      }
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('chunk') || entry.name.includes('.js')) {
              this.recordMetric('resourceLoad', entry.duration)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource observer not supported:', e)
      }
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value)
  }

  // Start timing an operation
  startTiming(name: string): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
      return duration
    }
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Get memory usage (if available)
  getMemoryUsage(): number {
    // @ts-ignore - memory API is experimental
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Measure component render time
  measureComponentRender<T extends React.ComponentType<any>>(
    Component: T, 
    componentName: string
  ): T {
    return React.forwardRef((props, ref) => {
      const endTiming = this.startTiming(`${componentName}_render`)
      
      React.useEffect(() => {
        endTiming()
      })

      return React.createElement(Component, { ...props, ref })
    }) as unknown as T
  }

  // Log performance summary
  logPerformanceSummary(): void {
    const metrics = this.getMetrics()
    const memoryUsage = this.getMemoryUsage()
    
    console.group('📊 Performance Summary')
    console.log('Metrics:', metrics)
    if (memoryUsage > 0) {
      console.log(`Memory Usage: ${memoryUsage.toFixed(2)} MB`)
    }
    console.log('Navigation Timing:', performance.getEntriesByType('navigation'))
    console.groupEnd()
  }

  // Clean up observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics())
    }, 5000)

    return () => {
      clearInterval(interval)
      performanceMonitor.disconnect()
    }
  }, [])

  return {
    metrics,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    logSummary: performanceMonitor.logPerformanceSummary.bind(performanceMonitor)
  }
}

// Bundle size analyzer
export const analyzeBundleSize = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).__DEV) {
    console.group('📦 Bundle Analysis')
    
    // List all loaded modules
    const modules = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.js') || entry.name.includes('chunk'))
      .map(entry => ({
        name: entry.name.split('/').pop() || entry.name,
        size: (entry as any).transferSize || 0,
        loadTime: entry.duration
      }))
      .sort((a, b) => (b.size || 0) - (a.size || 0))
    
    console.table(modules)
    
    const totalSize = modules.reduce((sum, mod) => sum + (mod.size || 0), 0)
    console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
    
    console.groupEnd()
  }
}

// Import React for the hook
import React from 'react'