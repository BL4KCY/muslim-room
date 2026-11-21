from typing import Annotated

from fastapi import APIRouter, Depends

from app.modules.auth.schema import Token
from app.modules.auth.service import get_token
from app.modules.users.schema import UserResponse
from app.modules.users.service import create_new_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login(token: Annotated[Token, Depends(get_token)]):
  return token


@router.post("/register", response_model=UserResponse)
async def register(user_response: Annotated[UserResponse, Depends(create_new_user)]):
  return user_response
