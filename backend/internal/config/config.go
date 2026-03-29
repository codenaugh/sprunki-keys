package config

import "os"

type Config struct {
	Port           string
	FrontendOrigin string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	origin := os.Getenv("FRONTEND_ORIGIN")
	if origin == "" {
		origin = "http://localhost:5173"
	}
	return Config{Port: port, FrontendOrigin: origin}
}
