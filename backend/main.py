from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import logging

from backend.core.configs import get_settings
from backend.routes import auth_routes
from backend.core.database import db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Conectando ao MongoDB...")
    # Aqui usamos o db importado
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    logging.info("MongoDB Conectado!")
    yield
    logging.info("Fechando conexão...")
    db.client.close()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- CORS (Cross-Origin Resource Sharing) ---
# Crítico: Permite que seu Next.js (Web) e futuramente o Desktop acessem a API.
origins = [
    "http://localhost",
    "http://localhost:3000",  # Next.js padrão
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Em produção, seja mais restrito
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Rotas de Teste ---
@app.get("/")
async def root():
    return {"message": "API Finance Control está online 🚀"}


@app.get("/health")
async def health_check():
    """Verifica se o banco está respondendo"""
    try:
        # Tenta um comando simples no banco
        await db.client.server_info()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}


#    --- REGISTRO DE ROTAS ---
# Aqui incluímos as rotas de autenticação na API
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Autenticação"])

# Para rodar (apenas para debug, em prod usa-se linha de comando):
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
