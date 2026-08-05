"use client";
import { cn } from "@/lib/utils";
import { Button } from "../Button/Button";

type CategoryPillsProps = {
  categories?: string[];
  categoryNames?: Record<string, string>;
  active?: string;
  onChange?: (value: string) => void;
};

const defaultCategories = ["All"];

export function   CategoryPills({
  categories = defaultCategories,
  categoryNames = {},
  active = categories[0],
  onChange = () => {},
}: CategoryPillsProps) {
  // Get display name for category (either from categoryNames map or use the ID)
  const getDisplayName = (categoryId: string) => {
    return categoryNames[categoryId] || categoryId;
  };

  return (
    <div
      className="flex flex-wrap gap-3 rounded-xl"
      role="tablist"
      aria-label="Product categories"
    >
      {categories.map((cat) => {
        const selected = active === cat;
        const displayName = getDisplayName(cat);

        return (
          <Button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(cat)}
            variant="outline"
            className={cn(
              "h-9 rounded-full px-3 text-sm border-gray-200 capitalize",
              "hover:bg-gray-50",
              selected &&
                "bg-blue-600 text-white border-blue-600 hover:bg-blue-600"
            )}
          >
            {displayName}
          </Button>
        );
      })}
    </div>
  );
}
