"use client";

import ProductCard, { Product } from "@/components/ui/Card/ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div
      role="list"
      aria-label="Products"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-4"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
