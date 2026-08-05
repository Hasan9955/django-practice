/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useEffect } from "react";
import { Form, Input, Select, Switch, Button, App } from "antd";
import TiptapEditor from "@/components/shared/TiptapEditor";
import { useEditProductMutation } from "@/redux/features/dashborad/products/productsApi";
import type { Product, Category } from "./EditProductPage";

const { Option } = Select;

interface BasicInformationProps {
  product: Product;
  productId: string;
  categories: Category[];
  onSuccess: () => void;
}

interface BasicFormValues {
  productName: string;
  categoryId: string;
  desc: string;
  productDetails: string;
  productStatus: string;
  isPublished: boolean;
  searchTag: string[];
}

const BasicInformation: FC<BasicInformationProps> = ({
  product,
  productId,
  categories,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<BasicFormValues>();
  const [updateProduct, { isLoading }] = useEditProductMutation();

  const descriptionContent = Form.useWatch("desc", form) ?? "";
  const detailsContent = Form.useWatch("productDetails", form) ?? "";

  useEffect(() => {
    form.setFieldsValue({
      productName: product.productName,
      categoryId: product.categoryId,
      desc: product.desc || "",
      productDetails: product.productDetails || "",
      productStatus: product.productStatus,
      isPublished: product.isPublished,
      searchTag: product.searchTag || [],
    });
  }, [product, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const bodyData = {
        productName: values.productName,
        categoryId: values.categoryId,
        desc: values.desc,
        productDetails: values.productDetails,
        productStatus: values.productStatus,
        isPublished: values.isPublished,
        searchTag: values.searchTag || [],
        // Preserve existing unchanged fields
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        discountStartDate: product.discountStartDate ?? null,
        discountEndTime: product.discountEndTime ?? null,
        productFaq: product.productFaq,
        productPhoto: product.productPhoto,
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      await updateProduct({ productId, formData }).unwrap();
      message.success("Basic information updated successfully!");
      onSuccess();
    } catch (error: any) {
      if (error?.errorFields?.length) {
        message.error(`Please fix ${error.errorFields.length} field error(s).`);
      } else {
        message.error(error?.data?.message || "Failed to update basic information.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <Form form={form} layout="vertical">
        {/* Product Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label={<span className="font-semibold text-gray-700">Product Name</span>}
            name="productName"
            rules={[{ required: true, message: "Please input product name" }]}
          >
            <Input placeholder="Enter product name" className="rounded-2xl" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-gray-700">Category</span>}
            name="categoryId"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select size="large" placeholder="Select category" className="rounded-2xl">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item
          label={<span className="font-semibold text-gray-700">Description</span>}
          required
          validateStatus={form.getFieldError("desc")?.length ? "error" : ""}
          help={form.getFieldError("desc")?.[0]}
        >
          <Form.Item
            name="desc"
            noStyle
            rules={[{
              validator: (_, value) =>
                value && value !== "<p></p>" && value.trim() !== ""
                  ? Promise.resolve()
                  : Promise.reject(new Error("Please input product description")),
            }]}
          >
            <input type="hidden" />
          </Form.Item>
          <TiptapEditor
            content={descriptionContent}
            onChange={(html) => {
              form.setFieldsValue({ desc: html });
              form.validateFields(["desc"]).catch(() => {});
            }}
            placeholder="Enter product description..."
          />
        </Form.Item>

        {/* Product Details */}
        <Form.Item
          label={<span className="font-semibold text-gray-700">Product Details</span>}
        >
          <Form.Item name="productDetails" noStyle>
            <input type="hidden" />
          </Form.Item>
          <TiptapEditor
            content={detailsContent}
            onChange={(html) => form.setFieldsValue({ productDetails: html })}
            placeholder="Enter detailed product information..."
          />
        </Form.Item>

        {/* Status & Published */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label={<span className="font-semibold text-gray-700">Status</span>}
            name="productStatus"
            rules={[{ required: true, message: "Please select product status" }]}
          >
            <Select size="large" placeholder="Select status" className="rounded-2xl">
              <Option value="NewArrival">New Arrival</Option>
              <Option value="InStock">In Stock</Option>
              <Option value="OutOfStock">Out of Stock</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-gray-700">Published</span>}
            name="isPublished"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        {/* Search Tags */}
        <Form.Item
          label={<span className="font-semibold text-gray-700">Search Tags</span>}
          name="searchTag"
        >
          <Select
            mode="tags"
            size="large"
            placeholder="Add tags to improve discoverability"
            className="rounded-2xl"
          />
        </Form.Item>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="primary"
            onClick={handleSave}
            loading={isLoading}
            size="large"
            className="px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Save Basic Information
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BasicInformation;