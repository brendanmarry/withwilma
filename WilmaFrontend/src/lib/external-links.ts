const DEFAULT_MAIN_SITE_URL = "https://withwilma.com";
const DEFAULT_CANDIDATE_APP_URL = "https://app.withwilma.com";
const DEFAULT_EMPLOYER_APP_URL = "https://app.withwilma.com/employer";

export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? DEFAULT_MAIN_SITE_URL;

export const EMPLOYER_APP_URL = "/employer/login";
