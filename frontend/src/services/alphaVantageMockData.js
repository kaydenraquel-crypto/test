// Mock data for Alpha Vantage API - used when API is unavailable or for demo purposes

export const mockDailyData = {
  'AAPL': {
    "Meta Data": {
      "1. Information": "Daily Prices (open, high, low, close) and Volumes",
      "2. Symbol": "AAPL",
      "3. Last Refreshed": "2024-01-12",
      "4. Output Size": "Compact",
      "5. Time Zone": "US/Eastern"
    },
    "Time Series (Daily)": {
      "2025-08-24": {
        "1. open": "185.90",
        "2. high": "189.45",
        "3. low": "182.15",
        "4. close": "188.32",
        "5. volume": "70230000"
      },
      "2025-08-23": {
        "1. open": "182.08",
        "2. high": "186.90",
        "3. low": "179.77",
        "4. close": "185.14",
        "5. volume": "74993547"
      },
      "2025-08-22": {
        "1. open": "180.16",
        "2. high": "183.56",
        "3. low": "175.49",
        "4. close": "181.89",
        "5. volume": "58279974"
      },
      "2025-08-21": {
        "1. open": "181.62",
        "2. high": "184.83",
        "3. low": "176.43",
        "4. close": "179.18",
        "5. volume": "66831572"
      },
      "2025-08-20": {
        "1. open": "179.23",
        "2. high": "182.44",
        "3. low": "174.23",
        "4. close": "181.01",
        "5. volume": "64440915"
      },
      "2025-08-19": {
        "1. open": "177.45",
        "2. high": "180.92",
        "3. low": "172.18",
        "4. close": "179.23",
        "5. volume": "59324821"
      },
      "2025-08-18": {
        "1. open": "175.12",
        "2. high": "178.67",
        "3. low": "170.45",
        "4. close": "177.45",
        "5. volume": "68492134"
      },
      "2025-08-17": {
        "1. open": "173.28",
        "2. high": "176.95",
        "3. low": "168.82",
        "4. close": "175.12",
        "5. volume": "72851947"
      }
    }
  },
  'TSLA': {
    "Meta Data": {
      "1. Information": "Daily Prices (open, high, low, close) and Volumes",
      "2. Symbol": "TSLA",
      "3. Last Refreshed": "2024-01-12",
      "4. Output Size": "Compact",
      "5. Time Zone": "US/Eastern"
    },
    "Time Series (Daily)": {
      "2024-01-12": {
        "1. open": "240.85",
        "2. high": "243.33",
        "3. low": "237.06",
        "4. close": "238.45",
        "5. volume": "112847621"
      },
      "2024-01-11": {
        "1. open": "242.65",
        "2. high": "245.01",
        "3. low": "239.21",
        "4. close": "241.70",
        "5. volume": "108932144"
      },
      "2024-01-10": {
        "1. open": "246.39",
        "2. high": "246.64",
        "3. low": "241.30",
        "4. close": "242.68",
        "5. volume": "89973500"
      }
    }
  },
  'BTCUSDT': {
    "Meta Data": {
      "1. Information": "Daily Prices (open, high, low, close) and Volumes",
      "2. Symbol": "BTCUSDT",
      "3. Last Refreshed": "2025-08-23",
      "4. Output Size": "Compact",
      "5. Time Zone": "US/Eastern"
    },
    "Time Series (Daily)": {
      "2025-08-23": {
        "1. open": "97185.00",
        "2. high": "97580.00",
        "3. low": "96420.00",
        "4. close": "97342.00",
        "5. volume": "15420000"
      },
      "2025-08-22": {
        "1. open": "96890.00",
        "2. high": "97890.00",
        "3. low": "96120.00",
        "4. close": "97185.00",
        "5. volume": "18250000"
      },
      "2025-08-21": {
        "1. open": "95780.00",
        "2. high": "97200.00",
        "3. low": "95200.00",
        "4. close": "96890.00",
        "5. volume": "22150000"
      },
      "2025-08-20": {
        "1. open": "94250.00",
        "2. high": "96100.00",
        "3. low": "93980.00",
        "4. close": "95780.00",
        "5. volume": "19800000"
      }
    }
  }
}

