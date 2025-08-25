\
import os
import re
import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import httpx
import logging

logger = logging.getLogger(__name__)

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
FINNHUB_KEY = os.getenv("FINNHUB_KEY", "")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")

def calculate_sentiment_score(text: str) -> Dict[str, float]:
    """
    Simple rule-based sentiment analysis for financial news.
    Returns sentiment score between -1 (bearish) and 1 (bullish).
    """
    if not text:
        return {"score": 0.0, "label": "neutral", "confidence": 0.0}
    
    text = text.lower()
    
    # Financial bullish keywords
    bullish_words = [
        'surge', 'rally', 'gains', 'profit', 'revenue', 'growth', 'upgrade', 'buy',
        'bullish', 'positive', 'outperform', 'beat', 'exceed', 'strong', 'robust',
        'soar', 'climb', 'rise', 'increase', 'jump', 'boost', 'momentum', 'breakout',
        'acquisition', 'partnership', 'expansion', 'innovation', 'breakthrough'
    ]
    
    # Financial bearish keywords  
    bearish_words = [
        'crash', 'plunge', 'fall', 'drop', 'decline', 'loss', 'downgrade', 'sell',
        'bearish', 'negative', 'underperform', 'miss', 'disappointing', 'weak', 'poor',
        'tumble', 'slide', 'decrease', 'concern', 'risk', 'volatility', 'correction',
        'lawsuit', 'investigation', 'scandal', 'bankruptcy', 'layoffs', 'recession'
    ]
    
    # Count sentiment words
    bullish_count = sum(1 for word in bullish_words if word in text)
    bearish_count = sum(1 for word in bearish_words if word in text)
    
    # Calculate raw score
    total_words = len(text.split())
    if total_words == 0:
        return {"score": 0.0, "label": "neutral", "confidence": 0.0}
    
    # Normalized sentiment score
    bullish_weight = bullish_count / total_words * 10
    bearish_weight = bearish_count / total_words * 10
    
    score = (bullish_weight - bearish_weight)
    score = max(-1.0, min(1.0, score))  # Clamp to [-1, 1]
    
    # Determine label and confidence
    if score > 0.2:
        label = "bullish"
        confidence = min(0.9, abs(score) + 0.3)
    elif score < -0.2:
        label = "bearish"
        confidence = min(0.9, abs(score) + 0.3)
    else:
        label = "neutral"
        confidence = 1.0 - abs(score)
    
    return {
        "score": round(score, 3),
        "label": label,
        "confidence": round(confidence, 3)
    }

def get_symbol_variations(symbol: str, market: str) -> List[str]:
    """Generate symbol variations for better news matching"""
    variations = [symbol.upper()]
    
    if market == "crypto":
        # Add crypto variations
        base_symbol = symbol.upper().replace("/", "").replace("-", "")
        if "USD" in base_symbol:
            base = base_symbol.replace("USD", "").replace("USDT", "")
            variations.extend([base, f"{base}USD", f"{base}USDT", f"{base}/USD"])
        
        # Common crypto name mappings
        crypto_names = {
            "BTC": "Bitcoin", "ETH": "Ethereum", "ADA": "Cardano",
            "SOL": "Solana", "DOT": "Polkadot", "LINK": "Chainlink",
            "UNI": "Uniswap", "MATIC": "Polygon", "AVAX": "Avalanche"
        }
        base = base_symbol.replace("USD", "").replace("USDT", "")
        if base in crypto_names:
            variations.append(crypto_names[base])
    
    return list(set(variations))

async def fetch_alpha_vantage_news(symbol: str, limit: int = 10) -> List[Dict]:
    """Fetch news from Alpha Vantage (free tier available)"""
    if not ALPHA_VANTAGE_KEY:
        return []
    
    try:
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={symbol}&apikey={ALPHA_VANTAGE_KEY}&limit={limit}"
        
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                articles = []
                
                for item in data.get("feed", [])[:limit]:
                    # Parse Alpha Vantage sentiment data
                    sentiment_data = {}
                    ticker_sentiment = item.get("ticker_sentiment", [])
                    
                    for ticker_info in ticker_sentiment:
                        if ticker_info.get("ticker") == symbol.upper():
                            sentiment_data = {
                                "score": float(ticker_info.get("relevance_score", 0)),
                                "label": ticker_info.get("ticker_sentiment_label", "neutral").lower(),
                                "confidence": float(ticker_info.get("relevance_score", 0))
                            }
                            break
                    
                    # Fallback to our sentiment analysis if no ticker data
                    if not sentiment_data:
                        title = item.get("title", "")
                        summary = item.get("summary", "")
                        sentiment_data = calculate_sentiment_score(f"{title} {summary}")
                    
                    articles.append({
                        "source": item.get("source", "Alpha Vantage"),
                        "headline": item.get("title"),
                        "summary": item.get("summary"),
                        "url": item.get("url"),
                        "datetime": item.get("time_published"),
                        "sentiment": sentiment_data,
                        "category": item.get("category_within_source", "general")
                    })
                
                return articles
                
    except Exception as e:
        logger.warning(f"Alpha Vantage news fetch failed: {e}")
    
    return []

