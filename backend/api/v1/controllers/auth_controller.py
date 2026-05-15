from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.api.v1.dependencies import get_db, get_user_repo
from backend.api.v1.middlewares.rate_limit import limiter
from backend.application.dtos.auth_dtos import (
    ForgotPasswordInput,
    LogoutInput,
    RefreshInput,
    RefreshOutput,
    ResetPasswordInput,
    SendCodeInput,
    SignupInput,
    SignupOutput,
    LoginOutput,
)
from backend.application.use_cases.auth.forgot_password import ForgotPasswordUseCase
from backend.application.use_cases.auth.login import LoginUseCase
from backend.application.use_cases.auth.refresh_token import RefreshTokenUseCase
from backend.application.use_cases.auth.reset_password import ResetPasswordUseCase
from backend.application.use_cases.auth.send_verification_code import SendVerificationCodeUseCase
from backend.application.use_cases.auth.signup import SignupUseCase
from backend.core.exceptions import (
    ConflictException,
    DomainException,
    UnauthorizedException,
)
from backend.domain.interfaces.user_repository import IUserRepository

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, ConflictException):
        raise HTTPException(status_code=409, detail=exc.message)
    if isinstance(exc, UnauthorizedException):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
            headers={"WWW-Authenticate": "Bearer"},
        )
    raise HTTPException(status_code=400, detail=exc.message)


@router.post("/send-code")
@limiter.limit("5/minute")
async def send_code(
    request: Request,
    data: SendCodeInput,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await SendVerificationCodeUseCase(db).execute(data.email)
        return {"message": "Código enviado com sucesso."}
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao processar envio.")


@router.post("/signup", response_model=SignupOutput, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(
    request: Request,
    data: SignupInput,
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        return await SignupUseCase(user_repo, db).execute(data)
    except DomainException as exc:
        _handle(exc)


@router.post("/login", response_model=LoginOutput)
@limiter.limit("10/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        return await LoginUseCase(user_repo, db).execute(form_data.username, form_data.password)
    except DomainException as exc:
        _handle(exc)


@router.post("/refresh", response_model=RefreshOutput)
@limiter.limit("20/minute")
async def refresh_token(
    request: Request,
    data: RefreshInput,
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        return await RefreshTokenUseCase(user_repo, db).execute(data.refresh_token)
    except DomainException as exc:
        _handle(exc)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    data: LogoutInput,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    from backend.core.security import hash_refresh_token
    token_hash = hash_refresh_token(data.refresh_token)
    await db["refresh_tokens"].delete_one({"token_hash": token_hash})


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    data: ForgotPasswordInput,
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    await ForgotPasswordUseCase(user_repo, db).execute(data.email)
    return {"message": "Se este e-mail estiver cadastrado, você receberá um código em breve."}


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    data: ResetPasswordInput,
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ResetPasswordUseCase(user_repo, db).execute(data)
        return {"message": "Senha redefinida com sucesso."}
    except DomainException as exc:
        _handle(exc)
