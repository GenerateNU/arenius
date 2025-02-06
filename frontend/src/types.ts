export type Item = {
  id?: string;
  description: string;
  quantity: number;
  unit_amount: number;
  currency_code: string;
  emission_factor_name?: string;
};

export type CreateLineItemRequest = {
  description: string;
  unit_amount: number;
  currency_code: string;
};

export type LoginRequest = {
  email: string; 
  password: string; 
}