import { env } from "@/lib/env";

const DEFAULT_CLIENT_SECRET_URL =
  process.env.OPENAI_REALTIME_CLIENT_SECRET_URL ?? "https://api.openai.com/v1/realtime/client_secrets";
const DEFAULT_REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview";
const DEFAULT_REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE ?? "verse";

export type RealtimeSessionResponse = {
  value: string;  // The ephemeral token
  expires_at: number;  // Unix timestamp
  session?: {
    id?: string;
    model?: string;
    [key: string]: unknown;
  };
};

export const createRealtimeSession = async (
  payload: Record<string, unknown> = {},
  maxRetries = 3,
): Promise<RealtimeSessionResponse> => {
  const { OPENAI_API_KEY } = env();

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(DEFAULT_CLIENT_SECRET_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body - endpoint doesn't accept parameters
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(
          `OpenAI realtime client secret creation failed (${response.status}): ${errorBody.slice(0, 500)}`,
        );
        
        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = error;
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.warn(`[Realtime] Client secret creation attempt ${attempt} failed, retrying in ${backoff}ms`, {
            status: response.status,
            attempt,
            maxRetries,
          });
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
        
        throw error;
      }

      const clientSecret = (await response.json()) as RealtimeSessionResponse;
      
      // Log the structure for debugging
      console.info('[Realtime] Client secret created', {
        hasValue: !!clientSecret.value,
        expiresAt: clientSecret.expires_at,
        hasSession: !!clientSecret.session,
        model: clientSecret.session?.model,
      });
      
      return clientSecret;
    } catch (error) {
      if (attempt === maxRetries) {
        throw lastError || error;
      }
      lastError = error as Error;
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.warn(`[Realtime] Client secret creation attempt ${attempt} failed with error, retrying in ${backoff}ms`, {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        maxRetries,
      });
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  throw lastError || new Error("Failed to create realtime client secret after retries");
};

export const getRealtimeWebsocketUrl = () =>
  (process.env.OPENAI_REALTIME_WEBSOCKET_URL ?? "wss://api.openai.com/v1/realtime") as string;

