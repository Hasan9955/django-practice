/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Table } from "@/components/ui/Table/Table";
import Image from "next/image";
import { FaEye, FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line, RiEditLine } from "react-icons/ri";

import {
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Button,
  Skeleton,
  Typography,
  Popconfirm,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetAllPromotionsQuery,
  useGetPromotionByIdQuery,
  useUpdatePromotionMutation,
} from "@/redux/features/banner/bannerSlice";
import toast from "react-hot-toast";

const { Text } = Typography;

type Promotion = {
  id: string;
  name: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  category: string;
  click: number;
  isPublished?: boolean;
};

const AllAdsPromotion = () => {
  // ==================== QUERIES & MUTATIONS ====================
  const {
    data: promotionsData,
    isLoading: isTableLoading,
    isFetching,
  } = useGetAllPromotionsQuery({});

  const [createPromotion, { isLoading: isCreating }] =
    useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] =
    useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] =
    useDeletePromotionMutation();

  // ==================== STATE ====================
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedPromotionForEdit, setSelectedPromotionForEdit] =
    useState<Promotion | null>(null);
  const [viewPromotionId, setViewPromotionId] = useState<string | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Lazy detail fetch for View modal
  const { data: viewDetailData, isLoading: isViewLoading } =
    useGetPromotionByIdQuery(viewPromotionId!, { skip: !viewPromotionId });

  // ==================== DATA MAPPING ====================
  const adsPromotionData: Promotion[] = (promotionsData?.result || []).map(
    (item: any) => ({
      id: item.id,
      name: item.name,
      bannerImage: item.promotionImage || "",
      startDate: item.startDate
        ? dayjs(item.startDate).format("YYYY-MM-DD")
        : "",
      endDate: item.endDate ? dayjs(item.endDate).format("YYYY-MM-DD") : "",
      category: item.category,
      click: 0,
      isPublished: item.isPublished,
    }),
  );

  // ==================== COLUMN DEFINITION ====================
  const columns = [
    {
      header: "Name",
      accessor: "name",
      className: "pl-4 pr-12",
    },
    {
      header: "Banner",
      accessor: "bannerImage",
      className: "pl-4 pr-12",
      render: (row: Promotion) => {
        return row.bannerImage ? (
          <div className="flex items-center">
            <Image
              src={row.bannerImage}
              alt={row.name}
              width={45}
              height={45}
              className="w-11 h-11 object-cover object-center rounded-[4px] mr-4"
            />
          </div>
        ) : (
          <div className="w-11 h-11 bg-gray-100 rounded-[4px] flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        );
      },
    },
    {
      header: "Start date",
      accessor: "startDate",
      className: "px-12",
    },
    {
      header: "End date",
      accessor: "endDate",
      className: "px-12",
    },
    {
      header: "Category",
      accessor: "category",
      className: "px-12",
    },
    {
      header: "Click",
      accessor: "click",
      className: "px-12",
    },
    {
      header: "Action",
      accessor: "action",
      className: "px-2",
      render: (row: Promotion) => (
        <div className="flex items-center space-x-2">
          {/* View */}
          <button
            className="rounded-[4px] border border-[#C2C2C2] text-[#606060] flex p-[8px] hover:text-blue-600 duration-300 items-center gap-[10px] cursor-pointer hover:bg-black/10"
            onClick={() => handleView(row.id)}
          >
            <FaEye />
          </button>

          {/* Edit */}
          <button
            className="rounded-[4px] border border-[#C2C2C2] text-[#606060] flex p-[8px] hover:text-blue-600 duration-300 items-center gap-[10px] cursor-pointer hover:bg-black/10"
            onClick={() => handleEdit(row)}
          >
            <RiEditLine />
          </button>

          {/* Delete - with loading state */}
          <Popconfirm
            title="Delete promotion?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(row.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <button
              disabled={isDeleting}
              className="rounded-[4px] border border-[#C2C2C2] text-[#606060] flex p-[8px] hover:text-red-600 duration-300 items-center gap-[10px] cursor-pointer hover:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" />
              ) : (
                <RiDeleteBin6Line />
              )}
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ==================== HANDLERS ====================
  const handleView = (id: string) => {
    setViewPromotionId(id);
    setIsViewModalOpen(true);
  };

  const handleEdit = (row: Promotion) => {
    setSelectedPromotionForEdit(row);
    editForm.setFieldsValue({
      name: row.name,
      category: row.category,
      startDate: row.startDate ? dayjs(row.startDate) : null,
      endDate: row.endDate ? dayjs(row.endDate) : null,
      isPublished: row.isPublished ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id).unwrap();
      toast.success("Promotion deleted successfully! 🎉"); // ← Toast Success
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete promotion. Please try again."); // ← Toast Error
    }
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setViewPromotionId(null);
    setSelectedPromotionForEdit(null);
    createForm.resetFields();
    editForm.resetFields();
  };

  // ==================== CREATE SUBMIT ====================
  const handleCreateSubmit = async (values: any) => {
    const formData = new FormData();

    const bodyData = {
      name: values.name,
      category: values.category,
      startDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : null,
      endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      isPublished: values.isPublished ?? true,
    };
    formData.append("bodyData", JSON.stringify(bodyData));

    if (values.promotionImage?.[0]?.originFileObj) {
      formData.append("promotionImage", values.promotionImage[0].originFileObj);
    }

    try {
      await createPromotion(formData).unwrap();
      toast.success("Promotion created successfully! 🎉"); // ← Toast Success
      closeAllModals();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create promotion. Please try again."); // ← Toast Error
    }
  };

  // ==================== UPDATE SUBMIT ====================
  const handleUpdateSubmit = async (values: any) => {
    if (!selectedPromotionForEdit) return;

    const formData = new FormData();

    const bodyData = {
      name: values.name,
      category: values.category,
      startDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : null,
      endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      isPublished: values.isPublished ?? true,
    };
    formData.append("bodyData", JSON.stringify(bodyData));

    if (values.promotionImage?.[0]?.originFileObj) {
      formData.append("promotionImage", values.promotionImage[0].originFileObj);
    }

    try {
      await updatePromotion({
        promotionId: selectedPromotionForEdit.id,
        data: formData,
      }).unwrap();
      toast.success("Promotion updated successfully! 🎉"); // ← Toast Success
      closeAllModals();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update promotion. Please try again."); // ← Toast Error
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between w-full mb-5">
        <p className="text-[#2A2A2A] font-sans text-base font-medium">List</p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="text-[#FFF] font-nunito text-[16px] font-medium leading-[19.84px] flex p-[10px_12px] items-center gap-[8px] rounded-[12px] bg-[#007BFF] hover:bg-[#0066CC] transition-colors"
        >
          <FaPlus />
          Add New Promotion
        </button>
      </div>

      {/* TABLE + LOADING */}
      {isTableLoading || isFetching ? (
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Input active block size="large" />
          <Skeleton.Input active block size="large" />
          <Skeleton.Input active block size="large" />
        </div>
      ) : (
        <Table columns={columns} data={adsPromotionData} />
      )}

      {/* ==================== CREATE MODAL ==================== */}
      <Modal
        title="Create New Promotion"
        open={isCreateModalOpen}
        onCancel={closeAllModals}
        footer={null}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            label="Promotion Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. New Year Mega Offer" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Input placeholder="e.g. Electronics" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </div>

          <Form.Item
            label="Published"
            name="isPublished"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item
            label="Banner Image"
            name="promotionImage"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture-card"
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={closeAllModals}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Create Promotion
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ==================== EDIT MODAL ==================== */}
      <Modal
        title="Edit Promotion"
        open={isEditModalOpen}
        onCancel={closeAllModals}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          initialValues={{
            isPublished: true,
          }}
        >
          <Form.Item
            label="Promotion Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </div>

          <Form.Item
            label="Published"
            name="isPublished"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Banner Image (optional - leave empty to keep current)"
            name="promotionImage"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture-card"
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload New</div>
              </div>
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={closeAllModals}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Update Promotion
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ==================== VIEW MODAL ==================== */}
      <Modal
        title="Promotion Details"
        open={isViewModalOpen}
        onCancel={closeAllModals}
        footer={null}
        width={700}
      >
        {isViewLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : viewDetailData?.result ? (
          <div className="space-y-6">
            {viewDetailData.result.promotionImage && (
              <div className="flex justify-center">
                <Image
                  src={viewDetailData.result.promotionImage}
                  alt={viewDetailData.result.name}
                  width={400}
                  height={200}
                  className="rounded-[8px] object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <Text type="secondary">Name</Text>
                <p className="font-medium text-base">
                  {viewDetailData.result.name}
                </p>
              </div>
              <div>
                <Text type="secondary">Category</Text>
                <p className="font-medium text-base">
                  {viewDetailData.result.category}
                </p>
              </div>
              <div>
                <Text type="secondary">Start Date</Text>
                <p className="font-medium text-base">
                  {dayjs(viewDetailData.result.startDate).format("YYYY-MM-DD")}
                </p>
              </div>
              <div>
                <Text type="secondary">End Date</Text>
                <p className="font-medium text-base">
                  {dayjs(viewDetailData.result.endDate).format("YYYY-MM-DD")}
                </p>
              </div>
              <div>
                <Text type="secondary">Published</Text>
                <p className="font-medium text-base">
                  {viewDetailData.result.isPublished ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <Text type="secondary">Created At</Text>
                <p className="font-medium text-base">
                  {dayjs(viewDetailData.result.createdAt).format(
                    "YYYY-MM-DD HH:mm",
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500">
            Failed to load promotion details.
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <Button onClick={closeAllModals}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AllAdsPromotion;
