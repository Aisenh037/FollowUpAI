"""Authentication schemas."""
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    email: str | None = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    email: str
    full_name: str | None = None
    
    class Config:
        from_attributes = True
