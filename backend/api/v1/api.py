from fastapi import APIRouter
from backend.api.v1.endpoints import auth_routes, report_routes, transaction_routes

api_router = APIRouter()

api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])

api_router.include_router(transaction_routes.router, prefix="/transactions", tags=["transactions"])

api_router.include_router(report_routes.router, prefix="/reports", tags=["Reports"])