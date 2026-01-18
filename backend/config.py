"""Configuration management for FollowUpAI backend."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database (SQLite for quick demo - no Docker needed!)
    DATABASE_URL: str = "sqlite:///./followupai.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Groq API
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Resend API
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "FollowUpAI <onboarding@resend.dev>"
    
    # Search API
    TAVILY_API_KEY: str = ""  # To be provided by user
    
    # Agent Settings
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
        "http://127.0.0.1:3002"
    ]
    
    # Redis for Taskiq
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
