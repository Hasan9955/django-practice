"use client";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { StaticImageData } from "next/image";

interface Product {
  id: number;
  title: string;
  price: number;
  rating: number;
  soldCount: number;
  currency?: string;
  image: string | StaticImageData;
}

const NicheProducts = () => {
  // Sample product data
  const initialProducts: Product[] = [
    {
      id: 1,
      title: "G-shork B343 Indo version",
      price: 16556,
      rating: 5,
      soldCount: 1200,
      currency: "BDT",
      image:
        "https://images.unsplash.com/photo-1761839256601-e768233e25e7?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 2,
      title: "G-shork B344 Pro version",
      price: 18599,
      rating: 4,
      soldCount: 850,
      currency: "BDT",
      image:
        "https://images.unsplash.com/photo-1761833199030-3e2c34a76523?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 3,
      title: "Soundcore Life Q30 Headphones",
      price: 8999,
      rating: 4,
      soldCount: 3200,
      currency: "BDT",
      image:
        "https://plus.unsplash.com/premium_photo-1761298779249-1165dd0f3fb9?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 4,
      title: "Xiaomi Redmi Note 11 Pro",
      price: 32999,
      rating: 5,
      soldCount: 2800,
      currency: "BDT",
      image:
        "https://plus.unsplash.com/premium_photo-1760453184957-b7ae59315880?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 5,
      title: "Casio Edifice Chronograph",
      price: 12500,
      rating: 4,
      soldCount: 650,
      currency: "BDT",
      image:
        "https://plus.unsplash.com/premium_photo-1760602531705-0b6931fc7fbc?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 6,
      title: "OnePlus Buds Z2 Wireless",
      price: 6999,
      rating: 3,
      soldCount: 1800,
      currency: "BDT",
      image:
        "https://plus.unsplash.com/premium_photo-1761795693820-e7428b565dc1?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 7,
      title: "Logitech MX Master 3 Mouse",
      price: 10999,
      rating: 5,
      soldCount: 950,
      currency: "BDT",
      image:
        "https://images.unsplash.com/photo-1761839257845-9283b7d1b933?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 8,
      title: "Samsung Galaxy Tab A8",
      price: 24999,
      rating: 4,
      soldCount: 1200,
      currency: "BDT",
      image:
        "https://images.unsplash.com/photo-1761839256601-e768233e25e7?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 9,
      title: "Amazfit GTS 4 Mini Smartwatch",
      price: 12999,
      rating: 4,
      soldCount: 750,
      currency: "BDT",
      image:
        "https://images.unsplash.com/photo-1761833199030-3e2c34a76523?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
    {
      id: 10,
      title: "Canon EOS M50 Mark II",
      price: 65999,
      rating: 5,
      soldCount: 420,
      currency: "BDT",
      image:
        "https://plus.unsplash.com/premium_photo-1761298779249-1165dd0f3fb9?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    },
  ];

  const [products] = useState<Product[]>(initialProducts);
  const [sortOption, setSortOption] = useState<string>("popular");

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
        return b.soldCount - a.soldCount;
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="mb-4 hidden">
        <label htmlFor="sort" className="mr-2 font-semibold">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const formattedSoldCount =
    product.soldCount >= 1000
      ? `${Math.floor(product.soldCount / 1000)}k+ Sold`
      : `${product.soldCount}+ Sold`;

  const formattedPrice = new Intl.NumberFormat("en-US").format(product.price);

  return (
    <div className="border mt-8 w-[280px] border-gray-200 rounded-[16px] font-nun bg-white p-4">
      <div className="bg-gray-100 flex items-center justify-center">
        <Image
          src={product.image}
          alt=""
          width={245}
          height={165}
          className="rounded-[8px] bg-center bg-cover overflow-hidden  "
        />
      </div>

      <div className="pt-3">
        <h3 className="text-lg font-bold text-gray-900 font-nun mb-1 line-clamp-2">
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < product.rating ? "black" : "#E5E7EB"}
                className="text-black"
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">{formattedSoldCount}</span>
        </div>

        <p className="text-xl font-semibold text-[#007BFF];">
          {product.currency} {formattedPrice}
        </p>
      </div>
    </div>
  );
};

export default NicheProducts;
