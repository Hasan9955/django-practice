"use client";
import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

interface DescriptionProps {
  description: string;
}

const Description: React.FC<DescriptionProps> = ({ description }) => {
  if (!description?.trim()) {
    return (
      <div className="bg-white rounded-2xl p-8">
        <Title level={3}>Product Description</Title>
        <p className="text-gray-500 italic">No description available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="md:px-8  px-2 md:py-6 my-1 border-b">
        <Title level={3} className="mb-0">
          Product Description
        </Title>
      </div>
      <div
        className="md:p-8 p-1 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export default Description;
