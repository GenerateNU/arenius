import { DateRange } from "react-day-picker";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_amount: number;
  currency_code: string;
  emission_factor_name?: string;
  scope?: number;
};

export interface LineItemFilters {
  dates?: DateRange;
}

export type CreateLineItemRequest = {
  description: string;
  unit_amount: number;
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

export type EmissionsFactor = {
  name: string;
  activity_id: string;
};

export type EmissionsFactorCategory = {
  name: string;
  emissions_factors: EmissionsFactor[];
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  scope?: string;
};

export type GetContactsRequest = {
  company_id: string;
}
