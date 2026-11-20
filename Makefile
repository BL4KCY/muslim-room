dev:
	@uv run fastapi dev

db:
	@docker compose up -d

fclean:
	@rm database.db