import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  specs: {
    display: string;
    processor: string;
    ram: string;
    storage: string;
    battery: string;
    camera: string;
    os: string;
    network?: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true, default: 'Smartphones', index: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 20, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    specs: {
      display: { type: String, required: true },
      processor: { type: String, required: true },
      ram: { type: String, required: true },
      storage: { type: String, required: true },
      battery: { type: String, required: true },
      camera: { type: String, required: true },
      os: { type: String, required: true },
      network: { type: String, default: '5G' }
    },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
);

const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
