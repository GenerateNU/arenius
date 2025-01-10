package postgres

import (
	"arenius/internal/config"
	"arenius/internal/storage"

	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Establishes a sustained connection to the PostgreSQL database using pooling.
func ConnectDatabase(config config.DB) (*pgxpool.Pool, error) {
	dbConfig, err := pgxpool.ParseConfig(config.Connection())
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
		return nil, err
	}

	conn, err := pgxpool.NewWithConfig(context.Background(), dbConfig)
	if err != nil {
		return nil, err
	}

	defer conn.Close()

	err = conn.Ping(context.Background())
	if err != nil {
		return nil, err
	}

	log.Print("Connected to database!")
	return conn, nil
}

func NewRepository(config config.DB) *storage.Repository {
	db, err := ConnectDatabase(config)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	return storage.NewRepository(db)
}
