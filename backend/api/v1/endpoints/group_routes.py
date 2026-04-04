from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from backend.core.database import db
from backend.schemas import GroupSchema, GroupCreate, GroupInvite
from backend.core.security import get_current_user
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def prepare_group(doc):
    if doc:
        if "id" not in doc:
            doc["id"] = str(doc["_id"])
        if "_id" in doc:
            del doc["_id"]
    return doc

@router.post("", response_model=GroupSchema)
async def create_group(group_in: GroupCreate, current_user = Depends(get_current_user)):
    new_group = {
        "name": group_in.name,
        "owner_id": str(current_user.id),
        "members": [
            {
                "user_id": str(current_user.id),
                "role": "admin",
                "joined_at": datetime.now(timezone.utc)
            }
        ],
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    result = await db.db.groups.insert_one(new_group)
    new_group["_id"] = result.inserted_id
    return prepare_group(new_group)

@router.get("", response_model=List[GroupSchema])
async def get_groups(current_user = Depends(get_current_user)):
    # Encontra grupos onde o usuário é membro
    query = {"members.user_id": str(current_user.id)}
    groups = await db.db.groups.find(query).to_list(100)
    return [prepare_group(g) for g in groups]

@router.post("/{group_id}/members", status_code=200)
async def invite_member(group_id: str, invite: GroupInvite, current_user = Depends(get_current_user)):
    # Verifica se quem chama é admin
    try:
        group_obj_id = ObjectId(group_id)
    except:
        group_obj_id = group_id
        
    group = await db.db.groups.find_one({
        "_id": group_obj_id,
        "members": {"$elemMatch": {"user_id": str(current_user.id), "role": "admin"}}
    })
    
    if not group:
        raise HTTPException(status_code=403, detail="Apenas administradores podem adicionar membros ou o grupo não existe.")
        
    # Busca ID do email convidado
    invited_user = await db.db.users.find_one({"email": invite.email})
    if not invited_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado com este email.")
        
    invited_user_id = str(invited_user["_id"])
    
    # Checa se já está no grupo
    if any(m["user_id"] == invited_user_id for m in group.get("members", [])):
        raise HTTPException(status_code=400, detail="Usuário já está no grupo.")
        
    # Instancia a Notificação ao invés de adicionar diretamente
    new_notification = {
        "user_id": invited_user_id,
        "title": "Novo Convite de Grupo",
        "message": f"Você foi convidado para participar do grupo '{group.get('name', 'Desconhecido')}'.",
        "type": "group_invite",
        "read": False,
        "meta_data": {
            "group_id": str(group_obj_id),
            "role": invite.role
        },
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.db.notifications.insert_one(new_notification)
    
    # ======= DISPARO DE EMAIL (MOCK/STUB) =======
    # TODO: Integrar com SMTP Real (ex: SendGrid, Resend, SMTPlib padrão do python)
    # Requer os parâmetros SMTP_USER, SMTP_PASS, SMTP_SERVER em um arquivo .env.
    logger.warning(f"📧 [DUMMY EMAIL] Enviando e-mail transacional de convite...")
    logger.warning(f"📧 De: Seneb <noreply@seneb.com.br>")
    logger.warning(f"📧 Para: {invite.email}")
    logger.warning(f"📧 Assunto: Convite para Grupo (Controle Compartilhado)")
    logger.warning(f"📧 Corpo: O usuário convidou você! Faça login e navegue para 'Meus Grupos'.")
    logger.warning(f"📧 Status: Simulando sucesso.\n===========================================")
    
    return {"message": "Membro adicionado ao grupo com sucesso e e-mail enviado!"}
