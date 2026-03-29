.PHONY: dev dev-frontend dev-backend build build-frontend build-backend clean deploy

# Development - run both frontend and backend
dev:
	@echo "Starting Sprunki Keys development servers..."
	@make dev-backend & make dev-frontend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && go run ./cmd/server/...

# Build
build: build-frontend build-backend

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && go build -o server ./cmd/server/...

# Clean
clean:
	rm -rf frontend/dist backend/server

# Test
test-backend:
	cd backend && go test ./...

test-frontend:
	cd frontend && npm test

# Deploy frontend to Firebase Hosting
deploy: build-frontend
	firebase deploy --only hosting
