package utils

type Pagination struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}

const (
	defaultPage  int = 1
	defaultLimit int = 10
)

func (p *Pagination) Validate() map[string]string {
	errs := make(map[string]string)

	if p.Page < 1 {
		p.Page = defaultPage
	}

	if p.Limit < 1 {
		p.Limit = defaultLimit
	}

	return errs
}

func (p *Pagination) GetOffset() int {
	return (p.Page - 1) * p.Limit
}