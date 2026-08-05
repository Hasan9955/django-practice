"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentCurrency } from "@/redux/features/currency/currencySlice";
import {
  CURRENCIESAll,
  getCurrencyInfo,
  isSupportedCurrency,
  type CurrencyCode,
  type CurrencyInfo,
} from "@/lib/currencies";

interface CurrencySelectorProps {
  availableCurrencies?: CurrencyInfo[];
  isLoading?: boolean;
}

export default function CurrencySelector({
  availableCurrencies,
  isLoading = false,
}: CurrencySelectorProps) {
  const dispatch = useAppDispatch();
  const currentCurrency = useAppSelector(
    (state) => state.currency.currentCurrency,
  );
  const [isOpen, setIsOpen] = useState(false);

  const displayList: CurrencyInfo[] =
    availableCurrencies ?? Object.values(CURRENCIESAll);

  useEffect(() => {
    if (isLoading || displayList.length === 0) return;
    const isCurrentValid = displayList.some(
      (info) => (info.code as CurrencyCode) === currentCurrency,
    );
    if (!isCurrentValid) {
      const firstCode = displayList[0].code;
      if (isSupportedCurrency(firstCode)) {
        dispatch(setCurrentCurrency(firstCode));
      }
    }
  }, [displayList, currentCurrency, isLoading, dispatch]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentInfo =
    displayList.find(
      (info) => (info.code as CurrencyCode) === currentCurrency,
    ) ??
    displayList[0] ??
    getCurrencyInfo("BDT");

  const handleSelect = (code: CurrencyCode) => {
    dispatch(setCurrentCurrency(code));
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-sm text-gray-400 animate-pulse">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-gray-400 px-1 py-0.5 sm:px-2 sm:py-1 rounded-2xl text-sm font-medium transition-all whitespace-nowrap"
      >
        <span>{currentInfo.flag}</span>
        <span className="font-semibold">{currentInfo.code}</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* ── Mobile: bottom sheet ── */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <p className="text-center text-sm font-semibold text-gray-500 pb-2 shrink-0">
              Select Currency
            </p>
            <div className="overflow-y-auto pb-6">
              {displayList?.map((info) => {
                const code = info.code as CurrencyCode;
                const isSelected = code === currentCurrency;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelect(code)}
                    className={`w-full px-6 py-3.5 text-left flex items-center gap-4 transition-all active:bg-gray-100 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-2xl">{info.flag}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {info.symbol} {info.code}
                      </div>
                      <div className="text-xs text-gray-500">{info.name}</div>
                    </div>
                    {isSelected && (
                      <span className="text-blue-500 font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Desktop: dropdown ── */}
          <div className="hidden sm:block absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-3xl shadow-xl py-2 z-50 max-h-[340px] overflow-auto">
            {displayList?.map((info) => {
              const code = info.code as CurrencyCode;
              const isSelected = code === currentCurrency;
              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition-all ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-2xl">{info.flag}</span>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {info.symbol} {info.code}
                    </div>
                    <div className="text-xs text-gray-500">{info.name}</div>
                  </div>
                  {isSelected && (
                    <span className="text-blue-500 font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
