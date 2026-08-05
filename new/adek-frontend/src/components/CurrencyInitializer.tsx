// ==================== CurrencyInitializer.tsx ====================
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import {
  fetchExchangeRates,
  loadPreferredCurrency,
} from '@/redux/features/currency/currencySlice';

export default function CurrencyInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load saved preference first so UI doesn't flash the default
    dispatch(loadPreferredCurrency());
    dispatch(fetchExchangeRates());
  }, [dispatch]);

  return null;
}