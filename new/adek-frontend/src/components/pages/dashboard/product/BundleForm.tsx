/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect } from "react";
import { Form, Input, InputNumber, Button, Card, Popconfirm, App } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface BundleFormProps {
  bundle: any;
  onSave: (data: any) => Promise<void>;
  onDelete: () => void;           // ← NEW
  refetchProduct?: () => void;
}

const BundleForm: FC<BundleFormProps> = ({
  bundle,
  onSave,
  onDelete,
  refetchProduct,
}) => {
  const { message } = App.useApp();   // ← use context-bound message (not static)
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      quantity: bundle.quantity,
      discount: bundle.discount,
      bundleTag: bundle.bundleTag,
    });
  }, [bundle, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
      message.success("Bundle offer updated successfully.");
      refetchProduct?.();
    } catch (error: any) {
      if (error?.data || (error?.message && !error?.errorFields)) {
        message.error(error?.data?.message || "Failed to update bundle offer.");
      }
      console.error(error);
    }
  };

  return (
    <Card
      className="bg-white border border-gray-200 rounded-3xl shadow-sm"
      title={
        <span className="text-gray-900 font-semibold">
          Bundle Offer #{bundle.id}
        </span>
      }
      // ── Delete button in the card header ──────────────────────────────────
      extra={
        <Popconfirm
          title="Delete this bundle offer?"
          description="This action cannot be undone."
          onConfirm={onDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      }
      styles={{ body: { padding: "24px" } }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="quantity"
            label={<span className="font-semibold text-gray-700">Quantity</span>}
            rules={[{ required: true, message: "Quantity is required" }]}
          >
            <InputNumber
              min={0}
              size="large"
              className="w-full rounded-2xl"
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            name="discount"
            label={<span className="font-semibold text-gray-700">Discount (%)</span>}
            rules={[{ required: true, message: "Discount is required" }]}
          >
            <InputNumber
              min={0}
              max={100}
              size="large"
              className="w-full rounded-2xl"
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="bundleTag"
          label={<span className="font-semibold text-gray-700">Bundle Tag</span>}
          rules={[{ required: true, message: "Bundle tag is required" }]}
        >
          <Input
            size="large"
            placeholder="E.g., Buy 2 Get 10% Off"
            className="rounded-2xl"
          />
        </Form.Item>

        <Button
          type="primary"
          onClick={handleSave}
          size="large"
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Save Bundle Offer
        </Button>
      </Form>
    </Card>
  );
};

export default BundleForm;