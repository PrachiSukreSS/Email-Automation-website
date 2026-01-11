import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from config import settings
from database import SessionLocal
from models import Campaign, Email, EmailStatus, CampaignStatus, EmailEvent, EmailEventType
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""
    
    def __init__(self):
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
        placeholders: Dict[str, Any] = None
    ) -> bool:
        """Send a single email"""
        try:
            # Render template with placeholders
            if placeholders:
                subject_template = Template(subject)
                body_template = Template(body)
                subject = subject_template.render(**placeholders)
                body = body_template.render(**placeholders)
            
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add HTML body
            html_part = MIMEText(body, "html")
            message.attach(html_part)
            
            # Send email with timeout
            async with aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=False,
                timeout=10 # Add timeout to prevent hanging
            ) as smtp:
                # Only upgrade to TLS if not already using it
                if not smtp.is_tls:
                    try:
                        await smtp.starttls()
                    except Exception as tls_error:
                        logger.warning(f"STARTTLS failed or already active: {tls_error}")
                
                await smtp.login(self.smtp_user, self.smtp_password)
                await smtp.send_message(message)
            
            return True
        
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False


email_service = EmailService()


def send_campaign_emails(campaign_id: int):
    """Send all emails for a campaign (runs in background)"""
    # 1. FETCH DATA (Synchronous DB)
    db = SessionLocal()
    pending_emails_data = []
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return
        
        # Get all pending emails for this campaign
        emails = db.query(Email).filter(
            Email.campaign_id == campaign_id,
            Email.status == EmailStatus.PENDING
        ).all()
        
        # Extract necessary data to avoid detatchment issues after closing session
        for email in emails:
            pending_emails_data.append({
                "id": email.id,
                "recipient_email": email.recipient_email,
                "recipient_name": email.recipient_name,
                "subject": email.subject,
                "body": email.body
            })
            
            # Pre-mark as sending in DB
            email.status = EmailStatus.SENDING
        
        db.commit()
    except Exception as e:
        logger.error(f"Error fetching emails for campaign {campaign_id}: {str(e)}")
        db.close()
        return
    finally:
        db.close()

    # 2. SEND EMAILS (Async)
    async def process_emails():
        results = []
        # Limit concurrency to avoid swamping the SMTP server
        semaphore = asyncio.Semaphore(5) 
        
        async def send_wrapper(email_data):
            async with semaphore:
                placeholders = {
                    "email": email_data["recipient_email"],
                    "name": email_data["recipient_name"]
                }
                success = await email_service.send_email(
                    to_email=email_data["recipient_email"],
                    subject=email_data["subject"],
                    body=email_data["body"],
                    placeholders=placeholders
                )
                return {"id": email_data["id"], "success": success}

        tasks = [send_wrapper(data) for data in pending_emails_data]
        if tasks:
            results = await asyncio.gather(*tasks)
        return results

    try:
        sending_results = asyncio.run(process_emails())
    except Exception as e:
        logger.error(f"Error during async sending for campaign {campaign_id}: {str(e)}")
        sending_results = [] # Should define fallback here maybe

    # 3. UPDATE DB (Synchronous)
    db = SessionLocal()
    try:
        # Re-fetch campaign
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return # Should not happen

        success_count = 0
        fail_count = 0

        for res in sending_results:
            email_id = res["id"]
            success = res["success"]
            
            email = db.query(Email).filter(Email.id == email_id).first()
            if not email:
                continue
                
            if success:
                email.status = EmailStatus.SENT
                email.sent_at = datetime.utcnow()
                success_count += 1
                
                # Create sent event
                event = EmailEvent(
                    email_id=email.id,
                    event_type=EmailEventType.SENT
                )
                db.add(event)
            else:
                email.status = EmailStatus.FAILED
                email.error_message = "Failed to send email (SMTP error)"
                fail_count += 1
        
        # Update campaign stats
        campaign.sent_count += success_count
        campaign.failed_count += fail_count
        campaign.status = CampaignStatus.COMPLETED
        campaign.completed_at = datetime.utcnow()
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id} status: {str(e)}")
        # Try to mark campaign as failed if possible
        try:
             campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
             if campaign:
                 campaign.status = CampaignStatus.FAILED
                 db.commit()
        except:
            pass
    finally:
        db.close()
