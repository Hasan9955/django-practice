/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Skeleton, Tabs } from "antd";
import type { TabsProps } from "antd";
import Reviews from "./Reviews";
import Description from "./Description";
import Message from "./Message";
import ProductImageDetails from "./ProductImgdetils";

const ProductTabs: React.FC<{ product: any }> = ({ product }) => {
  if (!product) return <Skeleton active paragraph={{ rows: 10 }} />;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Customer Reviews",
      children: <Reviews reviews={product.Review || []} />,
    },
    {
      key: "2",
      label: "Description",
      children: (
        <>
          <Description description={product.desc || ""} />
          <ProductImageDetails
            images={product.productPhoto || []}
            details={product.productDetails}
            productName={product.productName}
          />
        </>
      ),
    },
    {
      key: "3",
      label: "Store",
      children: <Message storeId={product.storeId} productId={product.id} />,
    },
  ];

  return (
    <div className="mt-12">
      <Tabs defaultActiveKey="1" items={items} size="large" />
    </div>
  );
};

export default ProductTabs;