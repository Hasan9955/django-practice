/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Steps,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Tag,
  Spin,
} from "antd";
import {
  DollarOutlined,
  BankOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  GlobalOutlined,
  SendOutlined,
  LoadingOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  useGetSllerTotalEarningsQuery,
  useSellerWithdrawalRequestMutation,
} from "@/redux/features/payment/paymentApi";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WithdrawFormValues {
  amount: number;
  bankName: string;
  accountNo: string;
  accountName: string;
  sortCode: string; // ← ADDED to match backend contract (see Postman)
}

interface WithdrawResult {
  id: string;
  sellerId: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountName: string;
  sortCode: string; // ← ADDED
  status: string;
  createdAt: string;
}

const STEP_FORM = 0;
const STEP_CONFIRM = 1;
const STEP_SUCCESS = 2;

// ─── Inline styles (unchanged) ───────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "40px 32px",
    maxWidth: 980,
    margin: "0 auto",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: "#ffffff",
    minHeight: "100vh",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0a0a0a",
    letterSpacing: "-0.4px",
    margin: 0,
  },
  pageSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 32,
    display: "block",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "24px 24px 20px",
    boxShadow: "none",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#9ca3af",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 700,
    color: "#0a0a0a",
    letterSpacing: "-1px",
    lineHeight: 1,
  },
  statAccent: {
    color: "#1d6af5",
  },
  accentLine: {
    width: 28,
    height: 3,
    background: "#1d6af5",
    borderRadius: 99,
    marginTop: 14,
  },
  actionCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "22px 28px",
    marginTop: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    boxShadow: "none",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0a0a0a",
    margin: 0,
  },
  actionSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 3,
  },
  withdrawBtn: {
    background: "#1d6af5",
    border: "none",
    borderRadius: 8,
    height: 40,
    padding: "0 20px",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.01em",
    boxShadow: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  divider: {
    margin: "6px 0",
    borderColor: "#f3f4f6",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  confirmLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0a0a0a",
  },
  confirmAmount: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1d6af5",
    letterSpacing: "-0.5px",
  },
  confirmBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "16px 20px",
  },
  refBox: {
    background: "#f0f7ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "14px 18px",
    textAlign: "left" as const,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const SellerPayment: React.FC = () => {
  const [form] = Form.useForm<WithdrawFormValues>();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEP_FORM);
  const [formValues, setFormValues] = useState<WithdrawFormValues | null>(null);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResult | null>(
    null,
  );

  const { data: earningsData, isLoading: earningsLoading } =
    useGetSllerTotalEarningsQuery({});
  const [sellerWithdrawalRequest, { isLoading: withdrawLoading }] =
    useSellerWithdrawalRequestMutation();

  const earnings = earningsData?.result;

  const openModal = () => {
    form.resetFields();
    setStep(STEP_FORM);
    setFormValues(null);
    setWithdrawResult(null);
    setOpen(true);
  };

  const handleNextStep = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setStep(STEP_CONFIRM);
    } catch {
      // validation errors handled by AntD
    }
  };

  const handleConfirm = async () => {
    if (!formValues) return;
    try {
      const res = await sellerWithdrawalRequest(formValues).unwrap(); // ← now sends full payload including sortCode
      setWithdrawResult(res.result);
      toast.success("Withdrawal request submitted successfully!");
      setStep(STEP_SUCCESS);
    } catch (err: any) {
      console.error("Withdrawal failed:", err);
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to submit withdrawal request.";
      toast.error(message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep(STEP_FORM);
      setFormValues(null);
      setWithdrawResult(null);
      form.resetFields();
    }, 300);
  };

  const modalFooter = () => {
    if (step === STEP_FORM) {
      return (
        <Space>
          <Button
            onClick={handleClose}
            style={{ borderRadius: 7, fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleNextStep}
            icon={<ArrowRightOutlined />}
            style={{
              borderRadius: 7,
              background: "#1d6af5",
              border: "none",
              fontWeight: 600,
            }}
          >
            Review Request
          </Button>
        </Space>
      );
    }
    if (step === STEP_CONFIRM) {
      return (
        <Space>
          <Button
            onClick={() => setStep(STEP_FORM)}
            style={{ borderRadius: 7, fontWeight: 500 }}
          >
            Back
          </Button>
          <Button
            type="primary"
            danger
            loading={withdrawLoading}
            onClick={handleConfirm}
            icon={<SendOutlined />}
            style={{ borderRadius: 7, fontWeight: 600 }}
          >
            Confirm Withdrawal
          </Button>
        </Space>
      );
    }
    return (
      <Button
        type="primary"
        onClick={handleClose}
        icon={<CheckCircleOutlined />}
        style={{
          borderRadius: 7,
          background: "#1d6af5",
          border: "none",
          fontWeight: 600,
        }}
      >
        Done
      </Button>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WalletOutlined style={{ color: "#1d6af5", fontSize: 18 }} />
          <span style={styles.pageTitle}>Earnings & Payments</span>
        </div>
        <span style={styles.pageSub}>
          Track your revenue and request withdrawals to your bank account.
        </span>
      </div>

      {/* Stat Cards (unchanged) */}
      <Spin
        spinning={earningsLoading}
        indicator={<LoadingOutlined style={{ color: "#1d6af5" }} />}
      >
        <Row gutter={[16, 16]}>
          {/* USD */}
          <Col xs={24} sm={8}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <GlobalOutlined style={{ color: "#1d6af5" }} />
                Total Earnings (USD)
              </div>
              <div style={styles.statValue}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#6b7280",
                    marginRight: 1,
                  }}
                >
                  $
                </span>
                <span style={styles.statAccent}>
                  {(earnings?.totalEarningsUSD ?? 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div style={styles.accentLine} />
            </div>
          </Col>

          {/* ZAR */}
          <Col xs={24} sm={8}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <DollarOutlined style={{ color: "#0a0a0a" }} />
                Total Earnings (NGN)
              </div>
              <div style={styles.statValue}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#6b7280",
                    marginRight: 1,
                  }}
                >
                 ₦
                </span>
                {(earnings?.totalEarningsZAR ?? 0).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div style={{ ...styles.accentLine, background: "#0a0a0a" }} />
            </div>
          </Col>

          {/* Withdrawals */}
          <Col xs={24} sm={8}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <BankOutlined style={{ color: "#0a0a0a" }} />
                Total Withdrawals
              </div>
              <div style={styles.statValue}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#6b7280",
                    marginRight: 1,
                  }}
                >
                  $
                </span>
                {(earnings?.totalWithdrawals ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div style={{ ...styles.accentLine, background: "#d1d5db" }} />
            </div>
          </Col>
        </Row>
      </Spin>

      {/* Withdraw Action Row (unchanged) */}
      <div style={styles.actionCard}>
        <div>
          <div style={styles.actionTitle}>Ready to withdraw your earnings?</div>
          <div style={styles.actionSub}>
            Submit a bank transfer request — processed within 1–3 business days.
          </div>
        </div>
        <button style={styles.withdrawBtn} onClick={openModal}>
          <BankOutlined />
          Withdraw Funds
        </button>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        title={
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0a0a0a",
              letterSpacing: "-0.2px",
            }}
          >
            <BankOutlined style={{ color: "#1d6af5", marginRight: 8 }} />
            Withdrawal Request
          </span>
        }
        onCancel={handleClose}
        footer={modalFooter()}
        width={500}
        destroyOnHidden
        maskClosable={step === STEP_SUCCESS}
        styles={{
          content: { borderRadius: 12, padding: "28px 28px 20px" },
          header: { paddingBottom: 0, borderBottom: "none" },
          footer: { borderTop: "1px solid #f3f4f6", paddingTop: 16 },
          mask: { backdropFilter: "blur(2px)" },
        }}
      >
        {/* Steps (unchanged) */}
        <Steps
          current={step}
          size="small"
          style={{ margin: "18px 0 26px", fontSize: 12 }}
          items={[
            { title: <span style={{ fontSize: 12 }}>Details</span> },
            { title: <span style={{ fontSize: 12 }}>Review</span> },
            { title: <span style={{ fontSize: 12 }}>Done</span> },
          ]}
        />

        {/* Step 0 — Form */}
        {step === STEP_FORM && (
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="amount"
              label={
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    letterSpacing: "0.03em",
                  }}
                >
                  AMOUNT (USD)
                </span>
              }
              rules={[
                { required: true, message: "Please enter an amount" },
                { type: "number", min: 1, message: "Minimum $1" },
              ]}
            >
              <InputNumber
                prefix={<span style={{ color: "#9ca3af" }}>$</span>}
                style={{ width: "100%", borderRadius: 8 }}
                size="large"
                placeholder="0.00"
                min={1}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="bankName"
                  label={
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        letterSpacing: "0.03em",
                      }}
                    >
                      BANK NAME
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    placeholder="e.g. FNB"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sortCode"
                  label={
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        letterSpacing: "0.03em",
                      }}
                    >
                      SORT CODE
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    placeholder="12-34-56"
                    style={{ borderRadius: 8, fontFamily: "monospace" }}
                    maxLength={8}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="accountName"
                  label={
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        letterSpacing: "0.03em",
                      }}
                    >
                      ACCOUNT HOLDER
                    </span>
                  }
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    placeholder="Full name"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accountNo"
                  label={
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        letterSpacing: "0.03em",
                      }}
                    >
                      ACCOUNT NUMBER
                    </span>
                  }
                  rules={[
                    { required: true, message: "Required" },
                    { pattern: /^\d+$/, message: "Digits only" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="e.g. 124587894514"
                    maxLength={20}
                    style={{ borderRadius: 8, fontFamily: "monospace" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div
              style={{
                background: "#f0f7ff",
                border: "1px solid #bfdbfe",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#1e40af",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowDownOutlined style={{ flexShrink: 0 }} />
              Funds are transferred within 1–3 business days after approval.
            </div>
          </Form>
        )}

        {/* Step 1 — Confirm */}
        {step === STEP_CONFIRM && formValues && (
          <div>
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#92400e",
                marginBottom: 18,
              }}
            >
              Please review your withdrawal details carefully before confirming.
            </div>
            <div style={styles.confirmBox}>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Amount</span>
                <span style={styles.confirmAmount}>
                  ${formValues.amount.toLocaleString()}
                </span>
              </div>
              <Divider style={styles.divider} />
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Bank Name</span>
                <span style={styles.confirmValue}>{formValues.bankName}</span>
              </div>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Sort Code</span>
                <span
                  style={{
                    ...styles.confirmValue,
                    fontFamily: "monospace",
                  }}
                >
                  {formValues.sortCode}
                </span>
              </div>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Account Holder</span>
                <span style={styles.confirmValue}>
                  {formValues.accountName}
                </span>
              </div>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Account Number</span>
                <span
                  style={{
                    ...styles.confirmValue,
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                >
                  {formValues.accountNo}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Success */}
        {step === STEP_SUCCESS && withdrawResult && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                background: "#f0f7ff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 26, color: "#1d6af5" }} />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0a0a0a",
                marginBottom: 4,
              }}
            >
              Request Submitted
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Your withdrawal of{" "}
              <strong style={{ color: "#1d6af5" }}>
                ${withdrawResult.amount}
              </strong>{" "}
              has been sent for review.
            </div>
            <div style={styles.refBox}>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Reference ID</span>
                <Typography.Text
                  copyable
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#1d6af5",
                    fontWeight: 600,
                  }}
                >
                  {withdrawResult.id}
                </Typography.Text>
              </div>
              <Divider style={styles.divider} />
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Status</span>
                <Tag
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#c2410c",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  {withdrawResult.status}
                </Tag>
              </div>
              <div style={styles.confirmRow}>
                <span style={styles.confirmLabel}>Submitted At</span>
                <span style={{ fontSize: 12, color: "#374151" }}>
                  {new Date(withdrawResult.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerPayment;