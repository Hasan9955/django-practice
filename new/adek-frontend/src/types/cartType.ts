export interface CartData {
  id?: string; // Matches the Redux slice (cart item id)
  productId?: string; // FK reference to Product.id
  name?: string; // mirrors productName
  price?: number; // basePrice or discountPrice
  image?: string; // single main image from productPhoto
  colors?: string[];
  sizes?: string[];
  quantity: number;
  discount?: number;
  delivery?: number;
  product?: Product; // optional full product reference (for richer cart details)
}

export type Category = {
  id?: string;
  name?: string;
};

export type Product = {
  id?: string;
  productName?: string;
  basePrice?: number;
  avgRating?: number;
  totalSale?: number;
  productStatus?: "NewArrival" | "Featured" | "OutOfStock" | string; // extend as needed
  discountPrice?: number;
  productPhoto?: string[]; // array of image URLs or file paths
  category?: Category;
};
