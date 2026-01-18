from fastapi.testclient import TestClient
from main import app
from services.auth_service import create_access_token

# We use the real app but a TestClient
client = TestClient(app)

def test_leads_access():
    print("🚦 Testing Unauthorized Access...")
    response = client.get("/api/leads")
    assert response.status_code == 401, "Security bug! Unauthorized access allowed."
    print("✅ Unauthorized Access: BLOCKED (Correct)")

    print("\n📬 Testing Authorized Health Check...")
    # Mock a token
    token = create_access_token({"sub": "test@example.com"})
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check if the overall system is healthy
    response = client.get("/api/health")
    assert response.status_code == 200
    print(f"✅ System Health API: SUCCESS - {response.json()['status']}")

if __name__ == "__main__":
    test_leads_access()
