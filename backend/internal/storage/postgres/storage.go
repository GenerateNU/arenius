package postgres

import (
	"arenius/internal/config"
	"arenius/internal/storage"

	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Establishes a sustained connection to the PostgreSQL database using pooling.
func ConnectDatabase(ctx context.Context, config config.DB) (*pgxpool.Pool, error) {
	// dbConfig, err := pgxpool.ParseConfig(config.Connection())
	dbConfig, err := pgxpool.ParseConfig("postgresql://postgres:postgres@host.docker.internal:54322/postgres")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
		return nil, err
	}

	conn, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		return nil, err
	}

	err = conn.Ping(ctx)
	if err != nil {
		return nil, err
	}

	log.Print("Connected to database!")
	return conn, nil
}

func NewRepository(ctx context.Context, config config.DB) *storage.Repository {
	db, err := ConnectDatabase(ctx, config)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	return storage.NewRepository(db)
}
