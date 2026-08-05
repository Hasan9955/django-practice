/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/textarea";
import { FiPlus, FiTrash2, FiUploadCloud, FiEdit } from "react-icons/fi";
import { Select } from "antd";

interface SectionCardProps {
  section: {
    title: string;
    data: any[];
    fields: string[];
    setter: React.Dispatch<React.SetStateAction<any[]>>;
  };
  hasImage: boolean;
  handleInputChange: (
    setter: any,
    id: string,
    field: string,
    value: any
  ) => void;
  handleFileChange: (setter: any, id: string, file: File) => void;
  handleAddItem: (setter: any, item: any) => void;
  handleRemoveItem: (setter: any, id: string, data: any[]) => void;
  handleSubmit: () => void;
  getAvailableParentCategories?: () => { label: string; value: string }[];
  isLoading?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  hasImage,
  handleInputChange,
  handleFileChange,
  handleAddItem,
  handleRemoveItem,
  handleSubmit,
  getAvailableParentCategories,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const isBannerSection = section.title === "Banner";
  const itemContainerClass = isBannerSection ? "grid grid-cols-2 gap-4" : "space-y-4";

  const addNewItem = () => {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      file: null,
      preview: "/placeholder.svg",
      name: "",
      title: "",
      description: "",
      parentId: "",
    };
    handleAddItem(section.setter, newItem);
    setEditingId(newId);
  };

  const getPlaceholder = (field: string) => {
    if (section.title === "Category" && field === "name") return "Enter category title";
    if (section.title === "Sub-category" && field === "name") return "Mens shoes";
    if (field === "title") return `Enter ${section.title.toLowerCase()} title`;
    if (field === "description") return `Enter ${section.title.toLowerCase()} description`;
    return `Enter ${section.title.toLowerCase()} name`;
  };

  const getLabel = (field: string) => {
    if (field === "parentId") return "Select a category";
    if (section.title === "Sub-category" && field === "name") return "Sub Category";
    if (field === "name" || field === "title") return `${field.charAt(0).toUpperCase() + field.slice(1)} *`;
    if (field === "description") return "Description";
    return "";
  };

  const getPreviewText = (item: any) => {
    let text = item.name || item.title || "Unnamed";
    if (section.fields.includes("parentId") && getAvailableParentCategories) {
      const parent = getAvailableParentCategories().find(p => p.value === item.parentId);
      text += parent ? ` (sub of ${parent.label})` : "";
    }
    return text;
  };

  const currentItem = editingId ? section.data.find(item => item.id === editingId) : null;

  return (
    <Card className="bg-[#F2F2F2] border-none mb-6">
      <CardContent className="p-4">
        <p className="text-lg font-semibold text-red-700 mb-4">
          {isBannerSection ? "All Banners" : `Add ${section.title}`}
        </p>

        <div className={itemContainerClass}>
          {section.data.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm relative">
              {hasImage ? (
                <Image
                  src={item.preview}
                  alt={`${section.title} preview`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-32 rounded-lg"
                />
              ) : (
                <p className="text-lg font-medium">{getPreviewText(item)}</p>
              )}
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(item.id)}
                >
                  <FiEdit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleRemoveItem(section.setter, item.id, section.data)}
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {currentItem && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-4">Edit {section.title}</h3>

            {section.fields.includes("parentId") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getLabel("parentId")}
                </label>
                <Select
                  showSearch
                  placeholder="Select parent category"
                  value={currentItem.parentId || undefined}
                  onChange={(value) =>
                    handleInputChange(
                      section.setter,
                      currentItem.id,
                      "parentId",
                      value
                    )
                  }
                  className="w-full"
                  options={getAvailableParentCategories?.() || []}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </div>
            )}

            {section.fields.includes("name") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getLabel("name")}
                </label>
                <Input
                  placeholder={getPlaceholder("name")}
                  value={currentItem.name || ""}
                  onChange={(e) =>
                    handleInputChange(
                      section.setter,
                      currentItem.id,
                      "name",
                      e.target.value
                    )
                  }
                  className="custom-input-container"
                />
              </div>
            )}

            {section.fields.includes("title") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getLabel("title")}
                </label>
                <Input
                  placeholder={getPlaceholder("title")}
                  value={currentItem.title || ""}
                  onChange={(e) =>
                    handleInputChange(
                      section.setter,
                      currentItem.id,
                      "title",
                      e.target.value
                    )
                  }
                  className="custom-input-container"
                />
              </div>
            )}

            {section.fields.includes("description") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getLabel("description")}
                </label>
                <Textarea
                  placeholder={getPlaceholder("description")}
                  value={currentItem.description || ""}
                  onChange={(e) =>
                    handleInputChange(
                      section.setter,
                      currentItem.id,
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full min-h-[120px] custom-input-container resize-none"
                />
              </div>
            )}

            {hasImage && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                {currentItem.preview && currentItem.preview !== "/placeholder.svg" ? (
                  <div className="space-y-3">
                    <div className="aspect-video w-full h-[225px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={currentItem.preview}
                        alt={`${section.title} preview`}
                        width={400}
                        height={225}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`${section.title}-${currentItem.id}`}
                      onChange={(e) =>
                        e.target.files &&
                        handleFileChange(
                          section.setter,
                          currentItem.id,
                          e.target.files[0]
                        )
                      }
                    />
                    <label
                      htmlFor={`${section.title}-${currentItem.id}`}
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
                      className="hidden"
                      id={`${section.title}-${currentItem.id}`}
                      onChange={(e) =>
                        e.target.files &&
                        handleFileChange(
                          section.setter,
                          currentItem.id,
                          e.target.files[0]
                        )
                      }
                    />
                    <label
                      htmlFor={`${section.title}-${currentItem.id}`}
                      className="cursor-pointer"
                    >
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => setEditingId(null)}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="link"
            className="text-start p-0 h-auto text-blue-600 hover:text-blue-800"
            onClick={addNewItem}
          >
            <FiPlus className="w-4 h-4 mr-1" /> Add new {section.title.toLowerCase()}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {isLoading ? "Submitting..." : `Submit ${section.title}s`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionCard;