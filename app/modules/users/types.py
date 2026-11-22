from enum import StrEnum
from typing import Annotated

from pydantic import Field

Username = Annotated[str, Field(pattern=r"^^[a-zA-Z][a-zA-Z0-9_]{2,19}$")]

FullName = Annotated[
  str, Field(pattern=r"^[a-zA-Z]{2,30}(?:[ '-][a-zA-Z]{2,30}){1,4}$")
]


class JoinMethod(StrEnum):
  PASSWORD_OAUTH = "password"

  GOOGLE_OAUTH = "google"

  DISCORD_OAUTH = "discord"

  MICROSOFT_OAUTH = "microsoft"

  FACEBOOK_OAUTH = "facebook"

  GITHUB_OAUTH = "github"
