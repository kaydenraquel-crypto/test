"""
Symbol schemas for the symbols API endpoint.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from enum import Enum


class SymbolType(str, Enum):
    """Enum for symbol types"""
    stock = "stock"
    crypto = "crypto"
    etf = "etf"
    forex = "forex"


class SymbolResponse(BaseModel):
    """Response schema for individual symbol data"""
    symbol: str = Field(..., description="Symbol ticker")
    name: str = Field(..., description="Full name of the security")
    type: SymbolType = Field(..., description="Type of security")
    exchange: str = Field(..., description="Exchange where the symbol is traded")
    
    model_config = ConfigDict(use_enum_values=True)


class SymbolsQueryParams(BaseModel):
    """Query parameters for symbol search"""
    q: str = Field(..., min_length=1, description="Search query for symbols")
    limit: Optional[int] = Field(20, ge=1, le=100, description="Maximum number of results to return")
    type_filter: Optional[SymbolType] = Field(None, description="Filter by symbol type")
    
    model_config = ConfigDict(use_enum_values=True)


class SymbolsListResponse(BaseModel):
    """Response schema for symbols list endpoint"""
    symbols: List[SymbolResponse] = Field(..., description="List of matching symbols")
    query: str = Field(..., description="Original search query")
    total: int = Field(..., description="Total number of results")
    limit: int = Field(..., description="Applied result limit")


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")