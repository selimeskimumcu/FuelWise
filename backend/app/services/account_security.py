import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password, hash_password_reset_secret
from app.models import PasswordReset, RefreshToken, User
from app.services.email import send_verification_email


VALID_ACTIONS = {"change_password", "delete_account"}


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def request_action_code(db: Session, user: User, action: str) -> None:
    if action not in VALID_ACTIONS:
        raise ValueError("Invalid account action")
    settings = get_settings()
    now = datetime.now(timezone.utc)
    latest = db.scalar(
        select(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.purpose == action)
        .order_by(PasswordReset.created_at.desc())
        .limit(1)
    )
    if latest and now - _aware(latest.created_at) < timedelta(seconds=settings.password_reset_request_cooldown_seconds):
        return
    db.execute(
        update(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.purpose == action, PasswordReset.used_at.is_(None))
        .values(used_at=now)
    )
    code = f"{secrets.randbelow(1_000_000):06d}"
    verification = PasswordReset(
        user_id=user.id,
        purpose=action,
        code_hash=hash_password_reset_secret(code),
        expires_at=now + timedelta(minutes=settings.password_reset_code_minutes),
        created_at=now,
    )
    db.add(verification)
    db.commit()
    try:
        send_verification_email(user.email, code, action)
    except Exception:
        verification.used_at = now
        db.commit()
        raise


def verify_action_code(db: Session, user: User, action: str, code: str) -> str | None:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    verification = db.scalar(
        select(PasswordReset)
        .where(
            PasswordReset.user_id == user.id,
            PasswordReset.purpose == action,
            PasswordReset.used_at.is_(None),
        )
        .order_by(PasswordReset.created_at.desc())
        .limit(1)
    )
    if not verification or _aware(verification.expires_at) <= now or verification.attempts >= settings.password_reset_max_attempts:
        return None
    verification.attempts += 1
    if not secrets.compare_digest(verification.code_hash, hash_password_reset_secret(code)):
        if verification.attempts >= settings.password_reset_max_attempts:
            verification.used_at = now
        db.commit()
        return None
    raw_token = secrets.token_urlsafe(48)
    verification.reset_token_hash = hash_password_reset_secret(raw_token)
    verification.verified_at = now
    db.commit()
    return raw_token


def consume_action_token(db: Session, user: User, action: str, raw_token: str) -> PasswordReset | None:
    now = datetime.now(timezone.utc)
    verification = db.scalar(
        select(PasswordReset).where(
            PasswordReset.user_id == user.id,
            PasswordReset.purpose == action,
            PasswordReset.reset_token_hash == hash_password_reset_secret(raw_token),
            PasswordReset.used_at.is_(None),
        )
    )
    if not verification or not verification.verified_at or _aware(verification.expires_at) <= now:
        return None
    verification.used_at = now
    return verification


def change_password(db: Session, user: User, raw_token: str, password: str) -> bool:
    if not consume_action_token(db, user, "change_password", raw_token):
        return False
    now = datetime.now(timezone.utc)
    user.password_hash = hash_password(password)
    db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=now))
    db.commit()
    return True


def delete_account(db: Session, user: User, raw_token: str) -> bool:
    if not consume_action_token(db, user, "delete_account", raw_token):
        return False
    db.delete(user)
    db.commit()
    return True
