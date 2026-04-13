import { IProduct } from './product';

export interface ICartItem {
  id: string;
  product: IProduct;
  quantity: number;
  selectedStorage?: string;
  selectedColor?: string;
  addedAt: string;
}

export interface ICartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}
