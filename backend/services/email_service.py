import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from datetime import datetime
from typing import Dict, Any
from database import SessionLocal
from models import (
    Campaign,
    Email,
    EmailStatus,
    CampaignStatus,
    EmailEvent,
    EmailEventType,
)
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""

    def __init__(self):
        from config import settings

        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        placeholders: Dict[str, Any] = None,
    ) -> bool:
        try:
            # Render placeholders
            if placeholders:
                subject = Template(subject).render(**placeholders)
                body = Template(body).render(**placeholders)

            # Build email
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(body, "html"))

            # 🔥 FIXED SMTP CONNECTION
            smtp = aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                start_tls=True,   # ✅ let library handle TLS
                timeout=15,
            )

            await smtp.connect()
            await smtp.login(self.smtp_user, self.smtp_password)
            await smtp.send_message(message)
            await smtp.quit()

            return True

        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False


email_service = EmailService()


def send_campaign_emails(campaign_id: int):
    """Send all emails for a campaign"""
    db = SessionLocal()
    pending_emails = []

    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            logger.error(f"Campaign {campaign_id} not found")
            return

        emails = (
            db.query(Email)
            .filter(
                Email.campaign_id == campaign_id,
                Email.status == EmailStatus.PENDING,
            )
            .all()
        )

        for email in emails:
            pending_emails.append(
                {
                    "id": email.id,
                    "recipient_email": email.recipient_email,
                    "recipient_name": email.recipient_name,
                    "subject": email.subject,
                    "body": email.body,
                }
            )
            email.status = EmailStatus.SENDING

        db.commit()

    except Exception as e:
        logger.error(f"Error preparing emails: {e}")
        return
    finally:
        db.close()

    async def process_emails():
        semaphore = asyncio.Semaphore(5)

        async def send_one(email_data):
            async with semaphore:
                placeholders = {
                    "name": email_data["recipient_name"],
                    "email": email_data["recipient_email"],
                }
                success = await email_service.send_email(
                    to_email=email_data["recipient_email"],
                    subject=email_data["subject"],
                    body=email_data["body"],
                    placeholders=placeholders,
                )
                return {"id": email_data["id"], "success": success}

        tasks = [send_one(e) for e in pending_emails]
        return await asyncio.gather(*tasks)

    try:
        results = asyncio.run(process_emails())
    except Exception as e:
        logger.error(f"Async processing failed: {e}")
        return

    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        success_count = 0
        fail_count = 0

        for result in results:
            email = db.query(Email).filter(Email.id == result["id"]).first()
            if not email:
                continue

            if result["success"]:
                email.status = EmailStatus.SENT
                email.sent_at = datetime.utcnow()
                success_count += 1
                db.add(
                    EmailEvent(
                        email_id=email.id,
                        event_type=EmailEventType.SENT,
                    )
                )
            else:
                email.status = EmailStatus.FAILED
                email.error_message = "SMTP send failed"
                fail_count += 1

        campaign.sent_count += success_count
        campaign.failed_count += fail_count
        campaign.status = CampaignStatus.COMPLETED
        campaign.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        logger.error(f"Final DB update error: {e}")
    finally:
        db.close()
