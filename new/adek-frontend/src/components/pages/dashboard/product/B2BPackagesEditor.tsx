/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useState } from "react";
import { Form, Button, InputNumber, Input, Select, Card, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import B2BPackageForm from "./B2BPackageForm";
import {
  useUpdateB2BPackageMutation,
  useAddB2BPackageMutation,
  useDeleteB2BPackageMutation,
} from "@/redux/features/dashborad/products/productsApi";
import type { Product } from "./EditProductPage";

const B2B_PACKAGE_TAGS = [
  { label: "Small Supply",  value: "SmallSupply"  },
  { label: "Medium Supply", value: "MediumSupply" },
  { label: "Large Supply",  value: "LargeSupply"  },
];

interface B2BPackagesEditorProps {
  product: Product;
  productId: string;
  refetchProduct: () => void;
}

const B2BPackagesEditor: FC<B2BPackagesEditorProps> = ({
  product,
  productId,
  refetchProduct,
}) => {
  const { message } = App.useApp();
  const [addForm] = Form.useForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [updateB2BPackage] = useUpdateB2BPackageMutation();
  const [addB2BPackage]    = useAddB2BPackageMutation();
  const [deleteB2BPackage] = useDeleteB2BPackageMutation();

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      if (values.maxMOQ < values.moq) {
        message.error("Max MOQ must be greater than or equal to MOQ.");
        return;
      }
      setIsAdding(true);
      await addB2BPackage({ productId, data: values }).unwrap();
      message.success("B2B package added successfully!");
      addForm.resetFields();
      setShowAddForm(false);
      refetchProduct();
    } catch (err: any) {
      if (err?.data || (err?.message && !err?.errorFields)) {
        message.error(err?.data?.message || "Failed to add B2B package.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (b2bPackageId: string | number) => {
    try {
      await deleteB2BPackage(b2bPackageId).unwrap();
      message.success("B2B package deleted.");
      refetchProduct();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete B2B package.");
    }
  };

  return (
    <div className="space-y-8">
      {product.B2BPackage.length === 0 && !showAddForm && (
        <p className="text-gray-500 text-sm italic">
          No B2B packages yet. Click below to add one.
        </p>
      )}

      {product.B2BPackage.map((pkg) => (
        <B2BPackageForm
          key={pkg.id}
          pkg={pkg}
          onSave={(data) =>
            updateB2BPackage({ b2bPackageId: pkg.id, formData: data }).unwrap()
          }
          onDelete={() => handleDelete(pkg.id)}
          refetchProduct={refetchProduct}
        />
      ))}

      {showAddForm && (
        <Card
          className="border border-blue-200 rounded-3xl shadow-sm bg-blue-50/40"
          title={<span className="font-semibold text-blue-700">New B2B Package</span>}
          styles={{ body: { padding: "24px" } }}
        >
          <Form form={addForm} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="quantity"
                label={<span className="font-semibold text-gray-700">Quantity</span>}
                rules={[{ required: true, message: "Quantity is required" }]}
              >
                <Input size="large" placeholder="E.g., 10 pcs" className="rounded-2xl" />
              </Form.Item>

              <Form.Item
                name="price"
                label={<span className="font-semibold text-gray-700">Price</span>}
                rules={[{ required: true, message: "Price is required" }]}
              >
                <InputNumber min={0} size="large" className="w-full rounded-2xl" prefix="$" placeholder="0.00" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="moq"
                label={<span className="font-semibold text-gray-700">Min Order Qty (MOQ)</span>}
                rules={[{ required: true, message: "MOQ is required" }]}
              >
                <InputNumber min={1} size="large" className="w-full rounded-2xl" placeholder="e.g. 10" />
              </Form.Item>

              <Form.Item
                name="maxMOQ"
                label={<span className="font-semibold text-gray-700">Max Order Qty</span>}
                rules={[{ required: true, message: "Max MOQ is required" }]}
              >
                <InputNumber min={1} size="large" className="w-full rounded-2xl" placeholder="e.g. 500" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="b2bPackageTag"
                label={<span className="font-semibold text-gray-700">Package Tag</span>}
                rules={[{ required: true, message: "Package tag is required" }]}
              >
                <Select size="large" placeholder="Select package type" options={B2B_PACKAGE_TAGS} className="rounded-2xl" />
              </Form.Item>

              <Form.Item
                name="pricePerUnit"
                label={<span className="font-semibold text-gray-700">Price per Unit</span>}
                rules={[{ required: true, message: "Price per unit is required" }]}
              >
                <InputNumber min={0} size="large" className="w-full rounded-2xl" prefix="$" placeholder="0.00" />
              </Form.Item>
            </div>

            <div className="flex gap-3">
              <Button
                type="primary"
                onClick={handleAdd}
                loading={isAdding}
                size="large"
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Add B2B Package
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
          Add B2B Package
        </Button>
      )}
    </div>
  );
};

export default B2BPackagesEditor;