from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.models import CampaignStatus, EmailStatus


# ================ User Schemas ================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ================ Contact Schemas ================
class ContactBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    email: Optional[EmailStr] = None


class ContactResponse(ContactBase):
    id: int
    is_subscribed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContactBulkImport(BaseModel):
    contacts: List[ContactCreate]


# ================ Email Template Schemas ================
class EmailTemplateBase(BaseModel):
    name: str
    subject: str
    body: str
    placeholders: List[str] = Field(default_factory=list)


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(EmailTemplateBase):
    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None


class EmailTemplateResponse(EmailTemplateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ================ Campaign Schemas ================
class CampaignBase(BaseModel):
    name: str
    template_id: int


class CampaignCreate(CampaignBase):
    contact_ids: List[int] = Field(default_factory=list)
    scheduled_at: Optional[datetime] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[CampaignStatus] = None
    scheduled_at: Optional[datetime] = None


class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    user_id: int
    recipient_count: int
    sent_count: int
    delivered_count: int
    opened_count: int
    clicked_count: int
    failed_count: int
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignStats(BaseModel):
    campaign_id: int
    campaign_name: str
    total_recipients: int
    sent_count: int
    delivered_count: int
    opened_count: int
    clicked_count: int
    failed_count: int
    open_rate: float
    click_rate: float
    delivery_rate: float


# ================ Email Schemas ================
class EmailResponse(BaseModel):
    id: int
    campaign_id: int
    recipient_email: str
    recipient_name: Optional[str]
    subject: str
    status: EmailStatus
    error_message: Optional[str] = None
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    opened_at: Optional[datetime]
    clicked_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ================ Dashboard Schemas ================
class DashboardStats(BaseModel):
    total_contacts: int
    total_campaigns: int
    total_emails_sent: int
    recent_campaigns: List[CampaignResponse]
