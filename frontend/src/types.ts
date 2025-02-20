import { DateRange } from "react-day-picker";

export interface ColumnObject {
}

export type LineItem = ColumnObject & {
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

export type Contact = ColumnObject & {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  xero_contact_id?: string;
  company_id: string;
};

export type GetContactsRequest = {
  company_id: string;
}

export type CreateContactRequest = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  company_id: string;
}