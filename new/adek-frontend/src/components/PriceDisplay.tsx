'use client';

import { getCurrencyInfo } from '@/lib/currencies';
import {
  selectConvertedPrice,
  selectCurrentCurrency,
  selectRatesLoaded,
} from '@/redux/features/currency/currencySlice';
import { useAppSelector } from '@/redux/hooks';

interface PriceDisplayProps {
  basePrice?: number;   // optional — safe for conditional rendering
  className?: string;
  showCode?: boolean;
}

export default function PriceDisplay({
  basePrice = 0,        // default to 0 — prevents NaN in formatter
  className = '',
  showCode = true,
}: PriceDisplayProps) {
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const ratesLoaded = useAppSelector(selectRatesLoaded);

  // FIX: selector already returns a rounded number — no extra processing needed here
  const convertedPrice = useAppSelector((state) =>
    selectConvertedPrice(state, basePrice),
  );

  // Show base USD price while rates are still loading — avoids layout flash
  const displayPrice = ratesLoaded ? convertedPrice : basePrice;
  const displayCurrency = ratesLoaded ? currentCurrency : 'USD';

  // FIX: getCurrencyInfo expects CurrencyCode — displayCurrency is already CurrencyCode ✓
  const info = getCurrencyInfo(displayCurrency);

  const formatter = new Intl.NumberFormat(info.locale, {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  });

  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      <span className="mr-1">{info.symbol}</span>
      {formatter.format(displayPrice)}
      {showCode && (
        <span className="ml-2 text-xs font-normal text-gray-500 uppercase tracking-widest">
          {info.code}
        </span>
      )}
    </span>
  );
}