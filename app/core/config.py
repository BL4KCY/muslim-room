from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		case_sensitive=False,
	)

	#Application
	app_name: str = "Muslim Room"
	app_version: str = "1.0.0"
	debug: bool = True
	enviroment: str = "production"

	#Database
	database_url: str = "postgresql://postgres:example@localhost:5432/postgres"
	# database_pool_size: int = 20
	# database_max_overflow: int = 10

	#Authentication
	secret_key: SecretStr
	algorithm: str = "HS256"
	access_token_expaire_mintutes: int = 30
	refresh_token_expaire_days: int  = 7

	# External Services
	redis_url: str = "redis://localhost:6379/0"
	smtp_host: str = "localhost"
	smtp_port: int = 587

	#CORS
	allowed_origins: list[str] = ["http://localhost:8000"]

	@property
	def async_database_url(self):
		return self.database_url.replace(
					"postgresql://", "postgresql+asyncpg://"
		)

@lru_cache
def get_settings() -> Settings:
	return Settings()