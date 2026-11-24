import logging
from typing import Annotated

from authlib.integrations.base_client.errors import MismatchingStateError
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.core.oauth import oauth
from app.core.security import create_access_token, hash_password, verify_password
from app.dependences import SessionDep
from app.modules.auth.schema import Token
from app.modules.users.model import User
from app.modules.users.schema import UserCreate
from app.modules.users.service import create_new_user, get_user_by_email
from app.modules.users.types import JoinMethod

credentials_exception = HTTPException(
  status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect username or password"
)

logger = logging.getLogger("auth.oauth")


async def get_token(
  user_form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
) -> None:
  # check if the user exists
  userdb = session.exec(select(User).where(User.username == user_form.username)).first()

  if not userdb:
    verify_password("incorrect", hash_password("correct"))
    raise credentials_exception
  if not verify_password(user_form.password, userdb.hashed_password):
    raise credentials_exception
  return Token(
    access_token=create_access_token(
      {"sub": userdb.username, "scopes": user_form.scopes},
    ),
    token_type="bearer",
  )


async def continue_with_google(request: Request, session: SessionDep) -> Token:
  try:
    google_token = await oauth.google.authorize_access_token(request)
  except MismatchingStateError:
    logger.warning("Google OAuth state mismatch")
    raise HTTPException(  # noqa: B904
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=(
        "The Google login session is invalid or has expired. "
        "Please start the login process again."
      ),
    )
  google_user = google_token["userinfo"]
  email = google_user["email"]
  fullname = f"{google_user['given_name']} {google_user['family_name']}"
  picture_url = google_user["picture"]

  userdb = get_user_by_email(email, session)
  if not userdb:
    userdb = create_new_user(
      user_create=UserCreate(
        username=None,
        email=email,
        password=None,
        fullname=fullname,
        picture_url=picture_url,
      ),
      session=session,
      join_by=JoinMethod.GOOGLE_OAUTH,
    )
  return Token(
    access_token=create_access_token(
      {"sub": userdb.username, "scopes": ["me", "items"]},
    ),
    token_type="bearer",
  )
