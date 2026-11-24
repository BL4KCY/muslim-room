from pydantic import BaseModel, EmailStr

from app.modules.users.types import FullName, Username


class UserBase(BaseModel):
  picture_url: str | None = None
  fullname: FullName
  username: Username | None = None
  email: EmailStr


class UserCreate(UserBase):
  password: str | None


class UserResponse(UserBase):
  id: int
