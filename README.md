# Email Automation Platform - 3-Tier Web Application

A complete email automation platform built with React, FastAPI, and PostgreSQL. Features modern UI design with glassmorphism effects, comprehensive campaign management, and analytics.

## Architecture

### 🎨 **Presentation Tier** (Frontend - React + Vite)
- Modern, responsive UI with dark theme
- Glassmorphism effects and smooth animations
- Authentication (Login/Register)
- Dashboard with statistics
- Contact management with bulk import (CSV/Excel)
- Email template editor with placeholders
- Campaign builder and management
- Analytics dashboard with charts

### ⚙️ **Application Tier** (Backend - FastAPI)
- RESTful API with FastAPI
- JWT authentication
- Email sending service with SMTP
- Template rendering with Jinja2
- Background task processing
- Comprehensive error handling

### 💾 **Data Tier** (Database - PostgreSQL)
- User management
- Contact storage
- Email templates
- Campaign tracking
- Email events and analytics

## Features

✅ **User Authentication**
- Secure registration and login
- JWT token-based authentication
- Protected routes

✅ **Contact Management**
- Add contacts manually
- Bulk import from CSV/Excel files
- Contact search and filtering
- Contact deletion

✅ **Email Templates**
- Create reusable templates
- Support for placeholders ({{name}}, {{email}}, etc.)
- Template management (CRUD operations)

✅ **Campaign Management**
- Create email campaigns
- Select templates and recipients
- Send immediately or schedule
- Campaign status tracking

✅ **Analytics & Reporting**
- Campaign performance metrics
- Open rates, click rates, delivery rates
- Interactive charts and visualizations
- Per-campaign analytics

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# - Database credentials
# - JWT secret key
# - SMTP credentials

# Create database
createdb email_automation

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Configuration

### Backend Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/email_automation

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# SMTP Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Email Automation Platform
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in SMTP_PASSWORD

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
email-automation/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   └── models.py           # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py          # Pydantic schemas
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   ├── contacts.py         # Contact management
│   │   ├── templates.py        # Template management
│   │   ├── campaigns.py        # Campaign management
│   │   └── dashboard.py        # Dashboard stats
│   ├── services/
│   │   └── email_service.py    # Email sending service
│   └── utils/
│       └── auth.py             # Authentication utilities
│
└── frontend/
    ├── index.html              # HTML entry point
    ├── package.json            # Node dependencies
    ├── src/
    │   ├── main.jsx            # React entry point
    │   ├── App.jsx             # Main app component
    │   ├── index.css           # Design system & styles
    │   ├── components/
    │   │   ├── Navbar.jsx      # Navigation bar
    │   │   └── PrivateRoute.jsx # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx # Authentication context
    │   ├── utils/
    │   │   └── api.js          # API client
    │   └── pages/
    │       ├── Login.jsx       # Login page
    │       ├── Register.jsx    # Registration page
    │       ├── Dashboard.jsx   # Dashboard
    │       ├── Contacts.jsx    # Contact management
    │       ├── Templates.jsx   # Template management
    │       ├── Campaigns.jsx   # Campaign management
    │       └── Analytics.jsx   # Analytics page
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Contacts
- `GET /api/contacts/` - List contacts
- `POST /api/contacts/` - Create contact
- `POST /api/contacts/bulk` - Bulk import
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Templates
- `GET /api/templates/` - List templates
- `POST /api/templates/` - Create template
- `PUT /api/templates/{id}` - Update template
- `DELETE /api/templates/{id}` - Delete template

### Campaigns
- `GET /api/campaigns/` - List campaigns
- `POST /api/campaigns/` - Create campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/campaigns/{id}/analytics` - Get analytics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard stats

## Technology Stack

**Frontend:**
- React 18
- Vite
- React Router
- Axios
- Recharts (for analytics)

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Python-Jose (JWT)
- Passlib (password hashing)
- Jinja2 (template rendering)
- aiosmtplib (async email)

## Development

### Run Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Features Roadmap

- ✅ User authentication
- ✅ Contact management
- ✅ Email templates
- ✅ Campaign creation and sending
- ✅ Analytics dashboard
- 🔲 Email drip campaigns
- 🔲 A/B testing
- 🔲 Advanced segmentation
- 🔲 Email scheduling with cron
- 🔲 Webhook integrations

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
