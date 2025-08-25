class OnChainMetrics {
  static instance = null;
  
  static getInstance() {
    if (!OnChainMetrics.instance) {
      OnChainMetrics.instance = new OnChainMetrics();
    }
    return OnChainMetrics.instance;
  }

  networkValueToTransactions(data, transactionData) {
    if (!data || !transactionData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < transactionData.length; i++) {
      const marketCap = data[i].close * data[i].supply;
      const transactionVolume = transactionData[i].volume || transactionData[i].transactionVolume;
      
      const nvt = transactionVolume > 0 ? marketCap / transactionVolume : 0;
      
      result.push({
        time: data[i].time,
        nvt: nvt,
        signal: nvt > 150 ? 'overvalued' : nvt < 50 ? 'undervalued' : 'neutral'
      });
    }
    
    return result;
  }

  marketValueToRealizedValue(data, realizedCapData) {
    if (!data || !realizedCapData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < realizedCapData.length; i++) {
      const marketCap = data[i].close * data[i].supply;
      const realizedCap = realizedCapData[i].value || realizedCapData[i].realizedCap;
      
      const mvrv = realizedCap > 0 ? marketCap / realizedCap : 0;
      
      let signal = 'neutral';
      if (mvrv > 3.7) signal = 'extreme_greed';
      else if (mvrv > 2.4) signal = 'greed';
      else if (mvrv < 1) signal = 'fear';
      else if (mvrv < 0.8) signal = 'extreme_fear';
      
      result.push({
        time: data[i].time,
        mvrv: mvrv,
        signal: signal
      });
    }
    
    return result;
  }

  spentOutputProfitRatio(data, utxoData) {
    if (!data || !utxoData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < utxoData.length; i++) {
      const spentOutputs = utxoData[i].spentOutputs || [];
      let totalValue = 0;
      let totalProfit = 0;
      
      spentOutputs.forEach(output => {
        const creationPrice = output.creationPrice || 0;
        const spentPrice = data[i].close;
        const value = output.value || 0;
        
        totalValue += value;
        if (spentPrice > creationPrice) {
          totalProfit += value;
        }
      });
      
      const sopr = totalValue > 0 ? totalProfit / totalValue : 0;
      
      let signal = 'neutral';
      if (sopr > 1.02) signal = 'profit_taking';
      else if (sopr < 0.98) signal = 'loss_realization';
      
      result.push({
        time: data[i].time,
        sopr: sopr,
        signal: signal
      });
    }
    
    return result;
  }

  hodlWaves(data, utxoAgeData) {
    if (!data || !utxoAgeData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < utxoAgeData.length; i++) {
      const ageDistribution = utxoAgeData[i];
      
      const waves = {
        '1d-1w': ageDistribution['1d-1w'] || 0,
        '1w-1m': ageDistribution['1w-1m'] || 0,
        '1m-3m': ageDistribution['1m-3m'] || 0,
        '3m-6m': ageDistribution['3m-6m'] || 0,
        '6m-1y': ageDistribution['6m-1y'] || 0,
        '1y-2y': ageDistribution['1y-2y'] || 0,
        '2y-3y': ageDistribution['2y-3y'] || 0,
        '3y-5y': ageDistribution['3y-5y'] || 0,
        '5y-7y': ageDistribution['5y-7y'] || 0,
        '7y-10y': ageDistribution['7y-10y'] || 0,
        '10y+': ageDistribution['10y+'] || 0
      };
      
      const shortTerm = waves['1d-1w'] + waves['1w-1m'] + waves['1m-3m'];
      const longTerm = waves['1y-2y'] + waves['2y-3y'] + waves['3y-5y'] + waves['5y+'];
      
      let signal = 'neutral';
      if (shortTerm > 0.3) signal = 'high_velocity';
      else if (longTerm > 0.7) signal = 'strong_hodl';
      
      result.push({
        time: data[i].time,
        waves: waves,
        shortTermRatio: shortTerm,
        longTermRatio: longTerm,
        signal: signal
      });
    }
    
    return result;
  }

  difficultyRibbons(data, difficultyData) {
    if (!data || !difficultyData || data.length === 0) return [];
    
    const result = [];
    const periods = [9, 14, 25, 40, 60, 90, 128, 200];
    
    for (let i = 200; i < data.length && i < difficultyData.length; i++) {
      const ribbons = {};
      
      periods.forEach(period => {
        let sum = 0;
        for (let j = 0; j < period && i - j >= 0; j++) {
          sum += difficultyData[i - j].difficulty || 0;
        }
        ribbons[`MA${period}`] = sum / period;
      });
      
      const compression = this.calculateRibbonCompression(ribbons);
      let signal = 'neutral';
      
      if (compression < 0.02) {
        signal = 'miner_capitulation';
      } else if (compression > 0.1) {
        signal = 'miner_expansion';
      }
      
      result.push({
        time: data[i].time,
        ribbons: ribbons,
        compression: compression,
        signal: signal
      });
    }
    
    return result;
  }

  calculateRibbonCompression(ribbons) {
    const values = Object.values(ribbons);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max > 0 ? (max - min) / max : 0;
  }

  activeAddresses(data, addressData) {
    if (!data || !addressData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 30; i < data.length && i < addressData.length; i++) {
      const activeAddresses = addressData[i].activeAddresses || 0;
      
      let ma30 = 0;
      for (let j = 0; j < 30; j++) {
        ma30 += addressData[i - j].activeAddresses || 0;
      }
      ma30 /= 30;
      
      const deviation = (activeAddresses - ma30) / ma30;
      
      let signal = 'neutral';
      if (deviation > 0.2) signal = 'high_activity';
      else if (deviation < -0.2) signal = 'low_activity';
      
      result.push({
        time: data[i].time,
        activeAddresses: activeAddresses,
        ma30: ma30,
        deviation: deviation,
        signal: signal
      });
    }
    
    return result;
  }

  exchangeNetflows(data, exchangeData) {
    if (!data || !exchangeData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < exchangeData.length; i++) {
      const inflow = exchangeData[i].inflow || 0;
      const outflow = exchangeData[i].outflow || 0;
      const netflow = inflow - outflow;
      
      let signal = 'neutral';
      if (netflow > 10000) signal = 'selling_pressure';
      else if (netflow < -10000) signal = 'accumulation';
      
      result.push({
        time: data[i].time,
        inflow: inflow,
        outflow: outflow,
        netflow: netflow,
        signal: signal
      });
    }
    
    return result;
  }

  coinDaysDestroyed(data, transactionData) {
    if (!data || !transactionData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < transactionData.length; i++) {
      const transactions = transactionData[i].transactions || [];
      let totalCDD = 0;
      
      transactions.forEach(tx => {
        const value = tx.value || 0;
        const age = tx.inputAge || 0;
        totalCDD += value * age;
      });
      
      let signal = 'neutral';
      if (totalCDD > 1000000) signal = 'old_coins_moving';
      else if (totalCDD < 100000) signal = 'young_coins_moving';
      
      result.push({
        time: data[i].time,
        cdd: totalCDD,
        signal: signal
      });
    }
    
    return result;
  }

  stockToFlow(data, supplyData) {
    if (!data || !supplyData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 365; i < data.length && i < supplyData.length; i++) {
      const currentStock = supplyData[i].totalSupply || 0;
      const yearAgoStock = supplyData[i - 365].totalSupply || 0;
      const annualFlow = currentStock - yearAgoStock;
      
      const stockToFlow = annualFlow > 0 ? currentStock / annualFlow : 0;
      
      let signal = 'neutral';
      if (stockToFlow > 100) signal = 'deflationary';
      else if (stockToFlow < 10) signal = 'inflationary';
      
      result.push({
        time: data[i].time,
        stockToFlow: stockToFlow,
        stock: currentStock,
        flow: annualFlow,
        signal: signal
      });
    }
    
    return result;
  }

  liquidityIndex(data, orderBookData) {
    if (!data || !orderBookData || data.length === 0) return [];
    
    const result = [];
    
    for (let i = 0; i < data.length && i < orderBookData.length; i++) {
      const orderBook = orderBookData[i];
      const midPrice = data[i].close;
      
      const bidLiquidity = this.calculateLiquidity(orderBook.bids, midPrice, 0.05);
      const askLiquidity = this.calculateLiquidity(orderBook.asks, midPrice, 0.05);
      const totalLiquidity = bidLiquidity + askLiquidity;
      
      let signal = 'neutral';
      if (totalLiquidity > 1000000) signal = 'high_liquidity';
      else if (totalLiquidity < 100000) signal = 'low_liquidity';
      
      result.push({
        time: data[i].time,
        bidLiquidity: bidLiquidity,
        askLiquidity: askLiquidity,
        totalLiquidity: totalLiquidity,
        signal: signal
      });
    }
    
    return result;
  }

  calculateLiquidity(orders, midPrice, priceRange) {
    if (!orders) return 0;
    
    return orders.reduce((total, order) => {
      const priceDeviation = Math.abs(order.price - midPrice) / midPrice;
      if (priceDeviation <= priceRange) {
        return total + (order.price * order.size);
      }
      return total;
    }, 0);
  }

  getAvailableMetrics() {
    return {
      'Network Valuation': {
        'Network Value to Transactions (NVT)': 'networkValueToTransactions',
        'Market Value to Realized Value (MVRV)': 'marketValueToRealizedValue',
        'Stock-to-Flow Ratio': 'stockToFlow'
      },
      'Transaction Analysis': {
        'Spent Output Profit Ratio (SOPR)': 'spentOutputProfitRatio',
        'Coin Days Destroyed (CDD)': 'coinDaysDestroyed',
        'Active Addresses': 'activeAddresses'
      },
      'Holder Behavior': {
        'HODL Waves': 'hodlWaves',
        'Exchange Netflows': 'exchangeNetflows'
      },
      'Mining Metrics': {
        'Difficulty Ribbons': 'difficultyRibbons'
      },
      'Market Structure': {
        'Liquidity Index': 'liquidityIndex'
      }
    };
  }
}

export default OnChainMetrics;