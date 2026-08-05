import React, { useState } from "react";
import { Card, Tag, Badge, Space, Button, Row, Col, message } from "antd";
import {
  GiftOutlined,
  CalendarOutlined,
  CheckOutlined,
} from "@ant-design/icons";

interface Offer {
  id: string;
  code: string;
  storeId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validFrom: string;
  validTill: string;
  createdAt: string;
  updatedAt: string;
}

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const [isCopied, setIsCopied] = useState(false);

  const isActive = new Date() < new Date(offer.validTill);
  const discountLabel =
    offer.discountType === "PERCENTAGE"
      ? `${offer.discountValue}% OFF`
      : `$${offer.discountValue} OFF`;

  const formattedValidTill = new Date(offer.validTill).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setIsCopied(true);
      message.success("Coupon copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.log(error);
      message.error("Failed to copy code");
    }
  };

  return (
    <Card
      className="offer-card hover:shadow-lg transition-all duration-300"
      bordered={false}
      style={{
        background: isActive
          ? "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)"
          : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        border: isActive ? "2px solid #1890ff" : "1px solid #d9d9d9",
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Header with Badge */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full p-2"
                  style={{
                    background: isActive ? "#1890ff" : "#bfbfbf",
                  }}
                >
                  <GiftOutlined
                    style={{
                      fontSize: "18px",
                      color: "#fff",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: isActive ? "#1890ff" : "#666",
                    fontWeight: "600",
                  }}
                >
                  Special Offer
                </span>
              </div>
              <Badge
                status={isActive ? "success" : "default"}
                text={isActive ? "Active" : "Expired"}
                style={{ color: isActive ? "#52c41a" : "#999" }}
              />
            </div>

            {/* Discount Value - Main Highlight */}
            <div
              style={{
                fontSize: "32px",
                fontWeight: "900",
                color: isActive ? "#1890ff" : "#666",
                textAlign: "center",
                padding: "12px",
                borderRadius: "8px",
                background: isActive ? "rgba(24, 144, 255, 0.1)" : "#f5f5f5",
              }}
            >
              {discountLabel}
            </div>

            {/* Coupon Code */}
            <div className="flex items-center gap-2 justify-center">
              <span
                style={{
                  color: isActive ? "#1890ff" : "#666",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Code:
              </span>
              <Tag
                color={isActive ? "blue" : "default"}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                }}
              >
                {offer.code}
              </Tag>
            </div>

            {/* Valid Until */}
            <div className="flex items-center justify-center gap-2">
              <CalendarOutlined
                style={{
                  color: isActive ? "#1890ff" : "#999",
                  fontSize: "14px",
                }}
              />
              <span
                style={{
                  color: isActive ? "#333" : "#666",
                  fontSize: "13px",
                }}
              >
                Valid until: <strong>{formattedValidTill}</strong>
              </span>
            </div>

            {/* Copy Button */}
            <Button
              type="primary"
              block
              onClick={handleCopyCode}
              icon={isCopied ? <CheckOutlined /> : undefined}
              style={{
                marginTop: "12px",
                background: isCopied ? "#52c41a" : "#1890ff",
                borderColor: isCopied ? "#52c41a" : "#1890ff",
                height: "40px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {isCopied ? "Copied!" : "Copy Code"}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default OfferCard;
