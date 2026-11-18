from app.db.database import get_session
from sqlmodel import Session
from fastapi import Depends
from typing import Annotated


# Session Dependency
SessionDep = Annotated[Session, Depends(get_session)]