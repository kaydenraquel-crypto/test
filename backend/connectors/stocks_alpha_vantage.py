"""
Alpha Vantage connector for stock market data
Provides real-time and historical market data, technical indicators, and fundamental data
"""
import os
import asyncio
import aiohttp
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class AlphaVantageConnector:
    def __init__(self):
        self.api_key = os.getenv('ALPHA_VANTAGE_KEY') or os.getenv('ALPHA_VANTAGE_API_KEY')
        if not self.api_key:
            logger.warning("Alpha Vantage API key not found in environment variables")
        
        self.base_url = "https://www.alphavantage.co/query"
        self.session = None
        self.rate_limit_delay = 12  # 12 seconds between requests for free tier
        self.last_request_time = 0
        self.cache = {}
        self.cache_duration = 300  # 5 minutes cache
        
    async def close(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
            self.session = None
        self.cache.clear()
        
    def clear_expired_cache(self):
        """Remove expired cache entries"""
        current_time = datetime.now()
        expired_keys = [
            key for key, (_, cached_time) in self.cache.items()
            if (current_time - cached_time).total_seconds() > self.cache_duration
        ]
        for key in expired_keys:
            del self.cache[key]
        logger.debug(f"Cleared {len(expired_keys)} expired cache entries")
            
    async def __aenter__(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            self.session = None
            
    async def ensure_rate_limit(self):
        """Ensure we don't exceed API rate limits"""
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - time_since_last)
        
        self.last_request_time = asyncio.get_event_loop().time()
        
    async def make_request(self, params: Dict[str, str]) -> Dict[str, Any]:
        """Make a request to Alpha Vantage API"""
        if not self.api_key:
            raise ValueError("Alpha Vantage API key not configured")
            
        # Check cache
        cache_key = json.dumps(params, sort_keys=True)
        if cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if (datetime.now() - cached_time).total_seconds() < self.cache_duration:
                logger.debug(f"Returning cached data for {params.get('symbol')}")
                return cached_data
            else:
                # Remove expired cache entry
                del self.cache[cache_key]
                
        await self.ensure_rate_limit()
        
        params['apikey'] = self.api_key
        
        try:
            if self.session is None:
                self.session = aiohttp.ClientSession()
                
            async with self.session.get(self.base_url, params=params) as response:
                data = await response.json()
                
                # Check for errors
                if 'Error Message' in data:
                    raise ValueError(f"API Error: {data['Error Message']}")
                if 'Information' in data:
                    logger.warning(f"API Rate limit: {data['Information']}")
                    raise ValueError("Rate limit exceeded")
                    
                # Cache successful response
                self.cache[cache_key] = (data, datetime.now())
                
                return data
                
        except Exception as e:
            logger.error(f"Alpha Vantage API error: {str(e)}")
            raise
            
    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time quote for a symbol"""
        try:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol
            }
            
            data = await self.make_request(params)
            
            if 'Global Quote' in data:
                quote = data['Global Quote']
                return {
                    'symbol': quote.get('01. symbol', symbol),
                    'price': float(quote.get('05. price', 0)),
                    'volume': int(quote.get('06. volume', 0)),
                    'change': float(quote.get('09. change', 0)),
                    'change_percent': quote.get('10. change percent', '0%').rstrip('%'),
                    'open': float(quote.get('02. open', 0)),
                    'high': float(quote.get('03. high', 0)),
                    'low': float(quote.get('04. low', 0)),
                    'previous_close': float(quote.get('08. previous close', 0)),
                    'timestamp': quote.get('07. latest trading day', '')
                }
            return {}
            
        except Exception as e:
            logger.error(f"Error getting quote for {symbol}: {str(e)}")
            return {}
            
    async def get_intraday(self, symbol: str, interval: str = '5min') -> Dict[str, Any]:
        """Get intraday time series data"""
        try:
            params = {
                'function': 'TIME_SERIES_INTRADAY',
                'symbol': symbol,
                'interval': interval,
                'outputsize': 'compact'
            }
            
            data = await self.make_request(params)
            
            time_series_key = f'Time Series ({interval})'
            if time_series_key in data:
                time_series = data[time_series_key]
                
                # Convert to list format
                result = []
                for timestamp, values in time_series.items():
                    result.append({
                        'timestamp': timestamp,
                        'open': float(values['1. open']),
                        'high': float(values['2. high']),
                        'low': float(values['3. low']),
                        'close': float(values['4. close']),
                        'volume': int(values['5. volume'])
                    })
                    
                return {
                    'symbol': symbol,
                    'interval': interval,
                    'data': result[:100]  # Limit to most recent 100 points
                }
                
            return {'symbol': symbol, 'interval': interval, 'data': []}
            
        except Exception as e:
            logger.error(f"Error getting intraday data for {symbol}: {str(e)}")
            return {'symbol': symbol, 'interval': interval, 'data': []}
            
    async def get_daily(self, symbol: str, outputsize: str = 'compact') -> Dict[str, Any]:
        """Get daily time series data"""
        try:
            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': symbol,
                'outputsize': outputsize
            }
            
            data = await self.make_request(params)
            
            if 'Time Series (Daily)' in data:
                time_series = data['Time Series (Daily)']
                
                # Convert to list format
                result = []
                for date, values in time_series.items():
                    result.append({
                        'date': date,
                        'open': float(values['1. open']),
                        'high': float(values['2. high']),
                        'low': float(values['3. low']),
                        'close': float(values['4. close']),
                        'volume': int(values['5. volume'])
                    })
                    
                return {
                    'symbol': symbol,
                    'data': result[:100]  # Limit to most recent 100 days
                }
                
            return {'symbol': symbol, 'data': []}
            
        except Exception as e:
            logger.error(f"Error getting daily data for {symbol}: {str(e)}")
            return {'symbol': symbol, 'data': []}
            
    async def get_technical_indicator(self, symbol: str, indicator: str, **kwargs) -> Dict[str, Any]:
        """Get technical indicator data"""
        try:
            params = {
                'function': indicator,
                'symbol': symbol,
                'interval': kwargs.get('interval', 'daily'),
                'time_period': kwargs.get('time_period', 14),
                'series_type': kwargs.get('series_type', 'close')
            }
            
            # Add any additional parameters
            for key, value in kwargs.items():
                if key not in params and value is not None:
                    params[key] = value
                    
            data = await self.make_request(params)
            
            # Find the technical analysis key (varies by indicator)
            ta_key = None
            for key in data.keys():
                if 'Technical Analysis' in key:
                    ta_key = key
                    break
                    
            if ta_key:
                ta_data = data[ta_key]
                
                # Convert to list format
                result = []
                for timestamp, values in list(ta_data.items())[:100]:
                    result.append({
                        'timestamp': timestamp,
                        **{k: float(v) for k, v in values.items()}
                    })
                    
                return {
                    'symbol': symbol,
                    'indicator': indicator,
                    'data': result
                }
                
            return {'symbol': symbol, 'indicator': indicator, 'data': []}
            
        except Exception as e:
            logger.error(f"Error getting {indicator} for {symbol}: {str(e)}")
            return {'symbol': symbol, 'indicator': indicator, 'data': []}
            
    async def get_rsi(self, symbol: str, interval: str = 'daily', time_period: int = 14):
        """Get RSI (Relative Strength Index) data"""
        return await self.get_technical_indicator(symbol, 'RSI', 
                                                 interval=interval, 
                                                 time_period=time_period)
        
    async def get_macd(self, symbol: str, interval: str = 'daily'):
        """Get MACD (Moving Average Convergence Divergence) data"""
        return await self.get_technical_indicator(symbol, 'MACD', 
                                                 interval=interval,
                                                 fastperiod=12,
                                                 slowperiod=26,
                                                 signalperiod=9)
        
    async def get_sma(self, symbol: str, interval: str = 'daily', time_period: int = 20):
        """Get SMA (Simple Moving Average) data"""
        return await self.get_technical_indicator(symbol, 'SMA',
                                                 interval=interval,
                                                 time_period=time_period)
        
    async def get_ema(self, symbol: str, interval: str = 'daily', time_period: int = 20):
        """Get EMA (Exponential Moving Average) data"""
        return await self.get_technical_indicator(symbol, 'EMA',
                                                 interval=interval,
                                                 time_period=time_period)
        
    async def get_bbands(self, symbol: str, interval: str = 'daily', time_period: int = 20):
        """Get Bollinger Bands data"""
        return await self.get_technical_indicator(symbol, 'BBANDS',
                                                 interval=interval,
                                                 time_period=time_period,
                                                 nbdevup=2,
                                                 nbdevdn=2)
        
    async def get_company_overview(self, symbol: str) -> Dict[str, Any]:
        """Get company fundamental data"""
        try:
            params = {
                'function': 'OVERVIEW',
                'symbol': symbol
            }
            
            data = await self.make_request(params)
            
            if 'Symbol' in data:
                return {
                    'symbol': data.get('Symbol'),
                    'name': data.get('Name'),
                    'description': data.get('Description'),
                    'exchange': data.get('Exchange'),
                    'currency': data.get('Currency'),
                    'country': data.get('Country'),
                    'sector': data.get('Sector'),
                    'industry': data.get('Industry'),
                    'market_cap': data.get('MarketCapitalization'),
                    'pe_ratio': data.get('PERatio'),
                    'peg_ratio': data.get('PEGRatio'),
                    'book_value': data.get('BookValue'),
                    'dividend_per_share': data.get('DividendPerShare'),
                    'dividend_yield': data.get('DividendYield'),
                    'eps': data.get('EPS'),
                    'revenue_per_share': data.get('RevenuePerShareTTM'),
                    'profit_margin': data.get('ProfitMargin'),
                    'operating_margin': data.get('OperatingMarginTTM'),
                    'return_on_assets': data.get('ReturnOnAssetsTTM'),
                    'return_on_equity': data.get('ReturnOnEquityTTM'),
                    'revenue': data.get('RevenueTTM'),
                    'gross_profit': data.get('GrossProfitTTM'),
                    'diluted_eps': data.get('DilutedEPSTTM'),
                    'quarterly_earnings_growth': data.get('QuarterlyEarningsGrowthYOY'),
                    'quarterly_revenue_growth': data.get('QuarterlyRevenueGrowthYOY'),
                    'analyst_target_price': data.get('AnalystTargetPrice'),
                    'trailing_pe': data.get('TrailingPE'),
                    'forward_pe': data.get('ForwardPE'),
                    'price_to_sales': data.get('PriceToSalesRatioTTM'),
                    'price_to_book': data.get('PriceToBookRatio'),
                    'ev_to_revenue': data.get('EVToRevenue'),
                    'ev_to_ebitda': data.get('EVToEBITDA'),
                    'beta': data.get('Beta'),
                    '52_week_high': data.get('52WeekHigh'),
                    '52_week_low': data.get('52WeekLow'),
                    '50_day_ma': data.get('50DayMovingAverage'),
                    '200_day_ma': data.get('200DayMovingAverage'),
                    'shares_outstanding': data.get('SharesOutstanding'),
                    'dividend_date': data.get('DividendDate'),
                    'ex_dividend_date': data.get('ExDividendDate')
                }
                
            return {}
            
        except Exception as e:
            logger.error(f"Error getting company overview for {symbol}: {str(e)}")
            return {}
            
    async def search_symbols(self, keywords: str) -> List[Dict[str, str]]:
        """Search for symbols"""
        try:
            params = {
                'function': 'SYMBOL_SEARCH',
                'keywords': keywords
            }
            
            data = await self.make_request(params)
            
            if 'bestMatches' in data:
                results = []
                for match in data['bestMatches']:
                    results.append({
                        'symbol': match.get('1. symbol'),
                        'name': match.get('2. name'),
                        'type': match.get('3. type'),
                        'region': match.get('4. region'),
                        'market_open': match.get('5. marketOpen'),
                        'market_close': match.get('6. marketClose'),
                        'timezone': match.get('7. timezone'),
                        'currency': match.get('8. currency'),
                        'match_score': match.get('9. matchScore')
                    })
                return results
                
            return []
            
        except Exception as e:
            logger.error(f"Error searching symbols with keywords '{keywords}': {str(e)}")
            return []
            
    async def get_news_sentiment(self, symbol: str = None, topics: str = None) -> Dict[str, Any]:
        """Get news and sentiment data"""
        try:
            params = {
                'function': 'NEWS_SENTIMENT'
            }
            
            if symbol:
                params['tickers'] = symbol
            if topics:
                params['topics'] = topics
                
            data = await self.make_request(params)
            
            if 'feed' in data:
                news_items = []
                for item in data['feed'][:10]:  # Limit to 10 most recent
                    news_items.append({
                        'title': item.get('title'),
                        'url': item.get('url'),
                        'time_published': item.get('time_published'),
                        'authors': item.get('authors', []),
                        'summary': item.get('summary'),
                        'source': item.get('source'),
                        'category': item.get('category_within_source'),
                        'overall_sentiment_score': item.get('overall_sentiment_score'),
                        'overall_sentiment_label': item.get('overall_sentiment_label'),
                        'ticker_sentiment': item.get('ticker_sentiment', [])
                    })
                    
                return {
                    'items': news_items,
                    'sentiment_score_definition': data.get('sentiment_score_definition'),
                    'relevance_score_definition': data.get('relevance_score_definition')
                }
                
            return {'items': []}
            
        except Exception as e:
            logger.error(f"Error getting news sentiment: {str(e)}")
            return {'items': []}

# Singleton instance
_connector_instance = None

def get_alpha_vantage_connector() -> AlphaVantageConnector:
    """Get or create the Alpha Vantage connector instance"""
    global _connector_instance
    if _connector_instance is None:
        _connector_instance = AlphaVantageConnector()
    return _connector_instance

# For backward compatibility with stocks_router.py
async def get_stock_data(symbol: str) -> Dict[str, Any]:
    """Get stock data for a symbol"""
    connector = get_alpha_vantage_connector()
    
    try:
        # Get quote and daily data in parallel
        quote_task = connector.get_quote(symbol)
        daily_task = connector.get_daily(symbol)
        
        quote, daily = await asyncio.gather(quote_task, daily_task)
        
        # Combine the data
        if quote and daily.get('data'):
            quote['historical'] = daily['data'][:30]  # Last 30 days
            
        return quote
        
    except Exception as e:
        logger.error(f"Error getting stock data for {symbol}: {str(e)}")
        return {}