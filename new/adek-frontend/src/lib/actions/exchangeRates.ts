'use server';

const API_KEY = process.env.EXCHANGE_RATE_API_KEY!;
const BASE_CURRENCY = process.env.NEXT_PUBLIC_BASE_CURRENCY ?? 'USD';

export interface ExchangeRatesResult {
  base: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRatesAction(): Promise<ExchangeRatesResult> {
  if (!API_KEY) {
    throw new Error('EXCHANGE_RATE_API_KEY is not configured in .env');
  }

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
      cache: 'force-cache',
    },
  );

  if (!res.ok) {
    throw new Error(`Exchange rate API error: HTTP ${res.status}`);
  }

  // FIX: typed response instead of `any` — avoids eslint-disable entirely
  const data = (await res.json()) as {
    result: string;
    'error-type'?: string;
    base_code: string;
    conversion_rates: Record<string, number>;
  };

  if (data.result === 'error') {
    throw new Error(data['error-type'] ?? 'Unknown exchange rate API error');
  }

  return {
    base: data.base_code,
    rates: data.conversion_rates,
  };
}