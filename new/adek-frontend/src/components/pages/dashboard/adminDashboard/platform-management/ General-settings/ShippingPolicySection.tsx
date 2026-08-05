/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/Button/Button";
import { CardContent } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input/Input";
import {
  useGetPlatformDataQuery,
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import { Card, Spin } from "antd";
import { IndianRupee, Plus, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface Policy {
  id: string;
  value: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build the FormData payload expected by the backend Multer middleware. */
const buildFormData = (
  platform: any,
  shippingPolicy: string[],
): FormData => {
  const bodyData = {
    banner: platform?.result?.banner ?? "",
    crmBanner: platform?.result?.crmBanner ?? "",
    categoryImage: platform?.result?.categoryImage ?? "",
    shippingPolicy,
  };
  const formData = new FormData();
  formData.append("bodyData", JSON.stringify(bodyData));
  return formData;
};

// ────────────────────────────────────────────────────────────────────────────

const ShippingPolicySection = () => {
  const [updatePlatform, { isLoading }] = useUpdatePlatformMutation();
  const {
    data: platform,
    isLoading: platformLoading,
    refetch,
  } = useGetPlatformDataQuery({});

  const [policies, setPolicies] = useState<Policy[]>([
    { id: `policy-0-${Date.now()}`, value: "" },
  ]);
  const [hasChanges, setHasChanges] = useState(false);

  // ── Seed local state from API ────────────────────────────────────────────
  useEffect(() => {
    const shippingPolicies: string[] = platform?.result?.shippingPolicy ?? [];
    const loadedPolicies = shippingPolicies.map((p: string, i: number) => ({
      id: `policy-${i}-${Date.now()}`,
      value: p,
    }));
    setPolicies(
      loadedPolicies.length > 0
        ? loadedPolicies
        : [{ id: `policy-0-${Date.now()}`, value: "" }],
    );
    setHasChanges(false);
  }, [platform]);

  // ── Dirty-state tracking ─────────────────────────────────────────────────
  useEffect(() => {
    const originalPolicies: string[] = platform?.result?.shippingPolicy ?? [];
    const currentPolicies = policies
      .map((p) => p.value.trim())
      .filter((v) => v !== "");

    setHasChanges(
      JSON.stringify(originalPolicies) !== JSON.stringify(currentPolicies),
    );
  }, [policies, platform]);

  // ── Add new empty row ────────────────────────────────────────────────────
  const addPolicyInput = () => {
    setPolicies((prev) => [
      ...prev,
      { id: `policy-${prev.length}-${Date.now()}`, value: "" },
    ]);
  };

  // ── Update a single row ──────────────────────────────────────────────────
  const updatePolicyValue = (id: string, value: string) => {
    setPolicies((prev) =>
      prev.map((policy) => (policy.id === id ? { ...policy, value } : policy)),
    );
  };

  // ── Remove row AND persist the deletion to the backend ───────────────────
  /**
   * FIX: Previously this only mutated local state.
   * Now it removes the row, then immediately calls the API so the
   * deletion is actually saved. The payload is built from the
   * *updated* list (not merged with old API data) so already-deleted
   * entries are not re-inserted.
   */
  const removePolicyInput = async (id: string) => {
    if (policies.length === 1) return;

    // Compute the next list before touching state so we can read it right away.
    const updatedPolicies = policies.filter((policy) => policy.id !== id);
    const updatedValues = updatedPolicies
      .map((p) => p.value.trim())
      .filter((v) => v !== "");

    // Optimistic UI update
    setPolicies(updatedPolicies);

    try {
      await updatePlatform(buildFormData(platform, updatedValues)).unwrap();
      toast.success("Policy removed successfully");
      refetch();
    } catch (error: any) {
      // Roll back on failure
      setPolicies(policies);
      console.error("Error removing shipping policy:", error);
      toast.error(error?.data?.message || "Failed to remove policy");
    }
  };

  // ── Save all (typed / edited) policies ──────────────────────────────────
  /**
   * FIX: Previously used `[...oldPolicies, ...newPolicies]` which caused
   * deleted entries to be re-added on the next save.
   * Now we send ONLY the current local state — the single source of truth.
   */
  const handleSubmitPolicies = async () => {
    const currentPolicies = policies
      .map((p) => p.value.trim())
      .filter((v) => v !== "");

    if (currentPolicies.length === 0) {
      toast.error("Please add at least one shipping policy");
      return;
    }

    try {
      await updatePlatform(
        buildFormData(platform, currentPolicies),
      ).unwrap();
      toast.success("Shipping policies saved successfully");
      setHasChanges(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating shipping policies:", error);
      toast.error(error?.data?.message || "Failed to save shipping policies");
    }
  };

  const allPoliciesEmpty = policies.every((p) => p.value.trim() === "");

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section Header */}
      <div className="mb-10">
        <h4 className="text-[#1C1C1C] font-medium text-2xl">
          Shipping Policies
        </h4>
        <p className="text-[#5F6368] text-base font-normal">
          Add your preferred shipping policies to inform customers
        </p>
      </div>

      {/* Policies List */}
      <div className="flex flex-col gap-3">
        <p className="text-[#1C1C1C] text-xl font-medium flex items-center gap-2">
          <IndianRupee className="text-[#5F6368] w-5 h-5" />
          Policies
        </p>

        <Card className="bg-[#F2F2F2] border-none">
          <CardContent className="p-4">
            {platformLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {policies.map((policy, index) => (
                    <div key={policy.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`Shipping policy ${index + 1}`}
                        value={policy.value}
                        onChange={(e) =>
                          updatePolicyValue(policy.id, e.target.value)
                        }
                        className="flex-1 custom-input-container"
                        maxLength={500}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removePolicyInput(policy.id)}
                        disabled={policies.length === 1 || isLoading}
                        className="shrink-0 rounded-[12px] border border-gray-600 hover:bg-slate-50 active:bg-[#E0E0E0] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove policy"
                      >
                        {isLoading ? (
                          <LoadingOutlined className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center mt-6 justify-between gap-3 flex-wrap">
                  <Button
                    variant="link"
                    className="text-start p-0 h-auto px-6 py-3 rounded-lg border-blue-primary border text-blue-primary hover:bg-blue-50 transition-colors"
                    onClick={addPolicyInput}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Policy
                  </Button>
                  <Button
                    variant="link"
                    className="text-start px-6 py-3 rounded-lg h-auto text-white bg-blue-primary hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitPolicies}
                    disabled={isLoading || !hasChanges || allPoliciesEmpty}
                  >
                    {isLoading ? (
                      <>
                        <LoadingOutlined className="w-4 h-4 mr-1" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save Policies
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingPolicySection;