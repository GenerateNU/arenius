import { DateRange } from "react-day-picker";

export type LineItem = {
  id: string;
  description: string;
  total_amount: number;
  currency_code: string;
  emission_factor_name?: string;
  emission_factor_id?: string;
  recommended_emission_factor_name?: string;
  recommended_emission_factor_id?: string;
  scope?: number;
  recommended_scope?: number;
  contact_name?: string;
  contact_id?: string;
  co2?: number;
  date: Date;
};

export type GetLineItemResponse = {
  count: number;
  total: number;
  line_items: LineItem[];
};

export interface LineItemFilters {
  dates?: DateRange;
  emissionFactor?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  company_id?: string;
  contact_id?: string;
  scope?: number;
  pageSize?: number;
  pageIndex?: number;
  reconciled?: boolean;
}

export type CreateLineItemRequest = {
  description: string;
  total_amount: number;
  currency_code: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type ReconcileBatchRequest = {
  lineItemIds: string[];
  scope?: number;
  emissionsFactorId?: string;
};

export type ReconcileRequest = {
  lineItemId: string;
  scope?: number;
  emissionsFactorId?: string;
  contactId?: string;
};

export type EmissionsFactor = {
  name: string;
  activity_id: string;
};

export type Price = {
  minPrice: number;
  maxPrice: number;
};

export type EmissionsFactorCategory = {
  name: string;
  emissions_factors: EmissionsFactor[];
};

export type EmissionsFactorCategories = {
  all: EmissionsFactorCategory[];
  favorites: EmissionsFactorCategory;
  history: EmissionsFactorCategory;
};

export type SimpleContact = {
  id: string;
  name: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  xero_contact_id?: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
};

export type GetContactsRequest = {
  company_id: string;
  search_term?: string;
  pageSize?: number;
  pageIndex?: number;
  unpaginated?: boolean;
};

export type GetContactsResponse = {
  total: number;
  count: number;
  contacts: Contact[];
};

export type CreateContactRequest = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  company_id: string;
};

export type ContactEmissions = {
  contact_id: string;
  contact_name: string;
  carbon: number;
};

export type ContactTreeEmissions = {
  contact_emissions: ContactEmissions;
  start_date: Date;
  end_date: Date;
};

export type GetGrossEmissionsRequest = {
  company_id: string;
  start_date: Date;
  end_date: Date;
};

export type ScopeSummary = {
  scope_one: number;
  scope_two: number;
  scope_three: number;
};

export type MonthSummary = {
  month_start: Date;
  scopes: ScopeSummary;
};

export type GrossSummary = {
  total_co2: number;
  start_date: Date;
  end_date: Date;
  months: MonthSummary[];
};

export type NetSummary = {
  start_date: Date;
  end_date: Date;
  months: MonthNetSummary[];
};

export type MonthNetSummary = {
  month_start: Date;
  emissions: number;
  offsets: number;
};

export type ScopeBreakdown = {
  total_co2: number;
  scopes: number;
};

export type GetContactEmissionsRequest = {
  company_id: string;
  contact_id: string;
  start_date: Date;
  end_date: Date;
};

export type CarbonOffset = {
  id: number;
  carbon_amount_kg: number;
  company_id: string;
  source: string;
  purchase_date: Date;
};

export type CreateCarbonOffsetRequest = {
  carbon_amount_kg: number;
  company_id: string;
  source: string;
  purchase_date: Date;
};

export type BatchCreateCarbonOffsetsRequest = {
  carbon_offsets: CreateCarbonOffsetRequest[];
};
