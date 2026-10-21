import html
import smtplib
import ssl
from email.message import EmailMessage

from config import get_settings

settings = get_settings()


class EmailService:
    def __init__(self):
        self.smtp_email = settings.smtp_email.strip()
        self.smtp_app_password = settings.smtp_app_password.replace(" ", "")
        self.from_email = self.smtp_email or settings.from_email
        self.api_key = settings.sendgrid_api_key

        self.sg = None

        try:
            from sendgrid import SendGridAPIClient
            if self.api_key and not self.smtp_email:
                self.sg = SendGridAPIClient(self.api_key)
        except ImportError:
            pass

    def send_email(self, to_email, subject, html_content, plain_content=None):
        if self.smtp_email and self.smtp_app_password:
            message = EmailMessage()
            message["Subject"] = subject
            message["From"] = self.smtp_email
            message["To"] = to_email
            message.set_content(plain_content or "Please view this email in an HTML-compatible email client.")
            message.add_alternative(html_content, subtype="html")

            try:
                context = ssl.create_default_context()

                with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    server.login(self.smtp_email, self.smtp_app_password)
                    server.send_message(message)

                print("[EMAIL] Email delivered to SMTP server.")
                return {"status": "sent", "message": "Email sent successfully"}

            except Exception as exc:
                print(f"[EMAIL] SMTP delivery failed: {type(exc).__name__}")
                return {
                    "status": "error",
                    "message": "Email delivery failed. Check SMTP configuration and Gmail App Password."
                }

        if self.sg:
            try:
                from sendgrid.helpers.mail import Mail

                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject=subject,
                    html_content=html_content,
                    plain_text_content=plain_content or ""
                )

                response = self.sg.send(message)

                if 200 <= response.status_code < 300:
                    return {
                        "status": "sent",
                        "status_code": response.status_code,
                        "message": "Email accepted by provider"
                    }

                return {
                    "status": "error",
                    "message": "Email provider did not accept the message"
                }

            except Exception as exc:
                print(f"[EMAIL] Provider delivery failed: {type(exc).__name__}")
                return {"status": "error", "message": "Email delivery failed"}

        return {
            "status": "error",
            "message": "Email service is not configured. Configure Gmail SMTP first."
        }

    def send_otp_email(self, to_email, otp, name="Farmer"):
        safe_name = html.escape(str(name))
        subject = "Your Smart Crop Advisory Login OTP"

        html_content = f"""
        <html><body style="font-family:Arial,sans-serif;padding:20px">
          <h2>Smart Crop Advisory System</h2>
          <p>Dear {safe_name},</p>
          <p>Your login verification code is:</p>
          <h1 style="color:#4a7c2c;letter-spacing:5px">{otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this code, ignore this email.</p>
        </body></html>
        """

        plain_content = (
            f"Dear {name}, your Smart Crop Advisory login OTP is {otp}. "
            "It expires in 10 minutes. Do not share this code."
        )

        return self.send_email(to_email, subject, html_content, plain_content)

    def send_disease_alert(self, to_email, disease_name, advisory, name="Farmer", crop_name=None):
        safe_name = html.escape(str(name))
        safe_disease = html.escape(str(disease_name))
        safe_crop = html.escape(str(crop_name)) if crop_name else ""
        safe_advisory = html.escape(str(advisory))

        crop_info = f" ({safe_crop})" if safe_crop else ""
        subject = f"Crop Disease Alert: {disease_name}{crop_info}"

        html_content = f"""
        <html><body style="font-family:Arial,sans-serif;padding:20px">
          <h2>Crop Disease Alert</h2>
          <p>Dear {safe_name},</p>
          <p>Detected: <strong>{safe_disease}</strong>{crop_info}</p>
          <h3>Treatment Advisory</h3>
          <p style="white-space:pre-line">{safe_advisory}</p>
        </body></html>
        """

        plain_content = f"Disease Detected: {disease_name}\n\nAdvisory:\n{advisory}"
        return self.send_email(to_email, subject, html_content, plain_content)

    def send_climate_alert(self, to_email, alert_title, severity, advisory, name="Farmer"):
        colors = {
            "low": "#5bc0de",
            "medium": "#f0ad4e",
            "high": "#d9534f",
            "critical": "#8b0000"
        }

        color = colors.get(str(severity).lower(), "#f0ad4e")
        safe_name = html.escape(str(name))
        safe_title = html.escape(str(alert_title))
        safe_severity = html.escape(str(severity))
        safe_advisory = html.escape(str(advisory))

        subject = f"Climate Alert: {alert_title}"

        html_content = f"""
        <html><body style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:{color}">Climate Alert</h2>
          <p>Dear {safe_name},</p>
          <h3>{safe_title}</h3>
          <p>Severity: {safe_severity}</p>
          <p style="white-space:pre-line">{safe_advisory}</p>
        </body></html>
        """

        plain_content = (
            f"Climate Alert: {alert_title}\n"
            f"Severity: {severity}\n\nAdvisory:\n{advisory}"
        )

        return self.send_email(to_email, subject, html_content, plain_content)


email_service = EmailService()
