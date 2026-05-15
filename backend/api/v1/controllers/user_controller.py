from fastapi import APIRouter, Depends, HTTPException, Request, status

from backend.api.v1.dependencies import get_current_user, get_db, get_user_repo
from backend.api.v1.middlewares.rate_limit import limiter
from backend.application.dtos.user_dtos import (
    AddBankInput,
    ChangeEmailInitInput,
    ChangePasswordConfirmInput,
    ChangePasswordInitInput,
    SetNewEmailInput,
    UpdateProfileInput,
    UserOutput,
    VerifyCodeInput,
)
from backend.application.use_cases.user.add_custom_bank import AddCustomBankUseCase
from backend.application.use_cases.user.change_email import (
    ChangeEmailConfirmUseCase,
    ChangeEmailInitUseCase,
    ChangeEmailSetNewUseCase,
    ChangeEmailVerifyCurrentUseCase,
)
from backend.application.use_cases.user.change_password import (
    ChangePasswordConfirmUseCase,
    ChangePasswordInitUseCase,
)
from backend.application.use_cases.user.get_profile import GetProfileUseCase
from backend.application.use_cases.user.update_profile import UpdateProfileUseCase
from backend.core.exceptions import (
    ConflictException,
    DomainException,
    NotFoundException,
)
from backend.domain.entities.user import UserEntity
from backend.domain.interfaces.user_repository import IUserRepository
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


def _handle(exc: DomainException) -> None:
    if isinstance(exc, NotFoundException):
        raise HTTPException(status_code=404, detail=exc.message)
    if isinstance(exc, ConflictException):
        raise HTTPException(status_code=409, detail=exc.message)
    raise HTTPException(status_code=400, detail=exc.message)


@router.get("/me", response_model=UserOutput)
async def get_profile(current_user: UserEntity = Depends(get_current_user)):
    user = await GetProfileUseCase().execute(current_user)
    return UserOutput(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        nickname=user.nickname,
        created_at=user.created_at,
        custom_banks=user.custom_banks,
    )


@router.patch("/me", response_model=UserOutput)
async def update_profile(
    data: UpdateProfileInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
):
    user = await UpdateProfileUseCase(user_repo).execute(data, current_user)
    return UserOutput(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        nickname=user.nickname,
        created_at=user.created_at,
        custom_banks=user.custom_banks,
    )


@router.post("/banks", status_code=status.HTTP_201_CREATED)
async def add_custom_bank(
    data: AddBankInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
):
    return await AddCustomBankUseCase(user_repo).execute(data, current_user)


@router.post("/change-password/init")
@limiter.limit("5/minute")
async def change_password_init(
    request: Request,
    data: ChangePasswordInitInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ChangePasswordInitUseCase(user_repo, db).execute(data, current_user)
        return {"message": "Código enviado para seu e-mail."}
    except DomainException as exc:
        _handle(exc)


@router.post("/change-password/confirm")
@limiter.limit("5/minute")
async def change_password_confirm(
    request: Request,
    data: ChangePasswordConfirmInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ChangePasswordConfirmUseCase(user_repo, db).execute(data, current_user)
        return {"message": "Senha alterada com sucesso."}
    except DomainException as exc:
        _handle(exc)


@router.post("/change-email/init")
@limiter.limit("5/minute")
async def change_email_init(
    request: Request,
    data: ChangeEmailInitInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ChangeEmailInitUseCase(user_repo, db).execute(data, current_user)
        return {"message": "Código enviado para seu e-mail atual."}
    except DomainException as exc:
        _handle(exc)


@router.post("/change-email/verify-current")
@limiter.limit("5/minute")
async def change_email_verify_current(
    request: Request,
    data: VerifyCodeInput,
    current_user: UserEntity = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ChangeEmailVerifyCurrentUseCase(db).execute(data, current_user)
        return {"message": "Código verificado. Agora digite seu novo e-mail."}
    except DomainException as exc:
        _handle(exc)


@router.post("/change-email/set-new")
@limiter.limit("5/minute")
async def change_email_set_new(
    request: Request,
    data: SetNewEmailInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await ChangeEmailSetNewUseCase(user_repo, db).execute(data, current_user)
        return {"message": f"Código enviado para {data.new_email}."}
    except DomainException as exc:
        _handle(exc)


@router.post("/change-email/confirm")
@limiter.limit("5/minute")
async def change_email_confirm(
    request: Request,
    data: VerifyCodeInput,
    current_user: UserEntity = Depends(get_current_user),
    user_repo: IUserRepository = Depends(get_user_repo),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        new_email = await ChangeEmailConfirmUseCase(user_repo, db).execute(data, current_user)
        return {"message": "E-mail alterado com sucesso.", "new_email": new_email}
    except DomainException as exc:
        _handle(exc)
