from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr, SecretStr

from backend.core.configs import settings

_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=SecretStr(settings.MAIL_PASSWORD),
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def _send(subject: str, recipient: str, html: str) -> None:
    message = MessageSchema(
        subject=subject,
        recipients=[recipient],  # type: ignore[list-item]
        body=html,
        subtype=MessageType.html,
    )
    await FastMail(_conf).send_message(message)


async def send_verification_code(email: EmailStr, code: str) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #00988D;">Seu Código de Verificação</h1>
        <p>Use o código abaixo para validar seu cadastro:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold;
                    text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p>Se você não solicitou este código, ignore este e-mail.</p>
    </div>
    """
    await _send("Código de Verificação - Seneb", email, html)


async def send_password_reset_code(email: EmailStr, code: str) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #F23E02;">Redefinição de Senha</h1>
        <p>Use o código abaixo para redefinir sua senha. Expira em 15 minutos.</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold;
                    text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
    </div>
    """
    await _send("Redefinição de Senha - Seneb", email, html)


async def send_email_change_code(email: EmailStr, code: str) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #013750;">Alteração de E-mail</h1>
        <p>Use o código abaixo para confirmar a alteração. Expira em 30 minutos.</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold;
                    text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p>Se você não solicitou essa alteração, mude sua senha imediatamente.</p>
    </div>
    """
    await _send("Alteração de E-mail - Seneb", email, html)


async def send_group_invite_email(
    recipient_email: str,
    inviter_name: str,
    group_name: str,
) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #013750, #2C6B74); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Seneb<span style="color: #F23E02;">.</span></h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Controle Financeiro</p>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5;">
            <h2 style="color: #013750; margin-top: 0;">Você recebeu um convite!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
                <strong>{inviter_name}</strong> convidou você para participar do grupo
                <strong>"{group_name}"</strong> no Seneb.
            </p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                O Seneb é um aplicativo de controle financeiro que permite gerenciar suas finanças
                pessoais e compartilhar despesas com grupos.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="https://seneb.com.br"
                   style="background: #F23E02; color: white; padding: 14px 32px; border-radius: 8px;
                          text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Criar minha conta grátis
                </a>
            </div>
            <p style="font-size: 13px; color: #888; text-align: center; margin-top: 24px;">
                Após criar sua conta, peça para <strong>{inviter_name}</strong> te reenviar o convite pelo app.
            </p>
        </div>
    </div>
    """
    await _send(f"{inviter_name} te convidou para o Seneb", recipient_email, html)


async def send_email_confirmation_code(email: EmailStr, code: str) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #00988D;">Confirme seu novo e-mail</h1>
        <p>Use o código abaixo para confirmar que este é seu novo endereço. Expira em 30 minutos.</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold;
                    text-align: center; letter-spacing: 5px; border-radius: 8px;">
            {code}
        </div>
        <p>Se você não reconhece esta ação, ignore este e-mail.</p>
    </div>
    """
    await _send("Confirme seu novo e-mail - Seneb", email, html)
