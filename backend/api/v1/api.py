from fastapi import APIRouter

from backend.api.v1.controllers import (
    analytics_controller,
    auth_controller,
    goal_controller,
    group_controller,
    notification_controller,
    report_controller,
    transaction_controller,
    user_controller,
)

api_router = APIRouter()

api_router.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])
api_router.include_router(transaction_controller.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(report_controller.router, prefix="/reports", tags=["Reports"])
api_router.include_router(user_controller.router, prefix="/users", tags=["Users"])
api_router.include_router(group_controller.router, prefix="/groups", tags=["Groups"])
api_router.include_router(notification_controller.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(goal_controller.router, prefix="/goals", tags=["Goals"])
api_router.include_router(analytics_controller.router, prefix="/analytics", tags=["Analytics"])
