/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/Modal/refund-request-modal.tsx
"use client";

import React from "react";
import { Modal, Form, Input, Button } from "antd";
import type { FormProps } from "antd";
import { useCreateRefundMutation } from "@/redux/features/refund/refundApi";
import toast from "react-hot-toast";
import type { RefundRequest } from "@/types/refund-types";

interface RefundRequestFormValues {
  orderId: string;
  refundReason: string;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the newly created request so parent can update local state */
  onRefundCreated: (newRequest: RefundRequest) => void;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  onRefundCreated,
}: RefundRequestModalProps) {
  const [form] = Form.useForm<RefundRequestFormValues>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createRefund] = useCreateRefundMutation();

  const handleFinish: FormProps<RefundRequestFormValues>["onFinish"] = async (values) => {
    setIsSubmitting(true);

    try {
      const response = await createRefund({
        orderId: values.orderId,
        refundReason: values.refundReason,
      }).unwrap();

      console.log("✅ [CreateRefund] Full API response:", response);

      const newConv = response?.result ?? response;

      // ── FINAL FIX FOR .bg ERROR IN RefundRequestDetail ──
      const newRequest: RefundRequest = {
        id: newConv?.refundId ?? "",
        refundReason: newConv?.refundReason ?? values.refundReason,
        // Both sidebar AND detail now receive a value they recognize
        refundStatus: "PENDING" as RefundRequest["refundStatus"],
        productName: newConv?.productName ?? "",
        productImage: Array.isArray(newConv?.productImage)
          ? newConv.productImage[0] ?? ""
          : (newConv?.productImage ?? ""),
        orderNumber: newConv?.orderNumber ?? "",
        userId: newConv?.sellerId ?? "",
        userName: newConv?.customerName ?? "",
        userAvatar: newConv?.customerImage ?? "",
        createdAt: new Date(),
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unseen: 0,
      };

      if (!newRequest.id) {
        throw new Error("Backend returned empty refundId");
      }

      onRefundCreated(newRequest);
      form.resetFields();
      onClose(); // close only on success

      toast.success("Refund request created successfully.");
    } catch (err: unknown) {
      console.error("❌ [CreateRefund] Full error object:", err);

      let errorMsg = "Failed to create refund request.";
      if (err && typeof err === "object") {
        const e = err as Record<string, any>;
        if (e?.data?.message) errorMsg = e.data.message;
        else if (e?.data?.error) errorMsg = e.data.error;
        else if (e?.error) errorMsg = e.error;
        else if (typeof e?.message === "string") errorMsg = e.message;
      }

      toast.error(errorMsg);
      // modal stays open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={<span className="text-xl font-semibold">Create Refund Request</span>}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      maskClosable={!isSubmitting}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        {/* Order ID */}
        <Form.Item
          label="Order ID *"
          name="orderId"
          rules={[
            { required: true, message: "Order ID is required" },
            {
              pattern: /^[a-f0-9]{24}$/i,
              message: "Order ID must be a valid 24-character hex string",
            },
          ]}
        >
          <Input
            placeholder="e.g. 68e9d04a988270063b8bb9f9"
            disabled={isSubmitting}
            size="large"
          />
        </Form.Item>

        {/* Refund Reason */}
        <Form.Item
          label="Refund Reason *"
          name="refundReason"
          rules={[
            { required: true, message: "Refund reason is required" },
            { min: 10, message: "Refund reason must be at least 10 characters" },
            { max: 500, message: "Refund reason cannot exceed 500 characters" },
          ]}
        >
          <Input.TextArea
            placeholder="Mind changed, wrong size, etc."
            rows={4}
            disabled={isSubmitting}
          />
        </Form.Item>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Refund Request"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}