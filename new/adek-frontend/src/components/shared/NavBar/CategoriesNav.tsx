"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  ancestors?: string[];
  subCategories?: Category[];
  displayName: string;
}

interface CategoriesNavProps {
  categories: Category[];
}

/* ✅ Improved formatCategoryName — handles ALL languages + messy API data */
export const formatCategoryName = (name: string): string => {
  if (!name) return "";
 
  return (
    name
      // 1. Replace underscores AND hyphens with a space
      .replace(/[_-]+/g, " ")
      // 2. Split camelCase (e.g. specialtyBooks → specialty Books)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // 3. Normalize spacing around & and parentheses
      .replace(/\s*&\s*/g, " & ")
      .replace(/\s*\(\s*/g, " (")
      .replace(/\s*\)\s*/g, ") ")
      // 4. Collapse multiple spaces and trim
      .replace(/\s+/g, " ")
      .trim()
      // 5. Unicode-safe title-case
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (!word) return "";
        if (word === "&") return "&";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ")
  );
};

/* ✅ Slug for URL (kept unchanged — only formatting was requested) */
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");
};

const CategoriesNav: React.FC<CategoriesNavProps> = ({ categories }) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const goToProduct = (name: string, id: string) => {
    router.push(`/${slugify(name)}/${id}`);
  };

  const renderSubCategories = (subCategories: Category[]) => (
    <div className="absolute left-full top-0 w-64 bg-white border rounded shadow-lg hidden group-hover:block z-20">
      {subCategories.map((subcat) => (
        <div key={subcat.id} className="group relative">
          <div
            className="px-4 py-2 cursor-pointer flex justify-between items-center text-gray-800 
              hover:bg-gray-100 hover:bg-clip-text hover:text-transparent 
              hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-400 hover:to-green-500
              transition-colors duration-300"
            onClick={(e) => {
              e.stopPropagation();
              goToProduct(subcat.displayName, subcat.id);
              setIsCategoriesOpen(false);
            }}
          >
            <span>{formatCategoryName(subcat.displayName)}</span>
            {subcat.subCategories?.length ? (
              <ChevronDown className="h-4 w-4" />
            ) : null}
          </div>

          {(subcat.subCategories?.length ?? 0) > 0 &&
            renderSubCategories(subcat.subCategories ?? [])}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (!isCategoriesOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoriesOpen]);

  return (
    <div>
      <nav className="flex flex-col md:flex-row items-start md:items-center text-sm w-full">
        {/* ✅ Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center bg-gray-100 md:px-3 md:py-2 pl-2 pr-1 py-1 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
          >
            <svg
              className="w-5 h-5 mr-1 md:mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>

            <span className="font-medium hidden md:block md:text-nowrap text-gray-800 
              hover:bg-clip-text hover:text-transparent 
              hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-400 hover:to-green-500
              transition-colors text-xs md:text-base duration-300">
              All Categories
            </span>

            <ChevronDown
              className={`h-4 w-4 ml-1 transition-transform hidden md:block ${
                isCategoriesOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isCategoriesOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white border rounded shadow-lg z-10">
              {categories.map((category) => (
                <div key={category.id} className="group relative">
                  <div
                    className="px-4 py-2 cursor-pointer flex justify-between items-center text-gray-800 
                      hover:bg-gray-100 hover:bg-clip-text hover:text-transparent 
                      hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-400 hover:to-green-500
                      transition-colors duration-300"
                    onClick={() => {
                      goToProduct(category.displayName, category.id);
                      setIsCategoriesOpen(false);
                    }}
                  >
                    <span>
                      {formatCategoryName(category.displayName)}
                    </span>

                    {category.subCategories?.length ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : null}
                  </div>

                  {(category.subCategories?.length ?? 0) > 0 &&
                    renderSubCategories(category.subCategories ?? [])}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Desktop inline categories */}
        <div className="hidden lg:flex flex-wrap gap-4 ml-6 items-center">
          {categories.slice(0, 6).map((category) => (
            <span
              key={category.id}
              className="cursor-pointer text-gray-800 
                hover:bg-clip-text hover:text-transparent 
                hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-400 hover:to-green-500
                transition-colors duration-300"
              onClick={() =>
                goToProduct(category.displayName, category.id)
              }
            >
              {formatCategoryName(category.displayName)}
            </span>
          ))}

          {categories.length > 6 && (
            <div className="relative group">
              <div className="flex items-center cursor-pointer text-gray-800 hover:text-pink-500 transition-colors duration-300">
                <span>Other</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>

              <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-30">
                <div className="bg-white border rounded shadow-lg w-48 py-1">
                  {categories.slice(6).map((category) => (
                    <div
                      key={category.id}
                      className="px-4 py-2 cursor-pointer text-gray-800 hover:bg-gray-100 
                        hover:bg-clip-text hover:text-transparent 
                        hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-400 hover:to-green-500
                        transition-colors duration-300"
                      onClick={() =>
                        goToProduct(category.displayName, category.id)
                      }
                    >
                      {formatCategoryName(category.displayName)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default CategoriesNav;