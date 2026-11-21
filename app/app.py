from fastapi import FastAPI

from app.api.router import router as api_router
from app.core.config import get_settings
from app.db.database import create_db_and_tables


def lifespan(app: FastAPI):

  # Startup
  create_db_and_tables()

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

  app.include_router(api_router)

  return app


app = create_app()
