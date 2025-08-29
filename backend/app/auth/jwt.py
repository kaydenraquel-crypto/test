# JWT Authentication Utilities for NovaSignal Backend
import os
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
import logging

logger = logging.getLogger(__name__)

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "30"))
REFRESH_TOKEN_EXPIRATION_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRATION_DAYS", "7"))

# Store for blacklisted tokens (in production, use Redis)
BLACKLISTED_TOKENS = set()

class JWTManager:
    """JWT Token management class"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plain password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def generate_api_key() -> tuple:
        """Generate API key and its prefix"""
        # Generate a secure random API key
        api_key = f"nv_{secrets.token_urlsafe(32)}"
        api_key_prefix = api_key[:12] + "..."  # First 12 chars for display
        
        return api_key, api_key_prefix

class PasswordManager:
    """Password security and validation"""
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple:
        """Validate password meets security requirements"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return len(errors) == 0, errors

# Initialize the instances
jwt_manager = JWTManager()
password_manager = PasswordManager()
