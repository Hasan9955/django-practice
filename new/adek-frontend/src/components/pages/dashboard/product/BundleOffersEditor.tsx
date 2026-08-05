/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useState } from "react";
import { Form, Button, InputNumber, Input, Card, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import BundleForm from "./BundleForm";
import {
  useUpdateProductBundleOfferMutation,
  useAddBundleOfferMutation,
  useDeleteBundleOfferMutation,
} from "@/redux/features/dashborad/products/productsApi";
import type { Product } from "./EditProductPage";

interface BundleOffersEditorProps {
  product: Product;
  productId: string;
  refetchProduct: () => void;
}

const BundleOffersEditor: FC<BundleOffersEditorProps> = ({
  product,
  productId,
  refetchProduct,
}) => {
  const { message } = App.useApp();
  const [addForm] = Form.useForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [updateBundleOffer] = useUpdateProductBundleOfferMutation();
  const [addBundleOffer]    = useAddBundleOfferMutation();
  const [deleteBundleOffer] = useDeleteBundleOfferMutation();

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      setIsAdding(true);
      await addBundleOffer({ productId, data: values }).unwrap();
      message.success("Bundle offer added successfully!");
      addForm.resetFields();
      setShowAddForm(false);
      refetchProduct();
    } catch (err: any) {
      if (err?.data || (err?.message && !err?.errorFields)) {
        message.error(err?.data?.message || "Failed to add bundle offer.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (bundleOfferId: string | number) => {
    try {
      await deleteBundleOffer(bundleOfferId).unwrap();
      message.success("Bundle offer deleted.");
      refetchProduct();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete bundle offer.");
    }
  };

  return (
    <div className="space-y-5">
      {product.BundleOffer.length === 0 && !showAddForm && (
        <p className="text-gray-500 text-sm italic">
          No bundle offers yet. Click below to add one.
        </p>
      )}

      {product.BundleOffer.map((bundle) => (
        <BundleForm
          key={bundle.id}
          bundle={bundle}
          onSave={(data) =>
            updateBundleOffer({ bundleOfferId: bundle.id, formData: data }).unwrap()
          }
          onDelete={() => handleDelete(bundle.id)}
          refetchProduct={refetchProduct}
        />
      ))}

      {showAddForm && (
        <Card
          className="border border-blue-200 rounded-3xl shadow-sm bg-blue-50/40"
          title={<span className="font-semibold text-blue-700">New Bundle Offer</span>}
          styles={{ body: { padding: "24px" } }}
        >
          <Form form={addForm} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="quantity"
                label={<span className="font-semibold text-gray-700">Quantity</span>}
                rules={[{ required: true, message: "Quantity is required" }]}
              >
                <InputNumber min={1} size="large" className="w-full rounded-2xl" placeholder="e.g. 2" />
              </Form.Item>

              <Form.Item
                name="discount"
                label={<span className="font-semibold text-gray-700">Discount (%)</span>}
                rules={[{ required: true, message: "Discount is required" }]}
              >
                <InputNumber min={0} max={100} size="large" className="w-full rounded-2xl" placeholder="e.g. 10" />
              </Form.Item>
            </div>

            <Form.Item
              name="bundleTag"
              label={<span className="font-semibold text-gray-700">Bundle Tag</span>}
              rules={[{ required: true, message: "Bundle tag is required" }]}
            >
              <Input size="large" placeholder="E.g., Buy 2 Get 10% Off" className="rounded-2xl" />
            </Form.Item>

            <div className="flex gap-3">
              <Button
                type="primary"
                onClick={handleAdd}
                loading={isAdding}
                size="large"
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Add Bundle Offer
              </Button>
              <Button
                onClick={() => { setShowAddForm(false); addForm.resetFields(); }}
                size="large"
                className="rounded-2xl border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {!showAddForm && (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          size="large"
          className="rounded-2xl h-12"
          onClick={() => setShowAddForm(true)}
        >
          Add Bundle Offer
        </Button>
      )}
    </div>
  );
};

export default BundleOffersEditor;