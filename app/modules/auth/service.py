from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.core.security import create_access_token, hash_password, verify_password
from app.dependences import SessionDep
from app.modules.auth.schema import Token
from app.modules.users.model import User

credentials_exception = HTTPException(
  status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect username or password"
)


def get_token(
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
      {"sub": userdb.username, "uid": userdb.id, "scopes": user_form.scopes},
    ),
    token_type="bearer",
  )
