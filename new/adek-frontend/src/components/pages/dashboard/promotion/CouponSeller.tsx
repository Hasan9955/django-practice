/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table/Table";
import {
  useCreateSellerCouponMutation,
  useDeleteSellerCouponMutation,
  useGetSellerCouponsQuery,
  useUpdateSellerCouponMutation,
} from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Button, Spin } from "antd";
import { FaEdit } from "react-icons/fa";
import { toast } from "sonner";
import CouponModal from "@/components/ui/Modal/Dashbord/CouponModal";
import { MdOutlineDeleteForever } from "react-icons/md";

interface CouponType {
  id: string;
  code: string;
  storeId: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: number;
  validFrom: string;
  validTill: string;
  createdAt: string;
  updatedAt: string;
}

const CouponSeller = () => {
  const seller = useAppSelector((state: RootState) => state.auth.user);
  const storeId = seller?.store?.[0]?.id;

  const { data, isLoading, refetch } = useGetSellerCouponsQuery(storeId);
  const coupons: CouponType[] = data?.result?.data || [];

  const [createCoupon, { isLoading: creating }] =
    useCreateSellerCouponMutation();
  const [updateCoupon, { isLoading: updating }] =
    useUpdateSellerCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] =
    useDeleteSellerCouponMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponType | null>(null);

  const handleCreate = async (values: any) => {
    try {
      const payload = { ...values, storeId };
      const res = await createCoupon(payload).unwrap();
      if (res?.success) {
        toast.success("Coupon created successfully!");
        setModalOpen(false);
        refetch();
      } else {
        toast.error(res?.message || "Failed to create coupon");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = async (values: any) => {
    try {
      const payload = { ...values, storeId };
      const res = await updateCoupon({
        id: selectedCoupon?.id,
        data: payload,
      }).unwrap();

      if (res?.success) {
        toast.success("Coupon updated successfully!");
        setModalOpen(false);
        refetch();
      } else {
        toast.error(res?.message || "Failed to update coupon");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCoupon(id).unwrap();
      if (res?.success) {
        toast.success("Coupon deleted successfully!");
        refetch();
      } else {
        toast.error(res?.message || "Failed to delete coupon");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    {
      header: "Coupon Code",
      accessor: "code",
      className: "pl-4 pr-8 font-medium",
    },
    {
      header: "Discount Type",
      accessor: "discountType",
      className: "px-8 capitalize",
    },
    {
      header: "Discount Value",
      accessor: "discountValue",
      className: "px-8",
      render: (row: CouponType) =>
        row.discountType === "FIXED"
          ? `$${row.discountValue}`
          : `${row.discountValue}%`,
    },
    {
      header: "Valid From",
      accessor: "validFrom",
      className: "px-8",
      render: (row: CouponType) => new Date(row.validFrom).toLocaleDateString(),
    },
    {
      header: "Valid Till",
      accessor: "validTill",
      className: "px-8",
      render: (row: CouponType) => new Date(row.validTill).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "px-4 text-center",
      render: (row: CouponType) => (
        <div className="flex justify-center gap-3 text-blue-600">
          <FaEdit
            size={18}
            className="cursor-pointer hover:text-blue-800"
            onClick={() => {
              setSelectedCoupon(row);
              setModalMode("edit");
              setModalOpen(true);
            }}
          />
          <button
            className="cursor-pointer hover:text-red-600"
            disabled={deleting}
            onClick={() => handleDelete(row.id)}
          >
            <MdOutlineDeleteForever size={20} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg font-semibold">Coupon Seller</h2>
        <Button
          type="primary"
          onClick={() => {
            setModalMode("create");
            setSelectedCoupon(null);
            setModalOpen(true);
          }}
        >
          Create Coupon
        </Button>
      </div>

      {coupons.length > 0 ? (
        <Table columns={columns} data={coupons} />
      ) : (
        <div className="text-center text-gray-500 py-12">
          No coupons available.
        </div>
      )}

      {/* Reusable Modal */}
      <CouponModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === "edit" ? handleEdit : handleCreate}
        loading={creating || updating}
        mode={modalMode}
        initialData={selectedCoupon || undefined}
      />
    </div>
  );
};

export default CouponSeller;
