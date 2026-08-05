"use client";
import React, { useState } from "react";
import { Typography, Image } from "antd";

const { Title } = Typography;

interface Props {
  images: string[];
  details?: string;
  productName?: string;
}

const ProductImageDetails: React.FC<Props> = ({
  images,
  details,
  productName = "Product",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="text-gray-500 py-10">No images available</div>;
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden mt-10">
      <div className="md:px-8 px-2 md:py-6 py-1 border-b bg-gray-50">
        <Title level={3}>{productName} – Images</Title>
      </div>

      <div className="md:p-8 p-1">
        <Image
          src={images[currentIndex]}
          alt={productName}
          className="w-full rounded-2xl"
          preview={true}
        />

        {images.length > 1 && (
          <div className="flex gap-4 mt-8 overflow-x-auto pb-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                  i === currentIndex
                    ? "border-blue-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  className="object-cover w-full h-full"
                  preview={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {details && (
        <>
          <div className="h-px bg-gray-100 mx-8" />
          <div className="md:p-8 p-1">
            <Title level={4}>Product Details</Title>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: details }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageDetails;
