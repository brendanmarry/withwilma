
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ organisationId: string }> }
) {
    try {
        const { organisationId } = await params;
        const body = await request.json();

        // Forward the request to the backend service
        const response = await fetch(`${API_BASE_URL}/organisations/${organisationId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                // Add any necessary auth headers here if needed, 
                // strictly speaking this should be authenticated proxy
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            // If the backend returns an error (e.g. slug taken), forward it
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: "Backend update failed", details: errorData },
                { status: response.status }
            );
        }

        const updatedOrg = await response.json();
        return NextResponse.json(updatedOrg);

    } catch (error) {
        console.error("Error updating tenant:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
