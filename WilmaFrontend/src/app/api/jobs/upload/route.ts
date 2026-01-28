
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:3001"; // Default to backend service

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";

        const response = await fetch(`${API_BASE_URL}/api/jobs/upload`, {
            method: "POST",
            headers: {
                // Forward content-type (multipart/form-data boundary is important)
                "Content-Type": contentType,
                // Forward auth token if needed, usually passed in headers
                "Cookie": request.headers.get("cookie") || "",
            },
            body: request.body as any, // duplicated stream
            duplex: "half", // Required for streaming body in Next.js/Node fetch
        } as any);

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(errorText, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
