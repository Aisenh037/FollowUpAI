"""Unified communication service for Email and WhatsApp (Meta/Twilio)."""
import resend
import requests
from twilio.rest import Client
from config import get_settings
from loguru import logger
from typing import Optional

settings = get_settings()

class CommunicationService:
    """Handles multi-channel communication (Email, Meta WhatsApp, Twilio WhatsApp)."""

    def __init__(self):
        # Initialize Resend
        if settings.RESEND_API_KEY:
            resend.api_key = settings.RESEND_API_KEY
            logger.info("Resend Email client initialized")

        # Meta WhatsApp API Config
        self.wa_token = settings.WHATSAPP_ACCESS_TOKEN
        self.wa_phone_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.wa_url = f"https://graph.facebook.com/v18.0/{self.wa_phone_id}/messages" if self.wa_phone_id else None

        # Twilio Client Initialization
        self.twilio_client = None
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                logger.info("Twilio WhatsApp client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio: {e}")

    def send_email(self, to_email: str, subject: str, html_content: str) -> dict:
        """Sends an email via Resend."""
        if not settings.RESEND_API_KEY:
            logger.warning("Resend API Key not found. Skipping email.")
            return {"success": False, "error": "API Key missing"}

        try:
            # Sandbox handling logic
            verified_to = to_email
            is_sandbox = "onboarding@resend.dev" in settings.RESEND_FROM_EMAIL
            
            if is_sandbox and to_email != "aisenh037@gmail.com":
                logger.warning(f"SANDBOX MODE: Rerouting email from {to_email} to aisenh037@gmail.com")
                verified_to = "aisenh037@gmail.com"

            response = resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL,
                "to": verified_to,
                "subject": f"[DEMO to {to_email}] {subject}" if is_sandbox else subject,
                "html": html_content
            })

            logger.info(f"Email sent to {to_email}. ID: {response.get('id')}")
            return {"success": True, "id": response.get("id")}
        except Exception as e:
            logger.error(f"Email failed: {e}")
            return {"success": False, "error": str(e)}

    def send_whatsapp(self, to_phone: str, message: str) -> dict:
        """
        Sends a WhatsApp message. 
        Tries Meta Cloud API first if credentials exist, otherwise falls back to Twilio.
        """
        # If we have Meta credentials AND they are prioritized (or Twilio is missing), use Meta
        # For MVP/Development where we have Twilio credentials, we can prioritize Twilio if needed.
        # Here we prioritize Twilio if configured, as it's easier for Sandbox testing requested by user.
        
        if self.twilio_client:
            return self._send_whatsapp_twilio(to_phone, message)
        
        if self.wa_token and self.wa_phone_id:
            return self._send_whatsapp_meta(to_phone, message)

        logger.warning(f"No WhatsApp provider configured. Content: '{message}' to {to_phone}")
        return {"success": False, "error": "WhatsApp API credentials missing"}

    def _send_whatsapp_meta(self, to_phone: str, message: str) -> dict:
        """Meta WhatsApp Cloud API Implementation."""
        try:
            clean_phone = ''.join(filter(str.isdigit, to_phone))
            headers = {
                "Authorization": f"Bearer {self.wa_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": clean_phone,
                "type": "text",
                "text": {"body": message}
            }
            response = requests.post(self.wa_url, headers=headers, json=payload)
            response_data = response.json()
            if response.status_code == 200:
                logger.info(f"Meta WhatsApp sent. ID: {response_data.get('messages', [{}])[0].get('id')}")
                return {"success": True, "id": response_data.get('messages', [{}])[0].get('id')}
            return {"success": False, "error": response_data.get('error', {}).get('message', 'Meta Error')}
        except Exception as e:
            logger.error(f"Meta Exception: {e}")
            return {"success": False, "error": str(e)}

    def _send_whatsapp_twilio(self, to_phone: str, message: str) -> dict:
        """Twilio WhatsApp Sandbox Implementation."""
        try:
            formatted_phone = to_phone if to_phone.startswith('+') else f"+{to_phone}"
            whatsapp_to = f"whatsapp:{formatted_phone}"

            response = self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=whatsapp_to
            )
            logger.info(f"Twilio WhatsApp sent. SID: {response.sid}")
            return {"success": True, "id": response.sid}
        except Exception as e:
            logger.error(f"Twilio Exception: {e}")
            return {"success": False, "error": str(e)}

# Singleton instance
comm_service = CommunicationService()
