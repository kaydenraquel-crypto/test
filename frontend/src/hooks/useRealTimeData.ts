import { useState, useEffect, useCallback } from 'react';

interface RealTimeDataHook {
  simulateRealTimeUpdates: (baseData: any[], symbol: string, onUpdate: (newData: any) => void) => () => void;
  isSimulating: boolean;
}

export const useRealTimeData = (): RealTimeDataHook => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const simulateRealTimeUpdates = useCallback((
    baseData: any[], 
    symbol: string, 
    onUpdate: (newData: any) => void
  ) => {
    if (!baseData || baseData.length === 0) {
      return () => {};
    }

    setIsSimulating(true);
    
    // Get the last data point to base updates on
    const lastDataPoint = baseData[baseData.length - 1];
    let currentPrice = lastDataPoint.close;
    let currentVolume = lastDataPoint.volume;
    
    // Create realistic price movement simulation
    const id = setInterval(() => {
      // Generate realistic price movement (±0.5% typical daily movement)
      const volatility = 0.005; // 0.5% volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = currentPrice * (1 + randomChange);
      
      // Simulate volume changes (±20% of last volume)
      const volumeChange = (Math.random() - 0.5) * 0.4;
      const newVolume = Math.max(100, Math.floor(currentVolume * (1 + volumeChange)));
      
      // Create new data point with current timestamp
      const now = Date.now() / 1000; // Unix timestamp in seconds
      const newDataPoint = {
        time: now,
        open: currentPrice,
        high: Math.max(currentPrice, newPrice),
        low: Math.min(currentPrice, newPrice),
        close: newPrice,
        volume: newVolume
      };
      
      // Update current price for next iteration
      currentPrice = newPrice;
      currentVolume = newVolume;
      
      // Call the update callback
      onUpdate(newDataPoint);
      
    }, 2000); // Update every 2 seconds
    
    setIntervalId(id);
    
    // Return cleanup function
    return () => {
      clearInterval(id);
      setIsSimulating(false);
      setIntervalId(null);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    simulateRealTimeUpdates,
    isSimulating
  };
};