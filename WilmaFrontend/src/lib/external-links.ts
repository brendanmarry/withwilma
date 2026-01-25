const DEFAULT_MAIN_SITE_URL = "https://withwilma.com";
const DEFAULT_CANDIDATE_APP_URL = "https://app.withwilma.com";
const DEFAULT_RECRUITER_APP_URL = "https://app.withwilma.com/recruiter";

export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? DEFAULT_MAIN_SITE_URL;

export const RECRUITER_APP_URL = "/recruiter/login";
