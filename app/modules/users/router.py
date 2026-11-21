from fastapi import APIRouter, Depends, Security
from typing import Annotated
from app.modules.users.schema import UserResponse
from app.modules.users.service import get_current_user


router = APIRouter(prefix="/users", tags=["users"])

async def get_current_active_user(
    current_user: Annotated[UserResponse, Security(get_current_user, scopes=["me"])],
):
    return current_user

@router.get("/me", response_model=UserResponse)
def my_profile(current_user: Annotated[UserResponse, Security(get_current_user, scopes=["me"])]) -> UserResponse:
	return current_user

@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[UserResponse, Security(get_current_active_user, scopes=["items"])],
):
    return [{"item_id": "Foo", "owner": current_user.username}]