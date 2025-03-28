package schema

import (
	"arenius/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SummaryRepository struct {
	db *pgxpool.Pool
}

func (r *SummaryRepository) GetGrossSummary(ctx context.Context, req models.GetGrossSummaryRequest) (*models.GetGrossSummaryResponse, error) {
	const monthlyQuery = `
		SELECT
			COALESCE(SUM(co2), 0) AS total_co2,
			scope,
			DATE_TRUNC('month', date) AS month_start
		FROM
			line_item
		WHERE
			company_id = $1
			AND
			date BETWEEN $2 AND $3
			AND 
			scope IS NOT NULL
		GROUP BY
			scope,
			DATE_TRUNC('month', date)
		ORDER BY
			month_start,
			scope;
	`

	rowsMonthly, errMonthly := r.db.Query(ctx, monthlyQuery, req.CompanyID, req.StartDate.UTC(), req.EndDate.UTC())
	if errMonthly != nil {
		return nil, errMonthly
	}
	defer rowsMonthly.Close()

	var monthSummaries []models.MonthSummary

	for rowsMonthly.Next() {
		var co2 float64
		var scope int
		var monthStart time.Time

		if err := rowsMonthly.Scan(&co2, &scope, &monthStart); err != nil {
			return nil, err
		}

		var currentSummary *models.MonthSummary
		if len(monthSummaries) > 0 && monthSummaries[len(monthSummaries)-1].MonthStart == monthStart {
			currentSummary = &monthSummaries[len(monthSummaries)-1]
		} else {
			newSummary := models.MonthSummary{
				MonthStart: monthStart,
				Scopes:     models.ScopeSummary{},
			}
			monthSummaries = append(monthSummaries, newSummary)
			currentSummary = &monthSummaries[len(monthSummaries)-1]
		}

		switch scope {
		case 1:
			currentSummary.Scopes.ScopeOne += co2
		case 2:
			currentSummary.Scopes.ScopeTwo += co2
		case 3:
			currentSummary.Scopes.ScopeThree += co2
		}
	}

	if errMonthlyRows := rowsMonthly.Err(); errMonthlyRows != nil {
		return nil, fmt.Errorf("error iterating over emission factor rows: %w", errMonthlyRows)
	}

	const totalQuery = `
		SELECT
			COALESCE(SUM(co2), 0) AS total_co2
		FROM
			line_item
		WHERE
			company_id = $1
			AND
			date BETWEEN $2 AND $3
			AND
			scope IS NOT NULL;
	`

	rowsTotal, errTotal := r.db.Query(ctx, totalQuery, req.CompanyID, req.StartDate.UTC(), req.EndDate.UTC())
	if errTotal != nil {
		return nil, errTotal
	}
	defer rowsTotal.Close()

	var co2Total float64
	if rowsTotal.Next() {
		if err := rowsTotal.Scan(&co2Total); err != nil {
			return nil, err
		}
	} else {
		co2Total = 0
	}

	if errTotalRows := rowsTotal.Err(); errTotalRows != nil {
		return nil, fmt.Errorf("error iterating over emission factor total rows: %w", errTotalRows)
	}

	return &models.GetGrossSummaryResponse{
		TotalCO2:  co2Total,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
		Months:    monthSummaries,
	}, nil
}

func (r *SummaryRepository) GetNetSummary(ctx context.Context, companyID, startDate, endDate string) ([]models.NetSummary, error) {
	const monthlyQuery = `
		SELECT
			SUM(co2) AS total_co2,
			scope AS scope      
		FROM
			line_item
		WHERE
			company_id = $1
			AND date >= $2
			AND date <= $3
			AND scope IS NOT NULL
			AND co2 IS NOT NULL
		GROUP BY
			scope
		ORDER BY
			scope;`

	var summaries []models.NetSummary

	rows, err := r.db.Query(ctx, monthlyQuery, companyID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var summary models.NetSummary

		if err := rows.Scan(&summary.TotalCO2, &summary.ScopeVal); err != nil {
			return nil, err
		}
		summaries = append(summaries, summary)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return summaries, nil
}

func (r *SummaryRepository) GetContactEmissions(ctx context.Context, req models.GetContactEmissionsSummaryRequest) (*models.GetContactEmissionsSummaryResponse, error) {
	const query = `
		SELECT l.contact_id, name, COALESCE(SUM(co2), 0) AS total_emissions
		FROM line_item l jOIN contact c ON l.contact_id = c.id
		WHERE l.company_id = $1 AND date BETWEEN $2 AND $3
		GROUP BY l.contact_id, name;
	`

	rows, err := r.db.Query(ctx, query, req.CompanyID, req.StartDate.UTC(), req.EndDate.UTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []models.ContactEmissionsSummary

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}

		id := fmt.Sprintf("%v", values[0])
		name, _ := values[1].(string)
		totalEmissions, _ := values[2].(float64)

		contacts = append(contacts, models.ContactEmissionsSummary{
			ContactID:   id,
			ContactName: name,
			Carbon:      totalEmissions,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(contacts) == 0 {
		return nil, fmt.Errorf("no emissions found for company_id: %s", req.CompanyID)
	}

	if contacts == nil {
		contacts = []models.ContactEmissionsSummary{} // Ensure it's an empty array
	}

	return &models.GetContactEmissionsSummaryResponse{
		ContactEmissions: contacts,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
	}, nil
}

func NewSummaryRepository(db *pgxpool.Pool) *SummaryRepository {
	return &SummaryRepository{
		db,
	}
}
