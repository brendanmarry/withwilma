const DEFAULT_MAIN_SITE_URL = "http://localhost:3002";
const DEFAULT_CANDIDATE_APP_URL = "http://localhost:3000";
const DEFAULT_RECRUITER_APP_URL = "http://localhost:3001/auth/login";

export const CANDIDATE_APP_URL =
  process.env.NEXT_PUBLIC_CANDIDATE_APP_URL ?? DEFAULT_CANDIDATE_APP_URL;

export const RECRUITER_APP_URL =
  process.env.NEXT_PUBLIC_RECRUITER_APP_URL ?? DEFAULT_RECRUITER_APP_URL;
