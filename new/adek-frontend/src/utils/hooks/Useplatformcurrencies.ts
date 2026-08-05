import { useMemo } from "react";
import {
  isSupportedCurrency,
  getDynamicCurrencyOptions,
  sortWithLocalFirst,
  type CurrencyCode,
  type CurrencyInfo,
} from "@/lib/currencies";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";

interface UsePlatformCurrenciesResult {
  currencyCodes: CurrencyCode[];     // validated + BDT-first sorted codes
  currencyOptions: CurrencyInfo[];   // full objects ready for dropdowns
  isLoading: boolean;
}

/**
 * Fetches platform-supported currencies from the backend,
 * validates each code against CURRENCIESAll, and returns
 * a BDT-first sorted list ready for CurrencySelector.
 */
export const usePlatformCurrencies = (): UsePlatformCurrenciesResult => {
  const { data, isLoading } = useGetPlatformDataForUserSupportQuery({});

  const currencyCodes = useMemo((): CurrencyCode[] => {
    // data?.result?.currency is string[] from backend — must validate each entry
    const raw: string[] = data?.result?.currency ?? [];

    if (raw.length === 0) return [];

    // Filter out any unknown codes the backend may send, then pin BDT first
    const validated = raw.filter(isSupportedCurrency); // narrows string → CurrencyCode
    return sortWithLocalFirst(validated);
  }, [data]);

  const currencyOptions = useMemo(
    (): CurrencyInfo[] => getDynamicCurrencyOptions(currencyCodes),
    [currencyCodes],
  );

  return { currencyCodes, currencyOptions, isLoading };
};