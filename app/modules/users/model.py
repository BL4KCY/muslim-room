from datetime import UTC, datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
  username: str = Field(index=True)
  email: EmailStr = Field(index=True)
  hashed_password: str


class User(UserBase, table=True):
  id: int | None = Field(None, primary_key=True)
  created_at: datetime = Field(
    default_factory=lambda: datetime.now(UTC),
    sa_column_kwargs={"onupdate": lambda: datetime.now(UTC)},
  )
