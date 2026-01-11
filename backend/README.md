# Email Automation Platform Backend

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Set Up Database
```bash
# Create PostgreSQL database
createdb email_automation

# Or use the provided DATABASE_URL in .env
```

### 4. Run the Application
```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 8000

# Or use Python directly
python main.py
```

### 5. Access API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Contacts
- `GET /api/contacts/` - List contacts
- `POST /api/contacts/` - Create contact
- `POST /api/contacts/bulk` - Bulk import from CSV/Excel
- `GET /api/contacts/{id}` - Get contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Email Templates
- `GET /api/templates/` - List templates
- `POST /api/templates/` - Create template
- `GET /api/templates/{id}` - Get template
- `PUT /api/templates/{id}` - Update template
- `DELETE /api/templates/{id}` - Delete template

### Campaigns
- `GET /api/campaigns/` - List campaigns
- `POST /api/campaigns/` - Create campaign
- `GET /api/campaigns/{id}` - Get campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/campaigns/{id}/analytics` - Get campaign analytics
- `GET /api/campaigns/{id}/emails` - Get campaign emails
- `DELETE /api/campaigns/{id}` - Delete campaign

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
