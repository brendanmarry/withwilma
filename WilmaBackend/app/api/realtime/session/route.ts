import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

const DEFAULT_REALTIME_URL = process.env.OPENAI_REALTIME_URL ?? "https://api.openai.com/v1/realtime/sessions";
const DEFAULT_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview-2024-12-17";
const DEFAULT_REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE ?? "verse";

export async function POST(request: NextRequest) {
  const { OPENAI_API_KEY } = env();

  let payload: Record<string, unknown> = {};
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      payload = await request.json();
    }
  } catch (error) {
    console.warn("Failed to parse realtime session request body", error);
  }

  const model = typeof payload.model === "string" && payload.model.length > 0 ? payload.model : DEFAULT_REALTIME_MODEL;
  const voice = typeof payload.voice === "string" && payload.voice.length > 0 ? payload.voice : DEFAULT_REALTIME_VOICE;
  const modalities = Array.isArray(payload.modalities) ? payload.modalities : ["text", "audio"];

  try {
    const response = await fetch(DEFAULT_REALTIME_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        modalities,
        ...("session" in payload && typeof payload.session === "object" ? { session: payload.session } : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI realtime session creation failed", response.status, errorBody);
      return NextResponse.json({ error: "Failed to create realtime session" }, { status: 502 });
    }

    const session = await response.json();
    return NextResponse.json(session, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Realtime session request error", error);
    return NextResponse.json({ error: "Unexpected error creating realtime session" }, { status: 500 });
  }
}
