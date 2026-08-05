/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect } from "react";
import { Form, Input, InputNumber, Button, Card, Select, Popconfirm, App } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const B2B_PACKAGE_TAGS = [
  { label: "Small Supply",  value: "SmallSupply"  },
  { label: "Medium Supply", value: "MediumSupply" },
  { label: "Large Supply",  value: "LargeSupply"  },
];

interface B2BPackage {
  id: string | number;
  quantity?: string;
  price?: number;
  moq?: number;
  maxMOQ?: number;
  b2bPackageTag?: string;
  pricePerUnit?: number;
  [key: string]: any;
}

interface B2BPackageFormProps {
  pkg: B2BPackage;
  onSave: (data: any) => Promise<void>;
  onDelete: () => void;             // ← NEW
  refetchProduct?: () => void;
}

const B2BPackageForm: FC<B2BPackageFormProps> = ({
  pkg,
  onSave,
  onDelete,
  refetchProduct,
}) => {
  const { message } = App.useApp();   // ← context-bound, not static
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      quantity:      pkg.quantity,
      price:         pkg.price,
      moq:           pkg.moq,
      maxMOQ:        pkg.maxMOQ,
      b2bPackageTag: pkg.b2bPackageTag,
      pricePerUnit:  pkg.pricePerUnit,
    });
  }, [pkg, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (values.maxMOQ && values.moq && values.maxMOQ < values.moq) {
        message.error("Max MOQ must be greater than or equal to MOQ.");
        return;
      }
      await onSave(values);
      message.success("B2B package updated successfully.");
      refetchProduct?.();
    } catch (error: any) {
      if (error?.data || (error?.message && !error?.errorFields)) {
        message.error(error?.data?.message || "Failed to update B2B package.");
      }
      console.error(error);
    }
  };

  return (
    <Card
      className="bg-white border border-gray-200 rounded-3xl shadow-sm"
      title={
        <span className="text-gray-900 font-semibold">
          B2B Package #{pkg.id}
        </span>
      }
      // ── Delete button in card header ───────────────────────────────────────
      extra={
        <Popconfirm
          title="Delete this B2B package?"
          description="This action cannot be undone."
          onConfirm={onDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <Button danger type="text" icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
      }
      styles={{ body: { padding: "24px" } }}
    >
      <Form form={form} layout="vertical">
        {/* Row 1 */}
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
            <InputNumber
              min={0} size="large" className="w-full rounded-2xl"
              prefix="$" placeholder="0.00"
            />
          </Form.Item>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="moq"
            label={<span className="font-semibold text-gray-700">Min Order Qty (MOQ)</span>}
          >
            <InputNumber min={1} size="large" className="w-full rounded-2xl" placeholder="1" />
          </Form.Item>

          <Form.Item
            name="maxMOQ"
            label={<span className="font-semibold text-gray-700">Max Order Qty</span>}
          >
            <InputNumber min={1} size="large" className="w-full rounded-2xl" placeholder="50" />
          </Form.Item>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ← Select replaces Input for enum safety */}
          <Form.Item
            name="b2bPackageTag"
            label={<span className="font-semibold text-gray-700">Package Tag</span>}
          >
            <Select
              size="large"
              placeholder="Select package type"
              options={B2B_PACKAGE_TAGS}
              className="rounded-2xl"
            />
          </Form.Item>

          <Form.Item
            name="pricePerUnit"
            label={<span className="font-semibold text-gray-700">Price per Unit</span>}
          >
            <InputNumber
              min={0} size="large" className="w-full rounded-2xl"
              prefix="$" placeholder="0.00"
            />
          </Form.Item>
        </div>

        <Button
          type="primary"
          onClick={handleSave}
          size="large"
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Save B2B Package
        </Button>
      </Form>
    </Card>
  );
};

export default B2BPackageForm;