import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from backend.api.v1.api import api_router
from backend.api.v1.middlewares.rate_limit import limiter
from backend.core.configs import settings
from backend.core.database import db
from backend.core.exceptions import (
    DomainException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
)

logger = logging.getLogger("uvicorn")

_OTP_TTL_SHORT = 900          # 15 minutes — verification + password reset codes
_OTP_TTL_LONG = 1800          # 30 minutes — email change codes
_NOTIFICATION_TTL = 604800    # 7 days
_REFRESH_TOKEN_TTL = 2592000  # 30 days


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Connecting to MongoDB...")
    await db.connect_to_mongo()

    col = db.db
    await col.notifications.create_index("created_at", expireAfterSeconds=_NOTIFICATION_TTL)
    await col.verification_codes.create_index("created_at", expireAfterSeconds=_OTP_TTL_SHORT)
    await col.password_reset_codes.create_index("created_at", expireAfterSeconds=_OTP_TTL_SHORT)
    await col.password_change_codes.create_index("created_at", expireAfterSeconds=_OTP_TTL_SHORT)
    await col.email_change_codes.create_index("created_at", expireAfterSeconds=_OTP_TTL_LONG)
    await col.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)

    yield

    logger.info("Closing MongoDB connection...")
    await db.close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if not settings.DISABLE_OPENAPI else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next) -> Response:
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


@app.exception_handler(NotFoundException)
async def not_found_handler(request: Request, exc: NotFoundException) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(ForbiddenException)
async def forbidden_handler(request: Request, exc: ForbiddenException) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": exc.message})


@app.exception_handler(ConflictException)
async def conflict_handler(request: Request, exc: ConflictException) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(UnauthorizedException)
async def unauthorized_handler(request: Request, exc: UnauthorizedException) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": exc.message},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(DomainException)
async def domain_handler(request: Request, exc: DomainException) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
