from pwdlib import PasswordHash
from app.core.config import get_settings
from app.modules.auth.schema import Token
import jwt
from datetime import datetime, timedelta, UTC

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
	return password_hash.hash(password)

def verify_password(
	plain_password: str,
	hashed_password: str
) -> bool:
	return password_hash.verify(
		plain_password,
		hashed_password
	)

def create_access_token(pyload: dict) -> Token:
	settings = get_settings()
	expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expaire_mintutes)
	pyload.update({"exp": expire})
	return jwt.encode(pyload, settings.secret_key.get_secret_value(), settings.algorithm)