// ==================== TYPES (declared first — fixes "used before defined" error) ====================
export interface CurrencyInfo {
  code: string;       // string (not CurrencyCode) — avoids circular type reference
  symbol: string;
  locale: string;
  decimals: number;
  name: string;
  flag: string;
}

// ==================== FULL CURRENCIES DATABASE ====================
// `satisfies Record<string, CurrencyInfo>` — full type safety without widening,
// so `keyof typeof CURRENCIESAll` still returns the exact literal union below
export const CURRENCIESAll = {
  AED: { code: "AED", symbol: "د.إ",  locale: "ar-AE", decimals: 2, name: "UAE Dirham",                        flag: "🇦🇪" },
  AFN: { code: "AFN", symbol: "؋",    locale: "ps-AF", decimals: 2, name: "Afghan Afghani",                    flag: "🇦🇫" },
  ALL: { code: "ALL", symbol: "L",    locale: "sq-AL", decimals: 2, name: "Albanian Lek",                      flag: "🇦🇱" },
  AMD: { code: "AMD", symbol: "֏",    locale: "hy-AM", decimals: 2, name: "Armenian Dram",                     flag: "🇦🇲" },
  ANG: { code: "ANG", symbol: "ƒ",    locale: "nl-CW", decimals: 2, name: "Netherlands Antillean Guilder",     flag: "🇳🇱" },
  AOA: { code: "AOA", symbol: "Kz",   locale: "pt-AO", decimals: 2, name: "Angolan Kwanza",                    flag: "🇦🇴" },
  ARS: { code: "ARS", symbol: "$",    locale: "es-AR", decimals: 2, name: "Argentine Peso",                    flag: "🇦🇷" },
  AUD: { code: "AUD", symbol: "A$",   locale: "en-AU", decimals: 2, name: "Australian Dollar",                 flag: "🇦🇺" },
  AWG: { code: "AWG", symbol: "ƒ",    locale: "nl-AW", decimals: 2, name: "Aruban Florin",                     flag: "🇦🇼" },
  AZN: { code: "AZN", symbol: "₼",    locale: "az-AZ", decimals: 2, name: "Azerbaijani Manat",                 flag: "🇦🇿" },
  BAM: { code: "BAM", symbol: "KM",   locale: "bs-BA", decimals: 2, name: "Bosnia and Herzegovina Mark",       flag: "🇧🇦" },
  BBD: { code: "BBD", symbol: "$",    locale: "en-BB", decimals: 2, name: "Barbados Dollar",                   flag: "🇧🇧" },
  BDT: { code: "BDT", symbol: "৳",    locale: "bn-BD", decimals: 2, name: "Bangladeshi Taka",                  flag: "🇧🇩" },
  BGN: { code: "BGN", symbol: "лв",   locale: "bg-BG", decimals: 2, name: "Bulgarian Lev",                     flag: "🇧🇬" },
  BHD: { code: "BHD", symbol: ".د.ب", locale: "ar-BH", decimals: 3, name: "Bahraini Dinar",                    flag: "🇧🇭" },
  BIF: { code: "BIF", symbol: "FBu",  locale: "fr-BI", decimals: 0, name: "Burundian Franc",                   flag: "🇧🇮" },
  BMD: { code: "BMD", symbol: "$",    locale: "en-BM", decimals: 2, name: "Bermudian Dollar",                  flag: "🇧🇲" },
  BND: { code: "BND", symbol: "$",    locale: "ms-BN", decimals: 2, name: "Brunei Dollar",                     flag: "🇧🇳" },
  BOB: { code: "BOB", symbol: "Bs.",  locale: "es-BO", decimals: 2, name: "Bolivian Boliviano",                flag: "🇧🇴" },
  BRL: { code: "BRL", symbol: "R$",   locale: "pt-BR", decimals: 2, name: "Brazilian Real",                    flag: "🇧🇷" },
  BSD: { code: "BSD", symbol: "$",    locale: "en-BS", decimals: 2, name: "Bahamian Dollar",                   flag: "🇧🇸" },
  BTN: { code: "BTN", symbol: "Nu.",  locale: "dz-BT", decimals: 2, name: "Bhutanese Ngultrum",                flag: "🇧🇹" },
  BWP: { code: "BWP", symbol: "P",    locale: "en-BW", decimals: 2, name: "Botswana Pula",                     flag: "🇧🇼" },
  BYN: { code: "BYN", symbol: "Br",   locale: "be-BY", decimals: 2, name: "Belarusian Ruble",                  flag: "🇧🇾" },
  BZD: { code: "BZD", symbol: "$",    locale: "en-BZ", decimals: 2, name: "Belize Dollar",                     flag: "🇧🇿" },
  CAD: { code: "CAD", symbol: "C$",   locale: "en-CA", decimals: 2, name: "Canadian Dollar",                   flag: "🇨🇦" },
  CDF: { code: "CDF", symbol: "FC",   locale: "fr-CD", decimals: 2, name: "Congolese Franc",                   flag: "🇨🇩" },
  CHF: { code: "CHF", symbol: "Fr.",  locale: "de-CH", decimals: 2, name: "Swiss Franc",                       flag: "🇨🇭" },
  CLP: { code: "CLP", symbol: "$",    locale: "es-CL", decimals: 0, name: "Chilean Peso",                      flag: "🇨🇱" },
  CNY: { code: "CNY", symbol: "¥",    locale: "zh-CN", decimals: 2, name: "Chinese Renminbi",                  flag: "🇨🇳" },
  COP: { code: "COP", symbol: "$",    locale: "es-CO", decimals: 2, name: "Colombian Peso",                    flag: "🇨🇴" },
  CRC: { code: "CRC", symbol: "₡",    locale: "es-CR", decimals: 2, name: "Costa Rican Colon",                 flag: "🇨🇷" },
  CUP: { code: "CUP", symbol: "$",    locale: "es-CU", decimals: 2, name: "Cuban Peso",                        flag: "🇨🇺" },
  CVE: { code: "CVE", symbol: "$",    locale: "pt-CV", decimals: 2, name: "Cape Verdean Escudo",               flag: "🇨🇻" },
  CZK: { code: "CZK", symbol: "Kč",   locale: "cs-CZ", decimals: 2, name: "Czech Koruna",                      flag: "🇨🇿" },
  DJF: { code: "DJF", symbol: "Fdj",  locale: "fr-DJ", decimals: 0, name: "Djiboutian Franc",                  flag: "🇩🇯" },
  DKK: { code: "DKK", symbol: "kr",   locale: "da-DK", decimals: 2, name: "Danish Krone",                      flag: "🇩🇰" },
  DOP: { code: "DOP", symbol: "$",    locale: "es-DO", decimals: 2, name: "Dominican Peso",                    flag: "🇩🇴" },
  DZD: { code: "DZD", symbol: "د.ج",  locale: "ar-DZ", decimals: 2, name: "Algerian Dinar",                    flag: "🇩🇿" },
  EGP: { code: "EGP", symbol: "£",    locale: "ar-EG", decimals: 2, name: "Egyptian Pound",                    flag: "🇪🇬" },
  ERN: { code: "ERN", symbol: "Nfk",  locale: "ti-ER", decimals: 2, name: "Eritrean Nakfa",                    flag: "🇪🇷" },
  ETB: { code: "ETB", symbol: "Br",   locale: "am-ET", decimals: 2, name: "Ethiopian Birr",                    flag: "🇪🇹" },
  EUR: { code: "EUR", symbol: "€",    locale: "de-DE", decimals: 2, name: "Euro",                              flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£",    locale: "en-GB", decimals: 2, name: "Pound Sterling",                    flag: "🇬🇧" },
  GEL: { code: "GEL", symbol: "₾",    locale: "ka-GE", decimals: 2, name: "Georgian Lari",                     flag: "🇬🇪" },
  GHS: { code: "GHS", symbol: "₵",    locale: "en-GH", decimals: 2, name: "Ghanaian Cedi",                     flag: "🇬🇭" },
  GMD: { code: "GMD", symbol: "D",    locale: "en-GM", decimals: 2, name: "Gambian Dalasi",                    flag: "🇬🇲" },
  GNF: { code: "GNF", symbol: "FG",   locale: "fr-GN", decimals: 0, name: "Guinean Franc",                     flag: "🇬🇳" },
  GTQ: { code: "GTQ", symbol: "Q",    locale: "es-GT", decimals: 2, name: "Guatemalan Quetzal",                flag: "🇬🇹" },
  GYD: { code: "GYD", symbol: "$",    locale: "en-GY", decimals: 2, name: "Guyanese Dollar",                   flag: "🇬🇾" },
  HKD: { code: "HKD", symbol: "$",    locale: "zh-HK", decimals: 2, name: "Hong Kong Dollar",                  flag: "🇭🇰" },
  HNL: { code: "HNL", symbol: "L",    locale: "es-HN", decimals: 2, name: "Honduran Lempira",                  flag: "🇭🇳" },
  HRK: { code: "HRK", symbol: "kn",   locale: "hr-HR", decimals: 2, name: "Croatian Kuna",                     flag: "🇭🇷" },
  HTG: { code: "HTG", symbol: "G",    locale: "ht-HT", decimals: 2, name: "Haitian Gourde",                    flag: "🇭🇹" },
  HUF: { code: "HUF", symbol: "Ft",   locale: "hu-HU", decimals: 2, name: "Hungarian Forint",                  flag: "🇭🇺" },
  IDR: { code: "IDR", symbol: "Rp",   locale: "id-ID", decimals: 2, name: "Indonesian Rupiah",                 flag: "🇮🇩" },
  ILS: { code: "ILS", symbol: "₪",    locale: "he-IL", decimals: 2, name: "Israeli New Shekel",                flag: "🇮🇱" },
  INR: { code: "INR", symbol: "₹",    locale: "en-IN", decimals: 2, name: "Indian Rupee",                      flag: "🇮🇳" },
  IQD: { code: "IQD", symbol: "ع.د",  locale: "ar-IQ", decimals: 3, name: "Iraqi Dinar",                       flag: "🇮🇶" },
  IRR: { code: "IRR", symbol: "﷼",    locale: "fa-IR", decimals: 2, name: "Iranian Rial",                      flag: "🇮🇷" },
  ISK: { code: "ISK", symbol: "kr",   locale: "is-IS", decimals: 0, name: "Icelandic Króna",                   flag: "🇮🇸" },
  JMD: { code: "JMD", symbol: "$",    locale: "en-JM", decimals: 2, name: "Jamaican Dollar",                   flag: "🇯🇲" },
  JOD: { code: "JOD", symbol: "د.ا",  locale: "ar-JO", decimals: 3, name: "Jordanian Dinar",                   flag: "🇯🇴" },
  JPY: { code: "JPY", symbol: "¥",    locale: "ja-JP", decimals: 0, name: "Japanese Yen",                      flag: "🇯🇵" },
  KES: { code: "KES", symbol: "KSh",  locale: "en-KE", decimals: 2, name: "Kenyan Shilling",                   flag: "🇰🇪" },
  KGS: { code: "KGS", symbol: "с",    locale: "ky-KG", decimals: 2, name: "Kyrgyzstani Som",                   flag: "🇰🇬" },
  KHR: { code: "KHR", symbol: "៛",    locale: "km-KH", decimals: 2, name: "Cambodian Riel",                    flag: "🇰🇭" },
  KMF: { code: "KMF", symbol: "CF",   locale: "fr-KM", decimals: 0, name: "Comorian Franc",                    flag: "🇰🇲" },
  KRW: { code: "KRW", symbol: "₩",    locale: "ko-KR", decimals: 0, name: "South Korean Won",                  flag: "🇰🇷" },
  KWD: { code: "KWD", symbol: "د.ك",  locale: "ar-KW", decimals: 3, name: "Kuwaiti Dinar",                     flag: "🇰🇼" },
  KZT: { code: "KZT", symbol: "₸",    locale: "kk-KZ", decimals: 2, name: "Kazakhstani Tenge",                 flag: "🇰🇿" },
  LAK: { code: "LAK", symbol: "₭",    locale: "lo-LA", decimals: 2, name: "Lao Kip",                           flag: "🇱🇦" },
  LBP: { code: "LBP", symbol: "ل.ل",  locale: "ar-LB", decimals: 2, name: "Lebanese Pound",                   flag: "🇱🇧" },
  LKR: { code: "LKR", symbol: "Rs",   locale: "si-LK", decimals: 2, name: "Sri Lanka Rupee",                   flag: "🇱🇰" },
  LRD: { code: "LRD", symbol: "$",    locale: "en-LR", decimals: 2, name: "Liberian Dollar",                   flag: "🇱🇷" },
  LSL: { code: "LSL", symbol: "L",    locale: "en-LS", decimals: 2, name: "Lesotho Loti",                      flag: "🇱🇸" },
  LYD: { code: "LYD", symbol: "ل.د",  locale: "ar-LY", decimals: 3, name: "Libyan Dinar",                      flag: "🇱🇾" },
  MAD: { code: "MAD", symbol: "د.م.", locale: "ar-MA", decimals: 2, name: "Moroccan Dirham",                   flag: "🇲🇦" },
  MDL: { code: "MDL", symbol: "L",    locale: "ro-MD", decimals: 2, name: "Moldovan Leu",                      flag: "🇲🇩" },
  MGA: { code: "MGA", symbol: "Ar",   locale: "mg-MG", decimals: 2, name: "Malagasy Ariary",                   flag: "🇲🇬" },
  MKD: { code: "MKD", symbol: "ден",  locale: "mk-MK", decimals: 2, name: "Macedonian Denar",                  flag: "🇲🇰" },
  MMK: { code: "MMK", symbol: "K",    locale: "my-MM", decimals: 2, name: "Burmese Kyat",                      flag: "🇲🇲" },
  MNT: { code: "MNT", symbol: "₮",    locale: "mn-MN", decimals: 2, name: "Mongolian Tögrög",                  flag: "🇲🇳" },
  MOP: { code: "MOP", symbol: "P",    locale: "zh-MO", decimals: 2, name: "Macanese Pataca",                   flag: "🇲🇴" },
  MUR: { code: "MUR", symbol: "₨",    locale: "en-MU", decimals: 2, name: "Mauritian Rupee",                   flag: "🇲🇺" },
  MVR: { code: "MVR", symbol: "Rf",   locale: "dv-MV", decimals: 2, name: "Maldivian Rufiyaa",                 flag: "🇲🇻" },
  MWK: { code: "MWK", symbol: "MK",   locale: "en-MW", decimals: 2, name: "Malawian Kwacha",                   flag: "🇲🇼" },
  MXN: { code: "MXN", symbol: "$",    locale: "es-MX", decimals: 2, name: "Mexican Peso",                      flag: "🇲🇽" },
  MYR: { code: "MYR", symbol: "RM",   locale: "ms-MY", decimals: 2, name: "Malaysian Ringgit",                 flag: "🇲🇾" },
  MZN: { code: "MZN", symbol: "MT",   locale: "pt-MZ", decimals: 2, name: "Mozambican Metical",                flag: "🇲🇿" },
  NAD: { code: "NAD", symbol: "$",    locale: "en-NA", decimals: 2, name: "Namibian Dollar",                   flag: "🇳🇦" },
  NGN: { code: "NGN", symbol: "₦",    locale: "en-NG", decimals: 2, name: "Nigerian Naira",                    flag: "🇳🇬" },
  NIO: { code: "NIO", symbol: "C$",   locale: "es-NI", decimals: 2, name: "Nicaraguan Córdoba",                flag: "🇳🇮" },
  NOK: { code: "NOK", symbol: "kr",   locale: "no-NO", decimals: 2, name: "Norwegian Krone",                   flag: "🇳🇴" },
  NPR: { code: "NPR", symbol: "₨",    locale: "ne-NP", decimals: 2, name: "Nepalese Rupee",                    flag: "🇳🇵" },
  NZD: { code: "NZD", symbol: "NZ$",  locale: "en-NZ", decimals: 2, name: "New Zealand Dollar",                flag: "🇳🇿" },
  OMR: { code: "OMR", symbol: "ر.ع.", locale: "ar-OM", decimals: 3, name: "Omani Rial",                        flag: "🇴🇲" },
  PAB: { code: "PAB", symbol: "B/.",  locale: "es-PA", decimals: 2, name: "Panamanian Balboa",                 flag: "🇵🇦" },
  PEN: { code: "PEN", symbol: "S/.",  locale: "es-PE", decimals: 2, name: "Peruvian Sol",                      flag: "🇵🇪" },
  PGK: { code: "PGK", symbol: "K",    locale: "en-PG", decimals: 2, name: "Papua New Guinean Kina",            flag: "🇵🇬" },
  PHP: { code: "PHP", symbol: "₱",    locale: "en-PH", decimals: 2, name: "Philippine Peso",                   flag: "🇵🇭" },
  PKR: { code: "PKR", symbol: "₨",    locale: "ur-PK", decimals: 2, name: "Pakistani Rupee",                   flag: "🇵🇰" },
  PLN: { code: "PLN", symbol: "zł",   locale: "pl-PL", decimals: 2, name: "Polish Złoty",                      flag: "🇵🇱" },
  PYG: { code: "PYG", symbol: "₲",    locale: "es-PY", decimals: 0, name: "Paraguayan Guaraní",                flag: "🇵🇾" },
  QAR: { code: "QAR", symbol: "ر.ق",  locale: "ar-QA", decimals: 2, name: "Qatari Riyal",                      flag: "🇶🇦" },
  RON: { code: "RON", symbol: "lei",  locale: "ro-RO", decimals: 2, name: "Romanian Leu",                      flag: "🇷🇴" },
  RSD: { code: "RSD", symbol: "дин.", locale: "sr-RS", decimals: 2, name: "Serbian Dinar",                     flag: "🇷🇸" },
  RUB: { code: "RUB", symbol: "₽",    locale: "ru-RU", decimals: 2, name: "Russian Ruble",                     flag: "🇷🇺" },
  RWF: { code: "RWF", symbol: "FRw",  locale: "rw-RW", decimals: 0, name: "Rwandan Franc",                     flag: "🇷🇼" },
  SAR: { code: "SAR", symbol: "ر.س",  locale: "ar-SA", decimals: 2, name: "Saudi Riyal",                       flag: "🇸🇦" },
  SDG: { code: "SDG", symbol: "ج.س.", locale: "ar-SD", decimals: 2, name: "Sudanese Pound",                    flag: "🇸🇩" },
  SEK: { code: "SEK", symbol: "kr",   locale: "sv-SE", decimals: 2, name: "Swedish Krona",                     flag: "🇸🇪" },
  SGD: { code: "SGD", symbol: "$",    locale: "en-SG", decimals: 2, name: "Singapore Dollar",                  flag: "🇸🇬" },
  SLL: { code: "SLL", symbol: "Le",   locale: "en-SL", decimals: 2, name: "Sierra Leonean Leone",              flag: "🇸🇱" },
  SOS: { code: "SOS", symbol: "Sh.",  locale: "so-SO", decimals: 2, name: "Somali Shilling",                   flag: "🇸🇴" },
  SRD: { code: "SRD", symbol: "$",    locale: "nl-SR", decimals: 2, name: "Surinamese Dollar",                 flag: "🇸🇷" },
  SSP: { code: "SSP", symbol: "£",    locale: "en-SS", decimals: 2, name: "South Sudanese Pound",              flag: "🇸🇸" },
  STN: { code: "STN", symbol: "Db",   locale: "pt-ST", decimals: 2, name: "São Tomé and Príncipe Dobra",       flag: "🇸🇹" },
  SYP: { code: "SYP", symbol: "£",    locale: "ar-SY", decimals: 2, name: "Syrian Pound",                      flag: "🇸🇾" },
  SZL: { code: "SZL", symbol: "E",    locale: "en-SZ", decimals: 2, name: "Eswatini Lilangeni",                flag: "🇸🇿" },
  THB: { code: "THB", symbol: "฿",    locale: "th-TH", decimals: 2, name: "Thai Baht",                         flag: "🇹🇭" },
  TJS: { code: "TJS", symbol: "ЅМ",   locale: "tg-TJ", decimals: 2, name: "Tajikistani Somoni",                flag: "🇹🇯" },
  TMT: { code: "TMT", symbol: "m",    locale: "tk-TM", decimals: 2, name: "Turkmenistan Manat",                flag: "🇹🇲" },
  TND: { code: "TND", symbol: "د.ت",  locale: "ar-TN", decimals: 3, name: "Tunisian Dinar",                    flag: "🇹🇳" },
  TRY: { code: "TRY", symbol: "₺",    locale: "tr-TR", decimals: 2, name: "Turkish Lira",                      flag: "🇹🇷" },
  TTD: { code: "TTD", symbol: "$",    locale: "en-TT", decimals: 2, name: "Trinidad and Tobago Dollar",        flag: "🇹🇹" },
  TWD: { code: "TWD", symbol: "NT$",  locale: "zh-TW", decimals: 2, name: "New Taiwan Dollar",                 flag: "🇹🇼" },
  TZS: { code: "TZS", symbol: "Sh",   locale: "sw-TZ", decimals: 2, name: "Tanzanian Shilling",                flag: "🇹🇿" },
  UAH: { code: "UAH", symbol: "₴",    locale: "uk-UA", decimals: 2, name: "Ukrainian Hryvnia",                 flag: "🇺🇦" },
  UGX: { code: "UGX", symbol: "USh",  locale: "en-UG", decimals: 0, name: "Ugandan Shilling",                  flag: "🇺🇬" },
  USD: { code: "USD", symbol: "$",    locale: "en-US", decimals: 2, name: "United States Dollar",              flag: "🇺🇸" },
  UYU: { code: "UYU", symbol: "$U",   locale: "es-UY", decimals: 2, name: "Uruguayan Peso",                    flag: "🇺🇾" },
  UZS: { code: "UZS", symbol: "so'm", locale: "uz-UZ", decimals: 2, name: "Uzbekistani So'm",                  flag: "🇺🇿" },
  VES: { code: "VES", symbol: "Bs.",  locale: "es-VE", decimals: 2, name: "Venezuelan Bolívar Soberano",       flag: "🇻🇪" },
  VND: { code: "VND", symbol: "₫",    locale: "vi-VN", decimals: 0, name: "Vietnamese Đồng",                   flag: "🇻🇳" },
  VUV: { code: "VUV", symbol: "VT",   locale: "bi-VU", decimals: 0, name: "Vanuatu Vatu",                      flag: "🇻🇺" },
  WST: { code: "WST", symbol: "T",    locale: "sm-WS", decimals: 2, name: "Samoan Tālā",                       flag: "🇼🇸" },
  XAF: { code: "XAF", symbol: "FCFA", locale: "fr-CM", decimals: 0, name: "Central African CFA Franc",         flag: "🇨🇲" },
  XOF: { code: "XOF", symbol: "CFA",  locale: "fr-SN", decimals: 0, name: "West African CFA franc",            flag: "🇸🇳" },
  ZAR: { code: "ZAR", symbol: "R",    locale: "en-ZA", decimals: 2, name: "South African Rand",                flag: "🇿🇦" },
  ZMW: { code: "ZMW", symbol: "ZK",   locale: "en-ZM", decimals: 2, name: "Zambian Kwacha",                    flag: "🇿🇲" },
} as const satisfies Record<string, CurrencyInfo>;

// ==================== DERIVED TYPES ====================
// Derived AFTER CURRENCIESAll — no forward-reference error
export type CurrencyCode = keyof typeof CURRENCIESAll;

// ==================== PINNED LOCAL CURRENCY ====================
const LOCAL_CURRENCY: CurrencyCode = "BDT";

// ==================== HELPERS ====================

/**
 * Type guard — narrows an unknown string to CurrencyCode.
 * Replaces the old `code in CURRENCIES` pattern (CURRENCIES is removed).
 */
export const isSupportedCurrency = (code: string): code is CurrencyCode =>
  code in CURRENCIESAll;

/**
 * Get full CurrencyInfo by code — throws on unknown code.
 */
export const getCurrencyInfo = (code: CurrencyCode): CurrencyInfo => {
  const currency = CURRENCIESAll[code];
  if (!currency) throw new Error(`[Currency] Unknown code: ${code}`);
  return currency;
};

/**
 * Pin BDT (LOCAL_CURRENCY) to top, preserve API order for everything else.
 */
export const sortWithLocalFirst = (codes: CurrencyCode[]): CurrencyCode[] =>
  [...codes].sort((a, b) => {
    if (a === LOCAL_CURRENCY) return -1;
    if (b === LOCAL_CURRENCY) return 1;
    return 0;
  });

/**
 * Map CurrencyCode[] → CurrencyInfo[].
 * Silently skips any unknown codes the backend may send.
 */
export const getCurrencyInfoList = (codes: CurrencyCode[]): CurrencyInfo[] =>
  codes.reduce<CurrencyInfo[]>((acc, code) => {
    const info = CURRENCIESAll[code] as CurrencyInfo | undefined;
    if (!info) {
      console.warn(`[Currency] Skipping unknown code: ${code}`);
      return acc;
    }
    acc.push(info);
    return acc;
  }, []);

/**
 * PRIMARY EXPORT — fully dynamic, BDT always first.
 * Pass raw codes from the platform API → returns sorted CurrencyInfo[].
 * Returns [] while loading (no silent static fallback).
 */
export const getDynamicCurrencyOptions = (
  supportedCodes: CurrencyCode[] | undefined | null,
): CurrencyInfo[] => {
  if (!supportedCodes || supportedCodes.length === 0) return [];
  return getCurrencyInfoList(sortWithLocalFirst(supportedCodes));
};