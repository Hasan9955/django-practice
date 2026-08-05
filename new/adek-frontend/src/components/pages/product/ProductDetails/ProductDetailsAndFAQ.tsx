"use client";

import React, { useState } from "react";
import { Collapse, Typography } from "antd";
import type { CollapseProps } from "antd";

const { Title } = Typography;

interface ProductFaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Product {
  productDetails?: string;
  productFaq?: ProductFaqItem[];
}

interface ProductDetailsAndFAQProps {
  product: Product | null | undefined;
  defaultOpenKey?: "details" | "faq";
}

const ProductDetailsAndFAQ: React.FC<ProductDetailsAndFAQProps> = ({
  product,
  defaultOpenKey = "details",
}) => {
  const [activeKey, setActiveKey] = useState<string | string[]>(defaultOpenKey);

  if (!product) {
    return (
      <div className="text-center py-8 text-gray-500">
        Product information not available
      </div>
    );
  }

  const handleChange: CollapseProps["onChange"] = (key) => {
    setActiveKey(key);
  };

  const mainItems: CollapseProps["items"] = [
    {
      key: "details",
      label: (
        <Title
          level={4}
          className="mb-0 text-[#000] font-semibold text-base md:text-lg"
        >
          Product Details
        </Title>
      ),
      children: (
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{
            __html: product.productDetails || "<p>No details available.</p>",
          }}
        />
      ),
    },
    {
      key: "faq",
      label: (
        <Title
          level={4}
          className="mb-0 text-[#000] font-semibold text-base md:text-lg"
        >
          Frequently Asked Questions
        </Title>
      ),
      children:
        product.productFaq && product.productFaq.length > 0 ? (
          <Collapse
            items={product.productFaq.map((faq, index) => ({
              key: `faq-${index}`,
              label: (
                <span className="font-medium text-[15px] md:text-base text-gray-800">
                  {faq.question}
                </span>
              ),
              children: (
                <div className="text-gray-600 leading-relaxed text-sm md:text-[15px]">
                  {faq.answer}
                </div>
              ),
            }))}
            ghost
            accordion
            bordered={false}
            className="inner-faq-collapse"
          />
        ) : (
          <p className="text-gray-500 italic">
            No FAQs available for this product.
          </p>
        ),
    },
  ];

  return (
    <div className="w-full bg-white overflow-hidden">
      <Collapse
        items={mainItems}
        activeKey={activeKey}
        onChange={handleChange}
        accordion
        bordered={false}
        className="product-info-collapse"
        expandIconPosition="end"
      />

      <style jsx global>{`
        /* ── Rich HTML content styles ── */
        .preview-content {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          line-height: 1.7;
          color: #374151;
          font-size: 15px;
        }
        .preview-content h1 { font-size: 1.6rem; font-weight: 700; margin: 1.5rem 0 1rem; }
        .preview-content h2 { font-size: 1.35rem; font-weight: 700; margin: 1.25rem 0 0.75rem; }
        .preview-content h3 { font-size: 1.2rem; font-weight: 700; margin: 1rem 0 0.625rem; }
        .preview-content h4,
        .preview-content h5,
        .preview-content h6 { font-size: 1.05rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .preview-content p { margin: 0.9rem 0; line-height: 1.65; }
        .preview-content ul,
        .preview-content ol { padding-left: 1.5rem; margin: 1rem 0; }
        .preview-content ul li,
        .preview-content ol li { margin: 0.4rem 0; }

        /* ── Outer collapse: header ── */
        .product-info-collapse .ant-collapse-header {
          padding: 14px 16px !important;
          background: #fff !important;
        }
        @media (min-width: 768px) {
          .product-info-collapse .ant-collapse-header {
            padding: 18px 24px !important;
          }
        }

        /* ── Outer collapse: content box — NO extra px padding ── */
        .product-info-collapse .ant-collapse-content-box {
          padding: 0 16px 16px !important;
        }
        @media (min-width: 768px) {
          .product-info-collapse .ant-collapse-content-box {
            padding: 0 24px 24px !important;
          }
        }

        /* ── Inner FAQ collapse: header ── */
        .inner-faq-collapse .ant-collapse-header {
          padding: 12px 0 !important;
        }

        /* ── Inner FAQ collapse: content box ── */
        .inner-faq-collapse .ant-collapse-content-box {
          padding: 0 0 12px !important;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsAndFAQ;