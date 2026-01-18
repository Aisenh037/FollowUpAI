"""Initialize database and create demo data for investor presentation."""
import asyncio
from datetime import datetime, timedelta
from services.database import engine, Base, SessionLocal
from models.user import User
from models.lead import Lead
from services.auth_service import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    """Create all database tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created!")


def create_demo_data():
    """Create demo user and leads for investor presentation."""
    db = SessionLocal()
    try:
        # Check if demo user exists
        existing_user = db.query(User).filter(User.email == "demo@followupai.com").first()
        if existing_user:
            logger.info("Demo data already exists!")
            return
        
        # Create demo user
        logger.info("Creating demo user...")
        demo_user = User(
            email="demo@followupai.com",
            full_name="Demo User",
            hashed_password=get_password_hash("demo123")
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        logger.info(f"✅ Demo user created: demo@followupai.com / demo123")
        
        # Create demo leads
        logger.info("Creating demo leads...")
        demo_leads = [
            Lead(
                name="Sarah Johnson",
                email="sarah@techstartup.io",
                company="TechStart Inc",
                last_message="Thanks for the demo, I'll discuss with my team and get back to you soon.",
                last_contacted_date=datetime.now() - timedelta(days=15),
                status="new",
                user_id=demo_user.id
            ),
            Lead(
                name="Mike Chen",
                email="mike@innovatecorp.com",
                company="InnovateCorp",
                last_message="Interesting product. Let me check our budget for Q2.",
                last_contacted_date=datetime.now() - timedelta(days=30),
                status="new",
                user_id=demo_user.id
            ),
            Lead(
                name="Emma Wilson",
                email="emma@growthventures.com",
                company="Growth Ventures",
                last_message="Just signed the contract! Excited to get started next week.",
                last_contacted_date=datetime.now() - timedelta(days=2),
                status="new",
                user_id=demo_user.id
            ),
            Lead(
                name="David Park",
                email="david@scalableai.com",
                company="Scalable AI",
                last_message="We're comparing a few options. Will decide by end of month.",
                last_contacted_date=datetime.now() - timedelta(days=12),
                status="new",
                user_id=demo_user.id
            ),
            Lead(
                name="Lisa Garcia",
                email="lisa@enterprisesolutions.com",
                company="Enterprise Solutions Ltd",
                last_message="Thanks for reaching out. Not the right time for us unfortunately.",
                last_contacted_date=datetime.now() - timedelta(days=45),
                status="new",
                user_id=demo_user.id
            ),
        ]
        
        for lead in demo_leads:
            db.add(lead)
        
        db.commit()
        logger.info(f"✅ Created {len(demo_leads)} demo leads!")
        
        print("\n" + "="*60)
        print("🚀 DEMO ACCOUNT READY!")
        print("="*60)
        print(f"Email:    demo@followupai.com")
        print(f"Password: demo123")
        print(f"Leads:    {len(demo_leads)} sample leads")
        print("="*60)
        print("\n🎯 Next Steps:")
        print("1. Visit http://localhost:3000")
        print("2. Login with demo credentials")
        print("3. Go to 'Agent' page and click 'Run Agent Now'")
        print("4. Show investors the AI in action!")
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"❌ Error creating demo data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    create_demo_data()
