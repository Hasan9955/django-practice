"use client";

import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ChevronRight, Grid } from "lucide-react";

interface Category {
  id: string;
  name: string;
  displayName: string;
  categoryPhoto?: string | null;
  parentId?: string | null;
  subCategories?: Category[];
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  showSubCategories?: boolean;
  maxVisibleCategories?: number;
}

/**
 * Format category display name for better UI presentation
 * Converts "shoes_&_sneakers" -> "Shoes & Sneakers"
 * Converts "phones_&_mobile_accessories" -> "Phones & Mobile Accessories"
 * Converts "clothing_(women)" -> "Clothing (Women)"
 */
function formatDisplayName(displayName: string): string {
  if (!displayName) return "";
  
  return displayName
    .split("_")
    .map((word) => {
      // Keep special characters like &, (, ) as is
      if (word === "&" || word === "(" || word === ")") {
        return word;
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\s+/g, " ") // Remove extra spaces
    .trim();
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
  showAllOption = true,
  allOptionLabel = "All Categories",
  showSubCategories = false,
  maxVisibleCategories,
}: CategoryFilterProps) {
  // Flatten categories including subcategories if enabled
  const flattenedCategories = useMemo(() => {
    // ✅ FIX: Check if categories is valid before mapping
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }

    if (!showSubCategories) {
      return categories.map((cat) => ({
        ...cat,
        formattedName: formatDisplayName(cat.displayName),
      }));
    }

    const flattened: Array<Category & { formattedName: string; isSubCategory: boolean }> = [];
    
    categories.forEach((category) => {
      const parentFormatted = formatDisplayName(category.displayName);
      flattened.push({
        ...category,
        formattedName: parentFormatted,
        isSubCategory: false,
      });
      
      if (category.subCategories && category.subCategories.length > 0) {
        category.subCategories.forEach((subCat) => {
          flattened.push({
            ...subCat,
            formattedName: formatDisplayName(subCat.displayName),
            isSubCategory: true,
          });
        });
      }
    });

    return flattened;
  }, [categories, showSubCategories]);

  // Get visible categories based on maxVisibleCategories
  const visibleCategories = useMemo(() => {
    if (!maxVisibleCategories) {
      return flattenedCategories;
    }
    return flattenedCategories.slice(0, maxVisibleCategories);
  }, [flattenedCategories, maxVisibleCategories]);

  const hasMoreCategories =
    maxVisibleCategories && flattenedCategories.length > maxVisibleCategories;

  // Check if categories array is valid
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Grid className="w-4 h-4" />
        <span>No categories available</span>
      </div>
    );
  }

  // Get the selected category name for aria-label
  const selectedCategory = flattenedCategories.find(
    (cat) => cat.id === selected
  );
  const selectedLabel = selectedCategory?.formattedName || allOptionLabel;

  return (
    <div className="space-y-3">
      {/* Category Filter Pills */}
      <div
        className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar"
        role="tablist"
        aria-label={`Product categories - ${selectedLabel} selected`}
      >
        {/* "All" Option */}
        {showAllOption && (
          <Button
            role="tab"
            aria-selected={selected === "all"}
            onClick={() => onSelect("all")}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap",
              selected === "all"
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
            )}
            variant="secondary"
          >
            <Grid className="w-3.5 h-3.5 mr-1.5" />
            {allOptionLabel}
          </Button>
        )}

        {/* Category Pills */}
        {visibleCategories.map((category) => {
          const active = category.id === selected;
          const isSubCategory = category.parentId !== null;

          return (
            <Button
              key={category.id}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(category.id)}
              title={category.formattedName} // Tooltip on hover
              className={cn(
                "h-9 rounded-full px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                active
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300",
                isSubCategory && "pl-3"
              )}
              variant="secondary"
            >
              {isSubCategory && (
                <ChevronRight className="w-3 h-3 mr-1 opacity-60" />
              )}
              {category.formattedName}
            </Button>
          );
        })}

        {/* "More" indicator */}
        {hasMoreCategories && (
          <div className="flex items-center px-3 py-1.5 text-xs text-muted-foreground font-medium">
            +{flattenedCategories.length - maxVisibleCategories!} more
          </div>
        )}
      </div>

      {/* Active Filter Info */}
      {selected !== "all" && selectedCategory && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtered by:</span>
          <span className="font-medium text-foreground">
            {selectedCategory.formattedName}
          </span>
          <button
            onClick={() => onSelect("all")}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium ml-1 transition-colors"
            aria-label="Clear category filter"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}