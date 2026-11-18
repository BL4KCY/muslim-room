from pydantic import BaseModel, EmailStr, SecretStr

class UserBase(BaseModel):
	username: str
	email: EmailStr

class UserCreate(UserBase):
	password: str

class UserResponse(UserBase):
	id: int

