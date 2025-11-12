import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const ADMIN_TOKEN_COOKIE = "wilma-admin-token";

const encoder = new TextEncoder();

export type AdminTokenPayload = {
  sub: string;
  organisationId: string;
  email: string;
  role: "admin";
};

export const createAdminToken = async (
  payload: AdminTokenPayload,
  expiresIn = "24h",
): Promise<string> => {
  const secret = encoder.encode(env().ADMIN_JWT_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .setSubject(payload.sub)
    .sign(secret);
};

export const verifyAdminToken = async (
  token: string,
): Promise<AdminTokenPayload | null> => {
  try {
    const secret = encoder.encode(env().ADMIN_JWT_SECRET);
    const { payload } = await jwtVerify<AdminTokenPayload>(token, secret);
    return payload;
  } catch (error) {
    console.error("Failed to verify admin token", error);
    return null;
  }
};

export const getAdminTokenFromRequest = async (): Promise<
  AdminTokenPayload | null
> => {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  const headerStore =
    typeof headers !== "undefined" ? await headers() : null;
  const tokenFromHeader = headerStore
    ?.get("authorization")
    ?.replace("Bearer ", "");

  const token = tokenFromHeader || tokenFromCookie;
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      return {
        sub: "dev-admin",
        organisationId: "dev-organisation",
        email: "admin@wilma.dev",
        role: "admin" as const,
      };
    }
    return null;
  }
  return verifyAdminToken(token);
};

