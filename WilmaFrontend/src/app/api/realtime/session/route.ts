import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "https://api.withwilma.com"

if (!API_BASE_URL) {
  console.warn("API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) is not defined. Realtime session proxy will fail.")
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { error: "Wilma backend URL is not configured. Set NEXT_PUBLIC_API_BASE_URL." },
      { status: 500 },
    )
  }

  let payload: Record<string, unknown> = {}
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      payload = await request.json()
    }
  } catch (error) {
    console.error("Failed to parse realtime proxy payload", error)
  }

  try {
    const upstream = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/api/realtime/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      const body = await upstream.text()
      console.error("Realtime session proxy failed", upstream.status, body)
      return NextResponse.json({ error: "Failed to create realtime session" }, { status: 502 })
    }

    const json = await upstream.json()
    return NextResponse.json(json, { status: 200, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Realtime session proxy error", error)
    return NextResponse.json({ error: "Unexpected error creating realtime session" }, { status: 500 })
  }
}

