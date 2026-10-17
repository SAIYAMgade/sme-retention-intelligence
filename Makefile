.PHONY: help install pipeline test backend frontend up down clean

help:
	@echo "SME Retention Intelligence - Automation Commands"
	@echo "  make install    - Install Python and Node dependencies"
	@echo "  make pipeline   - Run end-to-end analytical pipeline (seed=42)"
	@echo "  make test       - Run backend pytest test suite"
	@echo "  make backend    - Start FastAPI backend dev server"
	@echo "  make frontend   - Start Vite frontend dev server"
	@echo "  make build      - Build production frontend bundle"
	@echo "  make up         - Start full docker-compose stack"
	@echo "  make down       - Stop docker-compose stack"

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

pipeline:
	python analytics/run_pipeline.py

test:
	pytest backend/tests -v

backend:
	uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

up:
	docker-compose up --build -d

down:
	docker-compose down
