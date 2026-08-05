
"use client";

import {
  useGetSingleProductQuery,
} from "@/redux/features/dashborad/products/productsApi";
import { Spin, Tabs, App } from "antd";
import { FC, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";

import BasicInformation from "@/components/pages/dashboard/product/Basicinformation";
import PricingInformation from "@/components/pages/dashboard/product/PricingInformation";
import MediaInformation from "@/components/pages/dashboard/product/MediaInformation";
import FAQInformation from "@/components/pages/dashboard/product/FAQInformation";
import VariantsEditor from "@/components/pages/dashboard/product/VariantsEditor";
import BundleOffersEditor from "@/components/pages/dashboard/product/BundleOffersEditor";
import B2BPackagesEditor from "@/components/pages/dashboard/product/B2BPackagesEditor";

export interface Category { id: string; name: string; }
export interface FAQItem { id?: string; question: string; answer: string; }
export interface Variant {
  id: string; sku: string; stock: number; price: number;
  attributes: { color: string; size: string }; coupons: string[];
  productId?: string; createdAt?: string; updatedAt?: string;
}
export interface BundleOffer {
  id: string; quantity: number; discount: number; bundleTag: string;
  productId: string; createdAt: string; updatedAt: string;
}
export interface B2BPackage {
  id: string; quantity: string; price: number; moq?: number;
  maxMOQ?: number; b2bPackageTag?: string; pricePerUnit?: number;
  productId: string; createdAt: string; updatedAt: string;
}
export interface Product {
  storeId: string;
  id: string; productName: string; basePrice: number; discountPrice: number;
  desc?: string; productDetails?: string; productStatus: string;
  categoryId: string; discountStartDate?: string | null; discountEndTime?: string | null;
  searchTag: string[]; isPublished: boolean; productPhoto: string[];
  productFaq: FAQItem[]; Varient: Variant[]; BundleOffer: BundleOffer[]; B2BPackage: B2BPackage[];
}

// ─────────────────────────────────────────────────────────────────────────────

const EditProductContent: FC = () => {
  const params = useParams();
  const id = params.id as string | undefined;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");

  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
    refetch: refetchProduct,
  } = useGetSingleProductQuery(id, { skip: !id });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoryQuery({});

  const categories: Category[] = categoriesData?.result || [];
  const product: Product | undefined = productData?.result?.product;

  if (!id) {
    router.push("/dashboard/all-product");
    return null;
  }

  if (productLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" tip="Loading product and categories data..." />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-red-600 text-xl">Error loading product data or product not found.</p>
      </div>
    );
  }

  const tabItems = [
    {
      key: "basic",
      label: <span className="text-sm font-medium text-gray-700">Basic Information</span>,
      children: (
        <BasicInformation
          product={product}
          productId={id}
          categories={categories}
          onSuccess={() => refetchProduct()}
        />
      ),
    },
    {
      key: "pricing",
      label: <span className="text-sm font-medium text-gray-700">Pricing & Discounts</span>,
      children: (
        <PricingInformation
          product={product}
          productId={id}
          onSuccess={() => refetchProduct()}
        />
      ),
    },
    {
      key: "media",
      label: <span className="text-sm font-medium text-gray-700">Product Images</span>,
      children: (
        <MediaInformation
          product={product}
          productId={id}
          onSuccess={() => refetchProduct()}
        />
      ),
    },
    {
      key: "faq",
      label: <span className="text-sm font-medium text-gray-700">FAQs</span>,
      children: (
        <FAQInformation
          product={product}
          productId={id}
          onSuccess={() => refetchProduct()}
        />
      ),
    },
    {
      key: "variants",
      label: <span className="text-sm font-medium text-gray-700">Variants</span>,
      children: (
        <VariantsEditor
          product={product}
        />
      ),
    },
    {
      key: "bundleOffers",
      label: <span className="text-sm font-medium text-gray-700">Bundle Offers</span>,
      children: (
        <BundleOffersEditor
          product={product}
          productId={id}
          refetchProduct={refetchProduct}
        />
      ),
    },
    {
      key: "b2bPackages",
      label: <span className="text-sm font-medium text-gray-700">B2B Packages</span>,
      children: (
        <B2BPackagesEditor
          product={product}
          productId={id}
          refetchProduct={refetchProduct}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Edit Product</h1>
        <p className="text-gray-600 text-lg mt-1">{product.productName}</p>
      </div>

      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl p-8">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="custom-tabs"
          tabBarStyle={{ borderBottom: "1px solid #e5e7eb" }}
        />
      </div>
    </div>
  );
};

const EditProductPage: FC = () => (
  <App>
    <EditProductContent />
  </App>
);

export default EditProductPage;