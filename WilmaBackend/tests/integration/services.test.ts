import { Prisma } from "@prisma/client";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

jest.setTimeout(20000);

describe("Local service containers", () => {
  it("responds to a simple Postgres query", async () => {
    const [row] = await prisma.$queryRaw<{ result: number }[]>(
      Prisma.sql`SELECT 1 AS result`,
    );
    expect(row?.result).toBe(1);
  });

  it("lists buckets from the object store", async () => {
    const configuration = {
      region: env().S3_REGION,
      credentials: {
        accessKeyId: env().S3_ACCESS_KEY_ID,
        secretAccessKey: env().S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: env().S3_FORCE_PATH_STYLE === "true",
      endpoint: env().S3_ENDPOINT,
    } satisfies ConstructorParameters<typeof S3Client>[0];

    const client = new S3Client(configuration);
    const response = await client.send(new ListBucketsCommand({}));

    expect(Array.isArray(response.Buckets)).toBe(true);
  });
});

