// /* eslint-disable prefer-const */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useMemo } from "react";
// import { Button } from "@/components/ui/Button/Button";
// import { Card, CardContent } from "@/components/ui/Card/Card";
// import { Input } from "@/components/ui/Input/Input";
// import { Cascader, Spin } from "antd";
// import type { CascaderProps } from "antd";
// import { FiPlus, FiTrash2, FiEdit, FiUpload } from "react-icons/fi";
// import {
//   useUpdatePlatformMutation,
//   useEditCategoryMutation,
//   useDeleteCategoryMutation,
// } from "@/redux/features/dashborad/platform/platformManagementApi";
// import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";
// import toast from "react-hot-toast";
// import Image from "next/image";

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// /** Slug for API `name` field: lowercase, hyphens, & → and */
// const slugify = (text: string) =>
//   text
//     .trim()
//     .toLowerCase()
//     .replace(/_/g, "-")
//     .replace(/\s+/g, "-")
//     .replace(/&/g, "and");

// /**
//  * Human-readable display name.
//  * Strips underscores & hyphens used as word separators, then title-cases.
//  * e.g.  "mens_shoes"  → "Mens Shoes"
//  *       "mens-shoes"  → "Mens Shoes"
//  *       "Mens Shoes"  → "Mens Shoes"  (already clean)
//  */
// const normalizeDisplayName = (raw?: string): string => {
//   if (!raw) return "";
//   return raw
//     .replace(/[_-]+/g, " ")            // _ or - → space
//     .replace(/\s+/g, " ")              // collapse multiple spaces
//     .trim()
//     .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case every word
// };

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Attribute {
//   id: string;
//   name: string;
//   type: string;
//   isRequired: boolean;
//   values: any[];
// }

// interface Category {
//   id: string;
//   name: string;
//   displayName?: string;
//   parentId: string | null;
//   categoryPhoto: string;
//   ancestors: string[];
//   Attribute: Attribute[];
//   createdAt: string;
//   updatedAt: string;
//   subCategories: Category[];
// }

// interface CategoryResponse {
//   success: boolean;
//   message: string;
//   result: Category[];
// }

// interface CascaderOption {
//   label: string;
//   value: string;
//   children?: CascaderOption[];
// }

// interface SubcategoryItem {
//   id: string;
//   /** Human-readable label shown in the input */
//   displayName: string;
//   parentId: string;
//   file: File | null;
//   preview: string;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// const SubcategorySettings: React.FC = () => {
//   const { data: categoryResponse, isLoading } = useGetAllCategoryQuery({}) as {
//     data: CategoryResponse | undefined;
//     isLoading: boolean;
//   };

//   const [updatePlatform, { isLoading: isCreating }] =
//     useUpdatePlatformMutation();
//   const [editCategory, { isLoading: isEditing }] = useEditCategoryMutation();
//   const [deleteCategory] = useDeleteCategoryMutation();

//   const [editingItem, setEditingItem] = useState<SubcategoryItem | null>(null);
//   const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

//   // ── Flatten nested categories ──────────────────────────────────────────────

//   const flattenCategories = (categories: Category[]): Category[] => {
//     let flat: Category[] = [];
//     const flatten = (cats: Category[]) => {
//       cats.forEach((cat) => {
//         flat.push(cat);
//         if (cat.subCategories?.length) flatten(cat.subCategories);
//       });
//     };
//     flatten(categories);
//     return flat;
//   };

//   const allCategories = useMemo(() => {
//     if (!categoryResponse?.result) return [];
//     return flattenCategories(categoryResponse.result);
//   }, [categoryResponse]);

//   const subCategories = useMemo(
//     () => allCategories.filter((cat) => cat.parentId !== null),
//     [allCategories],
//   );

//   // ── Cascader options ───────────────────────────────────────────────────────
//   // Uses normalizeDisplayName so slugs like "mens_shoes" appear as "Mens Shoes"

//   const cascaderOptions = useMemo(() => {
//     const transformToCascaderOptions = (
//       categories: Category[],
//     ): CascaderOption[] =>
//       categories.map((cat) => ({
//         label: normalizeDisplayName(cat.displayName ?? cat.name),
//         value: cat.id,
//         children: cat.subCategories?.length
//           ? transformToCascaderOptions(cat.subCategories)
//           : undefined,
//       }));

//     if (!categoryResponse?.result) return [];
//     return transformToCascaderOptions(categoryResponse.result);
//   }, [categoryResponse]);

//   // ── Parent path helper ─────────────────────────────────────────────────────
//   // Also normalizes every segment so the path reads "Fiction > Sci Fi", not "fiction > sci_fi"

//   const getParentName = (parentId: string): string => {
//     const parent = allCategories.find((cat) => cat.id === parentId);
//     if (!parent) return "Unknown";

//     if (parent.ancestors?.length) {
//       const ancestorNames = parent.ancestors
//         .map((id) => {
//           const a = allCategories.find((c) => c.id === id);
//           return a ? normalizeDisplayName(a.displayName ?? a.name) : "";
//         })
//         .filter(Boolean);

//       return [
//         ...ancestorNames,
//         normalizeDisplayName(parent.displayName ?? parent.name),
//       ].join(" > ");
//     }

//     return normalizeDisplayName(parent.displayName ?? parent.name);
//   };

//   // ── Ancestors builder ──────────────────────────────────────────────────────

//   const buildAncestors = (parentId: string): string[] => {
//     const parent = allCategories.find((cat) => cat.id === parentId);
//     if (!parent) return [];
//     return parent.ancestors?.length ? [...parent.ancestors, parent.id] : [parent.id];
//   };

//   // ── Image selection ────────────────────────────────────────────────────────

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select a valid image file");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setEditingItem((prev) =>
//         prev ? { ...prev, file, preview: reader.result as string } : null,
//       );
//     };
//     reader.readAsDataURL(file);
//   };

//   // ── Open edit / create form ────────────────────────────────────────────────

//   const startEditing = (item?: Category) => {
//     if (item) {
//       setEditingItem({
//         id: item.id,
//         // Normalize on open so the input never shows raw slugs
//         displayName: normalizeDisplayName(item.displayName ?? item.name),
//         parentId: item.parentId || "",
//         file: null,
//         preview: item.categoryPhoto || "",
//       });
//     } else {
//       setEditingItem({ id: "", displayName: "", parentId: "", file: null, preview: "" });
//     }
//   };

//   // ── Delete ─────────────────────────────────────────────────────────────────

//   const removeItem = async (id: string) => {
//     try {
//       setDeletingItemId(id);
//       await deleteCategory(id).unwrap();
//       toast.success("Subcategory deleted successfully");
//     } catch (error: any) {
//       console.error("Delete error:", error);
//       toast.error(error?.data?.message || "Failed to delete subcategory");
//     } finally {
//       setDeletingItemId(null);
//     }
//   };

//   // ── Create ─────────────────────────────────────────────────────────────────

//   const createSubcategory = async () => {
//     if (!editingItem?.displayName || !editingItem?.parentId) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     const cleanDisplay = normalizeDisplayName(editingItem.displayName);
//     const cleanSlug    = slugify(editingItem.displayName);
//     const ancestors    = buildAncestors(editingItem.parentId);

//     const formData = new FormData();
//     formData.append(
//       "bodyData",
//       JSON.stringify({
//         categories: [
//           {
//             parentId: editingItem.parentId,
//             name: cleanSlug,
//             displayName: cleanDisplay,
//             ancestors,
//           },
//         ],
//       }),
//     );
//     if (editingItem.file) formData.append("categoryImage", editingItem.file);

//     try {
//       await updatePlatform(formData).unwrap();
//       toast.success("Subcategory created successfully");
//       setEditingItem(null);
//     } catch (error: any) {
//       console.error("Create error:", error);
//       toast.error(error?.data?.message || "Failed to create subcategory");
//     }
//   };

//   // ── Update ─────────────────────────────────────────────────────────────────

//   const updateSubcategory = async () => {
//     if (!editingItem?.displayName || !editingItem?.id) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     const cleanDisplay = normalizeDisplayName(editingItem.displayName);
//     const cleanSlug    = slugify(editingItem.displayName);

//     const formData = new FormData();
//     formData.append(
//       "bodyData",
//       JSON.stringify({ name: cleanSlug, displayName: cleanDisplay }),
//     );
//     if (editingItem.file) formData.append("categoryImage", editingItem.file);

//     try {
//       await editCategory({ id: editingItem.id, formdata: formData }).unwrap();
//       toast.success("Subcategory updated successfully");
//       setEditingItem(null);
//     } catch (error: any) {
//       console.error("Update error:", error);
//       if (error?.data?.err?.code === "LIMIT_UNEXPECTED_FILE") {
//         toast.error("Image field name not accepted. Please check backend configuration.");
//       } else {
//         toast.error(error?.data?.message || "Failed to update subcategory");
//       }
//     }
//   };

//   // ── Save dispatcher ────────────────────────────────────────────────────────

//   const handleSave = async () => {
//     const isExisting =
//       editingItem?.id && subCategories.some((i) => i.id === editingItem.id);
//     if (isExisting) {
//       await updateSubcategory();
//     } else {
//       await createSubcategory();
//     }
//   };

//   // ── Cascader helpers ───────────────────────────────────────────────────────

//   const handleCascaderChange: CascaderProps<CascaderOption>["onChange"] = (
//     value,
//   ) => {
//     if (value?.length) {
//       const selectedId = value[value.length - 1] as string;
//       setEditingItem((prev) => (prev ? { ...prev, parentId: selectedId } : null));
//     }
//   };

//   const getCascaderValue = (parentId: string): string[] => {
//     const parent = allCategories.find((cat) => cat.id === parentId);
//     if (!parent) return [];
//     return parent.ancestors?.length
//       ? [...parent.ancestors, parent.id]
//       : [parent.id];
//   };

//   // ── Loading state ──────────────────────────────────────────────────────────

//   if (isLoading) {
//     return (
//       <Card className="bg-[#F2F2F2] border-none mb-6">
//         <CardContent className="p-4 flex items-center justify-center min-h-[200px]">
//           <Spin size="large" />
//         </CardContent>
//       </Card>
//     );
//   }

//   const isSaving = isCreating || isEditing;
//   const isExistingItem = !!(
//     editingItem?.id && subCategories.some((i) => i.id === editingItem.id)
//   );

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <Card className="bg-[#F2F2F2] border-none mb-6">
//       <CardContent className="p-4">
//         <p className="text-lg font-semibold text-red-700 mb-4">
//           Add Sub-category
//         </p>

//         {/* Subcategory list */}
//         <div className="space-y-4 mt-4">
//           {subCategories.length === 0 ? (
//             <div className="text-center text-gray-500 py-4">
//               No subcategories found. Add your first subcategory below.
//             </div>
//           ) : (
//             subCategories.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
//               >
//                 <div className="flex items-center gap-3">
//                   {item.categoryPhoto && (
//                     <Image
//                       src={item.categoryPhoto}
//                       alt={item.name}
//                       className="w-10 h-10 object-cover rounded"
//                       width={40}
//                       height={40}
//                     />
//                   )}
//                   <div>
//                     {/* normalizeDisplayName handles any _ / - variants from the API */}
//                     <span className="font-medium">
//                       {normalizeDisplayName(item.displayName ?? item.name)}
//                     </span>
//                     <p className="text-xs text-gray-500">
//                       Path: {getParentName(item.parentId!)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => startEditing(item)}
//                     className="p-2 hover:bg-blue-50 rounded transition-colors"
//                     disabled={deletingItemId !== null || isSaving}
//                   >
//                     <FiEdit className="cursor-pointer hover:text-blue-600" />
//                   </button>
//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="p-2 hover:bg-red-50 rounded transition-colors"
//                     disabled={deletingItemId !== null || isSaving}
//                   >
//                     {deletingItemId === item.id ? (
//                       <Spin size="small" />
//                     ) : (
//                       <FiTrash2 className="cursor-pointer text-red-500 hover:text-red-700" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Edit / Create form */}
//         {editingItem && (
//           <div className="mt-6 bg-white p-6 rounded-lg shadow">
//             <h3 className="text-xl font-medium mb-4">
//               {isExistingItem ? "Edit" : "Add"} Sub-category
//             </h3>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select a parent category *
//               </label>
//               <Cascader
//                 fieldNames={{ label: "label", value: "value", children: "children" }}
//                 options={cascaderOptions}
//                 onChange={handleCascaderChange}
//                 value={
//                   editingItem.parentId
//                     ? getCascaderValue(editingItem.parentId)
//                     : undefined
//                 }
//                 placeholder="Select parent category"
//                 className="w-full"
//                 showSearch
//                 disabled={isSaving || isExistingItem}
//               />
//               {isExistingItem && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Parent category cannot be changed while editing
//                 </p>
//               )}
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Sub Category Name *
//               </label>
//               <Input
//                 placeholder="e.g., Mens Shoes"
//                 value={editingItem.displayName}
//                 onChange={(e) =>
//                   setEditingItem((prev) =>
//                     prev ? { ...prev, displayName: e.target.value } : null,
//                   )
//                 }
//                 disabled={isSaving}
//               />
//               {/* Live slug preview */}
//               {editingItem.displayName.trim() && (
//                 <p className="text-xs text-gray-400 mt-1">
//                   Slug:{" "}
//                   <code className="bg-gray-100 px-1 rounded">
//                     {slugify(editingItem.displayName)}
//                   </code>
//                 </p>
//               )}
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Subcategory Image (Optional)
//               </label>
//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors">
//                   <FiUpload />
//                   <span>
//                     {editingItem.preview ? "Change Image" : "Choose Image"}
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="hidden"
//                     disabled={isSaving}
//                   />
//                 </label>
//                 {editingItem.preview && (
//                   <div className="relative">
//                     <Image
//                       src={editingItem.preview}
//                       alt="Preview"
//                       width={64}
//                       height={64}
//                       className="w-16 h-16 object-cover rounded border"
//                     />
//                     {editingItem.file && (
//                       <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">
//                         New
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Max size: 5MB. Supported formats: JPG, PNG, GIF
//               </p>
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setEditingItem(null)}
//                 disabled={isSaving}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSave}
//                 disabled={
//                   isSaving ||
//                   !editingItem.displayName.trim() ||
//                   !editingItem.parentId
//                 }
//               >
//                 {isSaving ? (
//                   <>
//                     <Spin size="small" className="mr-2" />
//                     {isExistingItem ? "Updating..." : "Creating..."}
//                   </>
//                 ) : isExistingItem ? (
//                   "Update"
//                 ) : (
//                   "Create"
//                 )}
//               </Button>
//             </div>
//           </div>
//         )}

