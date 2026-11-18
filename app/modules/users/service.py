from fastapi import HTTPException, status
from sqlmodel import select
from app.dependences import SessionDep
from app.modules.users.schema import UserCreate
from app.modules.users.model import User
from app.core.security import hash_password

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