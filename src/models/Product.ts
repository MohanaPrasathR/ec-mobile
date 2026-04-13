import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  category: string;
  specs: {
    ram?: string;
    storage?: string;
    battery?: string;
    camera?: string;
    display?: string;
  };
  rating: number;
  stock: number;
  createdAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Smartphones' },
    specs: {
      ram: { type: String, default: '8GB' },
      storage: { type: String, default: '128GB' },
      battery: { type: String, default: '4500 mAh' },
      camera: { type: String, default: '50 MP' },
      display: { type: String, default: '6.5" OLED' },
    },
    rating: { type: Number, default: 4.5 },
    stock: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
