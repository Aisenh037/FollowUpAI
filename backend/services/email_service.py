"""Email service using Resend API."""
import resend
from config import get_settings
from typing import Optional

settings = get_settings()

# Configure Resend
resend.api_key = settings.RESEND_API_KEY


class EmailService:
    """Email service for sending follow-up emails."""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        from_name: str = "FollowUpAI"
    ) -> dict:
        """
        Send an email using Resend API.
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            html_content: HTML email body
            from_name: Sender name
            
        Returns:
            dict with 'success' boolean and 'message' or 'error'
        """
        try:
            # For Resend free tier, use the test domain
            # Replace with your verified domain in production
            from_email = f"{from_name} <onboarding@resend.dev>"
            
            response = resend.Emails.send({
                "from": from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content
            })
            
            return {
                "success": True,
                "message": "Email sent successfully",
                "email_id": response.get("id")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
email_service = EmailService()
