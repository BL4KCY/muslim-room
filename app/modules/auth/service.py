from fastapi.security import OAuth2PasswordRequestForm
from app.dependences import SessionDep
from sqlmodel import select
from typing import Annotated
from fastapi import Depends, HTTPException, status
from app.modules.users.model import User
from app.core.security import verify_password, hash_password, create_access_token
from app.modules.auth.schema import Token

Incorrect_credentials = HTTPException(
	status_code=status.HTTP_401_UNAUTHORIZED,
	detail="incorrect username or password"
)

def get_token(user_form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep) -> None:
	# check if the user exists
	userdb = session.exec(
		select(User).where(User.username == user_form.username)
	).first()

	if not userdb:
		verify_password("incorrect", hash_password("correct"))
		raise Incorrect_credentials
	if not verify_password(user_form.password, userdb.hashed_password):
		raise Incorrect_credentials
	return Token(
		access_token=create_access_token({"sub": userdb.username,}),
		token_type="bearer"
	)