from dataclasses import dataclass, field
from typing import Protocol


class AccessChecker(Protocol):
  """Answers one question: may this user view this room?"""

  async def can_view(self, user_id: int, room: str) -> bool: ...


@dataclass
class FakePlaylist:
  owner_id: int
  is_public: bool
  invited: set[int] = field(default_factory=set)


def _default_playlists() -> dict[int, FakePlaylist]:
  # Pretend ids: 1 = alice, 2 = bob, 3 = carol.
  return {
    1: FakePlaylist(owner_id=1, is_public=True),
    2: FakePlaylist(owner_id=1, is_public=False, invited={3}),
    3: FakePlaylist(owner_id=2, is_public=False),
  }


class FakeAccessChecker:
  """In-memory rules, used until the real playlist/event lookups exist."""

  def __init__(self, playlists: dict[int, FakePlaylist] | None = None):
    self.playlists = _default_playlists() if playlists is None else playlists

  async def can_view(self, user_id: int, room: str) -> bool:
    kind, _, ident = room.partition(":")
    # Deny by default: only "playlist:<number>" is understood for now.
    if kind != "playlist" or not ident.isdigit():
      return False
    playlist = self.playlists.get(int(ident))
    if playlist is None:
      return False
    return (
      playlist.is_public or user_id == playlist.owner_id or user_id in playlist.invited
    )


_checker = FakeAccessChecker()


def get_access_checker() -> AccessChecker:
  # The one place to change when the real (HTTP) checker arrives.
  return _checker
