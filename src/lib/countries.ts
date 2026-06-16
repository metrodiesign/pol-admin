import { PHONE_COUNTRIES } from "@/lib/phone-countries";

/** Country options (name + ISO alpha-2, lowercase for flagcdn) shared by the user account & edit forms. */
export const COUNTRY_OPTIONS: { value: string; iso2: string }[] =
  PHONE_COUNTRIES.map((c) => ({ value: c.name, iso2: c.iso2 }));
