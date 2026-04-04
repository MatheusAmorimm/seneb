from fastapi import APIRouter
from backend.api.v1.endpoints import auth_routes, report_routes, transaction_routes, user_routes, group_routes, notification_routes

api_router = APIRouter()

api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])

api_router.include_router(transaction_routes.router, prefix="/transactions", tags=["transactions"])

api_router.include_router(report_routes.router, prefix="/reports", tags=["Reports"])

api_router.include_router(user_routes.router, prefix="/users", tags=["Users"])

api_router.include_router(group_routes.router, prefix="/groups", tags=["Groups"])

api_router.include_router(notification_routes.router, prefix="/notifications", tags=["Notifications"])