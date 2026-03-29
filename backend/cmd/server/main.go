package main

import (
	"fmt"
	"log"
	"net/http"

	"sprunki-backend/data"
	"sprunki-backend/internal/config"
	"sprunki-backend/internal/handler"
	"sprunki-backend/internal/store"
)

func main() {
	cfg := config.Load()

	levelStore, err := store.NewLevelStore(data.LevelsJSON)
	if err != nil {
		log.Fatalf("failed to load levels: %v", err)
	}
	wordStore, err := store.NewWordStore(data.WordsJSON)
	if err != nil {
		log.Fatalf("failed to load words: %v", err)
	}

	levelHandler := &handler.LevelHandler{Store: levelStore}
	wordHandler := &handler.WordHandler{Store: wordStore}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", handler.HealthHandler)
	mux.HandleFunc("GET /api/levels", levelHandler.GetAll)
	mux.HandleFunc("GET /api/levels/{id}", levelHandler.GetByID)
	mux.HandleFunc("GET /api/words", wordHandler.GetByTier)
	mux.HandleFunc("GET /api/leaderboard/{id}", handler.LeaderboardGetHandler)
	mux.HandleFunc("POST /api/scores", handler.LeaderboardPostHandler)

	corsHandler := corsMiddleware(cfg.FrontendOrigin, mux)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting Sprunki Type API server on %s", addr)
	if err := http.ListenAndServe(addr, corsHandler); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func corsMiddleware(origin string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
