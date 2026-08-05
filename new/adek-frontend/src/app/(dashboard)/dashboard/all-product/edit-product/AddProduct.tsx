/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { z } from "zod";
import Link from "next/link";

import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  Switch,
  Typography,
  message,
  Upload,
  Cascader,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";
import {
  useCreateProductMutation,
  useGetAllCouponsQuery,
} from "@/redux/features/dashborad/products/productsApi";
import toast from "react-hot-toast";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import TiptapEditor from "@/components/shared/TiptapEditor";

const { Title, Text } = Typography;
const { Option } = Select;

// ─────────────────────────────────────────────
// Plan type definitions
// ─────────────────────────────────────────────
type PlanType = "free" | "pro" | "ScalePro";

const PLAN_FEATURES: Record<
  PlanType,
  { bundles: boolean; promotions: boolean; b2b: boolean }
> = {
  free: { bundles: false, promotions: false, b2b: false },
  pro: { bundles: true, promotions: true, b2b: false },
  ScalePro: { bundles: true, promotions: true, b2b: true },
};

// ─────────────────────────────────────────────
// B2B Package Tag — must match Prisma PackageTag enum exactly
// ─────────────────────────────────────────────
const B2B_PACKAGE_TAGS = [
  { label: "Small Supply", value: "SmallSupply" },
  { label: "Medium Supply", value: "MediumSupply" },
  { label: "Large Supply", value: "LargeSupply" },
];

// Predefined attribute key suggestions
const ATTRIBUTE_KEY_OPTIONS = [
  "color",
  "size",
  "material",
  "weight",
  "style",
  "brand",
  "finish",
  "pattern",
  "capacity",
  "flavor",
];

// ─────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z
    .number({ required_error: "Price is required" })
    .positive("Price must be > 0"),
  stock: z
    .number({ required_error: "Stock is required" })
    .min(0, "Stock must be >= 0"),
  attributes: z.record(z.string()).optional(),
  coupons: z.array(z.string()).optional(), // NOT required
});

const b2bPackageSchema = z.object({
  moq: z
    .number({ required_error: "MOQ is required" })
    .min(1, "MOQ must be >= 1"),
  maxMOQ: z
    .number({ required_error: "Max MOQ is required" })
    .min(1, "Max MOQ must be >= 1"),
  b2bPackageTag: z.string().min(1, "Package tag is required"),
  pricePerUnit: z
    .number({ required_error: "Price per unit is required" })
    .min(0, "Price per unit must be >= 0"),
});

const bundleOfferSchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .min(1, "Quantity must be >= 1"),
  discount: z
    .number({ required_error: "Discount is required" })
    .min(0)
    .max(100, "Discount must be between 0-100"),
  bundleTag: z.string().min(1, "At least one bundle tag is required"),
});

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  basePrice: z
    .number({ required_error: "Base price is required" })
    .positive("Base price must be > 0"),
  discountPrice: z.number().min(0).optional(),
  discountStartDate: z.any().optional(),
  discountEndTime: z.any().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

interface AttributePair {
  id: string;
  key: string;
  value: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributePairs: AttributePair[];
  coupons: string[];
}

interface B2BPackage {
  id: string;
  moq: number;
  maxMOQ: number;
  b2bPackageTag: string; // valid PackageTag enum value
  pricePerUnit: number;
}

interface BundleOffer {
  id: string;
  quantity: number;
  discount: number;
  bundleTag: string;
}

interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

interface CategoryOption {
  value: string;
  label: string;
  children?: CategoryOption[];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const parsePrice = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const p = parseFloat(value);
    return isNaN(p) ? 0 : p;
  }
  return 0;
};

const showUpgradeToast = (feature: string) => {
  toast.error(
    `"${feature}" requires a higher plan. Please upgrade your seller plan.`,
    { duration: 4000 },
  );
};

const makeEmptyVariant = (): ProductVariant => ({
  id: Date.now().toString() + Math.random(),
  sku: "",
  price: 0,
  stock: 0,
  attributePairs: [
    { id: Date.now().toString() + "_a", key: "color", value: "" },
  ],
  coupons: [],
});

