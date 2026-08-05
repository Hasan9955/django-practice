/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/Button/Button";
import {
  useGetPlatformDataQuery,
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import { Card } from "antd";
import { CardContent } from "@/components/ui/Card/Card";
import { Input, Spin } from "antd";
import { Percent, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const CommissionSection = () => {
  const [updatePlatform, { isLoading }] = useUpdatePlatformMutation();
  const {
    data: platform,
    isLoading: platformLoading,
    refetch,
  } = useGetPlatformDataQuery({});

  const [commissionRate, setCommissionRate] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Load commission rate from API
  useEffect(() => {
    const rate = platform?.result?.commisionRate;
    setCommissionRate(rate !== undefined ? String(rate) : "");
  }, [platform]);

  // Validate commission rate input
  const validateCommissionRate = (value: string): boolean => {
    setValidationError("");

    if (!value || value.trim() === "") {
      setValidationError("Commission rate is required");
      return false;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      setValidationError("Please enter a valid number");
      return false;
    }

    if (numValue < 0) {
      setValidationError("Commission rate cannot be negative");
      return false;
    }

    if (numValue > 100) {
      setValidationError("Commission rate cannot exceed 100%");
      return false;
    }

    return true;
  };

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommissionRate(value);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  // Handle form submission
  const handleSubmitCommissionRates = async () => {
    if (!validateCommissionRate(commissionRate)) {
      toast.error(validationError || "Please enter a valid commission rate");
      return;
    }

    const payload = {
      commisionRate: Number(commissionRate),
    };

    const formData = new FormData();
    formData.append("bodyData", JSON.stringify(payload));

    try {
      await updatePlatform(formData).unwrap();
      toast.success("Commission rate saved successfully");
      refetch();
    } catch (error: any) {
      console.error("Error updating commission rate:", error);
      const errorMessage =
        error?.data?.message || "Failed to save commission rate";
      toast.error(errorMessage);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitCommissionRates();
    }
  };

  return (
    <div>
      {/* Section Header */}
      <div className="pb-10">
        <h4 className="text-[#1C1C1C] font-medium pb-3 text-xl leading-normal">
          Commission Rates
        </h4>
        <p className="text-[#5F6368] text-base font-normal">
          Set the platform commission rate for transactions
        </p>
      </div>

      {/* Commission Input Card */}
      <div>
        <p className="text-[#1C1C1C] text-xl font-medium flex items-center mb-4 gap-2">
          <Percent className="text-[#5F6368] w-5 h-5" />
          Commission Rate
        </p>

        <Card className="bg-[#F2F2F2] border-none">
          <CardContent className="p-6">
            {platformLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Input with Label */}
                <div className="w-full max-w-md">
                  <label
                    htmlFor="commission-input"
                    className="block text-sm font-medium text-[#1C1C1C] mb-2"
                  >
                    Enter commission rate (%)
                  </label>

                  <Input
                    id="commission-input"
                    placeholder="e.g., 5.5"
                    value={commissionRate}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    size="large"
                    className={`${
                      validationError ? "border-red-500" : ""
                    } hover:border-blue-400 focus:border-blue-500`}
                    suffix={
                      <span className="text-[#5F6368] font-medium">%</span>
                    }
                    disabled={isLoading}
                    status={validationError ? "error" : undefined}
                  />

                  {/* Validation Error Message */}
                  {validationError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span>
                      {validationError}
                    </p>
                  )}

                  {/* Helper Text */}
                  <p className="text-[#5F6368] text-xs mt-2">
                    Enter a value between 0 and 100. Decimals are allowed (e.g.,
                    2.5%).
                  </p>
                </div>

                {/* Current Rate Display */}
                {platform?.result?.commisionRate !== undefined && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 w-full max-w-md">
                    <p className="text-sm text-[#5F6368] mb-1">
                      Current Commission Rate
                    </p>
                    <p className="text-2xl font-bold text-[#1C1C1C]">
                      {platform.result.commisionRate}%
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitCommissionRates}
                    disabled={isLoading || platformLoading || !!validationError}
                  >
                    {isLoading ? (
                      <>
                        <LoadingOutlined className="w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Save Commission Rate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommissionSection;
