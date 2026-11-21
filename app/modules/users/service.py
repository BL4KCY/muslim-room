from fastapi import HTTPException, status, Depends, Security
from sqlmodel import select
from typing import Annotated
from app.dependences import SessionDep
from app.modules.users.schema import UserCreate, UserResponse
from app.modules.auth.schema import TokenData
from app.modules.users.model import User
from app.core.security import hash_password
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from app.core.config import get_settings
import jwt
from jwt.exceptions import InvalidTokenError

def check_user_existing(user_create: UserCreate, session: SessionDep):
	# email check
	statement = select(User).where(User.email == user_create.email)
	existing_user = session.exec(statement).first()
	if existing_user:
		raise HTTPException(
			status.HTTP_409_CONFLICT,
			detail=f"email: {user_create.email} already registered"
		)
	# username check
	statement = select(User).where(User.username == user_create.username)
	existing_user = session.exec(statement).first()
	if existing_user:
		raise HTTPException(
			status.HTTP_409_CONFLICT,
			detail=f"username: {user_create.username} already registered"
		)

def create_new_user(user_create: UserCreate, session: SessionDep):
	# check if the user already exists
	check_user_existing(user_create, session)
	# create new user in db
	new_userdb = User(
		**user_create.model_dump(exclude={"password"}),
		hashed_password=hash_password(user_create.password),
	)
	session.add(new_userdb)
	session.commit()
	session.refresh(new_userdb)

	return new_userdb

#****************************| token |****************************#
oauth2_scheme = OAuth2PasswordBearer(
	tokenUrl="/api/v1/auth/token",
	scopes={
		"me": "Read information about the current user.",
		"items": "Read items."
	}
)
settings = get_settings()


def get_current_user(
	security_scopes: SecurityScopes,
	token: Annotated[str, Depends(oauth2_scheme)],
	session: SessionDep
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
		pyload = jwt.decode(token, settings.secret_key.get_secret_value(), settings.algorithm)
		token_data = TokenData(
			username=pyload.get('sub'),
			scopes=pyload.get('scopes', [])
		)
		if not token_data.username:
			raise credentials_exception
	except InvalidTokenError:
		raise credentials_exception
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