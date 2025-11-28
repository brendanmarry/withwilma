import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { env } from "@/lib/env";
import { logger, serializeError } from "@/lib/logger";

const getClient = () => {
  const configuration: ConstructorParameters<typeof S3Client>[0] = {
    region: env().S3_REGION,
    credentials: {
      accessKeyId: env().S3_ACCESS_KEY_ID,
      secretAccessKey: env().S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env().S3_FORCE_PATH_STYLE === "true",
  };

  if (env().S3_ENDPOINT) {
    configuration.endpoint = env().S3_ENDPOINT;
  }

  return new S3Client(configuration);
};

let ensureBucketPromise: Promise<void> | null = null;

const ensureBucketExists = async (client: S3Client) => {
  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      logger.debug("Verifying object storage bucket", {
        bucket: env().S3_BUCKET,
        endpoint: env().S3_ENDPOINT ?? "aws",
        accessKeyId: env().S3_ACCESS_KEY_ID,
        forcePathStyle: env().S3_FORCE_PATH_STYLE,
      });
      try {
        await client.send(
          new HeadBucketCommand({
            Bucket: env().S3_BUCKET,
          }),
        );
      } catch (error) {
        const errorName = (error as { name?: string }).name;
        const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
        if (
          errorName === "NotFound" ||
          errorName === "NoSuchBucket" ||
          status === 404
        ) {
          logger.info("Creating object storage bucket", { bucket: env().S3_BUCKET });
          try {
            await client.send(
              new CreateBucketCommand({
                Bucket: env().S3_BUCKET,
                ...(env().S3_REGION && env().S3_REGION !== "us-east-1"
                  ? { CreateBucketConfiguration: { LocationConstraint: env().S3_REGION } }
                  : {}),
              }),
            );
          } catch (createError) {
            const createName = (createError as { name?: string }).name;
            if (
              createName !== "BucketAlreadyOwnedByYou" &&
              createName !== "BucketAlreadyExists"
            ) {
              logger.error("Failed to create object storage bucket", {
                error: serializeError(createError),
                bucket: env().S3_BUCKET,
              });
              throw createError;
            }
          }
        } else {
          throw error;
        }
      }
    })().catch((error) => {
      ensureBucketPromise = null;
      throw error;
    });
  }
  return ensureBucketPromise;
};

export type UploadParams = {
  fileName: string;
  contentType: string;
  buffer: Buffer;
  folder?: string;
};

export const uploadBuffer = async ({
  fileName,
  contentType,
  buffer,
  folder,
}: UploadParams): Promise<string> => {
  const client = getClient();
  const key = `${folder ?? "uploads"}/${randomUUID()}-${fileName}`;
  await ensureBucketExists(client);
  await client.send(
    new PutObjectCommand({
      Bucket: env().S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `s3://${env().S3_BUCKET}/${key}`;
};

export const getDownloadUrl = async (
  key: string,
  expiresInSeconds = 60 * 10,
): Promise<string> => {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env().S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
};

export const parseS3Url = (url: string): { bucket: string; key: string } => {
  const s3Regex = /^s3:\/\/([^/]+)\/(.+)$/;
  const match = s3Regex.exec(url);
  if (!match) {
    throw new Error(`Invalid S3 URL: ${url}`);
  }
  return { bucket: match[1]!, key: match[2]! };
};

export const uploadStream = async (
  stream: Readable,
  {
    fileName,
    contentType,
    folder,
  }: { fileName: string; contentType: string; folder?: string },
): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk),
    );
  }
  return uploadBuffer({
    fileName,
    contentType,
    folder,
    buffer: Buffer.concat(chunks),
  });
};

export const downloadBuffer = async (key: string): Promise<Buffer> => {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env().S3_BUCKET,
    Key: key,
  });
  const response = await client.send(command);
  if (!response.Body) {
    throw new Error("Empty response body");
  }
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as Readable) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

