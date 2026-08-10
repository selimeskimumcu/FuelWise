from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_refresh_token, hash_password, hash_refresh_token, verify_password
from app.models import RefreshToken, User
from app.schemas.auth import RegisterRequest


def find_user_by_identifier(db: Session, identifier: str) -> User | None:
    normalized = identifier.strip().lower()
    return db.scalar(select(User).where(or_(User.username == normalized, User.email == normalized)))


def create_user(db: Session, payload: RegisterRequest) -> User:
    user = User(
        full_name=payload.full_name,
        username=payload.username,
        email=str(payload.email),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, identifier: str, password: str) -> User | None:
    user = find_user_by_identifier(db, identifier)
    if not user or not user.is_active or not verify_password(password, user.password_hash):
        return None
    return user


def issue_refresh_token(db: Session, user: User) -> str:
    settings = get_settings()
    raw_token = create_refresh_token()
    now = datetime.now(timezone.utc)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_token),
            created_at=now,
            expires_at=now + timedelta(days=settings.refresh_token_days),
        )
    )
    db.commit()
    return raw_token


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[User, str] | None:
    now = datetime.now(timezone.utc)
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(raw_token)))
    expires_at = stored.expires_at if stored else None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not stored or stored.revoked_at or expires_at <= now or not stored.user.is_active:
        return None
    stored.revoked_at = now
    db.commit()
    return stored.user, issue_refresh_token(db, stored.user)


def revoke_refresh_token(db: Session, raw_token: str | None) -> None:
    if not raw_token:
        return
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(raw_token)))
    if stored and not stored.revoked_at:
        stored.revoked_at = datetime.now(timezone.utc)
        db.commit()
