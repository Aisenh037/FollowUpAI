"""Lead classification logic based on deterministic rules."""
from datetime import datetime, timezone
from typing import Literal
from config import get_settings

settings = get_settings()

LeadStatus = Literal["active", "needs_followup", "stalled"]


class LeadClassifier:
    """Classifier for determining lead status based on last contact date."""
    
    @staticmethod
    def classify_lead(last_contacted_date: datetime | None) -> LeadStatus:
        """
        Classify lead based on days since last contact.
        
        Rules:
        - If replied in last 3 days → active
        - If no reply in 7-20 days → needs_followup
        - If no reply > 21 days → stalled
        
        Args:
            last_contacted_date: Last time lead was contacted
            
        Returns:
            Lead status classification
        """
        if last_contacted_date is None:
            # Never contacted, treat as stalled
            return "stalled"
        
        # Calculate days since last contact
        now = datetime.now(timezone.utc)
        if last_contacted_date.tzinfo is None:
            last_contacted_date = last_contacted_date.replace(tzinfo=timezone.utc)
        
        days_since_contact = (now - last_contacted_date).days
        
        # Apply classification rules
        if days_since_contact <= settings.ACTIVE_DAYS_THRESHOLD:
            return "active"
        elif (settings.NEEDS_FOLLOWUP_MIN_DAYS <= days_since_contact 
              <= settings.NEEDS_FOLLOWUP_MAX_DAYS):
            return "needs_followup"
        else:
            return "stalled"
    
    @staticmethod
    def get_days_since_contact(last_contacted_date: datetime | None) -> int:
        """Calculate days since last contact."""
        if last_contacted_date is None:
            return 999  # Large number for never contacted
        
        now = datetime.now(timezone.utc)
        if last_contacted_date.tzinfo is None:
            last_contacted_date = last_contacted_date.replace(tzinfo=timezone.utc)
        
        return (now - last_contacted_date).days


# Singleton instance
lead_classifier = LeadClassifier()