export const mockRSI = {
  'AAPL': {
    "Meta Data": {
      "1: Symbol": "AAPL",
      "2: Indicator": "Relative Strength Index (RSI)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Time Period": 14,
      "6: Series Type": "close",
      "7: Time Zone": "US/Eastern"
    },
    "Technical Analysis: RSI": {
      "2024-01-12": {
        "RSI": "68.45"
      },
      "2024-01-11": {
        "RSI": "72.18"
      },
      "2024-01-10": {
        "RSI": "65.33"
      }
    }
  },
  'BTCUSDT': {
    "Meta Data": {
      "1: Symbol": "BTCUSDT",
      "2: Indicator": "Relative Strength Index (RSI)",
      "3: Last Refreshed": "2025-08-23",
      "4: Interval": "daily",
      "5: Time Period": 14,
      "6: Series Type": "close",
      "7: Time Zone": "US/Eastern"
    },
    "Technical Analysis: RSI": {
      "2025-08-23": {
        "RSI": "58.42"
      },
      "2025-08-22": {
        "RSI": "61.18"
      },
      "2025-08-21": {
        "RSI": "55.73"
      }
    }
  },
  'TSLA': {
    "Meta Data": {
      "1: Symbol": "TSLA",
      "2: Indicator": "Relative Strength Index (RSI)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Time Period": 14,
      "6: Series Type": "close",
      "7: Time Zone": "US/Eastern"
    },
    "Technical Analysis: RSI": {
      "2024-01-12": {
        "RSI": "45.32"
      },
      "2024-01-11": {
        "RSI": "48.76"
      },
      "2024-01-10": {
        "RSI": "52.14"
      }
    }
  }
}

export const mockMACD = {
  'AAPL': {
    "Meta Data": {
      "1: Symbol": "AAPL",
      "2: Indicator": "Moving Average Convergence/Divergence (MACD)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Series Type": "close",
      "6: Time Zone": "US/Eastern"
    },
    "Technical Analysis: MACD": {
      "2024-01-12": {
        "MACD": "2.1456",
        "MACD_Hist": "0.3421",
        "MACD_Signal": "1.8035"
      },
      "2024-01-11": {
        "MACD": "1.9876",
        "MACD_Hist": "0.2845",
        "MACD_Signal": "1.7031"
      }
    }
  },
  'BTCUSDT': {
    "Meta Data": {
      "1: Symbol": "BTCUSDT",
      "2: Indicator": "Moving Average Convergence/Divergence (MACD)",
      "3: Last Refreshed": "2025-08-23",
      "4: Interval": "daily",
      "5: Series Type": "close",
      "6: Time Zone": "US/Eastern"
    },
    "Technical Analysis: MACD": {
      "2025-08-23": {
        "MACD": "1250.45",
        "MACD_Hist": "180.32",
        "MACD_Signal": "1070.13"
      },
      "2025-08-22": {
        "MACD": "1180.28",
        "MACD_Hist": "165.78",
        "MACD_Signal": "1014.50"
      }
    }
  },
  'TSLA': {
    "Meta Data": {
      "1: Symbol": "TSLA",
      "2: Indicator": "Moving Average Convergence/Divergence (MACD)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Series Type": "close",
      "6: Time Zone": "US/Eastern"
    },
    "Technical Analysis: MACD": {
      "2024-01-12": {
        "MACD": "-1.2345",
        "MACD_Hist": "-0.4567",
        "MACD_Signal": "-0.7778"
      }
    }
  }
}

export const mockSMA = {
  'AAPL': {
    "Meta Data": {
      "1: Symbol": "AAPL",
      "2: Indicator": "Simple Moving Average (SMA)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Time Period": 20,
      "6: Series Type": "close",
      "7: Time Zone": "US/Eastern"
    },
    "Technical Analysis: SMA": {
      "2024-01-12": {
        "SMA": "183.45"
      },
      "2024-01-11": {
        "SMA": "182.91"
      }
    }
  },
  'TSLA': {
    "Meta Data": {
      "1: Symbol": "TSLA",
      "2: Indicator": "Simple Moving Average (SMA)",
      "3: Last Refreshed": "2024-01-12",
      "4: Interval": "daily",
      "5: Time Period": 20,
      "6: Series Type": "close",
      "7: Time Zone": "US/Eastern"
    },
    "Technical Analysis: SMA": {
      "2024-01-12": {
        "SMA": "245.67"
      }
    }
  }
}

