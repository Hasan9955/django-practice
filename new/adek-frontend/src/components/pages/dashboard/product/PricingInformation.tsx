/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useEffect } from "react";
import { Form, InputNumber, DatePicker, Button, App } from "antd";
import dayjs from "dayjs";
import { useEditProductMutation } from "@/redux/features/dashborad/products/productsApi";
import type { Product } from "./EditProductPage";

interface PricingInformationProps {
  product: Product;
  productId: string;
  onSuccess: () => void;
}

interface PricingFormValues {
  basePrice: number;
  discountPrice: number;
  discountStartDate: dayjs.Dayjs | null;
  discountEndTime: dayjs.Dayjs | null;
}

const PricingInformation: FC<PricingInformationProps> = ({
  product,
  productId,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<PricingFormValues>();
  const [updateProduct, { isLoading }] = useEditProductMutation();

  useEffect(() => {
    form.setFieldsValue({
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
      discountStartDate: product.discountStartDate ? dayjs(product.discountStartDate) : null,
      discountEndTime: product.discountEndTime ? dayjs(product.discountEndTime) : null,
    });
  }, [product, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const bodyData = {
        basePrice: values.basePrice,
        discountPrice: values.discountPrice,
        discountStartDate: values.discountStartDate
          ? values.discountStartDate.toISOString()
          : null,
        discountEndTime: values.discountEndTime
          ? values.discountEndTime.toISOString()
          : null,
        // Preserve existing unchanged fields
        productName: product.productName,
        categoryId: product.categoryId,
        desc: product.desc,
        productDetails: product.productDetails,
        productStatus: product.productStatus,
        isPublished: product.isPublished,
        searchTag: product.searchTag,
        productFaq: product.productFaq,
        productPhoto: product.productPhoto,
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      await updateProduct({ productId, formData }).unwrap();
      message.success("Pricing updated successfully!");
      onSuccess();
    } catch (error: any) {
      if (error?.errorFields?.length) {
        message.error(`Please fix ${error.errorFields.length} field error(s).`);
      } else {
        message.error(error?.data?.message || "Failed to update pricing.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Form.Item
            label={<span className="font-semibold text-gray-700">Base Price</span>}
            name="basePrice"
            rules={[{ required: true, message: "Please input base price" }]}
          >
            <InputNumber
              min={0}
              size="large"
              placeholder="0.00"
              className="w-full"
              prefix="$"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-gray-700">Discount Price</span>}
            name="discountPrice"
            rules={[{ required: true, message: "Please input discount price" }]}
          >
            <InputNumber
              min={0}
              size="large"
              placeholder="0.00"
              className="w-full"
              prefix="$"
            />
          </Form.Item>
        </div>

        <div className="border-t pt-5">
          <h3 className="font-semibold text-base mb-4 text-gray-800">Discount Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Form.Item
              label={<span className="font-semibold text-gray-700">Start Date</span>}
              name="discountStartDate"
            >
              <DatePicker showTime size="large" className="w-full" />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-gray-700">End Date</span>}
              name="discountEndTime"
            >
              <DatePicker showTime size="large" className="w-full" />
            </Form.Item>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="primary"
            onClick={handleSave}
            loading={isLoading}
            size="large"
            className="px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Save Pricing
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PricingInformation;