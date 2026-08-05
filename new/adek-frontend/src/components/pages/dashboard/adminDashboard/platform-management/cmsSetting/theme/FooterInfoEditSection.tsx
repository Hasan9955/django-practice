/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useGetCmsContentQuery } from "@/redux/features/banner/bannerSlice";
import {
  useGetPlatformDataQuery,
  useUpdateFooterMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, Card, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import TiptapEditor from "@/components/shared/TiptapEditor";

const { Item } = Form;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterFormValues {
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;

  // Social media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedInUrl: string;
  youtubeUrl: string;
}

// Rich-text fields managed outside Ant Design Form (TiptapEditor)
interface RichTextFields {
  companyInfo: string;
  moneyBackGuarantee: string;
  learnToSell: string;
  news: string;
  invertors: string;
  polices: string;
  registration: string;
  seamlessBuying: string;
  sellerAccount: string;
}

// ─── Social Media Fields Config ───────────────────────────────────────────────

const SOCIAL_FIELDS: {
  name: keyof FooterFormValues;
  label: string;
  placeholder: string;
}[] = [
  {
    name: "facebookUrl",
    label: "Facebook",
    placeholder: "https://facebook.com/...",
  },
  {
    name: "twitterUrl",
    label: "Twitter / X",
    placeholder: "https://twitter.com/...",
  },
  {
    name: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/...",
  },
  {
    name: "linkedInUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/...",
  },
  {
    name: "youtubeUrl",
    label: "YouTube",
    placeholder: "https://youtube.com/...",
  },
];

// ─── Rich Text Field Config ────────────────────────────────────────────────────

const RICH_TEXT_FIELDS: {
  key: keyof RichTextFields;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "companyInfo",
    label: "Company Information",
    placeholder: "Tell about your company...",
  },
  {
    key: "moneyBackGuarantee",
    label: "Money Back Guarantee",
    placeholder: "Describe your money back guarantee policy...",
  },
  {
    key: "learnToSell",
    label: "Learn To Sell",
    placeholder: "Write about how sellers can get started...",
  },
  {
    key: "news",
    label: "News",
    placeholder: "Write latest news or announcements...",
  },
  {
    key: "invertors",
    label: "Investors",
    placeholder: "Write about investor information...",
  },
  {
    key: "polices",
    label: "Policies",
    placeholder: "Write platform policies...",
  },
  {
    key: "registration",
    label: "Registration",
    placeholder: "Write registration guidelines...",
  },
  {
    key: "seamlessBuying",
    label: "Seamless Buying",
    placeholder: "Write about the buying experience...",
  },
  {
    key: "sellerAccount",
    label: "Seller Account",
    placeholder: "Write about seller account features...",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const FooterInfoEditSection = () => {
  const [form] = Form.useForm<FooterFormValues>();

  // ── Rich-text state (TiptapEditor fields) ──────────────────────────────────
  const [richTextValues, setRichTextValues] = useState<RichTextFields>({
    companyInfo: "",
    moneyBackGuarantee: "",
    learnToSell: "",
    news: "",
    invertors: "",
    polices: "",
    registration: "",
    seamlessBuying: "",
    sellerAccount: "",
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: platformData, isLoading: isPlatformDataLoading } =
    useGetPlatformDataQuery({});

  const { data: cmsData, isLoading: isCmsLoading } = useGetCmsContentQuery({});

  const [updateFooter, { isLoading: isSubmitting }] = useUpdateFooterMutation();

  const cmsSettingId = platformData?.result?.CmsSetting?.[0]?.id;
  const existingFooter = cmsData?.result?.footer;

  // ── Auto-fill form & rich-text state from API data ─────────────────────────

  useEffect(() => {
    if (!existingFooter) return;

    // Fill standard Ant Design form fields
    form.setFieldsValue({
      facebookUrl: existingFooter.facebookUrl ?? "",
      twitterUrl: existingFooter.twitterUrl ?? "",
      instagramUrl: existingFooter.instagramUrl ?? "",
      linkedInUrl: existingFooter.linkedInUrl ?? "",
      youtubeUrl: existingFooter.youtubeUrl ?? "",
      contactEmail: existingFooter.contactEmail ?? "",
      contactPhone: existingFooter.contactPhone ?? "",
      contactAddress: existingFooter.contactAddress ?? "",
    });

    // Fill TiptapEditor fields — fall back to "" so editor doesn't break on null
    setRichTextValues({
      companyInfo: existingFooter.companyInfo ?? "",
      moneyBackGuarantee: existingFooter.moneyBackGuarantee ?? "",
      learnToSell: existingFooter.learnToSell ?? "",
      news: existingFooter.news ?? "",
      invertors: existingFooter.invertors ?? "",
      polices: existingFooter.polices ?? "",
      registration: existingFooter.registration ?? "",
      seamlessBuying: existingFooter.seamlessBuying ?? "",
      sellerAccount: existingFooter.sellerAccount ?? "",
    });
  }, [existingFooter, form]);

  // ── Helper: update a single rich-text field ────────────────────────────────

  const handleRichTextChange =
    (key: keyof RichTextFields) => (value: string) => {
      setRichTextValues((prev) => ({ ...prev, [key]: value }));
    };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onFinish = async (values: FooterFormValues) => {
    if (!cmsSettingId) {
      toast.error("CMS Setting ID not found. Please reload and try again.");
      return;
    }

    const toastId = toast.loading("Saving footer...");

    try {
      const payload = {
        cmsSettingId,
        footer: {
          ...values,           // standard form fields
          ...richTextValues,   // TiptapEditor fields merged in
        },
      };

      const res = await updateFooter(payload).unwrap();

      if (res?.success) {
        toast.success("Footer updated successfully", { id: toastId });
      } else {
        throw new Error(res?.message || "Operation not successful");
      }
    } catch (err: any) {
      console.error("Footer update error:", err);
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to update footer information";
      toast.error(errorMsg, { id: toastId });
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isPlatformDataLoading || isCmsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading footer data..." />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Card className="shadow-lg mt-8 lg:mt-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Edit Footer Information
        </h1>
        <p className="text-gray-500 mt-1">
          Update company information, guarantee, social links and contact
          details
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark="optional"
      >
        {/* ─── Rich Text Sections (TiptapEditor) ─── */}
        <Divider orientation="left">Rich Text Content</Divider>

        <div className="grid grid-cols-1 gap-8 mb-8">
          {RICH_TEXT_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              {/* 
                Key prop forces TiptapEditor to re-mount when API data first
                arrives, so the editor initialises with the correct content.
              */}
              <TiptapEditor
                key={`${key}-${existingFooter ? "loaded" : "empty"}`}
                content={richTextValues[key]}
                onChange={handleRichTextChange(key)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* ─── Social Media ─── */}
        <Divider orientation="left">Social Media Links</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {SOCIAL_FIELDS.map((field) => (
            <Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={[
                { required: true, message: `Please enter ${field.label} URL` },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder={field.placeholder} />
            </Item>
          ))}
        </div>

        {/* ─── Contact ─── */}
        <Divider orientation="left">Contact Information</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Item
            name="contactEmail"
            label="Contact Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="support@example.com" />
          </Item>

          <Item
            name="contactPhone"
            label="Contact Phone"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input placeholder="+1 (555) 123-4567" />
          </Item>

          <Item
            name="contactAddress"
            label="Physical Address"
            rules={[{ required: true, message: "Address is required" }]}
            className="md:col-span-2"
          >
            <Input placeholder="123 Main St, City, State, ZIP" />
          </Item>
        </div>

        {/* ─── Submit ─── */}
        <Form.Item className="mt-10 text-center md:text-left">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={!cmsSettingId}
            size="large"
            icon={<SaveOutlined />}
            className="min-w-[180px]"
          >
            Save Changes
          </Button>

          {!cmsSettingId && (
            <p className="text-red-500 text-sm mt-2">
              ⚠ CMS Setting ID is missing. Please reload the page.
            </p>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FooterInfoEditSection;