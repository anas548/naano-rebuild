// ISO 3166-1 alpha-2 with names resolved once at build time. Intl.DisplayNames
// is NOT used at render time: Node and browser ICU data disagree on some names
// (for example Hong Kong), which produced a React hydration mismatch.
const COUNTRY_ENTRIES: [string, string][] = [
  ["AE", "United Arab Emirates"],
  ["AR", "Argentina"],
  ["AT", "Austria"],
  ["AU", "Australia"],
  ["BE", "Belgium"],
  ["BG", "Bulgaria"],
  ["BR", "Brazil"],
  ["CA", "Canada"],
  ["CH", "Switzerland"],
  ["CL", "Chile"],
  ["CN", "China"],
  ["CO", "Colombia"],
  ["CZ", "Czechia"],
  ["DE", "Germany"],
  ["DK", "Denmark"],
  ["EE", "Estonia"],
  ["EG", "Egypt"],
  ["ES", "Spain"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["GB", "United Kingdom"],
  ["GR", "Greece"],
  ["HK", "Hong Kong SAR China"],
  ["HR", "Croatia"],
  ["HU", "Hungary"],
  ["ID", "Indonesia"],
  ["IE", "Ireland"],
  ["IL", "Israel"],
  ["IN", "India"],
  ["IS", "Iceland"],
  ["IT", "Italy"],
  ["JP", "Japan"],
  ["KE", "Kenya"],
  ["KR", "South Korea"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["LV", "Latvia"],
  ["MA", "Morocco"],
  ["MX", "Mexico"],
  ["MY", "Malaysia"],
  ["NG", "Nigeria"],
  ["NL", "Netherlands"],
  ["NO", "Norway"],
  ["NZ", "New Zealand"],
  ["PE", "Peru"],
  ["PH", "Philippines"],
  ["PK", "Pakistan"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["RO", "Romania"],
  ["RS", "Serbia"],
  ["SA", "Saudi Arabia"],
  ["SE", "Sweden"],
  ["SG", "Singapore"],
  ["SI", "Slovenia"],
  ["SK", "Slovakia"],
  ["TH", "Thailand"],
  ["TR", "Türkiye"],
  ["TW", "Taiwan"],
  ["UA", "Ukraine"],
  ["US", "United States"],
  ["VN", "Vietnam"],
  ["ZA", "South Africa"],
];

export const COUNTRIES = COUNTRY_ENTRIES.map(([code, name]) => ({ code, name })).sort(
  (a, b) => a.name.localeCompare(b.name),
);

const NAME_BY_CODE = new Map(COUNTRY_ENTRIES);

export function countryName(code: string) {
  return NAME_BY_CODE.get(code.toUpperCase()) ?? code;
}

export function countryFlag(code: string) {
  if (!/^[a-z]{2}$/i.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