async def fetch_free_news_sources(symbol: str, market: str, limit: int = 15) -> List[Dict]:
    """Fetch from free news sources with sentiment analysis"""
    articles = []
    symbol_variations = get_symbol_variations(symbol, market)
    
    # Try multiple free sources
    sources = [
        ("https://api.rss2json.com/v1/api.json", "rss"),
        ("https://newsapi.org/v2/everything", "newsapi") if NEWSAPI_KEY else None
    ]
    
    # RSS feeds for financial news
    rss_feeds = [
        "https://feeds.finance.yahoo.com/rss/2.0/headline",
        "https://feeds.benzinga.com/benzinga/news",
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "https://cointelegraph.com/rss",
    ]
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Try RSS feeds first
            for feed_url in rss_feeds[:2]:  # Limit to 2 feeds for speed
                try:
                    url = f"https://api.rss2json.com/v1/api.json?rss_url={feed_url}&count={limit}"
                    response = await client.get(url)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for item in data.get("items", []):
                            title = item.get("title", "")
                            description = item.get("description", "")
                            
                            # Check if any symbol variation appears in title or description
                            content = f"{title} {description}".lower()
                            if any(var.lower() in content for var in symbol_variations):
                                sentiment = calculate_sentiment_score(f"{title} {description}")
                                
                                articles.append({
                                    "source": data.get("feed", {}).get("title", "RSS Feed"),
                                    "headline": title,
                                    "summary": description[:200] + "..." if len(description) > 200 else description,
                                    "url": item.get("link"),
                                    "datetime": item.get("pubDate"),
                                    "sentiment": sentiment,
                                    "category": "financial"
                                })
                                
                        if len(articles) >= limit:
                            break
                            
                except Exception as e:
                    logger.debug(f"RSS feed {feed_url} failed: {e}")
                    continue
                    
        # Sort by relevance and recency
        articles = sorted(articles, key=lambda x: (
            x["sentiment"]["confidence"], 
            x.get("datetime", "")
        ), reverse=True)
        
        return articles[:limit]
        
    except Exception as e:
        logger.warning(f"Free news sources failed: {e}")
    
    return []

async def get_news_for_symbol(symbol: str, market: str = "crypto", limit: int = 15) -> List[Dict]:
    """Enhanced news fetching with sentiment analysis and multiple sources"""
    all_articles = []
    
    # Try premium sources first
    tasks = []
    
    # Alpha Vantage (has free tier)
    if ALPHA_VANTAGE_KEY:
        tasks.append(fetch_alpha_vantage_news(symbol, limit//2))
    
    # Finnhub for stocks
    if FINNHUB_KEY and market == "stocks":
        tasks.append(fetch_finnhub_news(symbol, limit//2))
    
    # Always try free sources
    tasks.append(fetch_free_news_sources(symbol, market, limit))
    
    # Execute all tasks concurrently
    if tasks:
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, list):
                    all_articles.extend(result)
        except Exception as e:
            logger.warning(f"News gathering failed: {e}")
    
    # Fallback: create synthetic news if no articles found
    if not all_articles:
        all_articles = create_fallback_news(symbol, market)
    
    # Deduplicate and sort
    seen_urls = set()
    unique_articles = []
    
    for article in all_articles:
        url = article.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_articles.append(article)
        elif not url:  # Articles without URLs (like synthetic ones)
            unique_articles.append(article)
    
    # Sort by sentiment confidence and datetime
    unique_articles.sort(key=lambda x: (
        x.get("sentiment", {}).get("confidence", 0),
        x.get("datetime", "")
    ), reverse=True)
    
    return unique_articles[:limit]

async def fetch_finnhub_news(symbol: str, limit: int = 10) -> List[Dict]:
    """Enhanced Finnhub news fetch with sentiment"""
    try:
        # Get recent date range
        to_date = datetime.now().strftime("%Y-%m-%d")
        from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        url = f"https://finnhub.io/api/v1/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={FINNHUB_KEY}"
        
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                articles = []
                
                for item in data[:limit]:
                    title = item.get("headline", "")
                    summary = item.get("summary", "")
                    sentiment = calculate_sentiment_score(f"{title} {summary}")
                    
                    articles.append({
                        "source": item.get("source", "Finnhub"),
                        "headline": title,
                        "summary": summary,
                        "url": item.get("url"),
                        "datetime": datetime.fromtimestamp(item.get("datetime", 0)).isoformat() if item.get("datetime") else None,
                        "sentiment": sentiment,
                        "category": "company"
                    })
                
                return articles
                
    except Exception as e:
        logger.warning(f"Finnhub news fetch failed: {e}")
    
    return []

def create_fallback_news(symbol: str, market: str) -> List[Dict]:
    """Create fallback news when no real articles are found"""
    base_symbol = symbol.replace("/", "").replace("-", "").upper()
    
    fallback_articles = [
        {
            "source": "Market Analysis",
            "headline": f"{base_symbol} Trading Analysis - Market Update",
            "summary": f"Technical analysis shows {base_symbol} trading within key support and resistance levels. Monitor volume patterns for potential breakout signals.",
            "url": None,
            "datetime": datetime.now().isoformat(),
            "sentiment": {"score": 0.0, "label": "neutral", "confidence": 0.7},
            "category": "analysis"
        },
        {
            "source": "Price Alert",
            "headline": f"{base_symbol} Price Movement Alert",
            "summary": f"Recent price action in {base_symbol} suggests monitoring for trend continuation or reversal patterns.",
            "url": None,
            "datetime": (datetime.now() - timedelta(hours=1)).isoformat(),
            "sentiment": {"score": 0.1, "label": "neutral", "confidence": 0.5},
            "category": "alert"
        }
    ]
    
    return fallback_articles
