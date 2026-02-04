from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.configs import settings
from backend.core.database import db
from backend.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando conexão com MongoDB...")
    await db.connect_to_mongo()
    yield
    print("Fechando conexão com MongoDB...")
    await db.close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agora sim, isso inclui TUDO (auth + transactions)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "ok"}