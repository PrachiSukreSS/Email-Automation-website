from .auth import router as auth_router
from .contacts import router as contacts_router
from .templates import router as templates_router
from .campaigns import router as campaigns_router
from .dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "contacts_router",
    "templates_router",
    "campaigns_router",
    "dashboard_router"
]
