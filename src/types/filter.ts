export interface IProductFilter {
  search?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  storage?: string[];
  ram?: string[];
  network?: string[];
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
