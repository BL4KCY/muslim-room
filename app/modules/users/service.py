from fastapi import HTTPException, status, Depends
from sqlmodel import select
from typing import Annotated
from app.dependences import SessionDep
from app.modules.users.schema import UserCreate, UserResponse
from app.modules.users.model import User
from app.core.security import hash_password
from fastapi.security import OAuth2PasswordBearer
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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
settings = get_settings()

credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
)

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep) -> UserResponse:
	try:
		pyload = jwt.decode(token, settings.secret_key.get_secret_value(), settings.algorithm)
		username = pyload.get('sub')
		if not username:
			raise credentials_exception
	except InvalidTokenError:
		raise credentials_exception
	userdb = session.exec(
		select(User).where(User.username == username)
	).first()
	if not userdb:
		raise credentials_exception
	return userdb