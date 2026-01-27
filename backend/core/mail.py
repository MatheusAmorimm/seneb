from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, SecretStr
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=SecretStr(os.getenv("MAIL_PASSWORD", "")), 
    MAIL_FROM=os.getenv("MAIL_FROM", ""),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_verification_code(email: EmailStr, code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #00988D;">Seu Código de Verificação</h1>
        <p>Olá,</p>
        <p>Use o código abaixo para validar seu cadastro:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p>Se você não solicitou este código, ignore este e-mail.</p>
    </div>
    """

    message = MessageSchema(
        subject="Código de Verificação - Controle Financeiro",
        recipients=[email], #type: ignore
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)