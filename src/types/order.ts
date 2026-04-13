import { IProduct } from './product';

export interface IOrderItem {
  product: IProduct | string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IOrder {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
