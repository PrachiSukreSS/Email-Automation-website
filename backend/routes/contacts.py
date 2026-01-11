from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from database import get_db
from models import User, Contact
from schemas import ContactCreate, ContactUpdate, ContactResponse
from utils.auth import get_current_active_user

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.get("/", response_model=List[ContactResponse])
async def get_contacts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all contacts for current user"""
    contacts = db.query(Contact).filter(
        Contact.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return contacts


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new contact"""
    # Check if contact with same email already exists for this user
    existing_contact = db.query(Contact).filter(
        Contact.email == contact_data.email,
        Contact.user_id == current_user.id
    ).first()
    
    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this email already exists"
        )
    
    new_contact = Contact(
        **contact_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    return new_contact


@router.post("/bulk", response_model=dict)
async def bulk_import_contacts(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Bulk import contacts from CSV or Excel file"""
    try:
        # Read file content
        content = await file.read()
        
        # Parse based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please use CSV or Excel files."
            )
        
        # Validate required columns
        if 'email' not in df.columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email column is required in the file"
            )
        
        # Import contacts
        imported_count = 0
        skipped_count = 0
        
        for _, row in df.iterrows():
            email = row.get('email')
            if pd.isna(email) or not email:
                skipped_count += 1
                continue
            
            # Check if contact already exists
            existing_contact = db.query(Contact).filter(
                Contact.email == email,
                Contact.user_id == current_user.id
            ).first()
            
            if existing_contact:
                skipped_count += 1
                continue
            
            # Create new contact
            new_contact = Contact(
                email=email,
                first_name=row.get('first_name') if not pd.isna(row.get('first_name')) else None,
                last_name=row.get('last_name') if not pd.isna(row.get('last_name')) else None,
                company=row.get('company') if not pd.isna(row.get('company')) else None,
                user_id=current_user.id
            )
            
            db.add(new_contact)
            imported_count += 1
        
        db.commit()
        
        return {
            "message": "Bulk import completed",
            "imported": imported_count,
            "skipped": skipped_count,
            "total": len(df)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing contacts: {str(e)}"
        )


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific contact"""
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a contact"""
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Update contact fields
    update_data = contact_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    db.commit()
    db.refresh(contact)
    
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a contact"""
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    
    return None
