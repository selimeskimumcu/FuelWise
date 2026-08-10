import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


def send_password_reset_email(recipient: str, code: str) -> None:
    send_verification_email(recipient, code, "password_reset")


def send_verification_email(recipient: str, code: str, purpose: str) -> None:
    settings = get_settings()
    if not settings.smtp_username or not settings.smtp_password:
        raise RuntimeError("SMTP is not configured.")

    message = EmailMessage()
    titles = {"password_reset": "Şifre sıfırlama", "change_password": "Şifre yenileme", "delete_account": "Hesap silme"}
    action = titles.get(purpose, "Hesap doğrulama")
    message["Subject"] = f"FuelWise {action.lower()} kodunuz"
    message["From"] = settings.smtp_from_email
    message["To"] = recipient
    message.set_content(
        f"FuelWise {action.lower()} doğrulama kodunuz: " + code + "\n\n"
        f"Bu kod {settings.password_reset_code_minutes} dakika boyunca geçerlidir. "
        "Bu işlemi siz başlatmadıysanız bu e-postayı yok sayabilirsiniz."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if settings.smtp_starttls:
            smtp.starttls()
        smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)
