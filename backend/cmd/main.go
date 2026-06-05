package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/liannarnold/skysignallab/internal/db"
	"github.com/liannarnold/skysignallab/internal/auth"
	authMiddleware "github.com/liannarnold/skysignallab/internal/middleware"
	"github.com/liannarnold/skysignallab/internal/handlers"
	httpSwagger "github.com/swaggo/http-swagger"
	_ "github.com/liannarnold/skysignallab/docs"
	"github.com/go-chi/cors"
)

// @title           SkySignalLab API
// @version         1.0
// @description     A full-stack SDR companion app for browsing radio signals and tracking live ADS-B aircraft.
// @host            localhost:8080
// @BasePath        /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found — using environment variables")
	}

	// Configure zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// Connect to database
	db.Connect()
	defer db.Close()

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize router
	r := chi.NewRouter()

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Global middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(authMiddleware.RateLimit)
	r.Use(authMiddleware.RequestLogger)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status":"ok"}`)
	})

	// Swagger UI
	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("http://localhost:8080/swagger/doc.json"),
	))

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", auth.Register)
			r.Post("/login", auth.Login)
			r.Post("/logout", auth.Logout)
		})

		// Public routes — no auth required
		r.Route("/signals", func(r chi.Router) {
			r.Get("/", handlers.GetSignals)
			r.Get("/{id}", handlers.GetSignal)
		})

		// Protected routes — require JWT
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireAuth)

			r.Route("/favorites", func(r chi.Router) {
				r.Get("/", handlers.GetFavorites)
				r.Post("/", handlers.AddFavorite)
				r.Delete("/{id}", handlers.RemoveFavorite)
				r.Patch("/{id}", handlers.UpdateFavorite)
			})

			r.Route("/user-signals", func(r chi.Router) {
				r.Get("/", handlers.GetUserSignals)
				r.Post("/", handlers.CreateUserSignal)
				r.Put("/{id}", handlers.UpdateUserSignal)
				r.Delete("/{id}", handlers.DeleteUserSignal)
			})
		})
	})

	// Start server
	log.Info().Str("port", port).Msg("SkySignalLab API starting")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("Server failed to start")
	}
}