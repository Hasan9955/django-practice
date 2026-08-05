/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/textarea";
import { FiPlus, FiTrash2, FiEdit, FiUploadCloud } from "react-icons/fi";
import {
  useDeleteBannerMutation,
  useEditBannerMutation,
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import toast from "react-hot-toast";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export interface BannerItem {
  id: string;
  title: string;
  description: string;
  redirectUrl: string; 
  bannerUrl: string; 
  file: File | null; 
  preview: string; 
}

interface BannerSettingsProps {
  data: BannerItem[];
  setData: React.Dispatch<React.SetStateAction<BannerItem[]>>;
  validateFile: (file: File | null) => boolean;
}

const urlToFile = async (url: string): Promise<File> => {
  const res = await fetch(url);
  const blob = await res.blob();
  const fileName = url.split("/").pop() ?? "banner.png";
  return new File([blob], fileName, { type: blob.type });
};

const BannerSettings: React.FC<BannerSettingsProps> = ({
  data,
  setData,
  validateFile,
}) => {
  const [updatePlatform, { isLoading: creatingBannerLoading }] =
    useUpdatePlatformMutation();
  const [editBanner, { isLoading: editingBannerLoading }] =
    useEditBannerMutation();
  const [deletePlatformItem] = useDeleteBannerMutation();

  const [editingItem, setEditingItem] = useState<BannerItem | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const startEditing = (item?: BannerItem) => {
    if (item) {
      setEditingItem({ ...item });
      setIsEditMode(true);
    } else {
      setEditingItem({
        id: Date.now().toString(),
        title: "",
        description: "",
        redirectUrl: "",
        bannerUrl: "",
        file: null,
        preview: "/placeholder.svg",
      });
      setIsEditMode(false);
    }
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file || !validateFile(file)) return;
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // ==================== CREATE ====================
  const handleCreateBanner = async () => {
    if (!editingItem) return;

    try {
      const formData = new FormData();
      if (editingItem.file) {
        formData.append("banner", editingItem.file);
      }

      formData.append(
        "bodyData",
        JSON.stringify({
          banners: [
            {
              title: editingItem.title,
              description: editingItem.description,
              redirectUrl: editingItem.redirectUrl || undefined,
            },
          ],
        }),
      );

      await updatePlatform(formData).unwrap();

      setData([...data, editingItem]);
      toast.success("Banner created successfully!");
      setEditingItem(null);
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error.data?.message ?? "Failed to create banner");
    }
  };

  // ==================== EDIT ====================
  const handleEditBanner = async () => {
    if (!editingItem) return;

    try {
      const formData = new FormData();

      if (editingItem.file) {
        formData.append("bannerImage", editingItem.file);
      } else if (editingItem.bannerUrl) {
        const existingFile = await urlToFile(editingItem.bannerUrl);
        formData.append("bannerImage", existingFile);
      }

      formData.append(
        "bodyData",
        JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          redirectUrl: editingItem.redirectUrl || undefined,
        }),
      );

      await editBanner({ id: editingItem.id, formdata: formData }).unwrap();

      const updatedItem: BannerItem = { ...editingItem, file: null };
      setData(
        data.map((item) => (item.id === editingItem.id ? updatedItem : item)),
      );

      toast.success("Banner updated successfully!");
      setEditingItem(null);
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error.data?.message ?? "Failed to update banner");
    }
  };

  const handleSave = () => {
    if (isEditMode) {
      handleEditBanner();
    } else {
      handleCreateBanner();
    }
  };

  // ==================== DELETE ====================
  const removeItem = async (id: string) => {
    if (deletingIds.has(id)) return;

    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      await deletePlatformItem(id).unwrap();
      setData(data.filter((item) => item.id !== id));
      toast.success("Banner deleted successfully!");
    } catch (error: any) {
      toast.error(error.data?.message ?? "Failed to delete banner");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsEditMode(false);
  };

  const activePreview =
    editingItem?.preview && editingItem.preview !== "/placeholder.svg"
      ? editingItem.preview
      : editingItem?.bannerUrl ?? "";

  return (
    <Card className="bg-[#F2F2F2] border-none mb-6">
      <CardContent className="p-4">
        <p className="text-lg font-semibold text-red-700 mb-4">All Banners</p>

        <div className="grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-sm relative"
            >
              <Image
                src={item.preview || item.bannerUrl || "/placeholder.svg"}
                alt="Banner preview"
                width={200}
                height={100}
                className="object-cover w-full h-32 rounded-lg"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  onClick={() => startEditing(item)}
                  className="cursor-pointer bg-white rounded-full p-2 shadow-lg"
                >
                  <FiEdit className="text-blue-500" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="cursor-pointer bg-white rounded-full p-2 shadow-lg"
                >
                  {deletingIds.has(item.id) ? (
                    <Spin indicator={<LoadingOutlined spin />} />
                  ) : (
                    <FiTrash2 className="text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingItem && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-4">
              {isEditMode ? "Edit" : "Add"} Banner
            </h3>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={editingItem.title}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, title: e.target.value } : null,
                  )
                }
                placeholder="Enter banner title"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
                placeholder="Enter banner description"
                className="min-h-[120px]"
              />
            </div>

            {/* Redirect URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL
              </label>
              <Input
                value={editingItem.redirectUrl}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, redirectUrl: e.target.value } : null,
                  )
                }
                placeholder="https://example.com/page"
                type="url"
              />
            </div>

            {/* Image upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              {activePreview ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full h-[225px] bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={activePreview}
                      alt="Banner preview"
                      width={400}
                      height={225}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                  >
                    <FiUploadCloud className="w-4 h-4" />
                    Change image
                  </label>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                    id="banner-upload-new"
                  />
                  <label htmlFor="banner-upload-new" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button className="bg-blue-600" onClick={handleSave}>
                {(isEditMode ? editingBannerLoading : creatingBannerLoading) ? (
                  <Spin indicator={<LoadingOutlined spin />} />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="link"
          className="text-start p-0 h-auto text-blue-600 hover:text-blue-800 mt-4"
          onClick={() => startEditing()}
        >
          <FiPlus className="w-4 h-4 mr-1" /> Add new banner
        </Button>
      </CardContent>
    </Card>
  );
};

export default BannerSettings;
