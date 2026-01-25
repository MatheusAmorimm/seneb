from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.configs import settings
from backend.core.database import db

# Importamos as rotas
from backend.routes.auth_routes import router as auth_router
from backend.routes.transaction_routes import router as transaction_router # <--- IMPORT NOVO

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Liga o Banco
    print("Iniciando conexão com MongoDB...")
    await db.connect_to_mongo()
    yield
    # Shutdown: Desliga o Banco
    print("Fechando conexão com MongoDB...")
    await db.close_mongo_connection()

# --- INICIALIZAÇÃO ÚNICA ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# --- CORS (Configurado apenas uma vez) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Seu Front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS ---

# 1. Rota de Autenticação (Mantive como estava)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

# 2. Rota de Transações (A QUE FALTAVA)
# O prefixo "/transactions" faz a URL virar: http://localhost:8000/transactions
app.include_router(transaction_router, prefix="/transactions", tags=["transactions"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}