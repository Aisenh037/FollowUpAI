from agents.email_generator import EmailGenerator
from services.database import SessionLocal
from models.lead import Lead

def test_sdr_persona():
    gen = EmailGenerator()
    
    # Fake lead context
    test_lead = {
        "name": "Jane Doe",
        "company": "TechCorp",
        "last_message": "We are looking for AI solutions for our sales team.",
        "status": "needs_followup"
    }
    
    print("🤖 AI is thinking (SDR Persona)...")
    email = gen.generate_followup(
        lead_name=test_lead["name"],
        company=test_lead["company"],
        context=test_lead["last_message"],
        lead_status=test_lead["status"],
        force_context="saas_offer" # We test our custom SaaS offer logic
    )
    
    print("\n📩 AI Generated Email Content:")
    print("-" * 30)
    print(email)
    print("-" * 30)
    
    assert len(email) > 10, "Email generation failed!"
    print("\n✅ SDR Persona Test: SUCCESS")

if __name__ == "__main__":
    test_sdr_persona()
