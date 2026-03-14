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


async def send_password_reset_code(email: EmailStr, code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #F23E02;">Redefinição de Senha</h1>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p style="margin-top: 16px; color: #666;">Este código expira em 15 minutos.</p>
        <p>Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanecerá inalterada.</p>
    </div>
    """

    message = MessageSchema(
        subject="Redefinição de Senha - Seneb",
        recipients=[email], #type: ignore
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_email_change_code(email: EmailStr, code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #013750;">Alteração de E-mail</h1>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para alterar o e-mail da sua conta. Use o código abaixo para confirmar:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p style="margin-top: 16px; color: #666;">Este código expira em 15 minutos.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail e altere sua senha imediatamente.</p>
    </div>
    """

    message = MessageSchema(
        subject="Alteração de E-mail - Seneb",
        recipients=[email], #type: ignore
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_email_confirmation_code(email: EmailStr, code: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #00988D;">Confirme seu novo e-mail</h1>
        <p>Olá,</p>
        <p>Use o código abaixo para confirmar que este é o seu novo endereço de e-mail:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p style="margin-top: 16px; color: #666;">Este código expira em 15 minutos.</p>
        <p>Se você não reconhece esta ação, ignore este e-mail.</p>
    </div>
    """

    message = MessageSchema(
        subject="Confirme seu novo e-mail - Seneb",
        recipients=[email], #type: ignore
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)