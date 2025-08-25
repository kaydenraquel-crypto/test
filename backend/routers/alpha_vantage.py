"""
Alpha Vantage API Router
Provides endpoints for real-time market data, technical indicators, and fundamental analysis
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
import logging
from connectors.stocks_alpha_vantage import get_alpha_vantage_connector

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/alpha-vantage", tags=["alpha-vantage"])

@router.get("/quote/{symbol}")
async def get_quote(symbol: str) -> Dict[str, Any]:
    """Get real-time quote for a symbol"""
    try:
        connector = get_alpha_vantage_connector()
        quote = await connector.get_quote(symbol.upper())
        
        if not quote:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
            
        return quote
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/intraday/{symbol}")
async def get_intraday(
    symbol: str,
    interval: str = Query(default="5min", description="Time interval: 1min, 5min, 15min, 30min, 60min")
) -> Dict[str, Any]:
    """Get intraday time series data"""
    try:
        valid_intervals = ["1min", "5min", "15min", "30min", "60min"]
        if interval not in valid_intervals:
            raise HTTPException(status_code=400, detail=f"Invalid interval. Must be one of: {valid_intervals}")
            
        connector = get_alpha_vantage_connector()
        data = await connector.get_intraday(symbol.upper(), interval)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No intraday data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting intraday data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/daily/{symbol}")
async def get_daily(
    symbol: str,
    outputsize: str = Query(default="compact", description="Output size: compact (100 days) or full (20+ years)")
) -> Dict[str, Any]:
    """Get daily time series data"""
    try:
        if outputsize not in ["compact", "full"]:
            raise HTTPException(status_code=400, detail="Output size must be 'compact' or 'full'")
            
        connector = get_alpha_vantage_connector()
        data = await connector.get_daily(symbol.upper(), outputsize)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No daily data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting daily data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/indicators/rsi/{symbol}")
async def get_rsi(
    symbol: str,
    interval: str = Query(default="daily", description="Time interval"),
    time_period: int = Query(default=14, description="Number of data points for calculation")
) -> Dict[str, Any]:
    """Get RSI (Relative Strength Index) data"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_rsi(symbol.upper(), interval, time_period)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No RSI data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting RSI for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/indicators/macd/{symbol}")
async def get_macd(
    symbol: str,
    interval: str = Query(default="daily", description="Time interval")
) -> Dict[str, Any]:
    """Get MACD (Moving Average Convergence Divergence) data"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_macd(symbol.upper(), interval)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No MACD data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting MACD for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/indicators/sma/{symbol}")
async def get_sma(
    symbol: str,
    interval: str = Query(default="daily", description="Time interval"),
    time_period: int = Query(default=20, description="Number of data points for calculation")
) -> Dict[str, Any]:
    """Get SMA (Simple Moving Average) data"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_sma(symbol.upper(), interval, time_period)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No SMA data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting SMA for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/indicators/ema/{symbol}")
async def get_ema(
    symbol: str,
    interval: str = Query(default="daily", description="Time interval"),
    time_period: int = Query(default=20, description="Number of data points for calculation")
) -> Dict[str, Any]:
    """Get EMA (Exponential Moving Average) data"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_ema(symbol.upper(), interval, time_period)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No EMA data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting EMA for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/indicators/bbands/{symbol}")
async def get_bbands(
    symbol: str,
    interval: str = Query(default="daily", description="Time interval"),
    time_period: int = Query(default=20, description="Number of data points for calculation")
) -> Dict[str, Any]:
    """Get Bollinger Bands data"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_bbands(symbol.upper(), interval, time_period)
        
        if not data or not data.get('data'):
            raise HTTPException(status_code=404, detail=f"No Bollinger Bands data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting Bollinger Bands for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/fundamentals/{symbol}")
async def get_company_overview(symbol: str) -> Dict[str, Any]:
    """Get company fundamental data and overview"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_company_overview(symbol.upper())
        
        if not data:
            raise HTTPException(status_code=404, detail=f"No fundamental data found for {symbol}")
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting company overview for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/search")
async def search_symbols(
    keywords: str = Query(..., description="Search keywords for symbol lookup")
) -> List[Dict[str, str]]:
    """Search for symbols by keywords"""
    try:
        connector = get_alpha_vantage_connector()
        results = await connector.search_symbols(keywords)
        
        if not results:
            return []
            
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error searching symbols with keywords '{keywords}': {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/news/{symbol}")
async def get_news_sentiment(
    symbol: Optional[str] = None,
    topics: Optional[str] = Query(None, description="Topics to filter news")
) -> Dict[str, Any]:
    """Get news and sentiment analysis"""
    try:
        connector = get_alpha_vantage_connector()
        data = await connector.get_news_sentiment(symbol.upper() if symbol else None, topics)
        
        if not data or not data.get('items'):
            return {'items': [], 'message': 'No news found'}
            
        return data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting news sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/comprehensive/{symbol}")
async def get_comprehensive_analysis(symbol: str) -> Dict[str, Any]:
    """Get comprehensive analysis including quote, indicators, and fundamentals"""
    try:
        connector = get_alpha_vantage_connector()
        
        # Fetch multiple data points (but respect rate limits)
        result = {
            'symbol': symbol.upper(),
            'timestamp': None,
            'quote': {},
            'indicators': {},
            'fundamentals': {}
        }
        
        # Get real-time quote
        try:
            result['quote'] = await connector.get_quote(symbol.upper())
        except Exception as e:
            logger.warning(f"Could not fetch quote: {e}")
            
        # Get key indicators (limit to avoid rate limits)
        try:
            result['indicators']['rsi'] = await connector.get_rsi(symbol.upper())
        except Exception as e:
            logger.warning(f"Could not fetch RSI: {e}")
            
        # Get fundamentals
        try:
            result['fundamentals'] = await connector.get_company_overview(symbol.upper())
        except Exception as e:
            logger.warning(f"Could not fetch fundamentals: {e}")
            
        if not any([result['quote'], result['indicators'], result['fundamentals']]):
            raise HTTPException(status_code=404, detail=f"No data available for {symbol}")
            
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting comprehensive analysis for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Check Alpha Vantage API connectivity"""
    try:
        connector = get_alpha_vantage_connector()
        
        if not connector.api_key:
            return {
                'status': 'error',
                'message': 'Alpha Vantage API key not configured'
            }
            
        # Try a simple quote request
        test_quote = await connector.get_quote('AAPL')
        
        if test_quote:
            return {
                'status': 'healthy',
                'message': 'Alpha Vantage API is accessible',
                'test_symbol': 'AAPL',
                'test_price': test_quote.get('price')
            }
        else:
            return {
                'status': 'warning',
                'message': 'Alpha Vantage API returned no data'
            }
            
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Alpha Vantage API error: {str(e)}'
        }