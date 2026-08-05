"use client";

import { useState, useEffect, useMemo } from "react";
import { IndianRupee, Plus, X } from "lucide-react";
import { Card, Select, Spin } from "antd";
import {
  useGetPlatformDataQuery,
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import { CardContent } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { CURRENCIESAll } from "@/lib/currencies";

// Shared interfaces
interface CurrencyInput {
  id: string;
  value: string;
}

const CurrencySection = () => {
  const [updatePlatform, { isLoading }] = useUpdatePlatformMutation();
  const {
    data: platform,
    isLoading: PlatformLoading,
    refetch,
  } = useGetPlatformDataQuery({});

  const [currencies, setCurrencies] = useState<CurrencyInput[]>([]);

  // Compact + Beautiful options (perfect for small select field)
  const currencyOptions = useMemo(() => {
    return Object.values(CURRENCIESAll).map((currency) => ({
      value: currency.code,
      label: (
        <div className="flex items-center gap-3 py-1 w-full">
          {/* Flag - smaller */}
          <span className="text-2xl flex-shrink-0">{currency.flag}</span>

          {/* Code + Symbol + Name - compact */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-bold text-[#1C1C1C]">{currency.code}</span>
              <span className="font-mono text-[#5F6368] text-base">
                {currency.symbol}
              </span>
            </div>
            <div className="text-xs text-[#5F6368] truncate mt-0.5">
              {currency.name}
            </div>
          </div>
        </div>
      ),
    }));
  }, []);

  // Load currencies from API
  useEffect(() => {
    const currList = platform?.result?.currency ?? [];
    const loadedCurrencies = currList.map((c: string, i: number) => ({
      id: `${i}`,
      value: c,
    }));
    setCurrencies(
      loadedCurrencies.length > 0 ? loadedCurrencies : [{ id: "0", value: "" }],
    );
  }, [platform]);

  // Handlers
  const addCurrencyInput = () => {
    const newId = Date.now().toString();
    setCurrencies([...currencies, { id: newId, value: "" }]);
  };

  const removeCurrencyInput = (index: number) => {
    if (currencies.length > 1) {
      setCurrencies(currencies.filter((_, i) => i !== index));
    }
  };

  const updateCurrencyValue = (index: number, value: string) => {
    setCurrencies(
      currencies.map((currency, i) =>
        i === index ? { ...currency, value } : currency,
      ),
    );
  };

  const handleSubmitCurrencies = async () => {
    const validCurrencies = currencies
      .map((currency) => currency.value)
      .filter((value) => value.trim() !== "");

    if (validCurrencies.length === 0) {
      toast.error("Please select at least one currency");
      return;
    }

    const payload = {
      currency: validCurrencies,
    };

    const formData = new FormData();
    formData.append("bodyData", JSON.stringify(payload));

    try {
      await updatePlatform(formData).unwrap();
      toast.success("Currencies saved successfully");
      refetch();
    } catch (error) {
      console.error("Error updating currencies:", error);
      toast.error("Failed to save currencies");
    }
  };

  return (
    <div>
      {/* Section Header */}
      <div className="pb-10">
        <h4 className="text-[#1C1C1C] font-medium pb-3 text-xl leading-normal">
          Default currencies
        </h4>
        <p className="text-[#5F6368] text-base font-normal">
          Add your preferred currencies
        </p>
      </div>

      {/* Currencies List */}
      <div>
        <p className="text-[#1C1C1C] text-xl font-medium flex items-center mb-4 gap-2">
          <IndianRupee className="text-[#5F6368] w-5 h-5" />
          Currencies
        </p>

        <Card className="bg-[#F2F2F2] border-none">
          <CardContent className="p-4">
            {PlatformLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
              </div>
            ) : (
              <div className="space-y-3">
                {currencies.map((currency, index) => {
                  const selectedCurrencies = currencies
                    .map((c) => c.value)
                    .filter((v): v is string => Boolean(v));

                  const availableOptions = currencyOptions.filter(
                    (opt) =>
                      !selectedCurrencies.includes(opt.value) ||
                      opt.value === currency.value,
                  );

                  return (
                    <div key={currency.id} className="flex items-center gap-3">
                      <Select
                        showSearch
                        size="large"
                        placeholder="Select currency"
                        value={currency.value || undefined}
                        onChange={(value) =>
                          updateCurrencyValue(index, value ?? "")
                        }
                        optionFilterProp="value"
                        filterOption={(input, option) => {
                          if (!option?.value) return false;
                          const currInfo =
                            CURRENCIESAll[
                              option.value as keyof typeof CURRENCIESAll
                            ];
                          if (!currInfo) return false;
                          const search = input.toLowerCase();
                          return (
                            currInfo.code.toLowerCase().includes(search) ||
                            currInfo.name.toLowerCase().includes(search) ||
                            currInfo.symbol.toLowerCase().includes(search)
                          );
                        }}
                        options={availableOptions}
                        className="flex-1"
                        allowClear
                        dropdownStyle={{
                          maxHeight: 400,
                          borderRadius: "12px",
                          padding: "8px",
                          boxShadow:
                            "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                        }}
                        style={{
                          width: "100%",
                        }}
                      />
                      {currencies.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeCurrencyInput(index)}
                          className="shrink-0 w-10 h-10 rounded-xl border border-gray-400 hover:bg-red-50 hover:border-red-400 hover:text-red-600 active:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center mt-6 justify-between gap-3 flex-wrap">
              <Button
                variant="outline"
                className="px-6 py-3 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 active:bg-blue-100 font-medium transition-colors"
                onClick={addCurrencyInput}
                disabled={PlatformLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Currency
              </Button>
              <Button
                className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-medium transition-colors shadow-sm"
                onClick={handleSubmitCurrencies}
                disabled={isLoading || PlatformLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingOutlined className="w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Save Currencies
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencySection;
