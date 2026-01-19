"""Configuration management for FollowUpAI backend."""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment Mode
    ENV: str = "development" # development | production
    DEBUG: bool = True
    
    # Database (Industry standard: PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./followupai.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Groq API
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Resend API (Transactional Email)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "FollowUpAI <onboarding@resend.dev>"
    
    # Meta WhatsApp Cloud API (Primary Industry Standard)
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_VERIFY_TOKEN: Optional[str] = "followup_ai_verify_token"
    
    # Twilio (Fallback/MVP Sandbox for Ease of Use)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886" # Twilio Sandbox number
    
    # Search API
    TAVILY_API_KEY: str = ""
    
    # Redis for Taskiq
    REDIS_URL: str = "redis://localhost:6379"
    
    # Sentry (Observability)
    SENTRY_DSN: Optional[str] = None
    
    # Agent Thresholds
    ACTIVE_DAYS_THRESHOLD: int = 3
    NEEDS_FOLLOWUP_MIN_DAYS: int = 7
    NEEDS_FOLLOWUP_MAX_DAYS: int = 20
    STALLED_DAYS_THRESHOLD: int = 21
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
