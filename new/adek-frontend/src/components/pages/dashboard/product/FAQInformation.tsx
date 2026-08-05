/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useEffect } from "react";
import { Form, Input, Button, App } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEditProductMutation } from "@/redux/features/dashborad/products/productsApi";
import type { Product, FAQItem } from "./EditProductPage";

const { TextArea } = Input;

interface FAQInformationProps {
  product: Product;
  productId: string;
  onSuccess: () => void;
}

const FAQInformation: FC<FAQInformationProps> = ({
  product,
  productId,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [updateProduct, { isLoading }] = useEditProductMutation();

  useEffect(() => {
    form.setFieldsValue({ productFaq: product.productFaq || [] });
  }, [product, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const bodyData = {
        productFaq: (values.productFaq || []).map((faq: FAQItem) => ({
          id: faq.id || undefined,
          question: faq.question,
          answer: faq.answer,
        })),
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
        productPhoto: product.productPhoto,
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      await updateProduct({ productId, formData }).unwrap();
      message.success("FAQs updated successfully!");
      onSuccess();
    } catch (error: any) {
      if (error?.errorFields?.length) {
        message.error(`Please fix ${error.errorFields.length} field error(s).`);
      } else {
        message.error(error?.data?.message || "Failed to update FAQs.");
      }
    }
  };

  return (
    <div className="space-y-5">
      <Form form={form} layout="vertical">
        <Form.List name="productFaq">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition-colors mb-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-700">FAQ #{index + 1}</h4>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                      size="small"
                    >
                      Remove
                    </Button>
                  </div>

                  <Form.Item {...field} name={[field.name, "id"]} hidden>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label={<span className="font-semibold text-gray-700">Question</span>}
                    name={[field.name, "question"]}
                    rules={[{ required: true, message: "Please input question" }]}
                    className="mb-4"
                  >
                    <Input placeholder="E.g., What is the material?" size="large" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    label={<span className="font-semibold text-gray-700">Answer</span>}
                    name={[field.name, "answer"]}
                    rules={[{ required: true, message: "Please input answer" }]}
                  >
                    <TextArea rows={3} placeholder="Provide a detailed answer" />
                  </Form.Item>
                </div>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add({ question: "", answer: "" })}
                size="large"
                className="h-10 rounded-lg"
              >
                Add FAQ
              </Button>
            </>
          )}
        </Form.List>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="primary"
            onClick={handleSave}
            loading={isLoading}
            size="large"
            className="px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Save FAQs
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FAQInformation;