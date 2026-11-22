from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import (
  OAuth2AuthorizationCodeBearer,
  OAuth2PasswordBearer,
  SecurityScopes,
)
from jwt.exceptions import InvalidTokenError
from pydantic import EmailStr, ValidationError
from sqlmodel import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.dependences import SessionDep
from app.modules.auth.schema import TokenData
from app.modules.users.model import User
from app.modules.users.schema import UserCreate, UserResponse
from app.modules.users.types import JoinMethod


def get_user_by_email(email: EmailStr, session: SessionDep) -> User:
  statement = select(User).where(User.email == email)
  return session.exec(statement).first()


def get_user_by_username(email: EmailStr, session: SessionDep) -> User:
  statement = select(User).where(User.email == email)
  return session.exec(statement).first()


def check_user_existing(user_create: UserCreate, session: SessionDep):
  # email check
  if get_user_by_email(user_create.email, session):
    raise HTTPException(
      status.HTTP_409_CONFLICT,
      detail=f"email: {user_create.email} already registered",
    )
  # username check
  if get_user_by_username(user_create.username, session):
    raise HTTPException(
      status.HTTP_409_CONFLICT,
      detail=f"username: {user_create.username} already registered",
    )


def create_new_user(
  user_create: UserCreate, session: SessionDep, join_by: JoinMethod
) -> UserResponse:
  is_join_by_pass = join_by == JoinMethod.PASSWORD_OAUTH

  if is_join_by_pass:
    check_user_existing(user_create, session)

  new_userdb = User(
    **user_create.model_dump(exclude={"password"}),
    hashed_password=hash_password(user_create.password) if is_join_by_pass else None,
    is_verified=not is_join_by_pass,
    join_method=join_by,
  )
  session.add(new_userdb)
  session.commit()
  session.refresh(new_userdb)

  return new_userdb


# ****************************| token |****************************#
oauth2_scheme = OAuth2PasswordBearer(
  tokenUrl="/api/v1/auth/token",
  scopes={"me": "Read information about the current user.", "items": "Read items."},
  auto_error=False
)

oauth2_scheme_google = OAuth2AuthorizationCodeBearer(
  authorizationUrl="https://google.com",
  tokenUrl="/api/v1/auth/google/callback",
  scheme_name="Google Login",
  auto_error=False,
)

settings = get_settings()


def get_current_user(
  security_scopes: SecurityScopes,
  token: Annotated[str, Depends(oauth2_scheme)],
  session: SessionDep,
) -> UserResponse:
  if security_scopes.scopes:
    authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
  else:
    authenticate_value = "Bearer"
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": authenticate_value},
  )
  try:
    token_data: TokenData
    pyload = jwt.decode(
      token, settings.secret_key.get_secret_value(), settings.algorithm
    )
    token_data = TokenData(username=pyload.get("sub"), scopes=pyload.get("scopes", []))
    if not token_data.username:
      raise credentials_exception
  except (InvalidTokenError, ValidationError):
    raise credentials_exception  # noqa: B904
  userdb = session.exec(
    select(User).where(User.username == token_data.username)
  ).first()
  if not userdb:
    raise credentials_exception
  for scope in security_scopes.scopes:
    if scope not in token_data.scopes:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not enough permissions",
        headers={"WWW-Authenticate": authenticate_value},
      )
  return userdb
