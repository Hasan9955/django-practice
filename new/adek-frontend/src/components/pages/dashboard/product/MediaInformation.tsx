/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useEffect } from "react";
import { Form, Upload, Button, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import { useEditProductMutation } from "@/redux/features/dashborad/products/productsApi";
import type { Product } from "./EditProductPage";

interface MediaInformationProps {
  product: Product;
  productId: string;
  onSuccess: () => void;
}

const MediaInformation: FC<MediaInformationProps> = ({
  product,
  productId,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [updateProduct, { isLoading }] = useEditProductMutation();

  useEffect(() => {
    const fileList: UploadFile[] = (product.productPhoto || []).map(
      (url, index) => ({
        uid: `-existing-${index}`,
        name: `image${index + 1}`,
        status: "done" as const,
        url,
      })
    );
    form.setFieldsValue({ productImage: fileList });
  }, [product, form]);

  const normFile = (e: UploadChangeParam<UploadFile>): UploadFile[] => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const fileList: UploadFile[] = values.productImage || [];

      const existingPhotos = fileList
        .filter((f) => f.url && f.status !== "removed")
        .map((f) => f.url as string);

      const newFiles = fileList.filter(
        (f) => !f.url && f.originFileObj && f.status !== "removed"
      );

      const bodyData = {
        productPhoto: existingPhotos,
        // Preserve existing unchanged fields
        productName: product.productName,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        discountStartDate: product.discountStartDate ?? null,
        discountEndTime: product.discountEndTime ?? null,
        categoryId: product.categoryId,
        desc: product.desc,
        productDetails: product.productDetails,
        productStatus: product.productStatus,
        isPublished: product.isPublished,
        searchTag: product.searchTag,
        productFaq: product.productFaq,
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));
      newFiles.forEach((f) =>
        formData.append("productImage", f.originFileObj as Blob)
      );

      await updateProduct({ productId, formData }).unwrap();
      message.success("Product images updated successfully!");
      onSuccess();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update images.");
    }
  };

  return (
    <div className="space-y-5">
      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-semibold text-gray-700">Upload Images</span>}
          name="productImage"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            name="productImage"
            listType="picture-card"
            multiple
            beforeUpload={() => false}
          >
            <div className="text-center">
              <UploadOutlined style={{ fontSize: "32px" }} className="mb-2" />
              <p className="font-medium text-xs">Click or drag to upload</p>
              <p className="text-[10px] text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </Upload>
        </Form.Item>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="primary"
            onClick={handleSave}
            loading={isLoading}
            size="large"
            className="px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Save Images
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MediaInformation;