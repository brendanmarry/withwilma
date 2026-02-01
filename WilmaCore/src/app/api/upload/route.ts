import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { uploadBuffer, parseS3Url, getPublicUrl } from "@/lib/storage";
import { logger, serializeError } from "@/lib/logger";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const POST = async (request: Request) => {
    const admin = await getAdminTokenFromRequest();
    if (!admin) {
        return withCors(new NextResponse("Unauthorized", { status: 401 }), request);
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return withCors(new NextResponse("No file provided", { status: 400 }), request);
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to S3/MinIO
        const s3Url = await uploadBuffer({
            fileName: file.name,
            contentType: file.type,
            buffer,
            folder: "logos",
        });

        // Return public URL (no expiration)
        const { key } = parseS3Url(s3Url);
        const publicUrl = getPublicUrl(key);

        return withCors(NextResponse.json({ url: publicUrl, s3Url }), request);

    } catch (error) {
        logger.error("Failed to upload logo", {
            error: serializeError(error),
        });
        return withCors(new NextResponse("Upload failed", { status: 500 }), request);
    }
};

export const OPTIONS = async (request: Request) => corsOptionsResponse(request);