export const mockCompanyOverview = {
  'AAPL': {
    "Symbol": "AAPL",
    "AssetType": "Common Stock",
    "Name": "Apple Inc",
    "Description": "Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services. Apple is the world's largest technology company by revenue and, since January 2021, the world's most valuable company.",
    "CIK": "320193",
    "Exchange": "NASDAQ",
    "Currency": "USD",
    "Country": "USA",
    "Sector": "Technology",
    "Industry": "Consumer Electronics",
    "Address": "One Apple Park Way, Cupertino, CA, United States, 95014",
    "FiscalYearEnd": "September",
    "LatestQuarter": "2023-12-30",
    "MarketCapitalization": "2870000000000",
    "EBITDA": "123456000000",
    "PERatio": "28.5",
    "PEGRatio": "2.1",
    "BookValue": "4.84",
    "DividendPerShare": "0.96",
    "DividendYield": "0.0052",
    "EPS": "6.42",
    "RevenuePerShareTTM": "24.32",
    "ProfitMargin": "0.264",
    "OperatingMarginTTM": "0.298",
    "ReturnOnAssetsTTM": "0.201",
    "ReturnOnEquityTTM": "1.479",
    "RevenueTTM": "394328000000",
    "GrossProfitTTM": "169148000000",
    "DilutedEPSTTM": "6.42",
    "QuarterlyEarningsGrowthYOY": "-0.131",
    "QuarterlyRevenueGrowthYOY": "-0.011",
    "AnalystTargetPrice": "195.5",
    "TrailingPE": "28.5",
    "ForwardPE": "26.2",
    "PriceToSalesRatioTTM": "7.28",
    "PriceToBookRatio": "39.1",
    "EVToRevenue": "7.65",
    "EVToEBITDA": "22.8",
    "Beta": "1.31",
    "52WeekHigh": "199.62",
    "52WeekLow": "164.08",
    "50DayMovingAverage": "184.32",
    "200DayMovingAverage": "179.84",
    "SharesOutstanding": "15552752000",
    "DividendDate": "2024-02-16",
    "ExDividendDate": "2024-02-09"
  },
  'TSLA': {
    "Symbol": "TSLA",
    "AssetType": "Common Stock",
    "Name": "Tesla Inc",
    "Description": "Tesla, Inc. is an American electric vehicle and clean energy company based in Palo Alto, California. Tesla's current products include electric cars, battery energy storage from home to grid scale, solar panels and solar roof tiles, as well as other related products and services.",
    "Exchange": "NASDAQ",
    "Currency": "USD",
    "Country": "USA",
    "Sector": "Consumer Cyclical",
    "Industry": "Auto Manufacturers",
    "MarketCapitalization": "760000000000",
    "PERatio": "65.2",
    "DividendYield": "0.0000",
    "EPS": "3.62",
    "Beta": "2.31",
    "52WeekHigh": "299.29",
    "52WeekLow": "138.80"
  }
}

export const mockNews = {
  'AAPL': [
    {
      title: "Apple Reports Strong Q4 Earnings Driven by iPhone Sales",
      summary: "Apple Inc. exceeded analyst expectations with robust iPhone 15 sales and growing services revenue, posting quarterly earnings of $1.89 per share versus the expected $1.70.",
      source: "Reuters",
      time_published: "20240112T143000",
      overall_sentiment_label: "Bullish",
      overall_sentiment_score: 0.75,
      url: "https://example.com/news1",
      banner_image: "https://via.placeholder.com/300x200"
    },
    {
      title: "Apple Vision Pro Production Scales Up for February Launch",
      summary: "Apple is reportedly increasing production capacity for the Vision Pro mixed reality headset ahead of its February 2024 launch, with initial shipments expected to reach 400,000 units.",
      source: "Bloomberg",
      time_published: "20240111T091500",
      overall_sentiment_label: "Bullish",
      overall_sentiment_score: 0.68,
      url: "https://example.com/news2"
    },
    {
      title: "Analysts Raise Price Targets Following Strong Services Growth",
      summary: "Multiple Wall Street firms have raised their price targets for Apple stock, citing strong growth in the App Store and other services that now represent 25% of total revenue.",
      source: "MarketWatch",
      time_published: "20240110T160000",
      overall_sentiment_label: "Bullish",
      overall_sentiment_score: 0.72
    }
  ],
  'TSLA': [
    {
      title: "Tesla Delivers Record 484,507 Vehicles in Q4 2023",
      summary: "Tesla announced record quarterly deliveries, beating analyst estimates and achieving annual delivery guidance despite supply chain challenges and increased competition.",
      source: "CNN Business",
      time_published: "20240112T120000",
      overall_sentiment_label: "Bullish",
      overall_sentiment_score: 0.81,
      url: "https://example.com/tesla1"
    },
    {
      title: "Cybertruck Production Ramps Up at Gigafactory Texas",
      summary: "Tesla has begun delivering the first Cybertruck units to customers while continuing to scale production at its Austin facility, with plans to reach higher volume production in 2024.",
      source: "Electrek",
      time_published: "20240111T140000",
      overall_sentiment_label: "Bullish",
      overall_sentiment_score: 0.76
    }
  ]
}

