export type Item = {
  id?: string;
  description: string;
  quantity: number;
  price: number;
  currencyCode: string;
  co2?: number;
  co2Unit?: string;
};
