const DEFAULT_MAIN_SITE_URL = "https://withwilma.com";
const DEFAULT_CANDIDATE_APP_URL = "https://app.withwilma.com";
const DEFAULT_RECRUITER_APP_URL = "https://api.withwilma.com";

export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? DEFAULT_MAIN_SITE_URL;

export const CANDIDATE_APP_URL =
  process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ?? DEFAULT_CANDIDATE_APP_URL;

export const RECRUITER_APP_URL =
  process.env.NEXT_PUBLIC_RECRUITER_APP_URL ?? DEFAULT_RECRUITER_APP_URL;

export const EMPLOYER_APP_URL =
  process.env.NEXT_PUBLIC_EMPLOYER_APP_URL ?? "https://app.withwilma.com/employer/login";