// Convert attributePairs array to { key: value } record for API
const pairsToRecord = (pairs: AttributePair[]): Record<string, string> => {
  const result: Record<string, string> = {};
  pairs.forEach(({ key, value }) => {
    if (key.trim() && value.trim()) result[key.trim()] = value.trim();
  });
  return result;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ProductForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Variants always visible — no toggle
  const [hasB2B, setHasB2B] = useState(false);
  const [hasBundles, setHasBundles] = useState(false);
  const [hasFaqs, setHasFaqs] = useState(false);

  const [productImages, setProductImages] = useState<File[]>([]);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const planType: PlanType =
    (user?.store?.[0]?.planType as PlanType) || "ScalePro";
  const features = PLAN_FEATURES[planType];

  const [descriptionContent, setDescriptionContent] = useState("");
  const [productDetailsContent, setProductDetailsContent] = useState("");

  // Variants state — always visible, default one row
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "1",
      sku: "",
      price: 0,
      stock: 0,
      attributePairs: [{ id: "1_a", key: "color", value: "" }],
      coupons: [],
    },
  ]);

  const [b2bPackages, setB2bPackages] = useState<B2BPackage[]>([
    { id: "1", moq: 0, maxMOQ: 0, b2bPackageTag: "", pricePerUnit: 0 },
  ]);

  const [bundleOffers, setBundleOffers] = useState<BundleOffer[]>([
    { id: "1", quantity: 0, discount: 0, bundleTag: "" },
  ]);

  const [faqs, setFaqs] = useState<ProductFaq[]>([
    { id: "1", question: "", answer: "" },
  ]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [bundleTagInputs, setBundleTagInputs] = useState<
    Record<string, string>
  >({});

  const { data, isLoading: categoriesLoading } = useGetAllCategoryQuery({});
  const [createProduct, { isLoading: createProductLoading }] =
    useCreateProductMutation();
  const { data: couponsData } = useGetAllCouponsQuery({});

  const categories = data?.result || [];
  const coupons = couponsData?.result?.data || [];
  const isPromotionsLocked = !features.promotions;

  // ─────────────────────────────────────────────
  // Plan-gated toggles
  // ─────────────────────────────────────────────

  const handleToggleBundles = (checked: boolean) => {
    if (checked && !features.bundles) {
      showUpgradeToast("Bundle Offers");
      return;
    }
    setHasBundles(checked);
  };

  const handleToggleB2B = (checked: boolean) => {
    if (checked && !features.b2b) {
      showUpgradeToast("B2B Packages");
      return;
    }
    setHasB2B(checked);
  };

  // ─────────────────────────────────────────────
  // Category options
  // ─────────────────────────────────────────────

  const buildCategoryOptions = (cats: any[]): CategoryOption[] =>
    cats.map((cat) => ({
      value: cat.id,
      label: cat.displayName,
      children:
        cat.subCategories?.length > 0
          ? buildCategoryOptions(cat.subCategories)
          : undefined,
    }));

  const categoryOptions = buildCategoryOptions(categories);

  // ─────────────────────────────────────────────
  // Bundle price calc
  // ─────────────────────────────────────────────

  const calculateBundlePrice = (
    basePrice: number,
    quantity: number,
    discountPercent: number,
  ) => {
    const original = basePrice * quantity;
    const discountAmt = original * (discountPercent / 100);
    return {
      originalPrice: parseFloat(original.toFixed(2)),
      discountedPrice: parseFloat((original - discountAmt).toFixed(2)),
      savings: parseFloat(discountAmt.toFixed(2)),
    };
  };

  const getCurrentBasePrice = (): number => {
    const val = form.getFieldValue("basePrice");
    return val && val > 0 ? parsePrice(val) : 0;
  };

  // ─────────────────────────────────────────────
  // Variant helpers
  // ─────────────────────────────────────────────

  const addVariant = () => setVariants((prev) => [...prev, makeEmptyVariant()]);

  const removeVariant = (id: string) => {
    if (variants.length > 1)
      setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariantField = (
    id: string,
    field: "sku" | "price" | "stock" | "coupons",
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (field === "coupons") {
          const arr = Array.isArray(value)
            ? value
            : String(value)
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
          return { ...v, coupons: arr };
        }
        return { ...v, [field]: value };
      }),
    );
  };

  const addAttributePair = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id !== variantId
          ? v
          : {
              ...v,
              attributePairs: [
                ...v.attributePairs,
                {
                  id: Date.now().toString() + Math.random(),
                  key: "",
                  value: "",
                },
              ],
            },
      ),
    );
  };

  const removeAttributePair = (variantId: string, attrId: string) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id !== variantId
          ? v
          : {
              ...v,
              attributePairs: v.attributePairs.filter((a) => a.id !== attrId),
            },
      ),
    );
  };

  const updateAttributePair = (
    variantId: string,
    attrId: string,
    field: "key" | "value",
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id !== variantId
          ? v
          : {
              ...v,
              attributePairs: v.attributePairs.map((a) =>
                a.id !== attrId ? a : { ...a, [field]: value },
              ),
            },
      ),
    );
  };

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────

  const validateVariants = (): string | null => {
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const result = variantSchema.safeParse({
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        attributes: pairsToRecord(v.attributePairs),
        coupons: v.coupons,
      });
      if (!result.success)
        return `Variant ${i + 1}: ${result.error.errors[0].message}`;
    }
    return null;
  };

  const validateB2BPackages = (): string | null => {
    for (let i = 0; i < b2bPackages.length; i++) {
      const p = b2bPackages[i];
      const result = b2bPackageSchema.safeParse(p);
      if (!result.success)
        return `B2B Package ${i + 1}: ${result.error.errors[0].message}`;
      if (p.maxMOQ < p.moq)
        return `B2B Package ${i + 1}: Max MOQ must be >= MOQ`;
    }
    return null;
  };

  const validateBundleOffers = (): string | null => {
    for (let i = 0; i < bundleOffers.length; i++) {
      const b = bundleOffers[i];
      const result = bundleOfferSchema.safeParse(b);
      if (!result.success)
        return `Bundle Offer ${i + 1}: ${result.error.errors[0].message}`;
    }
    return null;
  };

  const validateFaqs = (): string | null => {
    for (let i = 0; i < faqs.length; i++) {
      const result = faqSchema.safeParse(faqs[i]);
      if (!result.success)
        return `FAQ ${i + 1}: ${result.error.errors[0].message}`;
    }
    return null;
  };

  // ─────────────────────────────────────────────
  // B2B Package helpers
  // ─────────────────────────────────────────────

  const addB2BPackage = () =>
    setB2bPackages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        moq: 0,
        maxMOQ: 0,
        b2bPackageTag: "",
        pricePerUnit: 0,
      },
    ]);

  const removeB2BPackage = (id: string) => {
    if (b2bPackages.length > 1)
      setB2bPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const updateB2BPackage = (id: string, field: keyof B2BPackage, value: any) =>
    setB2bPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );

  // ─────────────────────────────────────────────
  // Bundle Offer helpers
  // ─────────────────────────────────────────────

  const addBundleOffer = () => {
    const newId = Date.now().toString();
    setBundleOffers((prev) => [
      ...prev,
      { id: newId, quantity: 0, discount: 0, bundleTag: "" },
    ]);
    setBundleTagInputs((prev) => ({ ...prev, [newId]: "" }));
  };

  const removeBundleOffer = (id: string) => {
    if (bundleOffers.length > 1) {
      setBundleOffers((prev) => prev.filter((b) => b.id !== id));
      setBundleTagInputs((prev) => {
        const c = { ...prev };
        delete c[id];
        return c;
      });
    }
  };

  const updateBundleOffer = (
    id: string,
    field: keyof BundleOffer,
    value: any,
  ) =>
    setBundleOffers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );

  const handleAddBundleTag = (bundleId: string) => {
    const trimmed = (bundleTagInputs[bundleId] || "").trim();
    if (!trimmed) return;
    const bundle = bundleOffers.find((b) => b.id === bundleId);
    if (!bundle) return;
    const existing = bundle.bundleTag
      ? bundle.bundleTag
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (existing.includes(trimmed)) {
      message.warning("Tag already exists!");
      return;
    }
    updateBundleOffer(bundleId, "bundleTag", [...existing, trimmed].join(","));
    setBundleTagInputs((prev) => ({ ...prev, [bundleId]: "" }));
  };

  const handleRemoveBundleTag = (bundleId: string, tagToRemove: string) => {
    const bundle = bundleOffers.find((b) => b.id === bundleId);
    if (!bundle) return;
    const newTags = bundle.bundleTag
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && t !== tagToRemove);
    updateBundleOffer(bundleId, "bundleTag", newTags.join(","));
  };

  // ─────────────────────────────────────────────
  // FAQ helpers
  // ─────────────────────────────────────────────

  const addFaq = () =>
    setFaqs((prev) => [
      ...prev,
      { id: Date.now().toString(), question: "", answer: "" },
    ]);

  const removeFaq = (id: string) => {
    if (faqs.length > 1) setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFaq = (id: string, field: keyof ProductFaq, value: string) =>
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );

  // ─────────────────────────────────────────────
  // Image upload
  // ─────────────────────────────────────────────

  const handleImageUpload = (info: any) => {
    const files = info.fileList
      .map((f: any) => f.originFileObj)
      .filter(Boolean);
    setProductImages(files);
  };

  // ─────────────────────────────────────────────
  // Tags
  // ─────────────────────────────────────────────

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {
    let antValues: any;
    try {
      antValues = await form.validateFields();
    } catch {
      message.error("Please fill all required fields correctly.");
      return;
    }

    const zodResult = productSchema.safeParse({
      productName: antValues.productName,
      basePrice: antValues.basePrice,
      categoryId: antValues.categoryId,
      discountPrice: antValues.discountPrice,
      discountStartDate: antValues.discountStartDate,
      discountEndTime: antValues.discountEndTime,
    });
    if (!zodResult.success) {
      message.error(zodResult.error.errors[0].message);
      return;
    }

    if (
      !descriptionContent ||
      descriptionContent.trim() === "" ||
      descriptionContent === "<p></p>"
    ) {
      message.error("Please enter a product description");
      return;
    }
    if (!productImages || productImages.length === 0) {
      message.error("Please upload at least one product image");
      return;
    }

    const variantError = validateVariants();
    if (variantError) {
      message.error(variantError);
      return;
    }

    if (hasB2B) {
      const b2bError = validateB2BPackages();
      if (b2bError) {
        message.error(b2bError);
        return;
      }
    }
    if (hasBundles) {
      const bundleError = validateBundleOffers();
      if (bundleError) {
        message.error(bundleError);
        return;
      }
    }
    if (hasFaqs) {
      const faqError = validateFaqs();
      if (faqError) {
        message.error(faqError);
        return;
      }
    }

    setLoading(true);
    try {
      const formValues = form.getFieldsValue();
      const formData = new FormData();

      const bodyData: Record<string, any> = {
        productName: formValues.productName,
        basePrice: formValues.basePrice,
        desc: descriptionContent,
        searchTag: tags,
        categoryId: formValues.categoryId,
        storeId: user?.store[0].id,
      };

      if (formValues.discountPrice)
        bodyData.discountPrice = formValues.discountPrice;
      if (formValues.discountStartDate)
        bodyData.discountStartDate = formValues.discountStartDate.toISOString();
      if (formValues.discountEndTime)
        bodyData.discountEndTime = formValues.discountEndTime.toISOString();
      if (productDetailsContent && productDetailsContent !== "<p></p>")
        bodyData.productDetails = productDetailsContent;

      // Variants — always sent, attributes as flat record
      bodyData.varients = variants
        .filter((v) => v.sku?.trim())
        .map((v) => ({
          sku: v.sku,
          stock: v.stock,
          price: v.price,
          attributes: pairsToRecord(v.attributePairs),
          coupons: v.coupons || [],
        }));

      // B2B — new shape ONLY: moq, maxMOQ, b2bPackageTag (enum), pricePerUnit
      if (hasB2B && b2bPackages.length > 0) {
        bodyData.b2bPackages = b2bPackages
          .filter(
            (p) =>
              p.moq > 0 &&
              p.maxMOQ > 0 &&
              p.b2bPackageTag &&
              p.pricePerUnit > 0,
          )
          .map((p) => ({
            moq: p.moq,
            maxMOQ: p.maxMOQ,
            b2bPackageTag: p.b2bPackageTag, // already valid enum from Select dropdown
            pricePerUnit: p.pricePerUnit,
          }));
      }

      if (hasBundles && bundleOffers.length > 0) {
        bodyData.bundleOffers = bundleOffers
          .filter((b) => b.quantity > 0 && b.discount > 0 && b.bundleTag.trim())
          .map((b) => ({
            quantity: b.quantity,
            discount: b.discount,
            bundleTag: b.bundleTag,
          }));
      }

      if (hasFaqs && faqs.length > 0) {
        bodyData.productFaq = faqs
          .filter((f) => f.question.trim() && f.answer.trim())
          .map((f) => ({ question: f.question, answer: f.answer }));
      }

      formData.append("bodyData", JSON.stringify(bodyData));
      productImages.forEach((img) => formData.append("productImage", img));

      const result = await createProduct(formData).unwrap();
      if (result.success) {
        toast.success("Product created successfully!");
        resetForm();
      } else {
        toast.error(
          "Failed to create product: " + (result.message || "Unknown error"),
        );
      }
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Unknown error";
      message.error("API call failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Reset
  // ─────────────────────────────────────────────

  const resetForm = () => {
    form.resetFields();
    setVariants([
      {
        id: "1",
        sku: "",
        price: 0,
        stock: 0,
        attributePairs: [{ id: "1_a", key: "color", value: "" }],
        coupons: [],
      },
    ]);
    setB2bPackages([
      { id: "1", moq: 0, maxMOQ: 0, b2bPackageTag: "", pricePerUnit: 0 },
    ]);
    setBundleOffers([{ id: "1", quantity: 0, discount: 0, bundleTag: "" }]);
    setFaqs([{ id: "1", question: "", answer: "" }]);
    setTags([]);
    setTagInput("");
    setBundleTagInputs({});
    setProductImages([]);
    setHasB2B(false);
    setHasBundles(false);
    setHasFaqs(false);
    setDescriptionContent("");
    setProductDetailsContent("");
  };

  // ─────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────

  const PlanBadge = () => (
    <Tag
      color={
        planType === "ScalePro"
          ? "gold"
          : planType === "pro"
          ? "blue"
          : "default"
      }
      style={{ marginLeft: 8, textTransform: "uppercase", fontWeight: 600 }}
    >
      {planType}
    </Tag>
  );

  const LockedOverlay = ({ feature }: { feature: string }) => (
    <Alert
      type="warning"
      showIcon
      icon={<LockOutlined />}
      message={
        <span>
          <strong>{feature}</strong> is not available on the{" "}
          <strong>{planType}</strong> plan.{" "}
          <Link href="/dashboard/sellapypro" style={{ color: "#fa8c16" }}>
            Upgrade your plan
          </Link>{" "}
          to unlock this feature.
        </span>
      }
      style={{ marginTop: 8 }}
    />
  );

  const FieldLabel = ({
    label,
    required,
  }: {
    label: string;
    required?: boolean;
  }) => (
    <div
      style={{ marginBottom: 4, fontSize: 12, color: "#555", fontWeight: 500 }}
    >
      {label}
      {required && <span style={{ color: "#ff4d4f", marginLeft: 2 }}>*</span>}
    </div>
  );

  // ─────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────

  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            Create Product
          </Title>
          <PlanBadge />
        </div>
        <Divider />

        <Form form={form} layout="vertical" size="large" preserve={false}>
          {/* ── Basic Info ── */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Product Name"
                name="productName"
                rules={[
                  { required: true, message: "Please enter product name" },
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Base Price"
                name="basePrice"
                rules={[{ required: true, message: "Please enter base price" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Discount — plan-gated ── */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Discount Price" name="discountPrice">
                {isPromotionsLocked ? (
                  <Tooltip title="Upgrade to Pro or ScalePro to use Promotions & Discounts">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0.00"
                      disabled
                      addonAfter={<LockOutlined style={{ color: "#faad14" }} />}
                    />
                  </Tooltip>
                ) : (
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Discount Start Date" name="discountStartDate">
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabled={isPromotionsLocked}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Discount End Date" name="discountEndTime">
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabled={isPromotionsLocked}
                />
              </Form.Item>
            </Col>
          </Row>
          {isPromotionsLocked && (
            <LockedOverlay feature="Promotions & Discounts" />
          )}

          {/* ── Category ── */}
          <Row gutter={16} style={{ marginTop: isPromotionsLocked ? 16 : 0 }}>
            <Col xs={24}>
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
                getValueFromEvent={(value) => value?.[value.length - 1]}
              >
                <Cascader
                  options={categoryOptions}
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"
                  }
                  loading={categoriesLoading}
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Description ── */}
          <Form.Item
            label="Description"
            name="desc"
            rules={[
              {
                required: true,
                validator: () =>
                  !descriptionContent ||
                  descriptionContent.trim() === "" ||
                  descriptionContent === "<p></p>"
                    ? Promise.reject(new Error("Please enter description"))
                    : Promise.resolve(),
              },
            ]}
          >
            <TiptapEditor
              content={descriptionContent}
              onChange={(html) => {
                setDescriptionContent(html);
                form.validateFields(["desc"]);
              }}
            />
          </Form.Item>

          <Form.Item label="Product Details" name="productDetails">
            <TiptapEditor
              content={productDetailsContent}
              onChange={setProductDetailsContent}
            />
          </Form.Item>

          {/* ── Search Tags ── */}
          <Form.Item label="Search Tags">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space wrap>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => removeTag(tag)}
                    closeIcon={<CloseOutlined />}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onPressEnter={addTag}
                />
                <Button type="primary" onClick={addTag} icon={<PlusOutlined />}>
                  Add
                </Button>
              </Space.Compact>
            </Space>
          </Form.Item>

          {/* ── Product Images ── */}
          <Form.Item
            label="Product Images"
            name="productImages"
            rules={[
              {
                required: true,
                validator: () =>
                  !productImages || productImages.length === 0
                    ? Promise.reject(
                        new Error("Please upload at least one product image"),
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <Upload
              multiple
              listType="picture-card"
              beforeUpload={() => false}
              onChange={handleImageUpload}
              accept="image/*"
              maxCount={10}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload Images</div>
              </div>
            </Upload>
          </Form.Item>

          {/* ════════════════════════════════════════
              PRODUCT VARIANTS — always visible, no toggle
          ════════════════════════════════════════ */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Product Variants
              </Title>
              <Button
                type="dashed"
                onClick={addVariant}
                icon={<PlusOutlined />}
              >
                Add Variant
              </Button>
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              {variants.map((variant, variantIndex) => (
                <Card
                  key={variant.id}
                  size="small"
                  style={{ backgroundColor: "#fafafa" }}
                  title={
                    <span style={{ fontWeight: 500 }}>
                      Variant {variantIndex + 1}
                    </span>
                  }
                  extra={
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeVariant(variant.id)}
                      disabled={variants.length === 1}
                    />
                  }
                >
                  {/* SKU, Price, Stock — required */}
                  <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                    <Col xs={24} sm={8}>
                      <FieldLabel label="SKU" required />
                      <Input
                        placeholder="e.g. TSHIRT-WHITE-L"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariantField(variant.id, "sku", e.target.value)
                        }
                        status={!variant.sku.trim() ? "error" : ""}
                      />
                      {!variant.sku.trim() && (
                        <div
                          style={{
                            color: "#ff4d4f",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          SKU is required
                        </div>
                      )}
                    </Col>
                    <Col xs={24} sm={8}>
                      <FieldLabel label="Price" required />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0.00"
                        value={variant.price || undefined}
                        onChange={(val) =>
                          updateVariantField(variant.id, "price", val || 0)
                        }
                        min={0}
                        step={0.01}
                        precision={2}
                        status={!variant.price ? "error" : ""}
                      />
                      {!variant.price && (
                        <div
                          style={{
                            color: "#ff4d4f",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          Price is required
                        </div>
                      )}
                    </Col>
                    <Col xs={24} sm={8}>
                      <FieldLabel label="Stock" required />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0"
                        value={
                          variant.stock !== undefined
                            ? variant.stock
                            : undefined
                        }
                        onChange={(val) =>
                          updateVariantField(variant.id, "stock", val ?? 0)
                        }
                        min={0}
                      />
                    </Col>
                  </Row>

                  {/* Dynamic Attributes */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ fontSize: 12, color: "#555", fontWeight: 500 }}
                      >
                        Attributes
                        <span
                          style={{
                            color: "#888",
                            fontWeight: 400,
                            marginLeft: 4,
                          }}
                        >
                          (color, size, material, weight…)
                        </span>
                      </span>
                      <Button
                        size="small"
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => addAttributePair(variant.id)}
                      >
                        Add Attribute
                      </Button>
                    </div>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size={6}
                    >
                      {variant.attributePairs.map((attr) => (
                        <Row key={attr.id} gutter={8} align="middle">
                          <Col xs={10} sm={9}>
                            <Select
                              style={{ width: "100%" }}
                              size="middle"
                              placeholder="Key"
                              value={attr.key || undefined}
                              onChange={(val) =>
                                updateAttributePair(
                                  variant.id,
                                  attr.id,
                                  "key",
                                  val,
                                )
                              }
                              showSearch
                              allowClear
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  <Divider style={{ margin: "4px 0" }} />
                                  <div style={{ padding: "0 8px 4px" }}>
                                    <Input
                                      size="small"
                                      placeholder="Custom key…"
                                      onPressEnter={(e) => {
                                        const val = (
                                          e.target as HTMLInputElement
                                        ).value.trim();
                                        if (val)
                                          updateAttributePair(
                                            variant.id,
                                            attr.id,
                                            "key",
                                            val,
                                          );
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                            >
                              {ATTRIBUTE_KEY_OPTIONS.map((key) => (
                                <Option key={key} value={key}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                          <Col xs={11} sm={12}>
                            <Input
                              size="middle"
                              placeholder="Value"
                              value={attr.value}
                              onChange={(e) =>
                                updateAttributePair(
                                  variant.id,
                                  attr.id,
                                  "value",
                                  e.target.value,
                                )
                              }
                            />
                          </Col>
                          <Col xs={3}>
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                removeAttributePair(variant.id, attr.id)
                              }
                              disabled={variant.attributePairs.length === 1}
                            />
                          </Col>
                        </Row>
                      ))}
                    </Space>
                  </div>

                  {/* Promotions & Discounts (Coupons) — plan-gated */}
                  <div>
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 12,
                        color: "#555",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      Promotions & Discounts — Coupons
                      {isPromotionsLocked && (
                        <Tag
                          icon={<LockOutlined />}
                          color="warning"
                          style={{ margin: 0, fontSize: 11 }}
                        >
                          Pro & ScalePro
                        </Tag>
                      )}
                    </div>
                    {isPromotionsLocked ? (
                      <Tooltip title="Upgrade to Pro or ScalePro to assign coupons">
                        <div
                          style={{ cursor: "not-allowed" }}
                          onClick={() =>
                            showUpgradeToast("Promotions & Discounts")
                          }
                        >
                          <Select
                            mode="multiple"
                            style={{ width: "100%" }}
                            placeholder="🔒 Upgrade to unlock coupon assignment"
                            disabled
                            suffixIcon={
                              <LockOutlined style={{ color: "#faad14" }} />
                            }
                          />
                        </div>
                      </Tooltip>
                    ) : (
                      <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        allowClear
                        showSearch
                        placeholder="Select coupons (optional)"
                        value={(variant.coupons || []).map(String)}
                        onChange={(val) =>
                          updateVariantField(variant.id, "coupons", val)
                        }
                        optionFilterProp="children"
                      >
                        {coupons.map((coupon: any) => (
                          <Option key={coupon.id} value={String(coupon.id)}>
                            {coupon.code || coupon.id}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          {/* ════════════════════════════════════════
              B2B PACKAGES — ScalePro only
              Payload: moq, maxMOQ, b2bPackageTag (enum), pricePerUnit
          ════════════════════════════════════════ */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space
              align="center"
              style={{ marginBottom: features.b2b && hasB2B ? 16 : 0 }}
            >
              <Switch
                checked={hasB2B}
                onChange={handleToggleB2B}
                disabled={!features.b2b}
              />
              <span>Enable B2B Packages</span>
              {!features.b2b && (
                <Tag icon={<LockOutlined />} color="warning">
                  ScalePro only
                </Tag>
              )}
            </Space>

            {!features.b2b && <LockedOverlay feature="B2B Packages" />}

            {features.b2b && hasB2B && (
              <div style={{ marginTop: 16 }}>
                <Title level={4}>B2B Packages</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {b2bPackages.map((pkg, pkgIndex) => (
                    <Card
                      key={pkg.id}
                      size="small"
                      style={{ backgroundColor: "#fafafa" }}
                      title={`Package ${pkgIndex + 1}`}
                      extra={
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeB2BPackage(pkg.id)}
                          disabled={b2bPackages.length === 1}
                        />
                      }
                    >
                      <Row gutter={[12, 12]}>
                        {/* MOQ */}
                        <Col xs={24} sm={12} md={6}>
                          <FieldLabel label="MOQ (Min Order Qty)" required />
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="e.g. 10"
                            value={pkg.moq || undefined}
                            onChange={(val) =>
                              updateB2BPackage(pkg.id, "moq", val || 0)
                            }
                            min={1}
                            status={!pkg.moq ? "error" : ""}
                          />
                        </Col>

                        {/* Max MOQ */}
                        <Col xs={24} sm={12} md={6}>
                          <FieldLabel
                            label="Max MOQ (Max Order Qty)"
                            required
                          />
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="e.g. 50"
                            value={pkg.maxMOQ || undefined}
                            onChange={(val) =>
                              updateB2BPackage(pkg.id, "maxMOQ", val || 0)
                            }
                            min={1}
                            status={
                              !pkg.maxMOQ || pkg.maxMOQ < pkg.moq ? "error" : ""
                            }
                          />
                        </Col>

                        {/* Package Tag — Select from enum values */}
                        <Col xs={24} sm={12} md={6}>
                          <FieldLabel label="Package Tag" required />
                          <Select
                            style={{ width: "100%" }}
                            placeholder="Select package type"
                            value={pkg.b2bPackageTag || undefined}
                            onChange={(val) =>
                              updateB2BPackage(pkg.id, "b2bPackageTag", val)
                            }
                            status={!pkg.b2bPackageTag ? "error" : ""}
                            options={B2B_PACKAGE_TAGS}
                          />
                        </Col>

                        {/* Price Per Unit */}
                        <Col xs={24} sm={12} md={6}>
                          <FieldLabel label="Price Per Unit" required />
                          <InputNumber
                            style={{ width: "100%" }}
                            placeholder="0.00"
                            value={pkg.pricePerUnit || undefined}
                            onChange={(val) =>
                              updateB2BPackage(pkg.id, "pricePerUnit", val || 0)
                            }
                            min={0}
                            step={0.01}
                            precision={2}
                            status={!pkg.pricePerUnit ? "error" : ""}
                          />
                        </Col>
                      </Row>

                      {/* Cross-field validation */}
                      {pkg.maxMOQ > 0 &&
                        pkg.moq > 0 &&
                        pkg.maxMOQ < pkg.moq && (
                          <Alert
                            type="error"
                            message="Max MOQ must be greater than or equal to MOQ"
                            style={{ marginTop: 10 }}
                            showIcon
                          />
                        )}

                      {/* Preview when valid */}
                      {pkg.moq > 0 &&
                        pkg.maxMOQ >= pkg.moq &&
                        pkg.pricePerUnit > 0 &&
                        pkg.b2bPackageTag && (
                          <Alert
                            type="success"
                            style={{ marginTop: 10 }}
                            showIcon
                            message={
                              <Text>
                                <strong>{pkg.b2bPackageTag}</strong>: Order{" "}
                                <strong>
                                  {pkg.moq}–{pkg.maxMOQ} units
                                </strong>{" "}
                                at{" "}
                                <strong>
                                  ${pkg.pricePerUnit.toFixed(2)}/unit
                                </strong>{" "}
                                (Total: $
                                {(pkg.moq * pkg.pricePerUnit).toFixed(2)}–$
                                {(pkg.maxMOQ * pkg.pricePerUnit).toFixed(2)})
                              </Text>
                            }
                          />
                        )}
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addB2BPackage}
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                  >
                    Add B2B Package
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          {/* ════════════════════════════════════════
              BUNDLE OFFERS — pro + ScalePro
          ════════════════════════════════════════ */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space
              align="center"
              style={{ marginBottom: features.bundles && hasBundles ? 16 : 0 }}
            >
              <Switch
                checked={hasBundles}
                onChange={handleToggleBundles}
                disabled={!features.bundles}
              />
              <span>Enable Bundle Offers</span>
              {!features.bundles && (
                <Tag icon={<LockOutlined />} color="warning">
                  Pro & ScalePro only
                </Tag>
              )}
            </Space>

            {!features.bundles && <LockedOverlay feature="Bundle Offers" />}

            {features.bundles && hasBundles && (
              <div style={{ marginTop: 16 }}>
                <Title level={4}>Bundle Offers</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {bundleOffers.map((bundle, bundleIndex) => {
                    const basePrice = getCurrentBasePrice();
                    const calc = calculateBundlePrice(
                      basePrice,
                      bundle.quantity,
                      bundle.discount,
                    );
                    const bundleTags = bundle.bundleTag
                      ? bundle.bundleTag
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      : [];

                    return (
                      <Card
                        key={bundle.id}
                        size="small"
                        style={{ backgroundColor: "#fafafa" }}
                        title={`Bundle ${bundleIndex + 1}`}
                        extra={
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeBundleOffer(bundle.id)}
                            disabled={bundleOffers.length === 1}
                          />
                        }
                      >
                        <Row gutter={[12, 12]}>
                          <Col xs={24} md={5}>
                            <FieldLabel label="Quantity" required />
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="Qty"
                              value={bundle.quantity || undefined}
                              onChange={(val) =>
                                updateBundleOffer(
                                  bundle.id,
                                  "quantity",
                                  val || 0,
                                )
                              }
                              min={1}
                              status={!bundle.quantity ? "error" : ""}
                            />
                          </Col>
                          <Col xs={24} md={5}>
                            <FieldLabel label="Discount %" required />
                            <InputNumber
                              style={{ width: "100%" }}
                              placeholder="%"
                              value={bundle.discount || undefined}
                              onChange={(val) =>
                                updateBundleOffer(
                                  bundle.id,
                                  "discount",
                                  val || 0,
                                )
                              }
                              min={0}
                              max={100}
                              step={0.01}
                              status={!bundle.discount ? "error" : ""}
                            />
                          </Col>
                          <Col xs={24} md={14}>
                            <FieldLabel label="Bundle Tags" required />
                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              <Space wrap>
                                {bundleTags.map((tag) => (
                                  <Tag
                                    key={tag}
                                    closable
                                    onClose={() =>
                                      handleRemoveBundleTag(bundle.id, tag)
                                    }
                                    closeIcon={<CloseOutlined />}
                                  >
                                    {tag}
                                  </Tag>
                                ))}
                              </Space>
                              <Space.Compact style={{ width: "100%" }}>
                                <Input
                                  value={bundleTagInputs[bundle.id] || ""}
                                  onChange={(e) =>
                                    setBundleTagInputs((prev) => ({
                                      ...prev,
                                      [bundle.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Add a bundle tag"
                                  onPressEnter={(e) => {
                                    e.preventDefault();
                                    handleAddBundleTag(bundle.id);
                                  }}
                                  status={
                                    bundleTags.length === 0 ? "error" : ""
                                  }
                                />
                                <Button
                                  type="primary"
                                  onClick={() => handleAddBundleTag(bundle.id)}
                                  icon={<PlusOutlined />}
                                >
                                  Add
                                </Button>
                              </Space.Compact>
                            </Space>
                          </Col>
                        </Row>

                        {basePrice > 0 &&
                          bundle.quantity > 0 &&
                          bundle.discount > 0 && (
                            <Alert
                              style={{ marginTop: 12 }}
                              message="Bundle Pricing Preview"
                              description={
                                <div>
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong>Original: </Text>
                                    <Text delete>
                                      ${calc.originalPrice.toFixed(2)}
                                    </Text>
                                  </div>
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong>Discounted: </Text>
                                    <Text
                                      type="success"
                                      style={{ fontSize: 16 }}
                                    >
                                      ${calc.discountedPrice.toFixed(2)}
                                    </Text>
                                  </div>
                                  <div style={{ marginBottom: 4 }}>
                                    <Text strong>Savings: </Text>
                                    <Text type="danger">
                                      ${calc.savings.toFixed(2)} (
                                      {bundle.discount}% Off)
                                    </Text>
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 8,
                                      padding: 8,
                                      backgroundColor: "#f0f5ff",
                                      borderRadius: 4,
                                    }}
                                  >
                                    <Text strong style={{ color: "#1890ff" }}>
                                      Buy {bundle.quantity} for $
                                      {calc.discountedPrice.toFixed(2)}
                                    </Text>
                                  </div>
                                </div>
                              }
                              type="info"
                              showIcon
                            />
                          )}
                      </Card>
                    );
                  })}
                  <Button
                    type="dashed"
                    onClick={addBundleOffer}
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                  >
                    Add Bundle Offer
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          {/* ════════════════════════════════════════
              PRODUCT FAQs — no plan restriction
          ════════════════════════════════════════ */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Switch checked={hasFaqs} onChange={setHasFaqs} />
              <span>Enable Product FAQs</span>
            </Space>

            {hasFaqs && (
              <div>
                <Title level={4}>Product FAQs</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {faqs.map((faq, faqIndex) => (
                    <Card
                      key={faq.id}
                      size="small"
                      style={{ backgroundColor: "#fafafa" }}
                      title={`FAQ ${faqIndex + 1}`}
                      extra={
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFaq(faq.id)}
                          disabled={faqs.length === 1}
                        />
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} md={12}>
                          <Input
                            placeholder="Question *"
                            value={faq.question}
                            onChange={(e) =>
                              updateFaq(faq.id, "question", e.target.value)
                            }
                            status={!faq.question.trim() ? "error" : ""}
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <Input
                            placeholder="Answer *"
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaq(faq.id, "answer", e.target.value)
                            }
                            status={!faq.answer.trim() ? "error" : ""}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addFaq}
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                  >
                    Add FAQ
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          {/* ── Submit ── */}
          <Form.Item>
            <Button
              type="primary"
              loading={createProductLoading || loading}
              size="large"
              onClick={handleSubmit}
              block
            >
              Create Product
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
