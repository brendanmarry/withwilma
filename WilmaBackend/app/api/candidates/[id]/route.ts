
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrganisationFromRequest } from "@/lib/tenant";
import { getDownloadUrl, parseS3Url } from "@/lib/storage";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // Await params before using them
    const { id } = await context.params;

    const organisation = await getOrganisationFromRequest(request);

    if (!organisation) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
        return new NextResponse("Candidate ID required", { status: 400 });
    }

    try {
        const candidate = await prisma.candidate.findFirst({
            where: {
                id,
                job: {
                    organisationId: organisation.id
                }
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        organisationId: true
                    }
                },
                videos: {
                    include: {
                        followupQuestion: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                followups: true
            }
        });

        if (!candidate) {
            return new NextResponse("Candidate not found", { status: 404 });
        }

        // Sign video URLs
        await Promise.all(candidate.videos.map(async (video) => {
            if (video.videoUrl && video.videoUrl.startsWith("s3://")) {
                try {
                    const { key } = parseS3Url(video.videoUrl);
                    // Force webm content type for playback, as uploads might be blobs without type
                    // Use localhost:9000 to sign the URL so it matches the browser's access point
                    const signedUrl = await getDownloadUrl(key, 600, "video/webm", "http://localhost:9000");
                    video.videoUrl = signedUrl;
                } catch (e) {
                    console.error(`Failed to sign video URL for ${video.id}`, e);
                }
            }
        }));

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("Failed to fetch candidate", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const organisation = await getOrganisationFromRequest(request);

    if (!organisation) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.candidate.delete({
            where: {
                id,
                job: { organisationId: organisation.id }
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete candidate", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const organisation = await getOrganisationFromRequest(request);

    if (!organisation) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { status } = body;

        const candidate = await prisma.candidate.update({
            where: {
                id,
                job: { organisationId: organisation.id }
            },
            data: {
                status
            }
        });

        return NextResponse.json(candidate);
    } catch (error) {
        console.error("Failed to update candidate", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
