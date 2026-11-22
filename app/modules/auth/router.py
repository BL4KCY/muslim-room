from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.core.oauth import oauth
from app.modules.auth.schema import Token
from app.modules.auth.service import continue_with_google, get_token
from app.modules.users.schema import UserResponse
from app.modules.users.service import create_new_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=Token)
async def login(token: Annotated[Token, Depends(get_token)]):
  return token


@router.post("/register", response_model=UserResponse)
async def register(user_response: Annotated[UserResponse, Depends(create_new_user)]):
  return user_response


@router.get("/google")
async def google_auth(request: Request):
  redirect_uri = request.url_for("google_callback")
  return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", response_model=Token, include_in_schema=False)
async def google_callback(token: Annotated[Token, Depends(continue_with_google)]):
  return token
