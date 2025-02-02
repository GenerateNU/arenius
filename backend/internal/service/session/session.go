package session

import (
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

type SessionStore struct {
	*session.Store
}

func NewSessionStore(config session.Config) *SessionStore {
	store := &SessionStore{
		session.New(config),
	}

	store.RegisterType(uuid.UUID{})
	store.RegisterType(oauth2.Token{})

	return store
}
