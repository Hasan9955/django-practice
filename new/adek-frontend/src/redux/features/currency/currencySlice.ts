import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// FIX: removed `CURRENCIES` import (deleted) — use `isSupportedCurrency` guard instead
import { CurrencyCode, isSupportedCurrency } from "@/lib/currencies";
import { fetchExchangeRatesAction } from "@/lib/actions/exchangeRates";
import type { RootState } from "@/redux/store";

interface CurrencyState {
  currentCurrency: CurrencyCode;
  baseCurrency: CurrencyCode;
  rates: Record<string, number>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CurrencyState = {
  currentCurrency: "BDT",
  baseCurrency: "USD",
  rates: {},
  status: "idle",
  error: null,
};

// ==================== SERVER ACTION THUNK ====================
export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchRates",
  async () => {
    return await fetchExchangeRatesAction();
  },
);

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrentCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currentCurrency = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("preferredCurrency", action.payload);
      }
    },
    loadPreferredCurrency: (state) => {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem("preferredCurrency");
      // FIX: was `saved in CURRENCIES` (CURRENCIES removed) — now uses isSupportedCurrency type guard
      if (saved && isSupportedCurrency(saved)) {
        state.currentCurrency = saved; // narrowed to CurrencyCode by the guard
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = "succeeded";
        // FIX: validate that base from API is a known CurrencyCode before assigning
        const base = action.payload.base;
        state.baseCurrency = isSupportedCurrency(base) ? base : "USD";
        state.rates = action.payload.rates;
        state.error = null;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load rates";
      });
  },
});

export const { setCurrentCurrency, loadPreferredCurrency } =
  currencySlice.actions;

// ==================== SELECTORS ====================
export const selectCurrentCurrency = (state: RootState): CurrencyCode =>
  state.currency.currentCurrency;

export const selectRatesLoaded = (state: RootState): boolean =>
  state.currency.status === "succeeded";

export const selectConvertedPrice = (
  state: RootState,
  basePrice: number,
): number => {
  const { currentCurrency, rates, baseCurrency, status } = state.currency;

  if (status !== "succeeded" || Object.keys(rates).length === 0) {
    return Number(basePrice.toFixed(2));
  }
  if (currentCurrency === baseCurrency) {
    return Number(basePrice.toFixed(2));
  }

  // FIX: explicit fallback to 1 if rate missing — avoids NaN on unknown codes
  const rate = rates[currentCurrency] ?? 1;
  return Number((basePrice * rate).toFixed(2));
};

export default currencySlice.reducer;