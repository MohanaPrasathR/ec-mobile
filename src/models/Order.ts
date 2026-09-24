import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderDocument extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, default: 'Default City' },
      postalCode: { type: String, default: '000000' },
      country: { type: String, default: 'India' }
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true }
      }
    ],
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'Cash on delivery (demo)' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
