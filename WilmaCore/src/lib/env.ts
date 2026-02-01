import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_REALTIME_MODEL: z.string().min(1).optional(),
  OPENAI_REALTIME_VOICE: z.string().min(1).optional(),
  OPENAI_TRANSCRIBE_MODEL: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_ENDPOINT: z.string().url().optional(),
  S3_PUBLIC_ENDPOINT: z.string().url().optional(),
  S3_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
  ADMIN_JWT_SECRET: z.string().min(1),
  APP_URL: z.string().url().optional().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export const env = (): Env => {
  if (!parsedEnv) {
    parsedEnv = envSchema.parse(process.env);
  }
  return parsedEnv;
};

