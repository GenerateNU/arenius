package schema

import (
	"arenius/internal/models"
	"context"
	"time"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SummaryRepository struct {
	db *pgxpool.Pool
}

func (r *SummaryRepository) GetGrossSummary(ctx context.Context, req models.GetGrossSummaryRequest) (*models.GetGrossSummaryResponse, error) {
	const monthlyQuery = `
		SELECT
			SUM(co2) AS total_co2,
			scope,
			DATE_TRUNC('month', date) AS month_start
		FROM
			line_item
		WHERE
			company_id = $1
			AND
			date >= DATE_TRUNC('month', CURRENT_DATE - ($2 - 1) * INTERVAL '1 month')
		GROUP BY
			scope,
			DATE_TRUNC('month', date)
		ORDER BY
			month_start,
			scope;
	`
	
	rowsMonthly, errMonthly := r.db.Query(ctx, monthlyQuery, req.CompanyID, req.MonthDuration)
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
			currentSummary.Scopes.ScopeOne = co2
		case 2:
			currentSummary.Scopes.ScopeTwo = co2
		case 3:
			currentSummary.Scopes.ScopeThree = co2
		}
	}

	if errMonthlyRows := rowsMonthly.Err(); errMonthlyRows != nil {
		return nil, fmt.Errorf("error iterating over emission factor rows: %w", errMonthlyRows)
	}

	const totalQuery = `
		SELECT
			SUM(co2) AS total_co2,
			DATE_TRUNC('month', CURRENT_DATE - ($2 - 1) * INTERVAL '1 month') AS start_date,
			CURRENT_DATE AS end_date
		FROM
			line_item
		WHERE
			company_id = $1
			AND
			date >= DATE_TRUNC('month', CURRENT_DATE - ($2 - 1) * INTERVAL '1 month');
	`

	rowsTotal, errTotal := r.db.Query(ctx, totalQuery, req.CompanyID, req.MonthDuration)
	if errTotal != nil {
		return nil, errTotal
	}
	defer rowsTotal.Close()

	var co2Total float64
	var startDate time.Time
	var endDate time.Time
	if rowsTotal.Next() {
		if err := rowsTotal.Scan(&co2Total, &startDate, &endDate); err != nil {
			return nil, err
		}
	} else {
		co2Total = 0
	}

	if errTotalRows := rowsTotal.Err(); errTotalRows != nil {
		return nil, fmt.Errorf("error iterating over emission factor total rows: %w", errTotalRows)
	}

	return &models.GetGrossSummaryResponse{
		TotalCO2: co2Total,
		StartDate: startDate,
		EndDate: endDate,
		Months: monthSummaries,
	}, nil
}

func NewSummaryRepository(db *pgxpool.Pool) *SummaryRepository {
	return &SummaryRepository{
		db,
	}
}