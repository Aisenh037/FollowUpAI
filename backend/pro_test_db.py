from services.database import engine, SessionLocal, Base
from models.lead import Lead
from models.user import User
from sqlalchemy import text

def test_db_connection():
    print("🔍 Testing Database Connection...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database Connection: SUCCESS")
    except Exception as e:
        print(f"❌ Database Connection: FAILED - {str(e)}")
        return

def test_models():
    print("\n🔍 Testing Model Mapping...")
    try:
        db = SessionLocal()
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)
        
        # Test query
        user_count = db.query(User).count()
        lead_count = db.query(Lead).count()
        
        print(f"📊 Current Stats: {user_count} Users, {lead_count} Leads")
        print("✅ Model Mapping: SUCCESS")
        db.close()
    except Exception as e:
        print(f"❌ Model Mapping: FAILED - {str(e)}")

if __name__ == "__main__":
    test_db_connection()
    test_models()
