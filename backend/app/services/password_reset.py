import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password, hash_password_reset_secret
from app.models import PasswordReset, RefreshToken, User
from app.services.email import send_password_reset_email


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def request_password_reset(db: Session, email: str) -> None:
    settings = get_settings()
    normalized = email.strip().lower()
    user = db.scalar(select(User).where(User.email == normalized, User.is_active.is_(True)))
    if not user:
        return

    now = datetime.now(timezone.utc)
    latest = db.scalar(
        select(PasswordReset).where(PasswordReset.user_id == user.id).order_by(PasswordReset.created_at.desc()).limit(1)
    )
    if latest and now - _aware(latest.created_at) < timedelta(seconds=settings.password_reset_request_cooldown_seconds):
        return

    db.execute(
        update(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.purpose == "password_reset", PasswordReset.used_at.is_(None))
        .values(used_at=now)
    )
    code = f"{secrets.randbelow(1_000_000):06d}"
    reset = PasswordReset(
        user_id=user.id,
        purpose="password_reset",
        code_hash=hash_password_reset_secret(code),
        expires_at=now + timedelta(minutes=settings.password_reset_code_minutes),
        created_at=now,
    )
    db.add(reset)
    db.commit()
    try:
        send_password_reset_email(user.email, code)
    except Exception:
        reset.used_at = now
        db.commit()
        raise


def verify_password_reset_code(db: Session, email: str, code: str) -> str | None:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    reset = db.scalar(
        select(PasswordReset)
        .join(User)
        .where(User.email == email.strip().lower(), PasswordReset.used_at.is_(None), PasswordReset.purpose == "password_reset")
        .order_by(PasswordReset.created_at.desc())
        .limit(1)
    )
    if not reset or _aware(reset.expires_at) <= now or reset.attempts >= settings.password_reset_max_attempts:
        return None
    reset.attempts += 1
    if not secrets.compare_digest(reset.code_hash, hash_password_reset_secret(code)):
        if reset.attempts >= settings.password_reset_max_attempts:
            reset.used_at = now
        db.commit()
        return None
    raw_token = secrets.token_urlsafe(48)
    reset.reset_token_hash = hash_password_reset_secret(raw_token)
    reset.verified_at = now
    db.commit()
    return raw_token


def confirm_password_reset(db: Session, raw_token: str, password: str) -> bool:
    now = datetime.now(timezone.utc)
    reset = db.scalar(
        select(PasswordReset).where(
            PasswordReset.reset_token_hash == hash_password_reset_secret(raw_token),
            PasswordReset.used_at.is_(None),
        )
    )
    if not reset or not reset.verified_at or _aware(reset.expires_at) <= now:
        return False
    reset.user.password_hash = hash_password(password)
    reset.used_at = now
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == reset.user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    db.commit()
    return True
