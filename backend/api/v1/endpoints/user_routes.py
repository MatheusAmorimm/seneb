from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from backend.core.database import db
from backend.core.security import get_current_user, verify_password, get_password_hash
from backend.models.user_model import UserModel
from backend.schemas import (
    UserSchema, BankAdd,
    ChangePasswordInitSchema, ChangePasswordConfirmSchema,
    ChangeEmailInitSchema, ChangeEmailVerifyCurrentSchema, ChangeEmailConfirmSchema,
)
from backend.repositories.user_repository import UserRepository
from backend.core.mail import (
    send_password_reset_code, send_email_change_code, send_email_confirmation_code
)
import random
import re

router = APIRouter()

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None

@router.get("/me", response_model=UserSchema)
async def get_user_me(current_user: UserModel = Depends(get_current_user)):
    """Retorna os dados do usuário logado, incluindo seus bancos personalizados."""
    return current_user

@router.post("/banks", status_code=status.HTTP_201_CREATED)
async def add_custom_bank(
    bank: BankAdd,
    current_user: UserModel = Depends(get_current_user)
):
    formatted_name = bank.bank_name.strip().title()
    
    if not formatted_name:
         raise HTTPException(status_code=400, detail="Nome do banco inválido.")
    
    try:
        user_id_obj = ObjectId(current_user.id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuário inválido.")

    result = await db.db.users.update_one(
        {"_id": user_id_obj},
        {"$addToSet": {"custom_banks": formatted_name}}
    )
    
    if result.modified_count == 0:
        return {"message": f"O banco '{formatted_name}' já estava na sua lista.", "bank_name": formatted_name}
        
    return {"message": f"Banco '{formatted_name}' adicionado com sucesso.", "bank_name": formatted_name}

@router.patch("/me", response_model=UserSchema)
async def update_user_me(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    update_fields = {}
    
    if user_data.full_name:
        update_fields["full_name"] = user_data.full_name
    if user_data.nickname:
        update_fields["nickname"] = user_data.nickname
        
    if not update_fields:
        return current_user

    try:
        user_id_obj = ObjectId(current_user.id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido.")

    await db.db.users.update_one(
        {"_id": user_id_obj},
        {"$set": update_fields}
    )
    
    current_user_dict = current_user.model_dump()
    current_user_dict.update(update_fields)
    
    return current_user_dict


# ============================================================
# CHANGE PASSWORD (2 rotas: init → confirm)
# ============================================================

def _validate_strong_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="A senha deve ter no mínimo 8 caracteres.")
    if not re.search(r'[A-Z]', password):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos uma letra maiúscula.")
    if not re.search(r'[a-z]', password):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos uma letra minúscula.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise HTTPException(status_code=400, detail="A senha deve conter pelo menos um caractere especial.")


@router.post("/change-password/init")
async def change_password_init(
    data: ChangePasswordInitSchema,
    current_user: UserModel = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")

    code = str(random.randint(10000000, 99999999))

    await db.db.password_change_codes.update_one(
        {"user_id": str(current_user.id)},
        {"$set": {"code": code, "user_id": str(current_user.id)}},
        upsert=True
    )

    await send_password_reset_code(current_user.email, code)

    return {"message": "Código enviado para seu e-mail."}


@router.post("/change-password/confirm")
async def change_password_confirm(
    data: ChangePasswordConfirmSchema,
    current_user: UserModel = Depends(get_current_user)
):
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Senhas não conferem.")

    _validate_strong_password(data.new_password)

    stored = await db.db.password_change_codes.find_one({"user_id": str(current_user.id)})
    if not stored:
        raise HTTPException(status_code=400, detail="Nenhum código solicitado.")
    if stored["code"] != data.code:
        raise HTTPException(status_code=400, detail="Código inválido.")

    hashed = get_password_hash(data.new_password)
    repo = UserRepository(db.db)
    await repo.update_password(current_user.email, hashed)

    await db.db.password_change_codes.delete_one({"user_id": str(current_user.id)})

    return {"message": "Senha alterada com sucesso."}


# ============================================================
# CHANGE EMAIL (4 rotas: init → verify-current → set-new → confirm)
# ============================================================

@router.post("/change-email/init")
async def change_email_init(
    data: ChangeEmailInitSchema,
    current_user: UserModel = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")

    if current_user.last_email_change:
        from datetime import datetime, timezone, timedelta
        days_since = (datetime.now(timezone.utc) - current_user.last_email_change).days
        if days_since < 15:
            remaining = 15 - days_since
            raise HTTPException(
                status_code=400,
                detail=f"Você só pode alterar o e-mail a cada 15 dias. Restam {remaining} dia(s)."
            )

    code = str(random.randint(10000000, 99999999))

    await db.db.email_change_codes.update_one(
        {"user_id": str(current_user.id)},
        {"$set": {
            "code": code,
            "user_id": str(current_user.id),
            "step": "verify_current",
        }},
        upsert=True
    )

    await send_email_change_code(current_user.email, code)

    return {"message": "Código enviado para seu e-mail atual."}


@router.post("/change-email/verify-current")
async def change_email_verify_current(
    data: ChangeEmailVerifyCurrentSchema,
    current_user: UserModel = Depends(get_current_user)
):
    stored = await db.db.email_change_codes.find_one({
        "user_id": str(current_user.id),
        "step": "verify_current"
    })

    if not stored:
        raise HTTPException(status_code=400, detail="Nenhum código solicitado.")
    if stored["code"] != data.code:
        raise HTTPException(status_code=400, detail="Código inválido.")

    await db.db.email_change_codes.update_one(
        {"user_id": str(current_user.id)},
        {"$set": {"step": "set_new"}}
    )

    return {"message": "Código verificado. Agora digite seu novo e-mail."}


@router.post("/change-email/set-new")
async def change_email_set_new(
    data: ChangeEmailConfirmSchema,
    current_user: UserModel = Depends(get_current_user)
):
    stored = await db.db.email_change_codes.find_one({
        "user_id": str(current_user.id),
        "step": "set_new"
    })

    if not stored:
        raise HTTPException(status_code=400, detail="Fluxo inválido. Reinicie o processo.")

    repo = UserRepository(db.db)
    if await repo.check_email_exists(data.new_email):
        raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outra conta.")

    code = str(random.randint(10000000, 99999999))

    await db.db.email_change_codes.update_one(
        {"user_id": str(current_user.id)},
        {"$set": {
            "code": code,
            "new_email": data.new_email,
            "step": "confirm_new",
        }}
    )

    await send_email_confirmation_code(data.new_email, code)

    return {"message": f"Código enviado para {data.new_email}."}


@router.post("/change-email/confirm")
async def change_email_confirm(
    data: ChangeEmailVerifyCurrentSchema,
    current_user: UserModel = Depends(get_current_user)
):
    stored = await db.db.email_change_codes.find_one({
        "user_id": str(current_user.id),
        "step": "confirm_new"
    })

    if not stored:
        raise HTTPException(status_code=400, detail="Fluxo inválido. Reinicie o processo.")
    if stored["code"] != data.code:
        raise HTTPException(status_code=400, detail="Código inválido.")

    new_email = stored["new_email"]
    repo = UserRepository(db.db)
    updated = await repo.update_email(str(current_user.id), new_email)

    if not updated:
        raise HTTPException(status_code=500, detail="Erro ao atualizar e-mail.")

    await db.db.email_change_codes.delete_one({"user_id": str(current_user.id)})

    return {"message": "E-mail alterado com sucesso.", "new_email": new_email}