/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import Image from "next/image";
import productimg from "@/assets/images/dashborad/image (9).png";

import type { StaticImageData } from "next/image";
import Link from "next/link";
import {
  useDeleteProductMutation,
  useGetMyStoreProductsQuery,
  usePushProductToStoreMutation,
} from "@/redux/features/dashborad/products/productsApi";
import { GoEyeClosed } from "react-icons/go";
import toast from "react-hot-toast";

export default function ProductTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useGetMyStoreProductsQuery({});
  const [pushProductToStore] = usePushProductToStoreMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const itemsPerPage = 7;

  const allProducts = data?.result?.[0]?.Product || [];
  const filteredProducts = allProducts.filter((item: any) =>
    item.productName.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page if search reduces results below current page
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const handleMute = async (id: string) => {
    const response = await pushProductToStore(id);
    if (response) {
      toast.success("Product status updated successfully");
    } else {
      toast.error("Failed to update product status");
    }
  };

  const handleDelete = async (id: string) => {
    const response = await deleteProduct(id);
    if (response) {
      toast.success("Product deleted successfully");
    } else {
      toast.error("Failed to delete product");
    }
  };

  const handleAddProduct = () => {
    console.log("Add new product");
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading products...</div>;
  }

  return (
    <div className="w-full mx-auto rounded-lg">
      <div className="flex items-center justify-between bg-white border-b rounded-t-lg border-gray-200 px-6 py-6">
        <h1 className="text-[24px] font-inter font-normal text-[#5F6368]">
          All product
        </h1>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Link href="/dashboard/all-product/add-product">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              onClick={handleAddProduct}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white px-4">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total sell
              </th>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edit Product
              </th>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mute
              </th>
              <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              currentProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Image
                      src={(product?.productPhoto?.[0] as string | StaticImageData) || productimg}
                      width={48}
                      height={48}
                      alt={product.productName}
                      className="h-12 w-12 rounded-lg object-cover bg-gray-100"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.totalSale}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/all-product/edit-product/${product.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMute(product.id)}
                      className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    >
                      {product.isPublished === true ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <GoEyeClosed className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="text-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className={
              currentPage === page
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "text-gray-600"
            }
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="text-gray-600"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}