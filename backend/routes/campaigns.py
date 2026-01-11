from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import User, Campaign, EmailTemplate, Contact, Email, CampaignStatus, EmailStatus
from schemas import CampaignCreate, CampaignUpdate, CampaignResponse, CampaignStats, EmailResponse
from utils.auth import get_current_active_user
from services.email_service import send_campaign_emails

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])


@router.get("/", response_model=List[CampaignResponse])
async def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all campaigns for current user"""
    campaigns = db.query(Campaign).filter(
        Campaign.user_id == current_user.id
    ).order_by(Campaign.created_at.desc()).offset(skip).limit(limit).all()
    
    return campaigns


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new campaign"""
    # Verify template exists and belongs to user
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == campaign_data.template_id,
        EmailTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Verify contacts exist
    if campaign_data.contact_ids:
        contacts = db.query(Contact).filter(
            Contact.id.in_(campaign_data.contact_ids),
            Contact.user_id == current_user.id
        ).all()
        
        if len(contacts) != len(campaign_data.contact_ids):
            raise HTTPException(status_code=404, detail="Some contacts not found")
    else:
        # If no specific contacts, use all user's contacts
        contacts = db.query(Contact).filter(
            Contact.user_id == current_user.id,
            Contact.is_subscribed == True
        ).all()
    
    # Create campaign
    new_campaign = Campaign(
        name=campaign_data.name,
        template_id=campaign_data.template_id,
        user_id=current_user.id,
        recipient_count=len(contacts),
        scheduled_at=campaign_data.scheduled_at,
        status=CampaignStatus.SCHEDULED if campaign_data.scheduled_at else CampaignStatus.DRAFT
    )
    
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    # Create email records for each recipient
    for contact in contacts:
        email = Email(
            campaign_id=new_campaign.id,
            recipient_email=contact.email,
            recipient_name=f"{contact.first_name or ''} {contact.last_name or ''}".strip() or contact.email,
            subject=template.subject,
            body=template.body,
            status=EmailStatus.PENDING
        )
        db.add(email)
    
    db.commit()
    db.refresh(new_campaign)
    
    return new_campaign


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return campaign


@router.post("/{campaign_id}/send", response_model=dict)
async def send_campaign(
    campaign_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send campaign emails immediately"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status == CampaignStatus.SENDING:
        raise HTTPException(status_code=400, detail="Campaign is already being sent")
    
    if campaign.status == CampaignStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Campaign has already been sent")
    
    # Update campaign status
    campaign.status = CampaignStatus.SENDING
    campaign.started_at = datetime.utcnow()
    db.commit()
    
    # Send emails in background
    background_tasks.add_task(send_campaign_emails, campaign_id)
    
    return {
        "message": "Campaign is being sent",
        "campaign_id": campaign_id,
        "recipient_count": campaign.recipient_count
    }


@router.get("/{campaign_id}/analytics", response_model=CampaignStats)
async def get_campaign_analytics(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get campaign statistics and analytics"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Calculate rates
    open_rate = (campaign.opened_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0
    click_rate = (campaign.clicked_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0
    delivery_rate = (campaign.delivered_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0
    
    return CampaignStats(
        campaign_id=campaign.id,
        campaign_name=campaign.name,
        total_recipients=campaign.recipient_count,
        sent_count=campaign.sent_count,
        delivered_count=campaign.delivered_count,
        opened_count=campaign.opened_count,
        clicked_count=campaign.clicked_count,
        failed_count=campaign.failed_count,
        open_rate=round(open_rate, 2),
        click_rate=round(click_rate, 2),
        delivery_rate=round(delivery_rate, 2)
    )


@router.get("/{campaign_id}/emails", response_model=List[EmailResponse])
async def get_campaign_emails(
    campaign_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all emails for a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    emails = db.query(Email).filter(
        Email.campaign_id == campaign_id
    ).offset(skip).limit(limit).all()
    
    return emails


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status == CampaignStatus.SENDING:
        raise HTTPException(status_code=400, detail="Cannot delete a campaign that is currently being sent")
    
    db.delete(campaign)
    db.commit()
    
    return None
