/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";
import { useRouter } from "next/navigation";
import { formatCategoryName } from "@/components/shared/NavBar/CategoriesNav";

/* ✅ Format display name */


/* ✅ Slug for URL */
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");
};

export default function PopularCategories() {
  const { data } = useGetAllCategoryQuery({});
  const categories = data?.result || [];
  const router = useRouter();
  console.log(data)

  /* ✅ Clean navigation */
  const goToProduct = (name: string, id: string) => {
    router.push(`/${slugify(name)}/${id}`);
  };

  return (
    <div className="bg-color-pinkf6 pb-12">
      <div className="container lg:px-16 md:px-14 mt-6 sm-mt-0 sm:px-10 px-6 xl:px-0 mx-auto">
        <h2 className="sm:text-3xl text-[24px] font-semibold text-center text-gray-800 mb-4 sm:mb-10 px-6 sm:px-0">
          Explore popular categories
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-6">
          {categories.slice(0, 10).map((category: any) => (
            <div
              key={category.id}
              onClick={() =>
                goToProduct(category.displayName, category.id)
              }
              className="flex flex-col items-center"
            >
              <div className="md:w-[148px] h-22 w-22 md:h-[148px] hover:border-[#FF914D] hover:border-[1px] rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-pointer">
                <Image
                  src={category.categoryPhoto}
                  alt={category.displayName}
                  height={82}
                  width={82}
                  className="md:w-24 md:h-24 h-16 w-16 rounded-full object-contain"
                />
              </div>

              <span className="mt-3 text-xs font-medium text-wrap text-center sm:text-sm text-gray-700">
                {formatCategoryName(category.displayName)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}