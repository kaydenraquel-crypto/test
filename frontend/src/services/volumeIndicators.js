class VolumeIndicators {
  static instance = null;
  
  static getInstance() {
    if (!VolumeIndicators.instance) {
      VolumeIndicators.instance = new VolumeIndicators();
    }
    return VolumeIndicators.instance;
  }

  onBalanceVolume(data) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    let obv = 0;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      
      if (i === 0) {
        obv = current.volume || 0;
      } else {
        const previous = data[i - 1];
        if (current.close > previous.close) {
          obv += current.volume;
        } else if (current.close < previous.close) {
          obv -= current.volume;
        }
      }
      
      result.push({
        time: current.time,
        obv: obv
      });
    }
    
    return result;
  }

  volumePriceTrend(data) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    let vpt = 0;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      
      if (i === 0) {
        vpt = 0;
      } else {
        const previous = data[i - 1];
        const priceChange = (current.close - previous.close) / previous.close;
        vpt += current.volume * priceChange;
      }
      
      result.push({
        time: current.time,
        vpt: vpt
      });
    }
    
    return result;
  }

  moneyFlowIndex(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const result = [];
    const typicalPrices = [];
    const moneyFlows = [];
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const typicalPrice = (current.high + current.low + current.close) / 3;
      typicalPrices.push(typicalPrice);
      
      if (i === 0) {
        moneyFlows.push(0);
      } else {
        const moneyFlow = typicalPrice * current.volume;
        moneyFlows.push(moneyFlow);
      }
      
      if (i >= period) {
        let positiveFlow = 0;
        let negativeFlow = 0;
        
        for (let j = i - period + 1; j <= i; j++) {
          if (typicalPrices[j] > typicalPrices[j - 1]) {
            positiveFlow += moneyFlows[j];
          } else if (typicalPrices[j] < typicalPrices[j - 1]) {
            negativeFlow += moneyFlows[j];
          }
        }
        
        const mfi = negativeFlow === 0 ? 100 : 100 - (100 / (1 + (positiveFlow / negativeFlow)));
        
        result.push({
          time: current.time,
          mfi: mfi
        });
      }
    }
    
    return result;
  }

  accumulationDistributionLine(data) {
    if (!data || data.length === 0) return [];
    
    const result = [];
    let ad = 0;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const clv = current.high === current.low ? 0 : 
        ((current.close - current.low) - (current.high - current.close)) / (current.high - current.low);
      
      ad += clv * current.volume;
      
      result.push({
        time: current.time,
        ad: ad
      });
    }
    
    return result;
  }

  chaikinOscillator(data, fastPeriod = 3, slowPeriod = 10) {
    const adLine = this.accumulationDistributionLine(data);
    if (adLine.length < slowPeriod) return [];
    
    const result = [];
    
    for (let i = slowPeriod - 1; i < adLine.length; i++) {
      let fastSum = 0;
      let slowSum = 0;
      
      for (let j = 0; j < fastPeriod; j++) {
        fastSum += adLine[i - j].ad;
      }
      
      for (let j = 0; j < slowPeriod; j++) {
        slowSum += adLine[i - j].ad;
      }
      
      const fastEMA = fastSum / fastPeriod;
      const slowEMA = slowSum / slowPeriod;
      const oscillator = fastEMA - slowEMA;
      
      result.push({
        time: adLine[i].time,
        chaikin: oscillator
      });
    }
    
    return result;
  }

  volumeOscillator(data, shortPeriod = 5, longPeriod = 10) {
    if (!data || data.length < longPeriod) return [];
    
    const result = [];
    
    for (let i = longPeriod - 1; i < data.length; i++) {
      let shortSum = 0;
      let longSum = 0;
      
      for (let j = 0; j < shortPeriod; j++) {
        shortSum += data[i - j].volume;
      }
      
      for (let j = 0; j < longPeriod; j++) {
        longSum += data[i - j].volume;
      }
      
      const shortAvg = shortSum / shortPeriod;
      const longAvg = longSum / longPeriod;
      const oscillator = ((shortAvg - longAvg) / longAvg) * 100;
      
      result.push({
        time: data[i].time,
        vo: oscillator
      });
    }
    
    return result;
  }

  priceVolumeRank(data, period = 20) {
    if (!data || data.length < period) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const volumes = [];
      for (let j = i - period + 1; j <= i; j++) {
        volumes.push(data[j].volume);
      }
      
      volumes.sort((a, b) => a - b);
      const currentVolume = data[i].volume;
      const rank = volumes.indexOf(currentVolume) + 1;
      const percentRank = (rank / period) * 100;
      
      result.push({
        time: data[i].time,
        pvr: percentRank
      });
    }
    
    return result;
  }

  negativevolumeIndex(data) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    let nvi = 1000;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      
      if (i === 0) {
        result.push({
          time: current.time,
          nvi: nvi
        });
      } else {
        const previous = data[i - 1];
        
        if (current.volume < previous.volume) {
          nvi = nvi * (current.close / previous.close);
        }
        
        result.push({
          time: current.time,
          nvi: nvi
        });
      }
    }
    
    return result;
  }

  positiveVolumeIndex(data) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    let pvi = 1000;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      
      if (i === 0) {
        result.push({
          time: current.time,
          pvi: pvi
        });
      } else {
        const previous = data[i - 1];
        
        if (current.volume > previous.volume) {
          pvi = pvi * (current.close / previous.close);
        }
        
        result.push({
          time: current.time,
          pvi: pvi
        });
      }
    }
    
    return result;
  }

  volumeWeightedAveragePrice(data) {
    if (!data || data.length === 0) return [];
    
    const result = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      const typicalPrice = (current.high + current.low + current.close) / 3;
      const tpv = typicalPrice * current.volume;
      
      cumulativeTPV += tpv;
      cumulativeVolume += current.volume;
      
      const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
      
      result.push({
        time: current.time,
        vwap: vwap
      });
    }
    
    return result;
  }

  volumeRSI(data, period = 14) {
    if (!data || data.length < period + 1) return [];
    
    const volumeChanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].volume - data[i - 1].volume;
      volumeChanges.push(change);
    }
    
    const result = [];
    
    for (let i = period - 1; i < volumeChanges.length; i++) {
      let gains = 0;
      let losses = 0;
      
      for (let j = i - period + 1; j <= i; j++) {
        if (volumeChanges[j] > 0) {
          gains += volumeChanges[j];
        } else {
          losses += Math.abs(volumeChanges[j]);
        }
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const vrsi = 100 - (100 / (1 + rs));
      
      result.push({
        time: data[i + 1].time,
        vrsi: vrsi
      });
    }
    
    return result;
  }

  klingerOscillator(data, shortPeriod = 34, longPeriod = 55) {
    if (!data || data.length < longPeriod + 1) return [];
    
    const result = [];
    const volumeForce = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const hlc = (current.high + current.low + current.close) / 3;
      const prevHlc = (previous.high + previous.low + previous.close) / 3;
      
      const trend = hlc > prevHlc ? 1 : (hlc < prevHlc ? -1 : 0);
      const dm = current.high - current.low;
      const cm = dm === 0 ? previous.close : dm;
      const vf = current.volume * Math.abs(2 * ((dm / cm) - 1)) * trend * 100;
      
      volumeForce.push(vf);
    }
    
    for (let i = longPeriod - 1; i < volumeForce.length; i++) {
      let shortSum = 0;
      let longSum = 0;
      
      for (let j = 0; j < shortPeriod; j++) {
        shortSum += volumeForce[i - j];
      }
      
      for (let j = 0; j < longPeriod; j++) {
        longSum += volumeForce[i - j];
      }
      
      const shortEMA = shortSum / shortPeriod;
      const longEMA = longSum / longPeriod;
      const ko = shortEMA - longEMA;
      
      result.push({
        time: data[i + 1].time,
        ko: ko
      });
    }
    
    return result;
  }

  forceIndex(data, period = 13) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    const forces = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      const force = (current.close - previous.close) * current.volume;
      forces.push(force);
    }
    
    for (let i = 0; i < forces.length; i++) {
      if (i < period - 1) {
        result.push({
          time: data[i + 1].time,
          fi: forces[i]
        });
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += forces[j];
        }
        const ema = sum / period;
        
        result.push({
          time: data[i + 1].time,
          fi: ema
        });
      }
    }
    
    return result;
  }

  easeOfMovement(data, period = 14) {
    if (!data || data.length < 2) return [];
    
    const result = [];
    const emvs = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const distance = ((current.high + current.low) / 2) - ((previous.high + previous.low) / 2);
      const box = (current.volume / 1000000) / (current.high - current.low);
      const emv = box === 0 ? 0 : distance / box;
      
      emvs.push(emv);
    }
    
    for (let i = 0; i < emvs.length; i++) {
      if (i < period - 1) {
        result.push({
          time: data[i + 1].time,
          emv: emvs[i]
        });
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += emvs[j];
        }
        const smaEmv = sum / period;
        
        result.push({
          time: data[i + 1].time,
          emv: smaEmv
        });
      }
    }
    
    return result;
  }

  getAvailableIndicators() {
    return {
      'Accumulation/Distribution': {
        'On-Balance Volume (OBV)': 'onBalanceVolume',
        'Accumulation/Distribution Line': 'accumulationDistributionLine',
        'Chaikin Oscillator': 'chaikinOscillator',
        'Negative Volume Index': 'negativevolumeIndex',
        'Positive Volume Index': 'positiveVolumeIndex'
      },
      'Price-Volume Analysis': {
        'Volume Price Trend (VPT)': 'volumePriceTrend',
        'Money Flow Index (MFI)': 'moneyFlowIndex',
        'Volume Weighted Average Price (VWAP)': 'volumeWeightedAveragePrice',
        'Price Volume Rank': 'priceVolumeRank'
      },
      'Advanced Volume': {
        'Volume Oscillator': 'volumeOscillator',
        'Volume RSI': 'volumeRSI',
        'Klinger Oscillator': 'klingerOscillator',
        'Force Index': 'forceIndex',
        'Ease of Movement': 'easeOfMovement'
      }
    };
  }
}

export default VolumeIndicators;