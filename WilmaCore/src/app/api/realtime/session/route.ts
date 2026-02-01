import { NextRequest, NextResponse } from "next/server";

import { createRealtimeSession } from "@/lib/realtime";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const OPTIONS = (request: NextRequest) => corsOptionsResponse(request);

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown> = {};
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      payload = await request.json();
    }
  } catch (error) {
    console.warn("Failed to parse realtime session request body", error);
  }

  try {
    const session = await createRealtimeSession(payload);
    return withCors(
      NextResponse.json(session, {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }),
      request,
    );
  } catch (error) {
    console.error("Realtime session request error", error);
    return withCors(
      NextResponse.json({ error: "Unexpected error creating realtime session" }, { status: 500 }),
      request,
    );
  }
}
