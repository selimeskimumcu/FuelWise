from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.core.rate_limit import client_address, enforce_rate_limit
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.auth import AccountActionCodeRequest, AccountActionVerifyRequest, AccountActionVerifyResponse, AccountDeleteRequest, AccountPasswordChangeRequest, AuthResponse, LoginRequest, MessageResponse, PasswordResetConfirmRequest, PasswordResetRequest, PasswordResetVerifyRequest, PasswordResetVerifyResponse, RegisterRequest, UserResponse
from app.services.auth import authenticate_user, create_user, issue_refresh_token, revoke_refresh_token, rotate_refresh_token
from app.services.password_reset import confirm_password_reset, request_password_reset, verify_password_reset_code
from app.services.account_security import change_password, delete_account, request_action_code, verify_action_code


router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookies(response: Response, user: User, refresh_token: str) -> None:
    settings = get_settings()
    common = settings.auth_cookie_options
    response.set_cookie(
        "access_token",
        create_access_token(str(user.id)),
        max_age=settings.access_token_minutes * 60,
        **common,
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        **common,
    )


def clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    options = {
        "path": "/",
        "secure": settings.cookie_secure,
        "httponly": True,
        "samesite": settings.cookie_samesite,
    }
    if settings.cookie_domain:
        options["domain"] = settings.cookie_domain
    response.delete_cookie("access_token", **options)
    response.delete_cookie("refresh_token", **options)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)) -> User:
    enforce_rate_limit("register-ip", client_address(request), 5, 60 * 60)
    existing = db.scalar(select(User).where(or_(User.username == payload.username, User.email == str(payload.email))))
    if existing:
        field = "username" if existing.username == payload.username else "email"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"This {field} is already registered")
    return create_user(db, payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    enforce_rate_limit("login-ip", client_address(request), 20, 5 * 60)
    enforce_rate_limit("login-account", payload.identifier, 10, 5 * 60)
    user = authenticate_user(db, payload.identifier, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password")
    set_auth_cookies(response, user, issue_refresh_token(db, user))
    return AuthResponse(message="Login successful", user=UserResponse.model_validate(user))


@router.post("/refresh", response_model=AuthResponse)
def refresh(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> AuthResponse:
    enforce_rate_limit("refresh-ip", client_address(request), 60, 60)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")
    result = rotate_refresh_token(db, refresh_token)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or expired")
    user, new_refresh_token = result
    set_auth_cookies(response, user, new_refresh_token)
    return AuthResponse(message="Session refreshed", user=UserResponse.model_validate(user))


@router.post("/logout", response_model=MessageResponse)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> MessageResponse:
    revoke_refresh_token(db, refresh_token)
    clear_auth_cookies(response)
    return MessageResponse(message="Logout successful")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/password-reset/request", response_model=MessageResponse)
def password_reset_request(payload: PasswordResetRequest, request: Request, db: Session = Depends(get_db)) -> MessageResponse:
    enforce_rate_limit("password-reset-request-ip", client_address(request), 10, 15 * 60)
    enforce_rate_limit("password-reset-request-account", str(payload.email), 3, 15 * 60)
    try:
        request_password_reset(db, str(payload.email))
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Email service is temporarily unavailable")
    return MessageResponse(message="If this email is registered, a verification code has been sent.")


@router.post("/password-reset/verify", response_model=PasswordResetVerifyResponse)
def password_reset_verify(payload: PasswordResetVerifyRequest, request: Request, db: Session = Depends(get_db)) -> PasswordResetVerifyResponse:
    enforce_rate_limit("password-reset-verify-ip", client_address(request), 30, 10 * 60)
    enforce_rate_limit("password-reset-verify-account", str(payload.email), 5, 10 * 60)
    token = verify_password_reset_code(db, str(payload.email), payload.code)
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The verification code is invalid or expired")
    return PasswordResetVerifyResponse(message="Verification successful", reset_token=token)


@router.post("/password-reset/confirm", response_model=MessageResponse)
def password_reset_confirm(payload: PasswordResetConfirmRequest, response: Response, db: Session = Depends(get_db)) -> MessageResponse:
    if not confirm_password_reset(db, payload.reset_token, payload.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The password reset session is invalid or expired")
    clear_auth_cookies(response)
    return MessageResponse(message="Your password has been changed successfully.")


@router.post("/account/action-code/request", response_model=MessageResponse)
def account_action_code_request(payload: AccountActionCodeRequest, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
    enforce_rate_limit(f"account-code-request-{payload.action}", str(current_user.id), 3, 15 * 60)
    try:
        request_action_code(db, current_user, payload.action)
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Email service is temporarily unavailable")
    return MessageResponse(message="A verification code has been sent to your registered email address.")


@router.post("/account/action-code/verify", response_model=AccountActionVerifyResponse)
def account_action_code_verify(payload: AccountActionVerifyRequest, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AccountActionVerifyResponse:
    enforce_rate_limit(f"account-code-verify-{payload.action}", str(current_user.id), 5, 10 * 60)
    token = verify_action_code(db, current_user, payload.action, payload.code)
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The verification code is invalid or expired")
    return AccountActionVerifyResponse(message="Verification successful", action_token=token)


@router.post("/account/change-password", response_model=MessageResponse)
def account_change_password(payload: AccountPasswordChangeRequest, response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
    if not change_password(db, current_user, payload.action_token, payload.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The verification session is invalid or expired")
    clear_auth_cookies(response)
    return MessageResponse(message="Your password has been changed successfully.")


@router.post("/account/delete", response_model=MessageResponse)
def account_delete(payload: AccountDeleteRequest, response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
    if not delete_account(db, current_user, payload.action_token):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The verification session is invalid or expired")
    clear_auth_cookies(response)
    return MessageResponse(message="Your account has been deleted.")
