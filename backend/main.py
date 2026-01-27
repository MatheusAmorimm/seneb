from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.configs import settings
from backend.core.database import db

# Importamos as rotas
from backend.api.v1.endpoints.auth_routes import router as api_router

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
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "ok"}