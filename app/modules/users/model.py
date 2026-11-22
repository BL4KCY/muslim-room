from datetime import UTC, datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from app.modules.users.types import FullName, JoinMethod, Username

# Validatros


class UserBase(SQLModel):
  picture_url: str | None = None

  fullname: FullName

  username: Username | None = Field(default=None, index=True, unique=True)

  email: EmailStr = Field(index=True, unique=True)

  hashed_password: str | None = None

  is_verified: bool = False

  join_method: JoinMethod


class User(UserBase, table=True):
  id: int | None = Field(None, primary_key=True)

  created_at: datetime = Field(
    default_factory=lambda: datetime.now(UTC),
  )

  updated_at: datetime = Field(
    default_factory=lambda: datetime.now(UTC),
    sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
  )
