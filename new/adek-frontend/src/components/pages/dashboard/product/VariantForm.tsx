/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  App,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetSellerCouponsQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";

// ── Attribute key suggestions ─────────────────────────────────────────────────
const ATTRIBUTE_KEY_OPTIONS = [
  "color",
  "size",
  "material",
  "weight",
  "dimensions",
  "flavor",
  "scent",
  "style",
];

interface AttributePair {
  id: string;       // local-only key for React list rendering
  key: string;
  value: string;
}

interface Variant {
  id: string | number;
  sku?: string;
  stock?: number;
  price?: number;
  attributes?: Record<string, string>;
  coupons?: string[];   // array of coupon IDs stored on the variant
  [key: string]: any;
}

interface VariantFormProps {
  variant: Variant;
  storeId: string;
  onSave: (data: any) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a flat attributes object → AttributePair[] for local state */
const attrsToLocalPairs = (attrs?: Record<string, string>): AttributePair[] => {
  if (!attrs || Object.keys(attrs).length === 0) {
    return [{ id: `pair_${Date.now()}`, key: "color", value: "" }];
  }
  return Object.entries(attrs).map(([k, v], i) => ({
    id: `pair_${i}_${k}`,
    key: k,
    value: v,
  }));
};

/** Convert AttributePair[] → plain object, dropping pairs with empty keys */
const localPairsToAttrs = (pairs: AttributePair[]): Record<string, string> =>
  pairs.reduce<Record<string, string>>((acc, pair) => {
    const k = pair.key.trim();
    if (k) acc[k] = pair.value;
    return acc;
  }, {});

// ─────────────────────────────────────────────────────────────────────────────

const VariantForm: FC<VariantFormProps> = ({ variant, storeId, onSave }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  // ── Dynamic attribute pairs (managed outside Ant Form) ────────────────────
  const [attrPairs, setAttrPairs] = useState<AttributePair[]>(() =>
    attrsToLocalPairs(variant.attributes)
  );

  // ── Coupon data ───────────────────────────────────────────────────────────
  const {
    data: couponData,
    isLoading: couponsLoading,
  } = useGetSellerCouponsQuery(storeId, { skip: !storeId });

  const coupons: { id: string; code: string }[] =
    couponData?.result?.data ?? [];

  // ── Seed form on variant change ───────────────────────────────────────────
  useEffect(() => {
    form.setFieldsValue({
      sku: variant.sku ?? "",
      stock: variant.stock ?? 0,
      price: variant.price ?? 0,
      // Coupon IDs already stored on the variant — pre-select them
      coupons: variant.coupons ?? [],
    });
    setAttrPairs(attrsToLocalPairs(variant.attributes));
  }, [variant, form]);

  // ── Attribute pair helpers ────────────────────────────────────────────────
  const addPair = () =>
    setAttrPairs((prev) => [
      ...prev,
      { id: `pair_${Date.now()}`, key: "", value: "" },
    ]);

  const removePair = (pairId: string) =>
    setAttrPairs((prev) => prev.filter((p) => p.id !== pairId));

  const updatePair = (
    pairId: string,
    field: "key" | "value",
    val: string
  ) =>
    setAttrPairs((prev) =>
      prev.map((p) => (p.id === pairId ? { ...p, [field]: val } : p))
    );

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Validate at least one attribute pair has a key
      const attrs = localPairsToAttrs(attrPairs);
      if (Object.keys(attrs).length === 0) {
        message.error("Please add at least one attribute with a key.");
        return;
      }

      setIsSaving(true);
      await onSave({ ...values, attributes: attrs });
      message.success("Variant updated successfully.");
    } catch (error: any) {
      // Ant Design validation errors have errorFields — skip toast for those
      if (error?.data || (error?.message && !error?.errorFields)) {
        message.error(error?.data?.message || "Failed to update variant.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Card
      className="bg-white border border-gray-200 rounded-3xl shadow-sm"
      title={
        <span className="text-gray-900 font-semibold">
          Variant #{variant.id}
        </span>
      }
      styles={{ body: { padding: "24px" } }}
    >
      <Form form={form} layout="vertical">

        {/* SKU ──────────────────────────────────────────────────────────── */}
        <Form.Item
          name="sku"
          label={<span className="font-semibold text-gray-700">SKU</span>}
          rules={[{ required: true, message: "Please input SKU" }]}
        >
          <Input size="large" placeholder="E.g. TSHIRT-WHITE-L" className="rounded-2xl" />
        </Form.Item>

        {/* Stock + Price ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="stock"
            label={<span className="font-semibold text-gray-700">Stock</span>}
            rules={[{ required: true, message: "Please input stock" }]}
          >
            <InputNumber
              min={0}
              size="large"
              className="w-full rounded-2xl"
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={<span className="font-semibold text-gray-700">Price</span>}
            rules={[{ required: true, message: "Please input price" }]}
          >
            <InputNumber
              min={0}
              size="large"
              className="w-full rounded-2xl"
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>
        </div>

        {/* Dynamic Attributes ──────────────────────────────────────────── */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-700">
              Attributes
              <span className="ml-2 text-xs font-normal text-gray-400">
                (color, size, material…)
              </span>
            </span>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addPair}
              className="rounded-xl"
            >
              Add Attribute
            </Button>
          </div>

          <div className="space-y-3">
            {attrPairs.map((pair) => (
              <Row key={pair.id} gutter={10} align="middle">
                {/* Key ─────────────────────────────────────────────────── */}
                <Col xs={10} sm={9}>
                  <Select
                    size="large"
                    className="w-full"
                    placeholder="Key"
                    value={pair.key || undefined}
                    onChange={(val) => updatePair(pair.id, "key", val)}
                    showSearch
                    allowClear
                    onClear={() => updatePair(pair.id, "key", "")}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "4px 0" }} />
                        <div className="px-2 pb-1">
                          <Input
                            size="small"
                            placeholder="Custom key…"
                            onPressEnter={(e) => {
                              const val = (
                                e.target as HTMLInputElement
                              ).value.trim();
                              if (val) updatePair(pair.id, "key", val);
                            }}
                          />
                        </div>
                      </>
                    )}
                  >
                    {ATTRIBUTE_KEY_OPTIONS.map((k) => (
                      <Select.Option key={k} value={k}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>

                {/* Value ──────────────────────────────────────────────── */}
                <Col xs={11} sm={12}>
                  <Input
                    size="large"
                    placeholder="Value"
                    value={pair.value}
                    onChange={(e) =>
                      updatePair(pair.id, "value", e.target.value)
                    }
                    className="rounded-2xl"
                  />
                </Col>

                {/* Remove ─────────────────────────────────────────────── */}
                <Col xs={3}>
                  <Button
                    danger
                    size="large"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removePair(pair.id)}
                    disabled={attrPairs.length === 1}
                    className="rounded-2xl"
                  />
                </Col>
              </Row>
            ))}
          </div>
        </div>

        {/* Coupons ─────────────────────────────────────────────────────── */}
        <Form.Item
          name="coupons"
          label={<span className="font-semibold text-gray-700">Coupons</span>}
        >
          {couponsLoading ? (
            <Spin size="small" />
          ) : (
            <Select
              mode="multiple"
              size="large"
              placeholder="Select coupon codes"
              className="rounded-2xl"
              optionFilterProp="label"
              options={coupons.map((c) => ({
                label: c.code,   // shown to the user
                value: c.id,     // stored as the form value
              }))}
            />
          )}
        </Form.Item>

        {/* Save ─────────────────────────────────────────────────────────── */}
        <Button
          type="primary"
          onClick={handleSave}
          loading={isSaving}
          size="large"
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Save Variant
        </Button>
      </Form>
    </Card>
  );
};

export default VariantForm;