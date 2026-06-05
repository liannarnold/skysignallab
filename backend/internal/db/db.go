package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

var Pool *pgxpool.Pool

func Connect() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal().Msg("DATABASE_URL is not set")
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to parse database URL")
	}

	// Disable prepared statement cache to avoid conflicts with connection pooler
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	var poolErr error
	Pool, poolErr = pgxpool.NewWithConfig(context.Background(), config)
	if poolErr != nil {
		log.Fatal().Err(poolErr).Msg("Failed to create database connection pool")
	}

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