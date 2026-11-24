from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from app.api.router import router as api_router
from app.core.config import get_settings


def lifespan(app: FastAPI):
  # Startup


  yield
  # Shutdown


def create_app():
  settings = get_settings()

  app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
  )

  app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    same_site="lax",
    https_only=False,  # False for local develepment
  )

  app.include_router(api_router)

  return app


app = create_app()
