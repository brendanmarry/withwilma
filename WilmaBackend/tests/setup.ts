process.env.DATABASE_URL ??= "postgresql://wilma:wilma@localhost:5432/wilma";
process.env.OPENAI_API_KEY ??= "test-openai-key";
process.env.S3_BUCKET ??= "wilma-local";
process.env.S3_REGION ??= "us-east-1";
process.env.S3_ACCESS_KEY_ID ??= "wilma";
process.env.S3_SECRET_ACCESS_KEY ??= "wilma-secret";
process.env.S3_ENDPOINT ??= "http://localhost:9000";
process.env.S3_FORCE_PATH_STYLE ??= "true";
process.env.ADMIN_JWT_SECRET ??= "test-admin-secret";
process.env.APP_URL ??= "http://localhost:3000";

import "@testing-library/jest-dom";
import { prisma } from "@/lib/db";

afterAll(async () => {
  await prisma.$disconnect();
});