//         <Button
//           variant="link"
//           className="text-start p-0 h-auto text-blue-600 hover:text-blue-800 mt-4"
//           onClick={() => startEditing()}
//           disabled={isSaving || deletingItemId !== null}
//         >
//           <FiPlus className="w-4 h-4 mr-1" /> Add new sub-category
//         </Button>
//       </CardContent>
//     </Card>
//   );
// };

// export default SubcategorySettings;

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import { Cascader, Modal, Spin } from "antd";
import type { CascaderProps } from "antd";
import {
  FiAlertTriangle,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiUpload,
} from "react-icons/fi";
import {
  useUpdatePlatformMutation,
  useEditCategoryMutation,
  useDeleteCategoryAdminMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";
import toast from "react-hot-toast";
import Image from "next/image";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Slug for API `name` field: lowercase, hyphens, & → and */
const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");

/**
 * Human-readable display name.
 * Strips underscores & hyphens used as word separators, then title-cases.
 * e.g.  "mens_shoes"  → "Mens Shoes"
 *       "mens-shoes"  → "Mens Shoes"
 *       "Mens Shoes"  → "Mens Shoes"  (already clean)
 */
const normalizeDisplayName = (raw?: string): string => {
  if (!raw) return "";
  return raw
    .replace(/[_-]+/g, " ") // _ or - → space
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case every word
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attribute {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  values: any[];
}

interface Category {
  id: string;
  name: string;
  displayName?: string;
  parentId: string | null;
  categoryPhoto: string;
  ancestors: string[];
  Attribute: Attribute[];
  createdAt: string;
  updatedAt: string;
  subCategories: Category[];
}

interface CategoryResponse {
  success: boolean;
  message: string;
  result: Category[];
}

interface CascaderOption {
  label: string;
  value: string;
  children?: CascaderOption[];
}

interface SubcategoryItem {
  id: string;
  /** Human-readable label shown in the input */
  displayName: string;
  parentId: string;
  file: File | null;
  preview: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SubcategorySettings: React.FC = () => {
  const { data: categoryResponse, isLoading } = useGetAllCategoryQuery({}) as {
    data: CategoryResponse | undefined;
    isLoading: boolean;
  };

  const [updatePlatform, { isLoading: isCreating }] =
    useUpdatePlatformMutation();
  const [editCategory, { isLoading: isEditing }] = useEditCategoryMutation();
  const [deleteCategory] = useDeleteCategoryAdminMutation();

  const [editingItem, setEditingItem] = useState<SubcategoryItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  // Category pending deletion — set to open the "are you sure" warning modal.
  // Nothing is actually deleted until the user explicitly confirms in the modal.
  const [itemPendingDelete, setItemPendingDelete] = useState<Category | null>(
    null,
  );

  // ── Flatten nested categories ──────────────────────────────────────────────

  const flattenCategories = (categories: Category[]): Category[] => {
    let flat: Category[] = [];
    const flatten = (cats: Category[]) => {
      cats.forEach((cat) => {
        flat.push(cat);
        if (cat.subCategories?.length) flatten(cat.subCategories);
      });
    };
    flatten(categories);
    return flat;
  };

  const allCategories = useMemo(() => {
    if (!categoryResponse?.result) return [];
    return flattenCategories(categoryResponse.result);
  }, [categoryResponse]);

  const subCategories = useMemo(
    () => allCategories.filter((cat) => cat.parentId !== null),
    [allCategories],
  );

  // ── Cascader options ───────────────────────────────────────────────────────
  // Uses normalizeDisplayName so slugs like "mens_shoes" appear as "Mens Shoes"

  const cascaderOptions = useMemo(() => {
    const transformToCascaderOptions = (
      categories: Category[],
    ): CascaderOption[] =>
      categories.map((cat) => ({
        label: normalizeDisplayName(cat.displayName ?? cat.name),
        value: cat.id,
        children: cat.subCategories?.length
          ? transformToCascaderOptions(cat.subCategories)
          : undefined,
      }));

    if (!categoryResponse?.result) return [];
    return transformToCascaderOptions(categoryResponse.result);
  }, [categoryResponse]);

  // ── Parent path helper ─────────────────────────────────────────────────────
  // Also normalizes every segment so the path reads "Fiction > Sci Fi", not "fiction > sci_fi"

  const getParentName = (parentId: string): string => {
    const parent = allCategories.find((cat) => cat.id === parentId);
    if (!parent) return "Unknown";

    if (parent.ancestors?.length) {
      const ancestorNames = parent.ancestors
        .map((id) => {
          const a = allCategories.find((c) => c.id === id);
          return a ? normalizeDisplayName(a.displayName ?? a.name) : "";
        })
        .filter(Boolean);

      return [
        ...ancestorNames,
        normalizeDisplayName(parent.displayName ?? parent.name),
      ].join(" > ");
    }

    return normalizeDisplayName(parent.displayName ?? parent.name);
  };

  // ── Ancestors builder ──────────────────────────────────────────────────────

  const buildAncestors = (parentId: string): string[] => {
    const parent = allCategories.find((cat) => cat.id === parentId);
    if (!parent) return [];
    return parent.ancestors?.length
      ? [...parent.ancestors, parent.id]
      : [parent.id];
  };

  // ── Duplicate-sibling check ─────────────────────────────────────────────────
  // Same name is fine under different parents; only block duplicates within
  // the *same* parentId. Compares on the slug so "Women" / "women" / "Women "
  // are all treated as the same subcategory.

  const isDuplicateSibling = (
    displayName: string,
    parentId: string,
    excludeId?: string,
  ): boolean => {
    const candidateSlug = slugify(displayName);
    return allCategories.some(
      (cat) =>
        cat.parentId === parentId &&
        cat.id !== excludeId &&
        slugify(cat.displayName ?? cat.name) === candidateSlug,
    );
  };

  // ── Image selection ────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingItem((prev) =>
        prev ? { ...prev, file, preview: reader.result as string } : null,
      );
    };
    reader.readAsDataURL(file);
  };

  // ── Open edit / create form ────────────────────────────────────────────────

  const startEditing = (item?: Category) => {
    if (item) {
      setEditingItem({
        id: item.id,
        // Normalize on open so the input never shows raw slugs
        displayName: normalizeDisplayName(item.displayName ?? item.name),
        parentId: item.parentId || "",
        file: null,
        preview: item.categoryPhoto || "",
      });
    } else {
      setEditingItem({
        id: "",
        displayName: "",
        parentId: "",
        file: null,
        preview: "",
      });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  // Step 1: user clicks the trash icon — we only OPEN the warning modal here.
  // Nothing is deleted yet.
  const openDeleteConfirm = (item: Category) => {
    setItemPendingDelete(item);
  };

  const closeDeleteConfirm = () => {
    if (deletingItemId) return; // don't allow closing mid-delete
    setItemPendingDelete(null);
  };

  // Step 2: user explicitly confirms inside the modal — only now do we call the API.
  const confirmDelete = async () => {
    if (!itemPendingDelete) return;
    const id = itemPendingDelete.id;

    try {
      setDeletingItemId(id);
      await deleteCategory(id).unwrap();
      toast.success("Subcategory were deleted successfully");
      setItemPendingDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.data?.message || "Failed to delete subcategory");
    } finally {
      setDeletingItemId(null);
    }
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  const createSubcategory = async () => {
    if (!editingItem?.displayName || !editingItem?.parentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isDuplicateSibling(editingItem.displayName, editingItem.parentId)) {
      toast.error(
        `"${normalizeDisplayName(
          editingItem.displayName,
        )}" already exists under this parent category`,
      );
      return;
    }

    const cleanDisplay = normalizeDisplayName(editingItem.displayName);
    const cleanSlug = slugify(editingItem.displayName);
    const ancestors = buildAncestors(editingItem.parentId);

    const formData = new FormData();
    formData.append(
      "bodyData",
      JSON.stringify({
        categories: [
          {
            parentId: editingItem.parentId,
            name: cleanSlug,
            displayName: cleanDisplay,
            ancestors,
          },
        ],
      }),
    );
    if (editingItem.file) formData.append("categoryImage", editingItem.file);

    try {
      await updatePlatform(formData).unwrap();
      toast.success("Subcategory created successfully");
      setEditingItem(null);
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error?.data?.message || "Failed to create subcategory");
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateSubcategory = async () => {
    if (!editingItem?.displayName || !editingItem?.id) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Editing keeps the original parentId (Cascader is disabled while editing),
    // so we can safely check for siblings under that same parent.
    const currentParentId =
      allCategories.find((cat) => cat.id === editingItem.id)?.parentId ??
      editingItem.parentId;

    if (
      currentParentId &&
      isDuplicateSibling(
        editingItem.displayName,
        currentParentId,
        editingItem.id,
      )
    ) {
      toast.error(
        `"${normalizeDisplayName(
          editingItem.displayName,
        )}" already exists under this parent category`,
      );
      return;
    }

    const cleanDisplay = normalizeDisplayName(editingItem.displayName);
    const cleanSlug = slugify(editingItem.displayName);

    const formData = new FormData();
    formData.append(
      "bodyData",
      JSON.stringify({ name: cleanSlug, displayName: cleanDisplay }),
    );
    if (editingItem.file) formData.append("categoryImage", editingItem.file);

    try {
      await editCategory({ id: editingItem.id, formdata: formData }).unwrap();
      toast.success("Subcategory updated successfully");
      setEditingItem(null);
    } catch (error: any) {
      console.error("Update error:", error);
      if (error?.data?.err?.code === "LIMIT_UNEXPECTED_FILE") {
        toast.error(
          "Image field name not accepted. Please check backend configuration.",
        );
      } else {
        toast.error(error?.data?.message || "Failed to update subcategory");
      }
    }
  };

  // ── Save dispatcher ────────────────────────────────────────────────────────

  const handleSave = async () => {
    const isExisting =
      editingItem?.id && subCategories.some((i) => i.id === editingItem.id);
    if (isExisting) {
      await updateSubcategory();
    } else {
      await createSubcategory();
    }
  };

  // ── Cascader helpers ───────────────────────────────────────────────────────

  const handleCascaderChange: CascaderProps<CascaderOption>["onChange"] = (
    value,
  ) => {
    if (value?.length) {
      const selectedId = value[value.length - 1] as string;
      setEditingItem((prev) =>
        prev ? { ...prev, parentId: selectedId } : null,
      );
    }
  };

  const getCascaderValue = (parentId: string): string[] => {
    const parent = allCategories.find((cat) => cat.id === parentId);
    if (!parent) return [];
    return parent.ancestors?.length
      ? [...parent.ancestors, parent.id]
      : [parent.id];
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card className="bg-[#F2F2F2] border-none mb-6">
        <CardContent className="p-4 flex items-center justify-center min-h-[200px]">
          <Spin size="large" />
        </CardContent>
      </Card>
    );
  }

  const isSaving = isCreating || isEditing;
  const isExistingItem = !!(
    editingItem?.id && subCategories.some((i) => i.id === editingItem.id)
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Card className="bg-[#F2F2F2] border-none mb-6">
      <CardContent className="p-4">
        <p className="text-lg font-semibold text-red-700 mb-4">
          Add Sub-category
        </p>

        {/* Subcategory list */}
        <div className="space-y-4 mt-4">
          {subCategories.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No subcategories found. Add your first subcategory below.
            </div>
          ) : (
            subCategories.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {item.categoryPhoto && (
                    <Image
                      src={item.categoryPhoto}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                      width={40}
                      height={40}
                    />
                  )}
                  <div>
                    {/* normalizeDisplayName handles any _ / - variants from the API */}
                    <span className="font-medium">
                      {normalizeDisplayName(item.displayName ?? item.name)}
                    </span>
                    <p className="text-xs text-gray-500">
                      Path: {getParentName(item.parentId!)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(item)}
                    className="p-2 hover:bg-blue-50 rounded transition-colors"
                    disabled={deletingItemId !== null || isSaving}
                  >
                    <FiEdit className="cursor-pointer hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(item)}
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                    disabled={deletingItemId !== null || isSaving}
                  >
                    {deletingItemId === item.id ? (
                      <Spin size="small" />
                    ) : (
                      <FiTrash2 className="cursor-pointer text-red-500 hover:text-red-700" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit / Create form */}
        {editingItem && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-medium mb-4">
              {isExistingItem ? "Edit" : "Add"} Sub-category
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a parent category *
              </label>
              <Cascader
                fieldNames={{
                  label: "label",
                  value: "value",
                  children: "children",
                }}
                options={cascaderOptions}
                onChange={handleCascaderChange}
                value={
                  editingItem.parentId
                    ? getCascaderValue(editingItem.parentId)
                    : undefined
                }
                placeholder="Select parent category"
                className="w-full"
                showSearch
                disabled={isSaving || isExistingItem}
                // Lets the user stop at ANY level (e.g. "Clothing") instead of
                // being forced to drill into an existing child before the
                // selection registers. Without this, antd only commits a value
                // once you reach a leaf node, which was silently turning
                // "Clothing" into "Clothing > Boys" as the effective parent.
                changeOnSelect
                expandTrigger="hover"
              />
              {isExistingItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Parent category cannot be changed while editing
                </p>
              )}
              {!isExistingItem && (
                <p className="text-xs text-gray-400 mt-1">
                  You can stop at any level — e.g. select just
                  &quot;Clothing&quot; to add a new sub-category directly under
                  it.
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Name *
              </label>
              <Input
                placeholder="e.g., Mens Shoes"
                value={editingItem.displayName}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, displayName: e.target.value } : null,
                  )
                }
                disabled={isSaving}
              />
              {/* Live slug preview */}
              {editingItem.displayName.trim() && (
                <p className="text-xs text-gray-400 mt-1">
                  Slug:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {slugify(editingItem.displayName)}
                  </code>
                </p>
              )}
              {/* Live duplicate warning */}
              {editingItem.displayName.trim() &&
                editingItem.parentId &&
                isDuplicateSibling(
                  editingItem.displayName,
                  isExistingItem
                    ? allCategories.find((c) => c.id === editingItem.id)
                        ?.parentId ?? editingItem.parentId
                    : editingItem.parentId,
                  isExistingItem ? editingItem.id : undefined,
                ) && (
                  <p className="text-xs text-red-500 mt-1">
                    A sub-category with this name already exists under the
                    selected parent.
                  </p>
                )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors">
                  <FiUpload />
                  <span>
                    {editingItem.preview ? "Change Image" : "Choose Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSaving}
                  />
                </label>
                {editingItem.preview && (
                  <div className="relative">
                    <Image
                      src={editingItem.preview}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    {editingItem.file && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Max size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !editingItem.displayName.trim() ||
                  !editingItem.parentId ||
                  isDuplicateSibling(
                    editingItem.displayName,
                    isExistingItem
                      ? allCategories.find((c) => c.id === editingItem.id)
                          ?.parentId ?? editingItem.parentId
                      : editingItem.parentId,
                    isExistingItem ? editingItem.id : undefined,
                  )
                }
              >
                {isSaving ? (
                  <>
                    <Spin size="small" className="mr-2" />
                    {isExistingItem ? "Updating..." : "Creating..."}
                  </>
                ) : isExistingItem ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="link"
          className="text-start p-0 h-auto text-blue-600 hover:text-blue-800 mt-4"
          onClick={() => startEditing()}
          disabled={isSaving || deletingItemId !== null}
        >
          <FiPlus className="w-4 h-4 mr-1" /> Add new sub-category
        </Button>

        {/* ── Delete confirmation modal ──────────────────────────────────────
            Deleting a category is destructive: every product listed under it
            is deleted along with it. We never delete on a single click — the
            user must read this warning and explicitly confirm first. */}
        <Modal
          open={!!itemPendingDelete}
          onCancel={closeDeleteConfirm}
          centered
          footer={null}
          closable={!deletingItemId}
          maskClosable={!deletingItemId}
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiAlertTriangle className="text-red-600 w-6 h-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete &quot;
                {normalizeDisplayName(
                  itemPendingDelete?.displayName ?? itemPendingDelete?.name,
                )}
                &quot;?
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                This action is{" "}
                <span className="font-semibold">
                  permanent and cannot be undone
                </span>
                . Deleting this category will also permanently delete:
              </p>
              <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                <li>All products currently listed under this category</li>
                {!!itemPendingDelete?.subCategories?.length && (
                  <li>
                    All {itemPendingDelete.subCategories.length} sub-categor
                    {itemPendingDelete.subCategories.length === 1
                      ? "y"
                      : "ies"}{" "}
                    nested underneath it, and their products
                  </li>
                )}
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Please make sure you no longer need this category or its
                products before continuing.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={closeDeleteConfirm}
              disabled={!!deletingItemId}
            >
              Don&apos;t delete
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={!!deletingItemId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingItemId ? (
                <>
                  <Spin size="small" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, delete permanently"
              )}
            </Button>
          </div>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default SubcategorySettings;
