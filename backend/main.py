from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.configs import settings
from backend.routes.auth_routes import router as auth_router
from backend.core.database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Liga o Banco
    await db.connect_to_mongo()
    yield
    # Shutdown: Desliga o Banco
    await db.close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan  # <--- Injetamos a função aqui
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}