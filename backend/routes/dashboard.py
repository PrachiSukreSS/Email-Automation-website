from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Contact, Campaign, Email
from schemas import DashboardStats, CampaignResponse
from utils.auth import get_current_active_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    # Count total contacts
    total_contacts = db.query(func.count(Contact.id)).filter(
        Contact.user_id == current_user.id
    ).scalar()
    
    # Count total campaigns
    total_campaigns = db.query(func.count(Campaign.id)).filter(
        Campaign.user_id == current_user.id
    ).scalar()
    
    # Count total emails sent
    total_emails_sent = db.query(func.sum(Campaign.sent_count)).filter(
        Campaign.user_id == current_user.id
    ).scalar() or 0
    
    # Get recent campaigns
    recent_campaigns = db.query(Campaign).filter(
        Campaign.user_id == current_user.id
    ).order_by(Campaign.created_at.desc()).limit(5).all()
    
    return DashboardStats(
        total_contacts=total_contacts or 0,
        total_campaigns=total_campaigns or 0,
        total_emails_sent=int(total_emails_sent),
        recent_campaigns=recent_campaigns
    )
