class ChartPatterns {
  static instance = null;
  
  static getInstance() {
    if (!ChartPatterns.instance) {
      ChartPatterns.instance = new ChartPatterns();
    }
    return ChartPatterns.instance;
  }

  findTriangles(data, minPeriod = 10) {
    if (!data || data.length < minPeriod * 2) return [];
    
    const patterns = [];
    
    for (let i = minPeriod; i < data.length - minPeriod; i++) {
      const segment = data.slice(i - minPeriod, i + minPeriod);
      
      const ascending = this.detectAscendingTriangle(segment, i - minPeriod);
      const descending = this.detectDescendingTriangle(segment, i - minPeriod);
      const symmetrical = this.detectSymmetricalTriangle(segment, i - minPeriod);
      
      if (ascending) {
        patterns.push({
          type: 'Ascending Triangle',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod - 1].time,
          signal: 'bullish',
          strength: 'strong',
          ...ascending
        });
      }
      
      if (descending) {
        patterns.push({
          type: 'Descending Triangle',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod - 1].time,
          signal: 'bearish',
          strength: 'strong',
          ...descending
        });
      }
      
      if (symmetrical) {
        patterns.push({
          type: 'Symmetrical Triangle',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod - 1].time,
          signal: 'neutral',
          strength: 'medium',
          ...symmetrical
        });
      }
    }
    
    return patterns;
  }

  detectAscendingTriangle(data, startIndex) {
    const highs = data.map((d, i) => ({ value: d.high, index: startIndex + i }));
    const lows = data.map((d, i) => ({ value: d.low, index: startIndex + i }));
    
    const resistanceLevel = this.findHorizontalLevel(highs, 0.02);
    const supportTrend = this.findTrendLine(lows, 'ascending');
    
    if (resistanceLevel && supportTrend && supportTrend.slope > 0.001) {
      return {
        resistanceLevel: resistanceLevel.level,
        supportLine: supportTrend,
        breakoutTarget: resistanceLevel.level * 1.05
      };
    }
    
    return null;
  }

  detectDescendingTriangle(data, startIndex) {
    const highs = data.map((d, i) => ({ value: d.high, index: startIndex + i }));
    const lows = data.map((d, i) => ({ value: d.low, index: startIndex + i }));
    
    const supportLevel = this.findHorizontalLevel(lows, 0.02);
    const resistanceTrend = this.findTrendLine(highs, 'descending');
    
    if (supportLevel && resistanceTrend && resistanceTrend.slope < -0.001) {
      return {
        supportLevel: supportLevel.level,
        resistanceLine: resistanceTrend,
        breakoutTarget: supportLevel.level * 0.95
      };
    }
    
    return null;
  }

  detectSymmetricalTriangle(data, startIndex) {
    const highs = data.map((d, i) => ({ value: d.high, index: startIndex + i }));
    const lows = data.map((d, i) => ({ value: d.low, index: startIndex + i }));
    
    const resistanceTrend = this.findTrendLine(highs, 'descending');
    const supportTrend = this.findTrendLine(lows, 'ascending');
    
    if (resistanceTrend && supportTrend && 
        resistanceTrend.slope < -0.001 && supportTrend.slope > 0.001) {
      
      const convergencePoint = this.findLineIntersection(resistanceTrend, supportTrend);
      
      return {
        resistanceLine: resistanceTrend,
        supportLine: supportTrend,
        convergencePoint: convergencePoint,
        breakoutTarget: Math.abs(resistanceTrend.startValue - supportTrend.startValue)
      };
    }
    
    return null;
  }

  findFlagsAndPennants(data, minPeriod = 8) {
    if (!data || data.length < minPeriod * 3) return [];
    
    const patterns = [];
    
    for (let i = minPeriod * 2; i < data.length - minPeriod; i++) {
      const poleSegment = data.slice(i - minPeriod * 2, i - minPeriod);
      const flagSegment = data.slice(i - minPeriod, i);
      
      const pole = this.detectPole(poleSegment);
      
      if (pole) {
        const flag = this.detectFlag(flagSegment, pole.direction);
        const pennant = this.detectPennant(flagSegment);
        
        if (flag) {
          patterns.push({
            type: pole.direction === 'up' ? 'Bull Flag' : 'Bear Flag',
            startTime: data[i - minPeriod * 2].time,
            endTime: data[i - 1].time,
            signal: pole.direction === 'up' ? 'bullish' : 'bearish',
            strength: 'strong',
            pole: pole,
            flag: flag,
            target: this.calculateFlagTarget(pole, flag)
          });
        }
        
        if (pennant) {
          patterns.push({
            type: pole.direction === 'up' ? 'Bull Pennant' : 'Bear Pennant',
            startTime: data[i - minPeriod * 2].time,
            endTime: data[i - 1].time,
            signal: pole.direction === 'up' ? 'bullish' : 'bearish',
            strength: 'strong',
            pole: pole,
            pennant: pennant,
            target: this.calculatePennantTarget(pole, pennant)
          });
        }
      }
    }
    
    return patterns;
  }

  detectPole(data) {
    if (data.length < 5) return null;
    
    const start = data[0];
    const end = data[data.length - 1];
    const change = (end.close - start.close) / start.close;
    
    if (Math.abs(change) > 0.05) {
      const direction = change > 0 ? 'up' : 'down';
      const strength = Math.abs(change);
      
      return {
        direction: direction,
        strength: strength,
        startPrice: start.close,
        endPrice: end.close,
        height: Math.abs(end.close - start.close)
      };
    }
    
    return null;
  }

  detectFlag(data, poleDirection) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    
    const highTrend = this.calculateTrendSlope(highs);
    const lowTrend = this.calculateTrendSlope(lows);
    
    const isConsolidating = Math.abs(highTrend) < 0.002 && Math.abs(lowTrend) < 0.002;
    const isCounterTrend = (poleDirection === 'up' && highTrend < -0.001 && lowTrend < -0.001) ||
                          (poleDirection === 'down' && highTrend > 0.001 && lowTrend > 0.001);
    
    if (isConsolidating || isCounterTrend) {
      return {
        highTrend: highTrend,
        lowTrend: lowTrend,
        type: isConsolidating ? 'horizontal' : 'sloped'
      };
    }
    
    return null;
  }

  detectPennant(data) {
    const highs = data.map((d, i) => ({ value: d.high, index: i }));
    const lows = data.map((d, i) => ({ value: d.low, index: i }));
    
    const resistanceTrend = this.findTrendLine(highs, 'descending');
    const supportTrend = this.findTrendLine(lows, 'ascending');
    
    if (resistanceTrend && supportTrend && 
        resistanceTrend.slope < -0.001 && supportTrend.slope > 0.001) {
      
      const convergence = this.findLineIntersection(resistanceTrend, supportTrend);
      
      return {
        resistanceLine: resistanceTrend,
        supportLine: supportTrend,
        convergence: convergence
      };
    }
    
    return null;
  }

  findWedges(data, minPeriod = 15) {
    if (!data || data.length < minPeriod * 2) return [];
    
    const patterns = [];
    
    for (let i = minPeriod; i < data.length - minPeriod; i++) {
      const segment = data.slice(i - minPeriod, i + minPeriod);
      
      const risingWedge = this.detectRisingWedge(segment, i - minPeriod);
      const fallingWedge = this.detectFallingWedge(segment, i - minPeriod);
      
      if (risingWedge) {
        patterns.push({
          type: 'Rising Wedge',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod - 1].time,
          signal: 'bearish',
          strength: 'medium',
          ...risingWedge
        });
      }
      
      if (fallingWedge) {
        patterns.push({
          type: 'Falling Wedge',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod - 1].time,
          signal: 'bullish',
          strength: 'medium',
          ...fallingWedge
        });
      }
    }
    
    return patterns;
  }

  detectRisingWedge(data, startIndex) {
    const highs = data.map((d, i) => ({ value: d.high, index: startIndex + i }));
    const lows = data.map((d, i) => ({ value: d.low, index: startIndex + i }));
    
    const resistanceTrend = this.findTrendLine(highs, 'ascending');
    const supportTrend = this.findTrendLine(lows, 'ascending');
    
    if (resistanceTrend && supportTrend && 
        resistanceTrend.slope > 0.001 && supportTrend.slope > 0.001 &&
        supportTrend.slope > resistanceTrend.slope) {
      
      return {
        resistanceLine: resistanceTrend,
        supportLine: supportTrend,
        convergence: this.findLineIntersection(resistanceTrend, supportTrend)
      };
    }
    
    return null;
  }

  detectFallingWedge(data, startIndex) {
    const highs = data.map((d, i) => ({ value: d.high, index: startIndex + i }));
    const lows = data.map((d, i) => ({ value: d.low, index: startIndex + i }));
    
    const resistanceTrend = this.findTrendLine(highs, 'descending');
    const supportTrend = this.findTrendLine(lows, 'descending');
    
    if (resistanceTrend && supportTrend && 
        resistanceTrend.slope < -0.001 && supportTrend.slope < -0.001 &&
        resistanceTrend.slope > supportTrend.slope) {
      
      return {
        resistanceLine: resistanceTrend,
        supportLine: supportTrend,
        convergence: this.findLineIntersection(resistanceTrend, supportTrend)
      };
    }
    
    return null;
  }

  findHeadAndShoulders(data, minPeriod = 20) {
    if (!data || data.length < minPeriod * 3) return [];
    
    const patterns = [];
    
    for (let i = minPeriod; i < data.length - minPeriod * 2; i++) {
      const segment = data.slice(i - minPeriod, i + minPeriod * 2);
      
      const hs = this.detectHeadAndShoulders(segment, i - minPeriod);
      const ihs = this.detectInverseHeadAndShoulders(segment, i - minPeriod);
      
      if (hs) {
        patterns.push({
          type: 'Head and Shoulders',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod * 2 - 1].time,
          signal: 'bearish',
          strength: 'very_strong',
          ...hs
        });
      }
      
      if (ihs) {
        patterns.push({
          type: 'Inverse Head and Shoulders',
          startTime: data[i - minPeriod].time,
          endTime: data[i + minPeriod * 2 - 1].time,
          signal: 'bullish',
          strength: 'very_strong',
          ...ihs
        });
      }
    }
    
    return patterns;
  }

  detectHeadAndShoulders(data, startIndex) {
    const third = Math.floor(data.length / 3);
    
    const leftShoulder = data.slice(0, third);
    const head = data.slice(third, third * 2);
    const rightShoulder = data.slice(third * 2);
    
    const leftPeak = this.findPeak(leftShoulder);
    const headPeak = this.findPeak(head);
    const rightPeak = this.findPeak(rightShoulder);
    
    if (leftPeak && headPeak && rightPeak) {
      const shoulderTolerance = 0.05;
      const shouldersEqual = Math.abs(leftPeak.value - rightPeak.value) / leftPeak.value < shoulderTolerance;
      const headHigher = headPeak.value > leftPeak.value && headPeak.value > rightPeak.value;
      
      if (shouldersEqual && headHigher) {
        const neckline = this.calculateNeckline(leftPeak, rightPeak);
        const target = neckline - (headPeak.value - neckline);
        
        return {
          leftShoulder: { ...leftPeak, index: startIndex + leftPeak.index },
          head: { ...headPeak, index: startIndex + third + headPeak.index },
          rightShoulder: { ...rightPeak, index: startIndex + third * 2 + rightPeak.index },
          neckline: neckline,
          target: target
        };
      }
    }
    
    return null;
  }

  detectInverseHeadAndShoulders(data, startIndex) {
    const third = Math.floor(data.length / 3);
    
    const leftShoulder = data.slice(0, third);
    const head = data.slice(third, third * 2);
    const rightShoulder = data.slice(third * 2);
    
    const leftTrough = this.findTrough(leftShoulder);
    const headTrough = this.findTrough(head);
    const rightTrough = this.findTrough(rightShoulder);
    
    if (leftTrough && headTrough && rightTrough) {
      const shoulderTolerance = 0.05;
      const shouldersEqual = Math.abs(leftTrough.value - rightTrough.value) / leftTrough.value < shoulderTolerance;
      const headLower = headTrough.value < leftTrough.value && headTrough.value < rightTrough.value;
      
      if (shouldersEqual && headLower) {
        const neckline = this.calculateNeckline(leftTrough, rightTrough);
        const target = neckline + (neckline - headTrough.value);
        
        return {
          leftShoulder: { ...leftTrough, index: startIndex + leftTrough.index },
          head: { ...headTrough, index: startIndex + third + headTrough.index },
          rightShoulder: { ...rightTrough, index: startIndex + third * 2 + rightTrough.index },
          neckline: neckline,
          target: target
        };
      }
    }
    
    return null;
  }

  findDoubleTopsBottoms(data, minPeriod = 15) {
    if (!data || data.length < minPeriod * 4) return [];
    
    const patterns = [];
    
    for (let i = minPeriod * 2; i < data.length - minPeriod * 2; i++) {
      const segment = data.slice(i - minPeriod * 2, i + minPeriod * 2);
      
      const doubleTop = this.detectDoubleTop(segment, i - minPeriod * 2);
      const doubleBottom = this.detectDoubleBottom(segment, i - minPeriod * 2);
      
      if (doubleTop) {
        patterns.push({
          type: 'Double Top',
          startTime: data[i - minPeriod * 2].time,
          endTime: data[i + minPeriod * 2 - 1].time,
          signal: 'bearish',
          strength: 'strong',
          ...doubleTop
        });
      }
      
      if (doubleBottom) {
        patterns.push({
          type: 'Double Bottom',
          startTime: data[i - minPeriod * 2].time,
          endTime: data[i + minPeriod * 2 - 1].time,
          signal: 'bullish',
          strength: 'strong',
          ...doubleBottom
        });
      }
    }
    
    return patterns;
  }

  detectDoubleTop(data, startIndex) {
    const half = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, half);
    const secondHalf = data.slice(half);
    
    const firstPeak = this.findPeak(firstHalf);
    const secondPeak = this.findPeak(secondHalf);
    const valley = this.findTrough(data.slice(Math.floor(half * 0.5), Math.floor(half * 1.5)));
    
    if (firstPeak && secondPeak && valley) {
      const peakTolerance = 0.03;
      const peaksEqual = Math.abs(firstPeak.value - secondPeak.value) / firstPeak.value < peakTolerance;
      const validValley = valley.value < firstPeak.value * 0.95 && valley.value < secondPeak.value * 0.95;
      
      if (peaksEqual && validValley) {
        const neckline = valley.value;
        const target = neckline - (firstPeak.value - neckline);
        
        return {
          firstTop: { ...firstPeak, index: startIndex + firstPeak.index },
          secondTop: { ...secondPeak, index: startIndex + half + secondPeak.index },
          valley: { ...valley, index: startIndex + Math.floor(half * 0.5) + valley.index },
          neckline: neckline,
          target: target
        };
      }
    }
    
    return null;
  }

  detectDoubleBottom(data, startIndex) {
    const half = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, half);
    const secondHalf = data.slice(half);
    
    const firstTrough = this.findTrough(firstHalf);
    const secondTrough = this.findTrough(secondHalf);
    const peak = this.findPeak(data.slice(Math.floor(half * 0.5), Math.floor(half * 1.5)));
    
    if (firstTrough && secondTrough && peak) {
      const troughTolerance = 0.03;
      const troughsEqual = Math.abs(firstTrough.value - secondTrough.value) / firstTrough.value < troughTolerance;
      const validPeak = peak.value > firstTrough.value * 1.05 && peak.value > secondTrough.value * 1.05;
      
      if (troughsEqual && validPeak) {
        const neckline = peak.value;
        const target = neckline + (neckline - firstTrough.value);
        
        return {
          firstBottom: { ...firstTrough, index: startIndex + firstTrough.index },
          secondBottom: { ...secondTrough, index: startIndex + half + secondTrough.index },
          peak: { ...peak, index: startIndex + Math.floor(half * 0.5) + peak.index },
          neckline: neckline,
          target: target
        };
      }
    }
    
    return null;
  }

  findCupAndHandle(data, minPeriod = 25) {
    if (!data || data.length < minPeriod * 3) return [];
    
    const patterns = [];
    
    for (let i = minPeriod * 2; i < data.length - minPeriod; i++) {
      const cupSegment = data.slice(i - minPeriod * 2, i);
      const handleSegment = data.slice(i, i + minPeriod);
      
      const cup = this.detectCup(cupSegment);
      
      if (cup) {
        const handle = this.detectHandle(handleSegment, cup.rimLevel);
        
        if (handle) {
          patterns.push({
            type: 'Cup and Handle',
            startTime: data[i - minPeriod * 2].time,
            endTime: data[i + minPeriod - 1].time,
            signal: 'bullish',
            strength: 'strong',
            cup: cup,
            handle: handle,
            target: cup.rimLevel + (cup.rimLevel - cup.bottom)
          });
        }
      }
    }
    
    return patterns;
  }

  detectCup(data) {
    const start = data[0];
    const end = data[data.length - 1];
    const rimTolerance = 0.05;
    
    const rimsEqual = Math.abs(start.high - end.high) / start.high < rimTolerance;
    
    if (rimsEqual) {
      const bottom = this.findTrough(data);
      const rimLevel = (start.high + end.high) / 2;
      
      if (bottom && bottom.value < rimLevel * 0.9) {
        return {
          rimLevel: rimLevel,
          bottom: bottom.value,
          depth: (rimLevel - bottom.value) / rimLevel
        };
      }
    }
    
    return null;
  }

  detectHandle(data, rimLevel) {
    const start = data[0];
    const handleDepth = 0.15;
    const maxDepth = rimLevel * (1 - handleDepth);
    
    const validHandle = data.every(d => d.low > maxDepth) && 
                       data.length >= 5 &&
                       data[data.length - 1].close >= start.close * 0.98;
    
    if (validHandle) {
      return {
        startPrice: start.close,
        endPrice: data[data.length - 1].close,
        depth: (start.close - Math.min(...data.map(d => d.low))) / start.close
      };
    }
    
    return null;
  }

  findPeak(data) {
    let maxValue = -Infinity;
    let maxIndex = -1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].high > maxValue) {
        maxValue = data[i].high;
        maxIndex = i;
      }
    }
    
    return maxIndex >= 0 ? { value: maxValue, index: maxIndex } : null;
  }

  findTrough(data) {
    let minValue = Infinity;
    let minIndex = -1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].low < minValue) {
        minValue = data[i].low;
        minIndex = i;
      }
    }
    
    return minIndex >= 0 ? { value: minValue, index: minIndex } : null;
  }

  findHorizontalLevel(points, tolerance) {
    if (points.length < 3) return null;
    
    const avgValue = points.reduce((sum, p) => sum + p.value, 0) / points.length;
    const validPoints = points.filter(p => Math.abs(p.value - avgValue) / avgValue <= tolerance);
    
    if (validPoints.length >= Math.ceil(points.length * 0.6)) {
      return { 
        level: avgValue, 
        touches: validPoints.length,
        strength: validPoints.length / points.length 
      };
    }
    
    return null;
  }

  findTrendLine(points, direction) {
    if (points.length < 3) return null;
    
    const n = points.length;
    const sumX = points.reduce((sum, p, i) => sum + i, 0);
    const sumY = points.reduce((sum, p) => sum + p.value, 0);
    const sumXY = points.reduce((sum, p, i) => sum + i * p.value, 0);
    const sumX2 = points.reduce((sum, p, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const expectedDirection = direction === 'ascending' ? 1 : -1;
    
    if ((slope > 0 && expectedDirection > 0) || (slope < 0 && expectedDirection < 0)) {
      return {
        slope: slope,
        intercept: intercept,
        startValue: intercept,
        endValue: intercept + slope * (n - 1)
      };
    }
    
    return null;
  }

  calculateTrendSlope(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  findLineIntersection(line1, line2) {
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = line1.slope * x + line1.intercept;
    return { x: x, y: y };
  }

  calculateNeckline(point1, point2) {
    return (point1.value + point2.value) / 2;
  }

  calculateFlagTarget(pole, flag) {
    return pole.endPrice + pole.height * (pole.direction === 'up' ? 1 : -1);
  }

  calculatePennantTarget(pole, pennant) {
    return pole.endPrice + pole.height * (pole.direction === 'up' ? 1 : -1);
  }

  detectPatterns(data) {
    if (!data || data.length < 50) return [];
    
    const patterns = [];
    
    patterns.push(...this.findTriangles(data));
    patterns.push(...this.findFlagsAndPennants(data));
    patterns.push(...this.findWedges(data));
    patterns.push(...this.findHeadAndShoulders(data));
    patterns.push(...this.findDoubleTopsBottoms(data));
    patterns.push(...this.findCupAndHandle(data));
    
    return patterns.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  getAvailablePatterns() {
    return {
      'Triangle Patterns': {
        'Ascending Triangle': 'detectAscendingTriangle',
        'Descending Triangle': 'detectDescendingTriangle',
        'Symmetrical Triangle': 'detectSymmetricalTriangle'
      },
      'Continuation Patterns': {
        'Bull Flag': 'detectFlag',
        'Bear Flag': 'detectFlag',
        'Bull Pennant': 'detectPennant',
        'Bear Pennant': 'detectPennant',
        'Rising Wedge': 'detectRisingWedge',
        'Falling Wedge': 'detectFallingWedge'
      },
      'Reversal Patterns': {
        'Head and Shoulders': 'detectHeadAndShoulders',
        'Inverse Head and Shoulders': 'detectInverseHeadAndShoulders',
        'Double Top': 'detectDoubleTop',
        'Double Bottom': 'detectDoubleBottom',
        'Triple Top': 'detectTripleTop',
        'Triple Bottom': 'detectTripleBottom'
      },
      'Bullish Patterns': {
        'Cup and Handle': 'detectCupAndHandle',
        'Rounding Bottom': 'detectRoundingBottom'
      }
    };
  }
}

export default ChartPatterns;