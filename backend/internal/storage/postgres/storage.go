package storage

import (
	"backend/internal/config"
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository storage of all repositories.
type Repository struct {
	DB *pgxpool.Pool
}

// Closes the pooled connection for cleanup and resource management.
func (r *Repository) Close() error {
	r.DB.Close()
	return nil
}

// Establishes a sustained connection to the PostgreSQL database using pooling.
func ConnectDatabase(ctx context.Context, config config.DB) (*pgxpool.Pool, error) {
	dbConfig, err := pgxpool.ParseConfig(config.Connection())
	if err != nil {
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

func NewRepository(config config.DB) *Repository {
	// db := ConnectDatabase(config)

	return &Repository{
		// DB: db,
		DB: nil,
	}
}
