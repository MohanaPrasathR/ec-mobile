export interface ISpecification {
  display: string;
  processor: string;
  ram: string;
  storage: string;
  battery: string;
  camera: string;
  os: string;
  network?: string;
  charging?: string;
}

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  specs: ISpecification;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
