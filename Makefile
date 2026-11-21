dev:
	@uv run fastapi dev app/app.py --host 0.0.0.0 --port 8000

db:
	@docker compose up -d

fclean:
	@rm database.db