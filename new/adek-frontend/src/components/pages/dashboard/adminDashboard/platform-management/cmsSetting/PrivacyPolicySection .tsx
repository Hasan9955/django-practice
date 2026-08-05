/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button/Button";
import Card from "antd/es/card/Card";
import {
  useCreateOrUpdateFaqMutation,
  useGetPlatformDataQuery,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import toast from "react-hot-toast";
import TiptapEditor from "@/components/shared/TiptapEditor";

const PrivacyPolicySection = () => {
  const { data: platformData, isLoading: isPlatformDataLoading } =
    useGetPlatformDataQuery({});

  const cmsSettingId = platformData?.result?.CmsSetting?.[0]?.id;
  const privacyPolicyData =
    platformData?.result?.CmsSetting?.[0]?.privacyPolicy?.content;

  const [submitPrivacyPolicy, { isLoading: isPrivacyPolicyLoading }] =
    useCreateOrUpdateFaqMutation();

  // ✅ No useEffect needed — initialized directly from onChange
  const [privacyContent, setPrivacyContent] = useState("");

  const handleSubmitPrivacyPolicy = async () => {
    try {
      const strippedContent = privacyContent.replace(/<[^>]*>/g, "").trim();
      if (!strippedContent) {
        toast.error("Please enter privacy policy content");
        return;
      }

      const privacyPayload = {
        cmsSettingId,
        privacyPolicy: privacyContent,
      };

      const response = await submitPrivacyPolicy(privacyPayload).unwrap();
      toast.success("Privacy Policy updated successfully!");
      console.log("Privacy Policy Response:", response);
    } catch (error: any) {
      console.error("Privacy Policy submission error:", error);
      toast.error(error?.data?.message || "Failed to update Privacy Policy");
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-color-1c font-inter text-2xl font-medium leading-normal mb-3">
          Privacy and policy
        </h2>
        <p className="text-[#5F6368] font-inter text-base font-normal">
          Add your preferred content
        </p>
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy and policy content
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {isPlatformDataLoading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              ) : (
                <TiptapEditor
                  key={privacyPolicyData || "empty"}
                  content={privacyPolicyData || ""}
                  onChange={setPrivacyContent}
                  placeholder="Enter privacy policy content..."
                />
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmitPrivacyPolicy}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 px-14"
            disabled={isPrivacyPolicyLoading || isPlatformDataLoading}
          >
            {isPrivacyPolicyLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicySection;
