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
            # PRO-TIP: Resend Sandbox Handling
            # If using the test domain, you can only send to yourself.
            # We'll automatically "reroute" for the demo to avoid 500 errors.
            verified_to = to_email
            is_sandbox = "onboarding@resend.dev" in settings.RESEND_FROM_EMAIL
            
            if is_sandbox and to_email != "aisenh037@gmail.com":
                # For demo purposes, we'll log where it was SUPPOSED to go
                # and send it to the verified email instead.
                from loguru import logger
                logger.warning(f"SANDBOX MODE: Rerouting email from {to_email} to aisenh037@gmail.com")
                verified_to = "aisenh037@gmail.com"

            response = resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL,
                "to": verified_to,
                "subject": f"[DEMO to {to_email}] {subject}" if is_sandbox else subject,
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
