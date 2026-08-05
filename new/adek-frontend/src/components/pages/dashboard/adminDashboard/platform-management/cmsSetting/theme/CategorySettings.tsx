// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/Button/Button";
// import { Card, CardContent } from "@/components/ui/Card/Card";
// import { Input } from "@/components/ui/Input/Input";
// import { FiPlus, FiTrash2, FiEdit, FiUploadCloud } from "react-icons/fi";
// import { Spin } from "antd";
// import {
//   useDeleteCategoryAdminMutation,
//   useEditCategoryMutation,
//   useUpdatePlatformMutation,
// } from "@/redux/features/dashborad/platform/platformManagementApi";
// import toast from "react-hot-toast";

// // ─── Helpers ────────────────────────────────────────────────────────────────

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
//  * e.g. "sci_fi"  → "Sci Fi"
//  *      "sci-fi"  → "Sci Fi"
//  *      "Sci Fi"  → "Sci Fi"  (already clean)
//  */
// const normalizeDisplayName = (raw: string): string =>
//   raw
//     .replace(/[_-]+/g, " ") // replace _ or - with space
//     .replace(/\s+/g, " ") // collapse multiple spaces
//     .trim()
//     .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case every word

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface CategoryItem {
//   id: string;
//   name: string;
//   displayName: string;
//   categoryPhoto: string;
//   isDeleted: boolean;
//   platformId: string;
//   parentId: string | null;
//   ancestors: string[];
//   createdAt: string;
//   updatedAt: string;
//   file: File | null;
//   preview: string;
// }

// interface CategorySettingsProps {
//   data: CategoryItem[];
//   setData: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
// }

// // ─── Component ───────────────────────────────────────────────────────────────

// const CategorySettings: React.FC<CategorySettingsProps> = ({
//   data,
//   setData,
// }) => {
//   const [addCategory, { isLoading: isAdding }] = useUpdatePlatformMutation();
//   const [editCategory, { isLoading: isEditing }] = useEditCategoryMutation();
//   const [deleteCategory, { isLoading: isDeleting }] =
//     useDeleteCategoryAdminMutation();

//   const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const isLoading = isAdding || isEditing || isDeleting;

//   // ── Open edit/create form ──────────────────────────────────────────────────

//   const startEditing = (item?: CategoryItem) => {
//     if (item) {
//       setEditingItem({
//         ...item,
//         // Normalize displayName on open so the input shows a clean value
//         displayName: normalizeDisplayName(item.displayName || item.name),
//         file: null,
//       });
//     } else {
//       setEditingItem({
//         id: "",
//         name: "",
//         displayName: "",
//         categoryPhoto: "/placeholder.svg",
//         isDeleted: false,
//         platformId: "",
//         parentId: null,
//         ancestors: [],
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         file: null,
//         preview: "/placeholder.svg",
//       });
//     }
//   };

//   // ── File selection ─────────────────────────────────────────────────────────

//   const handleFileSelect = (file: File | undefined) => {
//     if (!file) return;
//     if (!file.type.startsWith("image/")) {
//       toast.error("Only image files are permitted");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Maximum file size: 5 MB");
//       return;
//     }
//     if (editingItem) {
//       setEditingItem({
//         ...editingItem,
//         file,
//         preview: URL.createObjectURL(file),
//       });
//     }
//   };

//   // ── Edit existing ──────────────────────────────────────────────────────────

//   const handleEdit = async () => {
//     if (!editingItem || !editingItem.id || !editingItem.displayName.trim()) {
//       toast.error("Category name is mandatory");
//       return;
//     }

//     const cleanDisplay = normalizeDisplayName(editingItem.displayName);
//     const cleanSlug = slugify(editingItem.displayName);

//     const formData = new FormData();
//     formData.append("bodyData", JSON.stringify({ name: cleanSlug }));
//     if (editingItem.file instanceof File) {
//       formData.append("categoryImage", editingItem.file);
//     }

//     try {
//       const result = await editCategory({
//         id: editingItem.id,
//         formdata: formData,
//       }).unwrap();

//       setData((prev) =>
//         prev.map((item) =>
//           item.id === editingItem.id
//             ? {
//                 ...item,
//                 displayName: cleanDisplay,
//                 name: cleanSlug,
//                 categoryPhoto:
//                   result?.categoryPhoto ||
//                   result?.data?.categoryPhoto ||
//                   item.categoryPhoto,
//                 preview:
//                   result?.preview || result?.data?.preview || item.preview,
//               }
//             : item,
//         ),
//       );
//       setEditingItem(null);
//       toast.success("Category successfully updated");
//     } catch (err: any) {
//       console.error("[Category Edit Error]", err);
//       toast.error(
//         err?.data?.message || "Update failed. Please check network logs.",
//       );
//     }
//   };

//   // ── Add new ────────────────────────────────────────────────────────────────

//   const handleAdd = async () => {
//     if (!editingItem || !editingItem.displayName.trim()) {
//       toast.error("Category name is mandatory");
//       return;
//     }

//     const cleanDisplay = normalizeDisplayName(editingItem.displayName);
//     const cleanSlug = slugify(editingItem.displayName);

//     const formData = new FormData();
//     formData.append(
//       "bodyData",
//       JSON.stringify({
//         categories: [{ parentId: null, name: cleanSlug }],
//       }),
//     );
//     if (editingItem.file instanceof File) {
//       formData.append("categoryImage", editingItem.file);
//     }

//     try {
//       const result = await addCategory(formData).unwrap();

//       const newItem: CategoryItem = {
//         id: result?.id || Date.now().toString(),
//         name: cleanSlug,
//         displayName: cleanDisplay,
//         categoryPhoto:
//           result?.categoryPhoto || result?.preview || editingItem.preview,
//         isDeleted: false,
//         platformId: result?.platformId || editingItem.platformId || "",
//         parentId: null,
//         ancestors: [],
//         createdAt: result?.createdAt || new Date().toISOString(),
//         updatedAt: result?.updatedAt || new Date().toISOString(),
//         file: null,
//         preview: result?.preview || editingItem.preview,
//       };

//       setData((prev) => [...prev, newItem]);
//       setEditingItem(null);
//       toast.success("Category successfully created");
//     } catch (err: any) {
//       console.error("[Category Add Error]", err);
//       toast.error(
//         err?.data?.message || "Creation failed. Please check network logs.",
//       );
//     }
//   };

//   // ── Save dispatcher ────────────────────────────────────────────────────────

//   const handleSave = () => {
//     if (editingItem?.id) {
//       handleEdit();
//     } else {
//       handleAdd();
//     }
//   };

//   // ── Delete ─────────────────────────────────────────────────────────────────

//   const removeItem = async (id: string) => {
//     setDeletingId(id);
//     try {
//       await deleteCategory(id).unwrap();
//       setData((prev) => prev.filter((item) => item.id !== id));
//       toast.success("Category successfully deleted");
//     } catch (err: any) {
//       toast.error(err?.data?.message || "Deletion failed");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   // ── Render ─────────────────────────────────────────────────────────────────

//   return (
//     <Card className="bg-[#F2F2F2] border-none mb-6">
//       <CardContent className="p-4">
//         <p className="text-lg font-semibold text-red-700 mb-4">
//           Category Management
//         </p>

//         {/* Category list */}
//         <div className="space-y-4 mt-4">
//           {data.map((item) => (
//             <div
//               key={item.id}
//               className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
//             >
//               <div className="flex items-center gap-4">
//                 <Image
//                   src={item.preview}
//                   alt={item.name}
//                   width={60}
//                   height={60}
//                   sizes="(max-width: 768px) 80px, 60px"
//                   quality={75}
//                   loading="lazy"
//                   placeholder="blur"
//                   blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
//                   className="object-cover rounded-md"
//                   onError={(e) => {
//                     const img = e.currentTarget;
//                     if (!img.dataset.fallback) {
//                       img.srcset =
//                         "https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg";
//                       img.dataset.fallback = "true";
//                     }
//                   }}
//                 />
//                 {/* Always render through normalizeDisplayName so stored slugs display cleanly */}
//                 <span className="font-medium">
//                   {normalizeDisplayName(item.displayName || item.name)}
//                 </span>
//               </div>

//               <div className="flex gap-3 items-center">
//                 <FiEdit
//                   className={`cursor-pointer text-blue-600 hover:text-blue-800 ${
//                     deletingId === item.id || isLoading
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }`}
//                   onClick={() => {
//                     if (!deletingId && !isLoading) startEditing(item);
//                   }}
//                 />
//                 {deletingId === item.id ? (
//                   <Spin size="small" />
//                 ) : (
//                   <FiTrash2
//                     className="cursor-pointer text-red-500 hover:text-red-700"
//                     onClick={() => {
//                       if (!deletingId && !isLoading) removeItem(item.id);
//                     }}
//                   />
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Edit / Create form */}
//         {editingItem && (
//           <div className="mt-6 bg-white p-6 rounded-lg shadow-md border">
//             <h3 className="text-xl font-semibold mb-5">
//               {editingItem.id ? "Edit Category" : "Create New Category"}
//             </h3>

//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category Name <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 placeholder="Enter category name"
//                 value={editingItem.displayName}
//                 onChange={(e) =>
//                   setEditingItem((prev) =>
//                     prev ? { ...prev, displayName: e.target.value } : null,
//                   )
//                 }
//               />
//               {/* Live preview of how the slug will be stored */}
//               {editingItem.displayName.trim() && (
//                 <p className="text-xs text-gray-400 mt-1">
//                   Slug:{" "}
//                   <code className="bg-gray-100 px-1 rounded">
//                     {slugify(editingItem.displayName)}
//                   </code>
//                 </p>
//               )}
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category Image{" "}
//                 {editingItem.file ? "(new upload)" : "(unchanged)"}
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                 {editingItem.preview &&
//                 editingItem.preview !== "/placeholder.svg" ? (
//                   <div className="space-y-4">
//                     <Image
//                       src={editingItem.preview}
//                       alt="Preview"
//                       width={140}
//                       height={140}
//                       quality={80}
//                       placeholder="blur"
//                       blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
//                       loading="lazy"
//                       sizes="(max-width: 768px) 100vw, 140px"
//                       className="mx-auto object-cover rounded-md shadow"
//                       onError={(e) => {
//                         const img = e.currentTarget;
//                         if (!img.dataset.fallback) {
//                           img.srcset =
//                             "https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg";
//                           img.dataset.fallback = "true";
//                         }
//                       }}
//                     />
//                     <div>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => handleFileSelect(e.target.files?.[0])}
//                         className="hidden"
//                         id="category-image-edit"
//                       />
//                       <label
//                         htmlFor="category-image-edit"
//                         className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
//                       >
//                         <FiUploadCloud size={20} /> Change / Upload Image
//                       </label>
//                     </div>
//                   </div>
//                 ) : (
//                   <div>
//                     <FiUploadCloud className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e.target.files?.[0])}
//                       className="hidden"
//                       id="category-image-new"
//                     />
//                     <label
//                       htmlFor="category-image-new"
//                       className="cursor-pointer text-blue-600 hover:text-blue-800"
//                     >
//                       Upload Image (max 5 MB)
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-end gap-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setEditingItem(null)}
//                 disabled={isLoading}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSave}
//                 disabled={!editingItem.displayName.trim() || isLoading}
//               >
//                 {isLoading
//                   ? editingItem.id
//                     ? "Updating..."
//                     : "Creating..."
//                   : "Save"}
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Add button */}
//         {!editingItem && (
//           <Button
//             variant="link"
//             className="text-blue-600 hover:text-blue-800 p-0 mt-5"
//             onClick={() => startEditing()}
//           >
//             <FiPlus className="inline mr-1.5" /> Add New Category
//           </Button>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default CategorySettings;
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import { FiPlus, FiTrash2, FiEdit, FiUploadCloud } from "react-icons/fi";
import { Spin } from "antd";
import {
  useDeleteCategoryAdminMutation,
  useEditCategoryMutation,
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import toast from "react-hot-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
 * e.g. "sci_fi"  → "Sci Fi"
 *      "sci-fi"  → "Sci Fi"
 *      "Sci Fi"  → "Sci Fi"  (already clean)
 */
const normalizeDisplayName = (raw: string): string =>
  raw
    .replace(/[_-]+/g, " ") // replace _ or - with space
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // title-case every word

/**
 * Normalizes an id to a comparable string.
 * Guards against bugs where one side of a comparison is a number,
 * an ObjectId-like object, or has surrounding whitespace.
 */
const normalizeId = (id: unknown): string => String(id ?? "").trim();

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  displayName: string;
  categoryPhoto: string;
  isDeleted: boolean;
  platformId: string;
  parentId: string | null;
  ancestors: string[];
  createdAt: string;
  updatedAt: string;
  file: File | null;
  preview: string;
}

interface CategorySettingsProps {
  data: CategoryItem[];
  setData: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CategorySettings: React.FC<CategorySettingsProps> = ({
  data,
  setData,
}) => {
  const [addCategory, { isLoading: isAdding }] = useUpdatePlatformMutation();
  const [editCategory, { isLoading: isEditing }] = useEditCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryAdminMutation();

  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Track ids we've successfully deleted so that if a parent re-sync
  // (e.g. a stale RTK Query cache write) tries to bring a deleted row
  // back into `data`, we can filter it back out again.
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<Set<string>>(
    new Set(),
  );
  const isLoading = isAdding || isEditing || isDeleting;

  // Any row whose id we've deleted is hidden, even if `data` (owned by the
  // parent) still contains it because of a stale cache re-render.
  const visibleData = data.filter(
    (item) => !locallyDeletedIds.has(normalizeId(item.id)),
  );

  // ── Open edit/create form ──────────────────────────────────────────────────

  const startEditing = (item?: CategoryItem) => {
    if (item) {
      setEditingItem({
        ...item,
        // Normalize displayName on open so the input shows a clean value
        displayName: normalizeDisplayName(item.displayName || item.name),
        file: null,
      });
    } else {
      setEditingItem({
        id: "",
        name: "",
        displayName: "",
        categoryPhoto: "/placeholder.svg",
        isDeleted: false,
        platformId: "",
        parentId: null,
        ancestors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        file: null,
        preview: "/placeholder.svg",
      });
    }
  };

  // ── File selection ─────────────────────────────────────────────────────────

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are permitted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size: 5 MB");
      return;
    }
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  // ── Edit existing ──────────────────────────────────────────────────────────

  const handleEdit = async () => {
    if (!editingItem || !editingItem.id || !editingItem.displayName.trim()) {
      toast.error("Category name is mandatory");
      return;
    }

    const cleanDisplay = normalizeDisplayName(editingItem.displayName);
    const cleanSlug = slugify(editingItem.displayName);

    const formData = new FormData();
    formData.append("bodyData", JSON.stringify({ name: cleanSlug }));
    if (editingItem.file instanceof File) {
      formData.append("categoryImage", editingItem.file);
    }

    try {
      const result = await editCategory({
        id: editingItem.id,
        formdata: formData,
      }).unwrap();

      setData((prev) =>
        prev.map((item) =>
          normalizeId(item.id) === normalizeId(editingItem.id)
            ? {
                ...item,
                displayName: cleanDisplay,
                name: cleanSlug,
                categoryPhoto:
                  result?.categoryPhoto ||
                  result?.data?.categoryPhoto ||
                  item.categoryPhoto,
                preview:
                  result?.preview || result?.data?.preview || item.preview,
              }
            : item,
        ),
      );
      setEditingItem(null);
      toast.success("Category successfully updated");
    } catch (err: any) {
      console.error("[Category Edit Error]", err);
      toast.error(
        err?.data?.message || "Update failed. Please check network logs.",
      );
    }
  };

  // ── Add new ────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!editingItem || !editingItem.displayName.trim()) {
      toast.error("Category name is mandatory");
      return;
    }

    const cleanDisplay = normalizeDisplayName(editingItem.displayName);
    const cleanSlug = slugify(editingItem.displayName);

    const formData = new FormData();
    formData.append(
      "bodyData",
      JSON.stringify({
        categories: [{ parentId: null, name: cleanSlug }],
      }),
    );
    if (editingItem.file instanceof File) {
      formData.append("categoryImage", editingItem.file);
    }

    try {
      const result = await addCategory(formData).unwrap();

      const newId = normalizeId(result?.id) || Date.now().toString();

      const newItem: CategoryItem = {
        id: newId,
        name: cleanSlug,
        displayName: cleanDisplay,
        categoryPhoto:
          result?.categoryPhoto || result?.preview || editingItem.preview,
        isDeleted: false,
        platformId: result?.platformId || editingItem.platformId || "",
        parentId: null,
        ancestors: [],
        createdAt: result?.createdAt || new Date().toISOString(),
        updatedAt: result?.updatedAt || new Date().toISOString(),
        file: null,
        preview: result?.preview || editingItem.preview,
      };

      // If this id was previously marked as deleted (e.g. an id got reused,
      // or this is a resurrected row), clear it from the deleted set so it
      // shows up again.
      setLocallyDeletedIds((prev) => {
        if (!prev.has(newId)) return prev;
        const next = new Set(prev);
        next.delete(newId);
        return next;
      });

      setData((prev) => [...prev, newItem]);
      setEditingItem(null);
      toast.success("Category successfully created");
    } catch (err: any) {
      console.error("[Category Add Error]", err);
      toast.error(
        err?.data?.message || "Creation failed. Please check network logs.",
      );
    }
  };

  // ── Save dispatcher ────────────────────────────────────────────────────────

  const handleSave = () => {
    if (editingItem?.id) {
      handleEdit();
    } else {
      handleAdd();
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const removeItem = async (rawId: string) => {
    const id = normalizeId(rawId);
    setDeletingId(id);
    try {
      await deleteCategory(rawId).unwrap();

      // Remove locally right away...
      setData((prev) => prev.filter((item) => normalizeId(item.id) !== id));

      // ...and remember that this id is deleted, so that if the parent
      // re-syncs `data` from a stale cached list (the usual reason a row
      // "comes back" after a successful delete), we keep hiding it until
      // the parent's data source actually reflects the deletion.
      setLocallyDeletedIds((prev) => new Set(prev).add(id));

      toast.success("Category successfully deleted");
    } catch (err: any) {
      console.error("[Category Delete Error]", err);
      toast.error(err?.data?.message || "Deletion failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Card className="bg-[#F2F2F2] border-none mb-6">
      <CardContent className="p-4">
        <p className="text-lg font-semibold text-red-700 mb-4">
          Category Management
        </p>

        {/* Category list */}
        <div className="space-y-4 mt-4">
          {visibleData.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={item.preview}
                  alt={item.name}
                  width={60}
                  height={60}
                  sizes="(max-width: 768px) 80px, 60px"
                  quality={75}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
                  className="object-cover rounded-md"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.srcset =
                        "https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg";
                      img.dataset.fallback = "true";
                    }
                  }}
                />
                {/* Always render through normalizeDisplayName so stored slugs display cleanly */}
                <span className="font-medium">
                  {normalizeDisplayName(item.displayName || item.name)}
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <FiEdit
                  className={`cursor-pointer text-blue-600 hover:text-blue-800 ${
                    deletingId === normalizeId(item.id) || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (!deletingId && !isLoading) startEditing(item);
                  }}
                />
                {deletingId === normalizeId(item.id) ? (
                  <Spin size="small" />
                ) : (
                  <FiTrash2
                    className="cursor-pointer text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (!deletingId && !isLoading) removeItem(item.id);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit / Create form */}
        {editingItem && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-5">
              {editingItem.id ? "Edit Category" : "Create New Category"}
            </h3>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Enter category name"
                value={editingItem.displayName}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, displayName: e.target.value } : null,
                  )
                }
              />
              {/* Live preview of how the slug will be stored */}
              {editingItem.displayName.trim() && (
                <p className="text-xs text-gray-400 mt-1">
                  Slug:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {slugify(editingItem.displayName)}
                  </code>
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image{" "}
                {editingItem.file ? "(new upload)" : "(unchanged)"}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {editingItem.preview &&
                editingItem.preview !== "/placeholder.svg" ? (
                  <div className="space-y-4">
                    <Image
                      src={editingItem.preview}
                      alt="Preview"
                      width={140}
                      height={140}
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 140px"
                      className="mx-auto object-cover rounded-md shadow"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallback) {
                          img.srcset =
                            "https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg";
                          img.dataset.fallback = "true";
                        }
                      }}
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="hidden"
                        id="category-image-edit"
                      />
                      <label
                        htmlFor="category-image-edit"
                        className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
                      >
                        <FiUploadCloud size={20} /> Change / Upload Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FiUploadCloud className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      className="hidden"
                      id="category-image-new"
                    />
                    <label
                      htmlFor="category-image-new"
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      Upload Image (max 5 MB)
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!editingItem.displayName.trim() || isLoading}
              >
                {isLoading
                  ? editingItem.id
                    ? "Updating..."
                    : "Creating..."
                  : "Save"}
              </Button>
            </div>
          </div>
        )}

        {/* Add button */}
        {!editingItem && (
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-800 p-0 mt-5"
            onClick={() => startEditing()}
          >
            <FiPlus className="inline mr-1.5" /> Add New Category
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CategorySettings;
