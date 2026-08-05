/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import dayjs from "dayjs";

interface CouponFormValues {
  code: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: any;
}

const CouponModal: React.FC<CouponModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  mode,
  initialData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.setFieldsValue({
        code: initialData.code,
        discountType: initialData.discountType,
        discountValue: initialData.discountValue,
        dateRange: [
          dayjs(initialData.validFrom),
          dayjs(initialData.validTill),
        ],
      });
    } else {
      form.resetFields();
    }
  }, [mode, initialData, form]);

  const handleFinish = (values: CouponFormValues) => {
    const { dateRange, ...rest } = values;
    const payload = {
      ...rest,
      validFrom: dateRange[0].toISOString(),
      validTill: dateRange[1].toISOString(),
    };
    onSubmit(payload);
  };

  return (
    <Modal
      title={mode === "edit" ? "Edit Coupon" : "Create Coupon"}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          discountType: "FIXED",
        }}
      >
        <Form.Item
          label="Coupon Code"
          name="code"
          rules={[{ required: true, message: "Please enter coupon code" }]}
        >
          <Input placeholder="e.g. SEPT2025" />
        </Form.Item>

        <Form.Item
          label="Discount Type"
          name="discountType"
          rules={[{ required: true, message: "Please select discount type" }]}
        >
          <Select
            options={[
              { value: "FIXED", label: "Fixed Amount" },
              { value: "PERCENTAGE", label: "Percentage" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Discount Value"
          name="discountValue"
          rules={[{ required: true, message: "Please enter discount value" }]}
        >
          <InputNumber min={1} placeholder="Enter value" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Valid From / Till"
          name="dateRange"
          rules={[{ required: true, message: "Please select validity period" }]}
        >
          <DatePicker.RangePicker
            className="w-full"
            showTime
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CouponModal;
