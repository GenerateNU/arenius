package storage

import "github.com/jackc/pgx/v5/pgxpool"

// Interfaces for repository layer.

type Repository struct {
	db *pgxpool.Pool
}

func (r *Repository) Close() error {
	r.db.Close()
	return nil
}
