const DEFAULT_MAIN_SITE_URL = "http://localhost:3002";
const DEFAULT_CANDIDATE_APP_URL = "http://localhost:3000";
const DEFAULT_EMPLOYER_APP_URL = "http://localhost:3000/employer/login";

export const CANDIDATE_APP_URL =
  process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ?? DEFAULT_CANDIDATE_APP_URL;

export const EMPLOYER_APP_URL =
  process.env.NEXT_PUBLIC_EMPLOYER_APP_URL ?? DEFAULT_EMPLOYER_APP_URL;
