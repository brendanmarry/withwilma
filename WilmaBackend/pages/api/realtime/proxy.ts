import type { IncomingMessage, Server as HttpServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Duplex } from "node:stream";
import WebSocket, { WebSocketServer } from "ws";

import { createRealtimeSession, getRealtimeWebsocketUrl } from "@/lib/realtime";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HttpServer & {
      realtimeProxy?: WebSocketServer;
    };
  };
};

const ACCEPTED_ORIGINS = process.env.WILMA_REALTIME_ALLOWED_ORIGINS
  ? process.env.WILMA_REALTIME_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : null;

const isOriginAllowed = (origin?: string) => {
  if (!origin || !ACCEPTED_ORIGINS || ACCEPTED_ORIGINS.length === 0) return true;
  return ACCEPTED_ORIGINS.includes(origin);
};

// Session pool to pre-create sessions and avoid browser timeout
let sessionPool: Array<{
  session: Awaited<ReturnType<typeof createRealtimeSession>>;
  createdAt: number;
}> = [];

let isRefilling = false;

const POOL_SIZE = 5; // Increased to handle burst connections
const SESSION_TTL = 50000; // 50 seconds (sessions expire at 60s)

const refillSessionPool = async () => {
  if (isRefilling) return;
  isRefilling = true;
  
  try {
    // Remove expired sessions
    const now = Date.now();
    sessionPool = sessionPool.filter((entry) => {
      const expiresAt = entry.session.expires_at * 1000;
      return expiresAt - now > 10000; // Keep if expires in >10s
    });
    
    // Add new sessions up to pool size
    while (sessionPool.length < POOL_SIZE) {
      console.info("[RealtimeProxy] Creating session for pool, current size:", sessionPool.length);
      const startTime = Date.now();
      const session = await createRealtimeSession();
      const duration = Date.now() - startTime;
      console.info("[RealtimeProxy] Session created in", duration, "ms, pool size now:", sessionPool.length + 1);
      
      sessionPool.push({
        session,
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    console.error("[RealtimeProxy] Failed to refill session pool", error);
  } finally {
    isRefilling = false;
  }
};

const getSessionFromPool = async (): Promise<Awaited<ReturnType<typeof createRealtimeSession>>> => {
  // Start refilling in background
  void refillSessionPool();
  
  // Try to get a valid session from pool
  const now = Date.now();
  const validEntry = sessionPool.find((entry) => {
    const expiresAt = entry.session.expires_at * 1000;
    return expiresAt - now > 10000; // Must have >10s left
  });
  
  if (validEntry) {
    // Remove from pool
    const index = sessionPool.indexOf(validEntry);
    sessionPool.splice(index, 1);
    console.info("[RealtimeProxy] Using pooled session, pool size now:", sessionPool.length);
    return validEntry.session;
  }
  
  // No valid session in pool, create one immediately
  console.warn("[RealtimeProxy] Pool empty, creating session synchronously");
  const startTime = Date.now();
  const session = await createRealtimeSession();
  const duration = Date.now() - startTime;
  console.info("[RealtimeProxy] Emergency session created in", duration, "ms");
  return session;
};

// Pre-warm the pool on startup
void refillSessionPool();

  const handleProxyConnection = async (clientSocket: WebSocket, request: NextApiRequest) => {
    const connectedAt = Date.now();
    console.info("[RealtimeProxy] Incoming client connection", {
      origin: request.headers.origin,
      url: request.url,
      readyState: clientSocket.readyState,
      timestamp: connectedAt,
    });

    // Check if client socket is already closed
    if (clientSocket.readyState !== WebSocket.OPEN) {
      console.warn("[RealtimeProxy] Client socket not open, state:", clientSocket.readyState);
      return;
    }

    if (!isOriginAllowed(request.headers.origin)) {
      clientSocket.close(4403, "Origin not allowed");
      return;
    }

    // Send the FIRST keepalive IMMEDIATELY and SYNCHRONOUSLY before any async work
    // This is critical to prevent browser timeout
    try {
      clientSocket.send(JSON.stringify({ type: "keepalive", timestamp: Date.now() }));
      console.info("[RealtimeProxy] Sent initial keepalive");
    } catch (error) {
      console.error("[RealtimeProxy] Failed to send initial keepalive", error);
      return;
    }

    let upstreamSocket: WebSocket | null = null;

    // Register close handler IMMEDIATELY to catch early closes
    clientSocket.on("close", (code: number, reason: Buffer) => {
      const reasonText = reason.toString("utf8");
      const duration = Date.now() - connectedAt;
      console.info("[RealtimeProxy] Client closed", { 
        code, 
        reason: reasonText,
        durationMs: duration 
      });
      if (upstreamSocket && upstreamSocket.readyState === WebSocket.OPEN) {
        upstreamSocket.close(code, reasonText);
      }
    });

    clientSocket.on("error", (error: Error) => {
      console.error("[RealtimeProxy] Client error (early)", error);
    });

    // Continue sending keepalive messages every 10ms to prevent aggressive browser timeout
    console.info("[RealtimeProxy] Starting keepalive interval...");
    const keepaliveInterval = setInterval(() => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        try {
          clientSocket.send(JSON.stringify({ type: "keepalive", timestamp: Date.now() }));
        } catch (error) {
          console.warn("[RealtimeProxy] Keepalive send failed", error);
          clearInterval(keepaliveInterval);
        }
      } else {
        clearInterval(keepaliveInterval);
      }
    }, 10); // Send every 10ms - aggressive to prevent browser timeout!
    
    // Clean up keepalive when client closes
    clientSocket.on("close", () => clearInterval(keepaliveInterval));

  const closeSockets = (code: number, reason: string) => {
    try {
      clientSocket.close(code, reason);
    } catch (error) {
      console.error("[RealtimeProxy] Failed closing client socket", error);
    }
    try {
      upstreamSocket?.close(code, reason);
    } catch (error) {
      console.error("[RealtimeProxy] Failed closing upstream socket", error);
    }
  };

  // Check if client is still connected before async work
  if (clientSocket.readyState !== WebSocket.OPEN) {
    console.warn("[RealtimeProxy] Client already closed before session retrieval, aborting");
    return;
  }

  // Get session from pool (should be instant if pool is warm)
  const sessionStartTime = Date.now();
  try {
    const session = await getSessionFromPool();
    const sessionDuration = Date.now() - sessionStartTime;
    console.info("[RealtimeProxy] Session retrieved in", sessionDuration, "ms");
    
    // Check again after async operation
    if (clientSocket.readyState !== WebSocket.OPEN) {
      console.warn("[RealtimeProxy] Client closed during session retrieval, aborting");
      return;
    }
    // The client secret response has the token in the 'value' field
    const token = session.value;

    if (!token) {
      throw new Error("Realtime ephemeral token missing");
    }

    // Get model from session object, default to gpt-4o-realtime-preview
    const model = session.session?.model || 'gpt-4o-realtime-preview';

    console.info("[RealtimeProxy] Obtained realtime client secret", {
      model,
      expiresAt: session.expires_at,
      tokenPrefix: token.substring(0, 10),
    });

    // Create WebSocket with ephemeral token in subprotocol
    // Format: openai-insecure-api-key.{token}
    upstreamSocket = new WebSocket(
      `${getRealtimeWebsocketUrl()}?model=${encodeURIComponent(model)}`,
      ["realtime", `openai-insecure-api-key.${token}`],
    );

    upstreamSocket.on("open", () => {
      console.info("[RealtimeProxy] Upstream websocket open, stopping keepalive");
      clearInterval(keepaliveInterval); // Stop keepalive once upstream is connected
      
      // NO session.update needed! When using client secrets, the session is pre-configured
      console.info("[RealtimeProxy] Session ready - waiting for session.created from OpenAI");
    });

    upstreamSocket.on("message", (data: WebSocket.RawData) => {
      try {
        const text = data.toString();
        try {
          const payload = JSON.parse(text);
          if (payload?.type === "error") {
            console.error("[RealtimeProxy] OpenAI error:", JSON.stringify(payload, null, 2));
          } else if (payload?.type === "session.updated") {
            console.info("[RealtimeProxy] Upstream acknowledged session.update");
          } else if (payload?.type) {
            console.info("[RealtimeProxy] Upstream -> Client:", payload.type);
          }
        } catch {
          // Ignore JSON parse errors – not every frame is JSON
        }
        
        // Check client socket state before sending
        if (clientSocket.readyState !== WebSocket.OPEN) {
          console.warn("[RealtimeProxy] Cannot send to client, readyState:", clientSocket.readyState);
          return;
        }
        
        clientSocket.send(text);
      } catch (error) {
        console.error("[RealtimeProxy] Failed forwarding upstream message", error);
        closeSockets(1011, "proxy-forward-error");
      }
    });

    upstreamSocket.on("close", (code: number, reason: Buffer) => {
      const reasonText = reason.toString("utf8");
      console.info("[RealtimeProxy] Upstream closed", { code, reason: reasonText });
      clientSocket.close(code, reasonText);
    });

    upstreamSocket.on("error", (error: Error) => {
      console.error("[RealtimeProxy] Upstream error", error);
      closeSockets(1011, "proxy-upstream-error");
    });

    clientSocket.on("message", (data: WebSocket.RawData) => {
      try {
        const message = data.toString();
        const parsed = JSON.parse(message);
        console.info("[RealtimeProxy] Client -> Upstream:", parsed.type || parsed);
        upstreamSocket?.send(message);
      } catch (error) {
        console.error("[RealtimeProxy] Failed forwarding client message", error);
        closeSockets(1011, "proxy-forward-error");
      }
    });

    console.info("[RealtimeProxy] All handlers set up, client state:", clientSocket.readyState);
  } catch (error) {
    console.error("[RealtimeProxy] Failed to establish proxy", error);
    closeSockets(1011, "proxy-init-error");
  }
};

let upgradeHandlerRegistered = false;
let globalWss: WebSocketServer | null = null;

const initializeProxyServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.realtimeProxy) {
    const wss = new WebSocketServer({ noServer: true });
    res.socket.server.realtimeProxy = wss;
    globalWss = wss; // Store global reference

    wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      handleProxyConnection(ws, request as NextApiRequest).catch((error) => {
        console.error("[RealtimeProxy] Connection handler failed", error);
        ws.close(1011, "proxy-handler-error");
      });
    });

    console.info("[RealtimeProxy] WebSocketServer created");
  }

  // Register upgrade handler only once globally
  if (!upgradeHandlerRegistered) {
    console.info("[RealtimeProxy] Registering WebSocket upgrade handler");
    
    res.socket.server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      console.info("[RealtimeProxy] Upgrade event received", { url: request.url, headers: request.headers });
      if (!request.url?.startsWith("/api/realtime/proxy")) {
        console.info("[RealtimeProxy] Ignoring upgrade for non-proxy URL");
        return;
      }

      if (!globalWss) {
        console.error("[RealtimeProxy] WebSocketServer not initialized!");
        socket.destroy();
        return;
      }

      globalWss.handleUpgrade(request, socket as Duplex, head, (ws: WebSocket) => {
        globalWss!.emit("connection", ws, request);
      });
    });

    upgradeHandlerRegistered = true;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    res.status(405).end("Method Not Allowed");
    return;
  }

  initializeProxyServer(res);
  res.status(200).json({ status: "proxy-ready" });
}

