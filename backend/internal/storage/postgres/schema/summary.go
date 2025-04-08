package schema

import (
	"arenius/internal/models"
	"context"
	"fmt"
	"math"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SummaryRepository struct {
	db *pgxpool.Pool
}

func (r *SummaryRepository) GetEmissionSummary(ctx context.Context, req models.GetSummaryRequest) (*models.GetSummaryResponse, error) {
	const monthlyQuery = `
		SELECT
			COALESCE(SUM(co2), 0) AS total_co2,
			scope,
			DATE_TRUNC('month', date) AS month_start
		FROM line_item
		WHERE
			company_id = $1 AND date BETWEEN $2 AND $3 AND scope IS NOT NULL
		GROUP BY scope, DATE_TRUNC('month', date)
		ORDER BY month_start, scope;
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
		case 0:
			currentSummary.Offsets += co2
		case 1:
			currentSummary.Scopes.ScopeOne += co2
			currentSummary.Emissions += co2
		case 2:
			currentSummary.Scopes.ScopeTwo += co2
			currentSummary.Emissions += co2
		case 3:
			currentSummary.Scopes.ScopeThree += co2
			currentSummary.Emissions += co2
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

	return &models.GetSummaryResponse{
		TotalCO2:  co2Total,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
		Months:    monthSummaries,
	}, nil
}

func (r *SummaryRepository) GetScopeBreakdown(ctx context.Context, req models.GetSummaryRequest) ([]models.NetSummary, error) {
	const monthlyQuery = `
		SELECT
			SUM(co2) AS total_co2,
			scope AS scope      
		FROM line_item
		WHERE company_id = $1
			AND date >= $2 AND date <= $3
			AND scope > 0
			AND co2 IS NOT NULL
		GROUP BY scope
		ORDER BY scope;`

	var summaries []models.NetSummary

	rows, err := r.db.Query(ctx, monthlyQuery, req.CompanyID, req.StartDate, req.EndDate)
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

func (r *SummaryRepository) GetContactEmissions(ctx context.Context, req models.GetSummaryRequest) (*models.GetContactEmissionsSummaryResponse, error) {
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
	var maxEmissionAmount float64
	var sumAllEmissions float64 = 0

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}

		id := fmt.Sprintf("%v", values[0])
		name, _ := values[1].(string)
		totalEmissions, _ := values[2].(float64)

		maxEmissionAmount = max(maxEmissionAmount, totalEmissions)
		sumAllEmissions += totalEmissions

		contacts = append(contacts, models.ContactEmissionsSummary{
			ContactID:   id,
			ContactName: name,
			Carbon:      totalEmissions,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(contacts) == 0 || contacts == nil {
		contacts = []models.ContactEmissionsSummary{} // Ensure it's an empty array
	}

	filteredContacts := []models.ContactEmissionsSummary{
		{
			ContactID:   "Other",
			ContactName: "Other",
			Carbon:      0,
		},
	}
	
	for _, contact := range contacts {
		if contact.Carbon < min(maxEmissionAmount / 10, sumAllEmissions / 30) {
			filteredContacts[0].Carbon += 100 * contact.Carbon / sumAllEmissions
		} else {
			contact.Carbon = math.Round(100 * contact.Carbon / sumAllEmissions)
			filteredContacts = append(filteredContacts, contact)
		}
	}

	filteredContacts[0].Carbon = math.Round(filteredContacts[0].Carbon)

	return &models.GetContactEmissionsSummaryResponse{
		ContactEmissions: filteredContacts,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
	}, nil
}

func (r *SummaryRepository) GetTopEmissions(ctx context.Context, req models.GetSummaryRequest) (*[]models.GetTopEmissionsResponse, error) {
	const query = `
		SELECT 
			ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(co2), 0) DESC) AS rank,
			ef.name,
			COALESCE(SUM(co2), 0) AS total_co2
		FROM 
			line_item join emission_factor ef on line_item.emission_factor_id = ef.activity_id
		WHERE
			company_id = $1
			AND date BETWEEN $2 AND $3
		GROUP BY ef.name
		ORDER BY total_co2 DESC
		LIMIT 5;
	`

	rows, err := r.db.Query(ctx, query, req.CompanyID, req.StartDate.UTC(), req.EndDate.UTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topEmissions []models.GetTopEmissionsResponse

	for rows.Next() {
		var rank int
		var emissionFactor string
		var totalCO2 float64

		if err := rows.Scan(&rank, &emissionFactor, &totalCO2); err != nil {
			return nil, err
		}

		topEmissions = append(topEmissions, models.GetTopEmissionsResponse{
			Rank:           rank,
			EmissionFactor: emissionFactor,
			TotalCO2:       totalCO2,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &topEmissions, nil
}

func NewSummaryRepository(db *pgxpool.Pool) *SummaryRepository {
	return &SummaryRepository{
		db,
	}
}
