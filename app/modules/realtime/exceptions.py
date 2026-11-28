class UnresponsiveConnection(Exception):
  """The client did not send its first (auth) message in time."""

  def __init__(self, message: str = "unresponsive connection"):
    super().__init__(message)


class AuthenticationFailed(Exception):
  """The first message was not a valid auth message with a valid token."""
