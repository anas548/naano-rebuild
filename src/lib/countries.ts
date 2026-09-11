// ISO 3166-1 alpha-2. Names come from Intl so we don't ship a name table, and
// flags are built from regional indicator symbols.
export const COUNTRY_CODES = [
  "AE","AR","AT","AU","BE","BG","BR","CA","CH","CL","CN","CO","CZ","DE","DK",
  "EE","EG","ES","FI","FR","GB","GR","HK","HR","HU","ID","IE","IL","IN","IS",
  "IT","JP","KE","KR","LT","LU","LV","MA","MX","MY","NG","NL","NO","NZ","PE",
  "PH","PK","PL","PT","RO","RS","SA","SE","SG","SI","SK","TH","TR","TW","UA",
  "US","VN","ZA",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

const names = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string) {
  try {
    return names.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string) {
  if (!/^[a-z]{2}$/i.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export const COUNTRIES = COUNTRY_CODES.map((code) => ({
  code,
  name: countryName(code),
})).sort((a, b) => a.name.localeCompare(b.name));
