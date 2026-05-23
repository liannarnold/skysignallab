package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

var Pool *pgxpool.Pool

func Connect() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal().Msg("DATABASE_URL is not set")
	}

	var err error
	Pool, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create database connection pool")
	}

	// Test the connection
	if err := Pool.Ping(context.Background()); err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	log.Info().Msg("Database connected successfully")
}

func Close() {
	if Pool != nil {
		Pool.Close()
		log.Info().Msg("Database connection closed")
	}
}