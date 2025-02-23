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

export interface RequestObject {
}

export interface LineItemFilters extends RequestObject{
  dates?: DateRange;
  emissionFactor?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
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

export type ReconcileRequest = {
  lineItemId: string;
  scope?: number;
  emissionsFactorId?: string;
  contactId?: string;
}

export type EmissionsFactor = {
  name: string;
  activity_id: string;
};

export type Price = {
  minPrice: number;
  maxPrice: number;
}

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
  xero_contact_id?: string;
  company_id: string;
};

export interface GetContactsRequest extends RequestObject {
  company_id: string;
};

export type CreateContactRequest = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  company_id: string;
};
