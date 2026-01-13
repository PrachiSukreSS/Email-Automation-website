from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import (
    User,
    Campaign,
    EmailTemplate,
    Contact,
    Email,
    CampaignStatus,
    EmailStatus
)
from schemas import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CampaignStats,
    EmailResponse
)
from utils.auth import get_current_active_user
from services.email_service import send_campaign_emails

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


# ================= GET ALL CAMPAIGNS =================
@router.get("/", response_model=List[CampaignResponse])
async def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Campaign)
        .filter(Campaign.user_id == current_user.id)
        .order_by(Campaign.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ================= CREATE CAMPAIGN =================
@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == campaign_data.template_id,
        EmailTemplate.user_id == current_user.id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if campaign_data.contact_ids:
        contacts = db.query(Contact).filter(
            Contact.id.in_(campaign_data.contact_ids),
            Contact.user_id == current_user.id
        ).all()
    else:
        contacts = db.query(Contact).filter(
            Contact.user_id == current_user.id,
            Contact.is_subscribed == True
        ).all()

    campaign = Campaign(
        name=campaign_data.name,
        template_id=template.id,
        user_id=current_user.id,
        recipient_count=len(contacts),
        status=CampaignStatus.DRAFT
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    for contact in contacts:
        db.add(Email(
            campaign_id=campaign.id,
            recipient_email=contact.email,
            recipient_name=f"{contact.first_name or ''} {contact.last_name or ''}".strip(),
            subject=template.subject,
            body=template.body,
            status=EmailStatus.PENDING
        ))

    db.commit()
    return campaign


# ================= SEND CAMPAIGN =================
@router.post("/{campaign_id}/send", response_model=dict)
async def send_campaign(
    campaign_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status in [CampaignStatus.SENDING, CampaignStatus.COMPLETED]:
        raise HTTPException(status_code=400, detail="Campaign cannot be sent")

    campaign.status = CampaignStatus.SENDING
    campaign.started_at = datetime.utcnow()
    db.commit()

    # 🔥 Background email sending
    background_tasks.add_task(send_campaign_emails, campaign_id)

    return {
        "message": "Campaign emails are being sent",
        "campaign_id": campaign_id,
        "recipient_count": campaign.recipient_count
    }


# ================= ANALYTICS =================
@router.get("/{campaign_id}/analytics", response_model=CampaignStats)
async def get_campaign_analytics(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    sent = campaign.sent_count or 1  # avoid zero division

    return CampaignStats(
        campaign_id=campaign.id,
        campaign_name=campaign.name,
        total_recipients=campaign.recipient_count,
        sent_count=campaign.sent_count,
        delivered_count=campaign.delivered_count,
        opened_count=campaign.opened_count,
        clicked_count=campaign.clicked_count,
        failed_count=campaign.failed_count,
        open_rate=round(campaign.opened_count / sent * 100, 2),
        click_rate=round(campaign.clicked_count / sent * 100, 2),
        delivery_rate=round(campaign.delivered_count / sent * 100, 2)
    )
