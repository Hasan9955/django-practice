export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  productName: string;
  basePrice: number;
  avgRating: number;
  totalSale: number;
  productStatus: "NewArrival" | "Featured" | "OutOfStock" | string; // extend as needed
  discountPrice: number;
  productPhoto: string[]; // assuming photo URLs or file paths
  category: Category;
};

export interface CartItem extends Product {
  id: string; // same as Product.id
  productId: string; // reference to Product.id
  name: string; // product name for quick access
  price: number;
  image?: string;
  quantity: number;
  discount?: number;
  product?: Product; // optional full product reference
}
