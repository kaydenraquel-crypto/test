"""
Symbols API endpoint with search functionality, validation, and rate limiting.
"""

import time
import logging
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from schemas.symbol import SymbolResponse, SymbolsListResponse, SymbolType, ErrorResponse

logger = logging.getLogger(__name__)

# In-memory rate limiter (in production, use Redis or similar)
rate_limiter_store: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_REQUESTS = 10  # requests per minute
RATE_LIMIT_WINDOW = 60    # seconds


def check_rate_limit(client_ip: str) -> bool:
    """
    Check if client IP has exceeded rate limit.
    Returns True if within limit, False if exceeded.
    """
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Clean old requests
    rate_limiter_store[client_ip] = [
        req_time for req_time in rate_limiter_store[client_ip] 
        if req_time > window_start
    ]
    
    # Check current count
    if len(rate_limiter_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limiter_store[client_ip].append(current_time)
    return True


async def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check for forwarded IP first (for proxies/load balancers)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct connection IP
    return request.client.host if request.client else "unknown"


async def rate_limit_dependency(request: Request) -> None:
    """Dependency to enforce rate limiting"""
    # Skip rate limiting in test environment
    if os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST"):
        return
        
    client_ip = await get_client_ip(request)
    
    if not check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "detail": f"Maximum {RATE_LIMIT_REQUESTS} requests per minute allowed"
            }
        )


# Mock symbol database - in production this would be a real database or API
MOCK_SYMBOLS = [
    # Stocks
    {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "GOOGL", "name": "Alphabet Inc. Class A", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "META", "name": "Meta Platforms, Inc.", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "NFLX", "name": "Netflix, Inc.", "type": "stock", "exchange": "NASDAQ"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "type": "stock", "exchange": "NYSE"},
    {"symbol": "BAC", "name": "Bank of America Corporation", "type": "stock", "exchange": "NYSE"},
    
    # Crypto
    {"symbol": "BTC/USD", "name": "Bitcoin", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "ETH/USD", "name": "Ethereum", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "BNB/USD", "name": "Binance Coin", "type": "crypto", "exchange": "Binance"},
    {"symbol": "XRP/USD", "name": "Ripple", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "ADA/USD", "name": "Cardano", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "SOL/USD", "name": "Solana", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "DOGE/USD", "name": "Dogecoin", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "AVAX/USD", "name": "Avalanche", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "MATIC/USD", "name": "Polygon", "type": "crypto", "exchange": "Multiple"},
    {"symbol": "DOT/USD", "name": "Polkadot", "type": "crypto", "exchange": "Multiple"},
    
    # ETFs
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", "type": "etf", "exchange": "NYSE"},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "type": "etf", "exchange": "NASDAQ"},
    {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "type": "etf", "exchange": "NYSE"},
    {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "type": "etf", "exchange": "NYSE"},
    {"symbol": "IWM", "name": "iShares Russell 2000 ETF", "type": "etf", "exchange": "NYSE"},
    
    # Forex (major pairs)
    {"symbol": "EUR/USD", "name": "Euro/US Dollar", "type": "forex", "exchange": "Forex"},
    {"symbol": "GBP/USD", "name": "British Pound/US Dollar", "type": "forex", "exchange": "Forex"},
    {"symbol": "USD/JPY", "name": "US Dollar/Japanese Yen", "type": "forex", "exchange": "Forex"},
    {"symbol": "AUD/USD", "name": "Australian Dollar/US Dollar", "type": "forex", "exchange": "Forex"},
    {"symbol": "USD/CAD", "name": "US Dollar/Canadian Dollar", "type": "forex", "exchange": "Forex"},
]


async def search_symbols(query: str, limit: int = 20, type_filter: Optional[SymbolType] = None) -> List[Dict[str, Any]]:
    """
    Search for symbols matching the query.
    In production, this would query a real database or external API.
    """
    query_lower = query.lower()
    results = []
    
    for symbol_data in MOCK_SYMBOLS:
        # Skip if type filter doesn't match
        if type_filter and symbol_data["type"] != type_filter:
            continue
            
        # Check if query matches symbol or name
        if (query_lower in symbol_data["symbol"].lower() or 
            query_lower in symbol_data["name"].lower()):
            results.append(symbol_data)
            
        # Stop if we have enough results
        if len(results) >= limit:
            break
    
    return results


router = APIRouter(prefix="/api", tags=["symbols"])


@router.get(
    "/symbols",
    response_model=SymbolsListResponse,
    responses={
        200: {"description": "Successful response with symbol list"},
        400: {"description": "Bad request", "model": ErrorResponse},
        422: {"description": "Validation error", "model": ErrorResponse},
        429: {"description": "Rate limit exceeded", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
    summary="Search for trading symbols",
    description="""
    Search for trading symbols across stocks, crypto, ETFs, and forex.
    
    **Features:**
    - Full text search on symbol ticker and name
    - Type filtering (stock, crypto, etf, forex)  
    - Rate limiting: 10 requests per minute per IP
    - Query validation (minimum 1 character)
    
    **Examples:**
    - `/api/symbols?q=AAPL` - Search for Apple stock
    - `/api/symbols?q=bitcoin&type_filter=crypto` - Search crypto only
    - `/api/symbols?q=SPY&limit=5` - Limit results to 5
    """,
)
async def get_symbols(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query for symbols"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    type_filter: Optional[SymbolType] = Query(None, description="Filter by symbol type"),
    _rate_limit: None = Depends(rate_limit_dependency)
) -> SymbolsListResponse:
    """
    Search for trading symbols with comprehensive filtering and validation.
    """
    try:
        # Log the request for monitoring
        client_ip = await get_client_ip(request)
        logger.info(f"Symbols search: q='{q}', limit={limit}, type_filter={type_filter}, ip={client_ip}")
        
        # Simulate async operation (in production, this would be a database query)
        await asyncio.sleep(0.01)
        
        # Search for symbols
        raw_results = await search_symbols(q, limit, type_filter)
        
        # Convert to response models
        symbols = [
            SymbolResponse(
                symbol=item["symbol"],
                name=item["name"],
                type=item["type"],
                exchange=item["exchange"]
            )
            for item in raw_results
        ]
        
        response = SymbolsListResponse(
            symbols=symbols,
            query=q,
            total=len(symbols),
            limit=limit
        )
        
        logger.info(f"Symbols search completed: {len(symbols)} results for query '{q}'")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions (like rate limiting)
        raise
    except Exception as e:
        logger.error(f"Symbols search error for query '{q}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "detail": "An unexpected error occurred while searching symbols"
            }
        )


@router.get("/symbols/health", include_in_schema=False)
async def symbols_health():
    """Health check endpoint for symbols service"""
    return {
        "status": "healthy",
        "service": "symbols",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_symbols": len(MOCK_SYMBOLS),
        "rate_limit": f"{RATE_LIMIT_REQUESTS} req/min"
    }