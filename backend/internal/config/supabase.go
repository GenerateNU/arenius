package config

type Supabase struct {
	URL       string `env:"SUPABASE_URL"`
	Key       string `env:"SUPABASE_ANON_KEY"`
	JWTSecret string `env:"SUPABASE_JWT_SECRET"`
	ProjectID string `env:"SUPABASE_PROJECT_ID"`
}