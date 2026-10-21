import secrets
import string
from datetime import datetime, timedelta
from typing import Dict

try:
    from twilio.rest import Client
except ImportError:
    Client = None

from config import get_settings
from services.email_service import email_service

settings = get_settings()
otp_storage: Dict[str, Dict] = {}


class OTPService:
    def __init__(self):
        self.twilio_client = None

        if Client and settings.twilio_account_sid and settings.twilio_auth_token:
            try:
                self.twilio_client = Client(
                    settings.twilio_account_sid,
                    settings.twilio_auth_token
                )
            except Exception:
                self.twilio_client = None

        self.twilio_number = settings.twilio_phone_number

    def generate_otp(self, length=6):
        return "".join(secrets.choice(string.digits) for _ in range(length))

    def store_otp(self, identifier, otp, expires_in_minutes=10):
        otp_storage[identifier] = {
            "otp": otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=expires_in_minutes),
            "attempts": 0
        }

    def verify_otp(self, identifier, otp, max_attempts=3):
        stored = otp_storage.get(identifier)

        if not stored:
            return False

        if datetime.utcnow() >= stored["expires_at"]:
            otp_storage.pop(identifier, None)
            return False

        if stored["attempts"] >= max_attempts:
            otp_storage.pop(identifier, None)
            return False

        if secrets.compare_digest(stored["otp"], str(otp)):
            otp_storage.pop(identifier, None)
            return True

        stored["attempts"] += 1

        if stored["attempts"] >= max_attempts:
            otp_storage.pop(identifier, None)

        return False

    def send_email_otp(self, email, name="Farmer"):
        otp = self.generate_otp()

        result = email_service.send_otp_email(email, otp, name)

        if result.get("status") != "sent":
            return {
                "status": "error",
                "method": "email",
                "message": "OTP email could not be delivered."
            }

        self.store_otp(f"email:{email.strip().lower()}", otp)

        return {
            "status": "sent",
            "method": "email",
            "message": "OTP email accepted by the configured provider."
        }

    def send_sms_otp(self, phone):
        if settings.mock_otp_enabled:
            otp = self.generate_otp()
            self.store_otp(f"phone:{phone}", otp)
            print("[OTP] Development mock OTP generated.")
            return {
                "status": "sent",
                "method": "sms",
                "message": "Development mock OTP generated.",
                "otp": otp
            }
        if not self.twilio_client or not self.twilio_number:
            return {
                "status": "error",
                "method": "sms",
                "message": "SMS OTP is not configured. Use email OTP instead."
            }

        otp = self.generate_otp()

        try:
            message = self.twilio_client.messages.create(
                body=f"Your Smart Crop Advisory OTP is {otp}. Valid for 10 minutes.",
                from_=self.twilio_number,
                to=phone
            )

            self.store_otp(f"phone:{phone}", otp)

            return {
                "status": "sent",
                "method": "sms",
                "message_sid": message.sid
            }

        except Exception as exc:
            print(f"[OTP] SMS delivery failed: {type(exc).__name__}: {exc}")
            return {
                "status": "error",
                "method": "sms",
                "message": "SMS delivery failed."
            }

    def verify_email_otp(self, email, otp):
        return self.verify_otp(f"email:{email.strip().lower()}", otp)

    def verify_phone_otp(self, phone, otp):
        return self.verify_otp(f"phone:{phone}", otp)


otp_service = OTPService()

