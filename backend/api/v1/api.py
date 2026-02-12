from fastapi import APIRouter
from backend.api.v1.endpoints import (
    auth_routes, 
    report_routes, 
    transaction_routes, 
    user_routes
)

api_router = APIRouter()

# --- Rotas de Autenticação (/api/v1/auth/...) ---
api_router.include_router(
    auth_routes.router, 
    prefix="/auth", 
    tags=["Auth"] # Padronizado com maiúscula
)

# --- Rotas de Transações (/api/v1/transactions/...) ---
api_router.include_router(
    transaction_routes.router, 
    prefix="/transactions", 
    tags=["Transactions"]
)

# --- Rotas de Relatórios (/api/v1/reports/...) ---
api_router.include_router(
    report_routes.router, 
    prefix="/reports", 
    tags=["Reports"]
)

# --- Rotas de Usuário (/api/v1/users/...) ---
api_router.include_router(
    user_routes.router, 
    prefix="/users", 
    tags=["Users"]
)