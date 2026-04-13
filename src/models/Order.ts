import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  customerName: string;
  email: string;
  address?: string;
  items: IOrderItem[];
  totalAmount: number;
  receiptId: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  createdAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, required: true },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: 'Standard Shipping' },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    receiptId: { type: String, required: true, unique: true },
    status: { type: String, default: 'Processing', enum: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
