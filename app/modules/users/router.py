from fastapi import APIRouter, Depends
from typing import Annotated
from app.modules.users.schema import UserResponse
from app.modules.users.service import get_current_user


router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def my_profile(current_user: Annotated[UserResponse, Depends(get_current_user)]) -> UserResponse:
	return current_user