export const mockSymbolSearch = {
  "bestMatches": [
    {
      "1. symbol": "AAPL",
      "2. name": "Apple Inc",
      "3. type": "Equity",
      "4. region": "United States",
      "5. marketOpen": "09:30",
      "6. marketClose": "16:00",
      "7. timezone": "UTC-05",
      "8. currency": "USD",
      "9. matchScore": "1.0000"
    },
    {
      "1. symbol": "TSLA",
      "2. name": "Tesla Inc",
      "3. type": "Equity",
      "4. region": "United States",
      "5. marketOpen": "09:30",
      "6. marketClose": "16:00",
      "7. timezone": "UTC-05",
      "8. currency": "USD",
      "9. matchScore": "0.9000"
    },
    {
      "1. symbol": "GOOGL",
      "2. name": "Alphabet Inc Class A",
      "3. type": "Equity",
      "4. region": "United States",
      "5. marketOpen": "09:30",
      "6. marketClose": "16:00",
      "7. timezone": "UTC-05",
      "8. currency": "USD",
      "9. matchScore": "0.8000"
    },
    {
      "1. symbol": "MSFT",
      "2. name": "Microsoft Corporation",
      "3. type": "Equity",
      "4. region": "United States",
      "5. marketOpen": "09:30",
      "6. marketClose": "16:00",
      "7. timezone": "UTC-05",
      "8. currency": "USD",
      "9. matchScore": "0.7500"
    }
  ]
}

// Helper function to generate realistic mock data for any symbol
export function generateMockData(symbol) {
  const basePrice = Math.random() * 200 + 50 // Random price between $50-$250
  const change = (Math.random() - 0.5) * 10 // Random change ±$5
  const changePercent = (change / basePrice) * 100
  
  return {
    marketData: {
      symbol,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 100000000) + 10000000, // 10M-110M volume
      timestamp: new Date().toISOString()
    },
    indicators: {
      rsi: {
        value: Math.random() * 100,
        signal: Math.random() > 0.7 ? 'overbought' : Math.random() < 0.3 ? 'oversold' : 'neutral'
      },
      macd: {
        macd: (Math.random() - 0.5) * 4,
        signal: (Math.random() - 0.5) * 4,
        histogram: (Math.random() - 0.5) * 2,
        trend: Math.random() > 0.5 ? 'bullish' : 'bearish'
      },
      sma20: basePrice * (0.95 + Math.random() * 0.1),
      sma50: basePrice * (0.90 + Math.random() * 0.2),
      ema20: basePrice * (0.96 + Math.random() * 0.08),
      bollinger: {
        upper: basePrice * 1.05,
        middle: basePrice,
        lower: basePrice * 0.95,
        position: 'middle'
      },
      stoch: {
        k: Math.random() * 100,
        d: Math.random() * 100,
        signal: Math.random() > 0.8 ? 'overbought' : Math.random() < 0.2 ? 'oversold' : 'neutral'
      },
      adx: {
        value: Math.random() * 100,
        trend: Math.random() > 0.6 ? 'strong' : Math.random() > 0.3 ? 'weak' : 'ranging'
      }
    },
    companyInfo: {
      name: `${symbol} Corporation`,
      sector: 'Technology',
      marketCap: `${Math.floor(Math.random() * 1000 + 100)}B`,
      peRatio: (Math.random() * 30 + 10).toFixed(1),
      dividendYield: (Math.random() * 5).toFixed(2) + '%',
      description: `${symbol} is a leading company in its sector with strong fundamentals and growth prospects.`
    },
    news: [
      {
        title: `${symbol} Reports Strong Quarterly Results`,
        summary: `${symbol} exceeded analyst expectations with strong revenue growth and improved margins.`,
        source: 'Financial Times',
        time_published: new Date().toISOString(),
        overall_sentiment_label: 'Bullish',
        overall_sentiment_score: 0.75
      }
    ]
  }
}