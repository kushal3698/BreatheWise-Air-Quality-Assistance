.PHONY: dev-backend dev-frontend lint typecheck test docker-up docker-down

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

lint:
	cd backend && ruff check . && black --check .
	cd frontend && npm run lint

typecheck:
	cd frontend && npx tsc --noEmit

test:
	cd backend && python -m pytest -v tests/
	cd frontend && npm test -- --run

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
