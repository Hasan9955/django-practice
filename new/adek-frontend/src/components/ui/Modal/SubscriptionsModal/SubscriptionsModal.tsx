"use client";

import React from "react";
import { Modal, Descriptions, Card, Typography, Divider, Tag } from "antd";
import Image from "next/image";
import { IoLocationSharp } from "react-icons/io5";
import {
  DateIocn,
  ProductSellerIcon,
  RevenueIcon,
  StarterProIcon,
} from "@/assets/svgIcon";
import { SellerSubscriptionsData } from "@/components/pages/dashboard/adminDashboard/seller&store-oversight/SellerSubscriptions";

const { Title, Text } = Typography;

interface SubscriptionsModalProps {
  modalData: SellerSubscriptionsData | null;
  open: boolean;
  onCancel: () => void;
}

export default function SubscriptionsModal({
  modalData,
  open,
  onCancel,
}: SubscriptionsModalProps) {
  if (!modalData) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: "980px", padding: "0 12px" }}
      centered
      className="custom-subscription-modal"
      styles={{
        content: {
          borderRadius: "24px",
          padding: 0,
          overflow: "hidden",
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 sm:px-8 md:px-10 pt-8 md:pt-10 pb-8 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Avatar + Seller Info (stacks on mobile) */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar - responsive size */}
              <Image
                src={modalData?.imageUrl}
                alt={modalData.sellersName}
                width={128}
                height={128}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-3xl border-4 border-white shadow-md flex-shrink-0"
              />

              {/* Info block */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                <Title
                  level={2}
                  className="mb-1 text-gray-900 text-2xl sm:text-3xl md:text-4xl leading-tight"
                >
                  {modalData.sellersName}
                </Title>

                {/* Responsive grid for stats */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:text-base mt-5">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <IoLocationSharp className="text-xl text-gray-400" />
                    <Text className="text-gray-700">Canada</Text>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <ProductSellerIcon />
                    <Text className="text-gray-700">134 products</Text>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <DateIocn />
                    <Text className="text-gray-700">
                      {modalData.details.date}
                    </Text>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <RevenueIcon />
                    <Text className="text-gray-700">
                      ${modalData.details.revenue}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Card - full width on mobile, fixed on lg+ */}
          <Card
            className="w-full lg:w-80 shadow-sm border-0"
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#1E293B] p-2 rounded-2xl">
                <StarterProIcon />
              </div>
              <div>
                <Tag color="blue" className="mb-1 text-xs font-medium">
                  Running Plan
                </Tag>
                <Title level={4} className="!mb-0 text-lg md:text-xl">
                  {modalData.details.runningPlan}
                </Title>
              </div>
            </div>

            <Text className="text-gray-600 block mb-6 text-sm leading-relaxed">
              Premium service with continuous personalized attention
            </Text>

            <Divider className="my-4" />

            <div className="flex items-baseline">
              <Title
                level={3}
                className="!mb-0 text-gray-900 text-2xl md:text-3xl"
              >
                €799
              </Title>
              <Text className="text-gray-500 ml-2 text-base">/ month</Text>
            </div>
          </Card>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="px-5 sm:px-8 md:px-10 py-8 md:py-10">
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }} /* Fully responsive columns */
          labelStyle={{ width: "160px", fontWeight: 600 }}
          contentStyle={{ fontSize: "15px" }}
          className="text-sm md:text-base"
        >
          <Descriptions.Item label="Plan">{modalData.plane}</Descriptions.Item>
          <Descriptions.Item label="Purchase Date">
            {modalData.purchaseDate}
          </Descriptions.Item>
          <Descriptions.Item label="Renew / Expire Date">
            {modalData.renewDate}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                modalData.status === "ACTIVE"
                  ? "green"
                  : modalData.status === "PENDING"
                  ? "gold"
                  : modalData.status === "DEACTIVE"
                  ? "default"
                  : "red"
              }
              className="text-sm font-medium"
            >
              {modalData.status === "DEACTIVE" ? "Inactive" : modalData.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}
