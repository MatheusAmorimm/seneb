from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from backend.core.database import db
from backend.models.notification_model import NotificationModel
from backend.core.security import get_current_user
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def prepare_notification(doc):
    if doc:
        if "id" not in doc:
            doc["id"] = str(doc["_id"])
        if "_id" in doc:
            del doc["_id"]
    return doc

@router.get("")
async def get_notifications(current_user = Depends(get_current_user)):
    user_id = str(current_user.id)
    # Lista 50 notificações mais recentes
    notifications = await db.db.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(50).to_list(100)
    return [prepare_notification(n) for n in notifications]

@router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notification_id)
    except:
        obj_id = notification_id

    result = await db.db.notifications.update_one(
        {"_id": obj_id, "user_id": str(current_user.id)},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notificação não encontrada.")
    return {"message": "Notificação marcada como lida."}

@router.post("/{notification_id}/accept-invite")
async def accept_invite(notification_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notification_id)
    except:
        obj_id = notification_id

    # Busca apenas pelo _id. Checamos permissão depois para erro amigável.
    notification = await db.db.notifications.find_one({"_id": obj_id})
    if not notification:
        raise HTTPException(status_code=404, detail=f"Convite não encontrado no servidor. ID: {notification_id}")
        
    if str(notification.get("user_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Você não tem permissão para aceitar este convite.")

    if notification.get("type") != "group_invite":
        raise HTTPException(status_code=400, detail="Esta notificação não é um convite de grupo.")

    meta = notification.get("meta_data", {})
    group_id = meta.get("group_id")
    role = meta.get("role", "guest")

    if not group_id:
        raise HTTPException(status_code=400, detail="Grupo inválido no convite.")

    try:
        group_obj_id = ObjectId(group_id)
    except:
        group_obj_id = group_id

    # Add to group
    new_member = {
        "user_id": str(current_user.id),
        "role": role,
        "joined_at": datetime.now(timezone.utc)
    }

    # Verifica se já está no grupo (para evitar duplicados via race condition)
    group = await db.db.groups.find_one({"_id": group_obj_id})
    if group:
        if any(m["user_id"] == str(current_user.id) for m in group.get("members", [])):
            # Já está no grupo, apenas marca como lida
            pass
        else:
            await db.db.groups.update_one(
                {"_id": group_obj_id},
                {"$push": {"members": new_member}}
            )
            
            # Notifica o dono do grupo
            owner_id = group.get("owner_id")
            if owner_id:
                await db.db.notifications.insert_one({
                    "user_id": owner_id,
                    "title": "Convite Aceito",
                    "message": f"Um usuário acabou de ingressar no seu grupo '{group.get('name', 'Compartilhado')}'.",
                    "type": "info",
                    "read": False,
                    "created_at": datetime.now(timezone.utc)
                })

    # Marca invite como lido
    await db.db.notifications.update_one(
        {"_id": obj_id},
        {"$set": {"read": True}}
    )

    return {"message": "Convite aceito e grupo integrado com sucesso!"}

@router.post("/{notification_id}/reject-invite")
async def reject_invite(notification_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notification_id)
    except:
        obj_id = notification_id

    notification = await db.db.notifications.find_one({"_id": obj_id})
    if not notification:
        raise HTTPException(status_code=404, detail="Convite não encontrado.")
        
    if str(notification.get("user_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Você não tem permissão para recusar este convite.")

    await db.db.notifications.update_one(
        {"_id": obj_id},
        {"$set": {"read": True}}
    )
        
    return {"message": "Convite recusado e descartado."}
