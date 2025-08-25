class CandlestickPatterns {
  static instance = null;
  
  static getInstance() {
    if (!CandlestickPatterns.instance) {
      CandlestickPatterns.instance = new CandlestickPatterns();
    }
    return CandlestickPatterns.instance;
  }

  isDoji(candle, threshold = 0.1) {
    const bodySize = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    return bodySize <= (range * threshold);
  }

  isLongLeggedDoji(candle) {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const range = candle.high - candle.low;
    
    return bodySize <= (range * 0.05) && upperShadow > (range * 0.3) && lowerShadow > (range * 0.3);
  }

  isGravestoneDoji(candle) {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const range = candle.high - candle.low;
    
    return bodySize <= (range * 0.1) && upperShadow >= (range * 0.6) && lowerShadow <= (range * 0.1);
  }

  isDragonflyDoji(candle) {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const range = candle.high - candle.low;
    
    return bodySize <= (range * 0.1) && lowerShadow >= (range * 0.6) && upperShadow <= (range * 0.1);
  }

  isHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    
    return lowerShadow >= (body * 2) && upperShadow <= (body * 0.1);
  }

  isInvertedHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    
    return upperShadow >= (body * 2) && lowerShadow <= (body * 0.1);
  }

  isShootingStar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    
    return upperShadow >= (body * 2) && lowerShadow <= (body * 0.1) && candle.close < candle.open;
  }

  isHangingMan(candle) {
    return this.isHammer(candle) && candle.close < candle.open;
  }

  isBullishEngulfing(current, previous) {
    return previous.close < previous.open && 
           current.close > current.open &&
           current.open < previous.close &&
           current.close > previous.open;
  }

  isBearishEngulfing(current, previous) {
    return previous.close > previous.open && 
           current.close < current.open &&
           current.open > previous.close &&
           current.close < previous.open;
  }

  isBullishHarami(current, previous) {
    return previous.close < previous.open &&
           current.close > current.open &&
           current.open > previous.close &&
           current.close < previous.open;
  }

  isBearishHarami(current, previous) {
    return previous.close > previous.open &&
           current.close < current.open &&
           current.open < previous.close &&
           current.close > previous.open;
  }

  isMorningStar(third, second, first) {
    const firstBody = Math.abs(first.close - first.open);
    const secondBody = Math.abs(second.close - second.open);
    const thirdBody = Math.abs(third.close - third.open);
    
    return first.close < first.open &&
           secondBody < (firstBody * 0.3) &&
           third.close > third.open &&
           third.close > (first.open + first.close) / 2;
  }

  isEveningStar(third, second, first) {
    const firstBody = Math.abs(first.close - first.open);
    const secondBody = Math.abs(second.close - second.open);
    const thirdBody = Math.abs(third.close - third.open);
    
    return first.close > first.open &&
           secondBody < (firstBody * 0.3) &&
           third.close < third.open &&
           third.close < (first.open + first.close) / 2;
  }

  isThreeWhiteSoldiers(third, second, first) {
    return first.close > first.open &&
           second.close > second.open &&
           third.close > third.open &&
           second.open > first.open && second.open < first.close &&
           third.open > second.open && third.open < second.close &&
           second.close > first.close &&
           third.close > second.close;
  }

  isThreeBlackCrows(third, second, first) {
    return first.close < first.open &&
           second.close < second.open &&
           third.close < third.open &&
           second.open < first.open && second.open > first.close &&
           third.open < second.open && third.open > second.close &&
           second.close < first.close &&
           third.close < second.close;
  }

  isPiercing(current, previous) {
    const prevBody = Math.abs(previous.close - previous.open);
    return previous.close < previous.open &&
           current.close > current.open &&
           current.open < previous.low &&
           current.close > previous.close + (prevBody / 2) &&
           current.close < previous.open;
  }

  isDarkCloudCover(current, previous) {
    const prevBody = Math.abs(previous.close - previous.open);
    return previous.close > previous.open &&
           current.close < current.open &&
           current.open > previous.high &&
           current.close < previous.close - (prevBody / 2) &&
           current.close > previous.open;
  }

  isSpinningTop(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    
    return body <= (range * 0.3) && upperShadow >= body && lowerShadow >= body;
  }

  isMarubozu(candle) {
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const range = candle.high - candle.low;
    
    return upperShadow <= (range * 0.01) && lowerShadow <= (range * 0.01);
  }

  isTweezersTop(current, previous) {
    return Math.abs(current.high - previous.high) <= ((current.high + previous.high) * 0.002) &&
           current.close < current.open &&
           previous.close > previous.open;
  }

  isTweezersBottom(current, previous) {
    return Math.abs(current.low - previous.low) <= ((current.low + previous.low) * 0.002) &&
           current.close > current.open &&
           previous.close < previous.open;
  }

  isInsideBar(current, previous) {
    return current.high < previous.high && current.low > previous.low;
  }

  isOutsideBar(current, previous) {
    return current.high > previous.high && current.low < previous.low;
  }

  detectPatterns(data) {
    if (!data || data.length < 3) return [];
    
    const patterns = [];
    
    for (let i = 2; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      const twoPrev = data[i - 2];
      
      const detectedPatterns = [];
      
      if (this.isDoji(current)) {
        if (this.isGravestoneDoji(current)) {
          detectedPatterns.push({ name: 'Gravestone Doji', type: 'bearish', strength: 'strong' });
        } else if (this.isDragonflyDoji(current)) {
          detectedPatterns.push({ name: 'Dragonfly Doji', type: 'bullish', strength: 'strong' });
        } else if (this.isLongLeggedDoji(current)) {
          detectedPatterns.push({ name: 'Long-Legged Doji', type: 'neutral', strength: 'medium' });
        } else {
          detectedPatterns.push({ name: 'Doji', type: 'neutral', strength: 'medium' });
        }
      }
      
      if (this.isHammer(current)) {
        detectedPatterns.push({ name: 'Hammer', type: 'bullish', strength: 'strong' });
      }
      
      if (this.isInvertedHammer(current)) {
        detectedPatterns.push({ name: 'Inverted Hammer', type: 'bullish', strength: 'medium' });
      }
      
      if (this.isShootingStar(current)) {
        detectedPatterns.push({ name: 'Shooting Star', type: 'bearish', strength: 'strong' });
      }
      
      if (this.isHangingMan(current)) {
        detectedPatterns.push({ name: 'Hanging Man', type: 'bearish', strength: 'strong' });
      }
      
      if (this.isMarubozu(current)) {
        const type = current.close > current.open ? 'bullish' : 'bearish';
        detectedPatterns.push({ name: 'Marubozu', type: type, strength: 'strong' });
      }
      
      if (this.isSpinningTop(current)) {
        detectedPatterns.push({ name: 'Spinning Top', type: 'neutral', strength: 'weak' });
      }
      
      if (this.isBullishEngulfing(current, previous)) {
        detectedPatterns.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 'strong' });
      }
      
      if (this.isBearishEngulfing(current, previous)) {
        detectedPatterns.push({ name: 'Bearish Engulfing', type: 'bearish', strength: 'strong' });
      }
      
      if (this.isBullishHarami(current, previous)) {
        detectedPatterns.push({ name: 'Bullish Harami', type: 'bullish', strength: 'medium' });
      }
      
      if (this.isBearishHarami(current, previous)) {
        detectedPatterns.push({ name: 'Bearish Harami', type: 'bearish', strength: 'medium' });
      }
      
      if (this.isPiercing(current, previous)) {
        detectedPatterns.push({ name: 'Piercing Pattern', type: 'bullish', strength: 'strong' });
      }
      
      if (this.isDarkCloudCover(current, previous)) {
        detectedPatterns.push({ name: 'Dark Cloud Cover', type: 'bearish', strength: 'strong' });
      }
      
      if (this.isTweezersTop(current, previous)) {
        detectedPatterns.push({ name: 'Tweezers Top', type: 'bearish', strength: 'medium' });
      }
      
      if (this.isTweezersBottom(current, previous)) {
        detectedPatterns.push({ name: 'Tweezers Bottom', type: 'bullish', strength: 'medium' });
      }
      
      if (this.isInsideBar(current, previous)) {
        detectedPatterns.push({ name: 'Inside Bar', type: 'neutral', strength: 'weak' });
      }
      
      if (this.isOutsideBar(current, previous)) {
        detectedPatterns.push({ name: 'Outside Bar', type: 'neutral', strength: 'medium' });
      }
      
      if (this.isMorningStar(current, previous, twoPrev)) {
        detectedPatterns.push({ name: 'Morning Star', type: 'bullish', strength: 'very_strong' });
      }
      
      if (this.isEveningStar(current, previous, twoPrev)) {
        detectedPatterns.push({ name: 'Evening Star', type: 'bearish', strength: 'very_strong' });
      }
      
      if (this.isThreeWhiteSoldiers(current, previous, twoPrev)) {
        detectedPatterns.push({ name: 'Three White Soldiers', type: 'bullish', strength: 'very_strong' });
      }
      
      if (this.isThreeBlackCrows(current, previous, twoPrev)) {
        detectedPatterns.push({ name: 'Three Black Crows', type: 'bearish', strength: 'very_strong' });
      }
      
      if (detectedPatterns.length > 0) {
        patterns.push({
          time: current.time,
          index: i,
          patterns: detectedPatterns
        });
      }
    }
    
    return patterns;
  }

  getPatternSignal(patterns) {
    if (!patterns || patterns.length === 0) return 'neutral';
    
    let bullishScore = 0;
    let bearishScore = 0;
    
    const strengthScores = {
      'weak': 1,
      'medium': 2,
      'strong': 3,
      'very_strong': 4
    };
    
    patterns.forEach(patternGroup => {
      patternGroup.patterns.forEach(pattern => {
        const score = strengthScores[pattern.strength] || 1;
        
        if (pattern.type === 'bullish') {
          bullishScore += score;
        } else if (pattern.type === 'bearish') {
          bearishScore += score;
        }
      });
    });
    
    if (bullishScore > bearishScore * 1.5) return 'strong_bullish';
    if (bullishScore > bearishScore) return 'bullish';
    if (bearishScore > bullishScore * 1.5) return 'strong_bearish';
    if (bearishScore > bullishScore) return 'bearish';
    
    return 'neutral';
  }

  getAvailablePatterns() {
    return {
      'Single Candle': {
        'Doji': 'isDoji',
        'Gravestone Doji': 'isGravestoneDoji',
        'Dragonfly Doji': 'isDragonflyDoji',
        'Long-Legged Doji': 'isLongLeggedDoji',
        'Hammer': 'isHammer',
        'Inverted Hammer': 'isInvertedHammer',
        'Shooting Star': 'isShootingStar',
        'Hanging Man': 'isHangingMan',
        'Marubozu': 'isMarubozu',
        'Spinning Top': 'isSpinningTop'
      },
      'Two Candle': {
        'Bullish Engulfing': 'isBullishEngulfing',
        'Bearish Engulfing': 'isBearishEngulfing',
        'Bullish Harami': 'isBullishHarami',
        'Bearish Harami': 'isBearishHarami',
        'Piercing Pattern': 'isPiercing',
        'Dark Cloud Cover': 'isDarkCloudCover',
        'Tweezers Top': 'isTweezersTop',
        'Tweezers Bottom': 'isTweezersBottom',
        'Inside Bar': 'isInsideBar',
        'Outside Bar': 'isOutsideBar'
      },
      'Three Candle': {
        'Morning Star': 'isMorningStar',
        'Evening Star': 'isEveningStar',
        'Three White Soldiers': 'isThreeWhiteSoldiers',
        'Three Black Crows': 'isThreeBlackCrows'
      }
    };
  }
}

export default CandlestickPatterns;