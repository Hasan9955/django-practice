/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Skeleton } from "antd";
import { useRouter } from "next/navigation";
import PriceDisplay from "@/components/PriceDisplay";

const Moreproduct = ({
  products,
  isLoading,
}: {
  products: any[];
  isLoading: boolean;
}) => {
  const router = useRouter();

  const formatStatus = (status: string = "") => {
    return status
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;

  return (
    <div className="bg-color-pinkf6 mt-16">
      <div className="container mx-auto">
        <h3 className="text-3xl font-semibold text-[#1C1C1C] py-8">
          More products from this store
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-xl transition"
            >
              <div className="relative h-52 overflow-hidden rounded-xl">
                <Image
                  src={product.productPhoto?.[0] || "/placeholder.png"}
                  width={300}
                  height={300}
                  alt={product.productName}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="pt-4">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {product.productName}
                </h3>

                <div className="flex items-center gap-2 my-2">
                  <PriceDisplay
                    basePrice={product.discountPrice}
                    showCode={false}
                    className="text-[#007BFF] font-bold text-2xl"
                  />
                  <PriceDisplay
                    basePrice={product.basePrice}
                    showCode={false}
                    className="line-through text-gray-500"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-md ${
                      product.productStatus === "NewArrival"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {formatStatus(product.productStatus)}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    -
                    {Math.round(
                      ((product.basePrice - product.discountPrice) /
                        product.basePrice) *
                        100,
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Moreproduct;
