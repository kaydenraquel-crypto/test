import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChartPerformanceMetrics {
  fps: number;
  renderTime: number;
  dataPoints: number;
  memoryUsage: number;
  seriesCount: number;
  lastUpdate: Date;
  totalUpdates: number;
  avgRenderTime: number;
  isOptimized: boolean;
}

export interface ChartPerformanceOptimization {
  enableDownsampling: boolean;
  maxDataPoints: number;
  updateThrottleMs: number;
  enableLazyLoading: boolean;
  enableWebWorkers: boolean;
}

interface UseChartPerformanceOptions {
  trackFPS?: boolean;
  trackMemory?: boolean;
  optimizationThreshold?: {
    maxDataPoints: number;
    maxSeries: number;
    minFPS: number;
  };
  onPerformanceWarning?: (metrics: ChartPerformanceMetrics) => void;
}

export function useChartPerformance(options: UseChartPerformanceOptions = {}) {
  const {
    trackFPS = true,
    trackMemory = true,
    optimizationThreshold = {
      maxDataPoints: 10000,
      maxSeries: 20,
      minFPS: 30,
    },
    onPerformanceWarning,
  } = options;

  const [metrics, setMetrics] = useState<ChartPerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    dataPoints: 0,
    memoryUsage: 0,
    seriesCount: 0,
    lastUpdate: new Date(),
    totalUpdates: 0,
    avgRenderTime: 0,
    isOptimized: true,
  });

  const [optimization, setOptimization] = useState<ChartPerformanceOptimization>({
    enableDownsampling: false,
    maxDataPoints: 5000,
    updateThrottleMs: 16, // 60 FPS
    enableLazyLoading: false,
    enableWebWorkers: false,
  });

  // Performance tracking refs
  const fpsRef = useRef<{
    frames: number;
    lastTime: number;
    frameId: number | null;
  }>({ frames: 0, lastTime: performance.now(), frameId: null });

  const renderTimesRef = useRef<number[]>([]);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const memoryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // FPS tracking
  useEffect(() => {
    if (!trackFPS) return;

    const trackFPS = () => {
      fpsRef.current.frames++;
      const now = performance.now();
      
      if (now >= fpsRef.current.lastTime + 1000) {
        const fps = Math.round(
          (fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime)
        );
        
        setMetrics(prev => ({ ...prev, fps }));
        
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;

        // Check for performance warnings
        if (fps < optimizationThreshold.minFPS && onPerformanceWarning) {
          onPerformanceWarning({
            ...metrics,
            fps,
          });
        }
      }
      
      fpsRef.current.frameId = requestAnimationFrame(trackFPS);
    };

    fpsRef.current.frameId = requestAnimationFrame(trackFPS);

    return () => {
      if (fpsRef.current.frameId) {
        cancelAnimationFrame(fpsRef.current.frameId);
      }
    };
  }, [trackFPS, optimizationThreshold.minFPS, onPerformanceWarning, metrics]);

  // Memory tracking
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;

    const trackMemory = () => {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      
      setMetrics(prev => ({ ...prev, memoryUsage }));
    };

    // Track memory every 5 seconds
    memoryIntervalRef.current = setInterval(trackMemory, 5000);
    trackMemory(); // Initial measurement

    return () => {
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, [trackMemory]);

  // Performance Observer for render times
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.name.includes('chart') || entry.entryType === 'measure') {
            renderTimesRef.current.push(entry.duration);
            
            // Keep only last 100 measurements
            if (renderTimesRef.current.length > 100) {
              renderTimesRef.current.shift();
            }
            
            const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / 
                                  renderTimesRef.current.length;
            
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration,
              avgRenderTime: Math.round(avgRenderTime * 100) / 100,
              lastUpdate: new Date(),
              totalUpdates: prev.totalUpdates + 1,
            }));
          }
        });
      });

      performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }

    return () => {
      performanceObserverRef.current?.disconnect();
    };
  }, []);

  // Performance optimization logic
  const checkAndOptimize = useCallback(() => {
    const needsOptimization = 
      metrics.dataPoints > optimizationThreshold.maxDataPoints ||
      metrics.seriesCount > optimizationThreshold.maxSeries ||
      metrics.fps < optimizationThreshold.minFPS;

    if (needsOptimization && !optimization.enableDownsampling) {
      console.log('🚀 Performance: Enabling optimizations');
      
      setOptimization(prev => ({
        ...prev,
        enableDownsampling: true,
        maxDataPoints: Math.min(prev.maxDataPoints, 3000),
        updateThrottleMs: Math.max(prev.updateThrottleMs, 33), // 30 FPS
        enableLazyLoading: true,
      }));
    } else if (!needsOptimization && optimization.enableDownsampling) {
      console.log('🚀 Performance: Disabling optimizations');
      
      setOptimization(prev => ({
        ...prev,
        enableDownsampling: false,
        maxDataPoints: 5000,
        updateThrottleMs: 16, // 60 FPS
        enableLazyLoading: false,
      }));
    }

    setMetrics(prev => ({ ...prev, isOptimized: !needsOptimization }));
  }, [metrics, optimization, optimizationThreshold]);

  // Auto-optimization check
  useEffect(() => {
    const interval = setInterval(checkAndOptimize, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [checkAndOptimize]);

  // Manual performance measurement
  const measureRender = useCallback((name: string, fn: () => void) => {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-measure`;

    performance.mark(startMark);
    fn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    // Clean up marks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  }, []);

  // Update data metrics
  const updateDataMetrics = useCallback((dataPoints: number, seriesCount: number) => {
    setMetrics(prev => ({
      ...prev,
      dataPoints,
      seriesCount,
    }));
  }, []);

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    if (metrics.fps >= 50) return { status: 'excellent', color: '#4CAF50' };
    if (metrics.fps >= 30) return { status: 'good', color: '#FF9800' };
    if (metrics.fps >= 20) return { status: 'fair', color: '#FF5722' };
    return { status: 'poor', color: '#F44336' };
  }, [metrics.fps]);

  // Get optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.dataPoints > optimizationThreshold.maxDataPoints) {
      recommendations.push('Enable data downsampling');
    }

    if (metrics.seriesCount > optimizationThreshold.maxSeries) {
      recommendations.push('Reduce number of active indicators');
    }

    if (metrics.fps < optimizationThreshold.minFPS) {
      recommendations.push('Increase update throttling');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('Clear unused chart data');
    }

    if (metrics.avgRenderTime > 16) {
      recommendations.push('Consider lazy loading for indicators');
    }

    return recommendations;
  }, [metrics, optimizationThreshold]);

  // Performance report
  const generatePerformanceReport = useCallback(() => {
    const status = getPerformanceStatus();
    const recommendations = getOptimizationRecommendations();

    return {
      metrics,
      optimization,
      status: status.status,
      statusColor: status.color,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }, [metrics, optimization, getPerformanceStatus, getOptimizationRecommendations]);

  return {
    metrics,
    optimization,
    measureRender,
    updateDataMetrics,
    getPerformanceStatus,
    getOptimizationRecommendations,
    generatePerformanceReport,
    setOptimization,
  };
}