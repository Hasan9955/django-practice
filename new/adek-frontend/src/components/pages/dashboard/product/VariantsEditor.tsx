"use client";

import { FC } from "react";
import VariantForm from "./VariantForm";
import { useUpdateProductVariantMutation } from "@/redux/features/dashborad/products/productsApi";
import type { Product } from "./EditProductPage";

interface VariantsEditorProps {
  product: Product;
}

const VariantsEditor: FC<VariantsEditorProps> = ({ product }) => {
  const [updateVariant] = useUpdateProductVariantMutation();

  return (
    <div className="space-y-5">
      {product.Varient.length === 0 && (
        <p className="text-gray-500 text-sm italic">No variants available.</p>
      )}

      {product.Varient?.map((variant) => (
        <VariantForm
          key={variant.id}
          variant={variant}
          storeId={product?.storeId}
          onSave={(data) =>
            updateVariant({ variantId: variant.id, formData: data }).unwrap()
          }
        />
      ))}
    </div>
  );
};

export default VariantsEditor;
