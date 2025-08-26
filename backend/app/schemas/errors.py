# backend/app/schemas/errors.py
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standard error response schema with correlation tracking."""
    error: str = Field(..., description="Error type identifier")
    message: str = Field(..., description="Human-readable error message")
    correlation_id: str = Field(..., description="Request correlation ID for tracing")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), 
                          description="Error occurrence timestamp")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error context")
    path: str = Field(..., description="Request path where error occurred")
    method: str = Field(..., description="HTTP method")


class ValidationErrorResponse(ErrorResponse):
    """Enhanced error response for validation failures."""
    validation_errors: List[Dict[str, Any]] = Field(
        default_factory=list, 
        description="Detailed validation error information"
    )


class ExternalAPIErrorResponse(ErrorResponse):
    """Error response for external API failures."""
    provider: Optional[str] = Field(None, description="External API provider name")
    provider_error_code: Optional[str] = Field(None, description="Provider-specific error code")
    retry_after: Optional[int] = Field(None, description="Recommended retry delay in seconds")


class RateLimitErrorResponse(ErrorResponse):
    """Error response for rate limiting violations."""
    limit: int = Field(..., description="Rate limit threshold")
    window: int = Field(..., description="Rate limit window in seconds")
    retry_after: int = Field(..., description="Seconds until request can be retried")
    remaining_requests: int = Field(default=0, description="Remaining requests in current window")


# Error category constants for consistent error typing
class ErrorCategories:
    VALIDATION_ERROR = "validation_error"
    AUTHENTICATION_ERROR = "authentication_error"
    AUTHORIZATION_ERROR = "authorization_error"
    EXTERNAL_API_ERROR = "external_api_error"
    RATE_LIMIT_ERROR = "rate_limit_error"
    INTERNAL_ERROR = "internal_error"
    NOT_FOUND_ERROR = "not_found_error"
    TIMEOUT_ERROR = "timeout_error"
    DEPENDENCY_ERROR = "dependency_error"
