from services.auth_service import get_password_hash, verify_password, create_access_token
from config import get_settings
from datetime import timedelta

def test_security_flow():
    settings = get_settings()
    password = "pro_learner_2026"
    
    print("🔐 Testing Password Hashing...")
    hashed = get_password_hash(password)
    assert hashed != password, "Hasing failed: Plain text stored!"
    assert verify_password(password, hashed), "Verification failed: Correct password rejected!"
    print("✅ Password Hashing & Verification: SUCCESS")
    
    print("\n🎫 Testing JWT Token Generation...")
    data = {"sub": "test@example.com"}
    token = create_access_token(data, expires_delta=timedelta(minutes=15))
    
    assert len(token) > 20, "Token generation failed: Token too short!"
    print(f"✅ JWT Token Created: SUCCESS\n   Token: {token[:20]}...")

if __name__ == "__main__":
    test_security_flow()
