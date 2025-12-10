"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type AgentRole = "wilma" | "candidate" | "system";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  text: string;
  timestamp: number;
}

interface UseRealtimeAgentOptions {
  model?: string;
  enableAudio?: boolean;
}

interface UseRealtimeAgent {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  isMicStreaming: boolean;
  sendUserMessage: (text: string) => void;
  createResponse: (instructions: string, options?: { modalities?: ("text" | "audio")[] }) => void;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => void;
  toggleAudioEnabled: () => void;
  audioEnabled: boolean;
  audioAnalyser: AnalyserNode | null;
  messages: AgentMessage[];
  lastError?: string | null;
}

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview-2024-12-17";
const PCM_SAMPLE_RATE = 24000;

let proxyWarmPromise: Promise<void> | null = null;

const websocketToHttp = (url: string) =>
  url.replace(/^ws/iu, (match) => (match.toLowerCase() === "wss" ? "https" : "http"));

const warmRealtimeProxy = async () => {
  if (typeof window === "undefined") return;
  if (!proxyWarmPromise) {
    const proxyUrl = getProxyWebsocketUrl();
    const warmUrl = websocketToHttp(proxyUrl);

    proxyWarmPromise = fetch(warmUrl, { credentials: "include", cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to warm realtime proxy (${response.status})`);
        }
      })
      .catch((error) => {
        proxyWarmPromise = null;
        throw error;
      });
  }
  return proxyWarmPromise;
};

const getProxyWebsocketUrl = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_REALTIME_PROXY_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    "";

  const transformProtocol = (value: string) =>
    value.replace(/^http/iu, (match) => (match.toLowerCase() === "https" ? "wss" : "ws"));

  if (configured) {
    return `${transformProtocol(configured.replace(/\/$/, ""))}/api/realtime/proxy`;
  }

  if (typeof window !== "undefined") {
    return `${transformProtocol(window.location.origin)}/api/realtime/proxy`;
  }

  return "/api/realtime/proxy";
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch (error) {
    console.error("Failed to parse realtime payload", error);
    return null;
  }
}

// Preserve WebSocket across HMR in development
let globalSocket: WebSocket | null = null;
if (typeof window !== 'undefined') {
  // @ts-ignore - HMR preserves this
  if (!window.__wilmaRealtimeSocket) {
    // @ts-ignore
    window.__wilmaRealtimeSocket = null;
  }
  // @ts-ignore
  globalSocket = window.__wilmaRealtimeSocket;
}

export function useRealtimeAgent({
  model = DEFAULT_MODEL,
  enableAudio = true,
}: UseRealtimeAgentOptions = {}): UseRealtimeAgent {
  const socketRef = useRef<WebSocket | null>(globalSocket);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoStartAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicStreaming, setIsMicStreaming] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (audioEnabled) {
      audioContextRef.current?.resume().catch(() => undefined);
    }
  }, [audioEnabled]);

  useEffect(() => {
    const resume = () => {
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume().catch(() => undefined);
      }
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  const disconnect = useCallback(() => {
    console.info("[WilmaRealtime] disconnect called");

    // Clean up audio processor
    const audioContext = audioContextRef.current;
    if (audioContext) {
      const processor = (audioContext as any).__wilmaProcessor;
      const source = (audioContext as any).__wilmaSource;

      if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
      }
      if (source) {
        source.disconnect();
      }
    }

    // Stop media tracks
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.info("[WilmaRealtime] Closing WebSocket from disconnect()");
      socketRef.current.close();
    }
    socketRef.current = null;
    // Clear global HMR reference
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__wilmaRealtimeSocket = null;
    }
    autoStartAttemptedRef.current = false;
    setIsConnected(false);
    setIsMicStreaming(false);
  }, []);

  // Mark component as mounted and handle cleanup
  useEffect(() => {
    isMountedRef.current = true;
    console.info("[WilmaRealtime] Component mounted");

    return () => {
      console.info("[WilmaRealtime] Component unmounting, scheduling cleanup");
      isMountedRef.current = false;

      // In development (React StrictMode), be VERY conservative about cleanup
      // Only cleanup after a substantial delay to avoid disrupting legitimate connections
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }

      cleanupTimerRef.current = setTimeout(() => {
        // Only disconnect if still unmounted after delay AND not connecting
        if (!isMountedRef.current && !isConnecting && !isConnected) {
          console.info("[WilmaRealtime] Cleanup confirmed, disconnecting");
          disconnect();
        } else {
          console.info("[WilmaRealtime] Component remounted or connection active, skipping cleanup", {
            mounted: isMountedRef.current,
            connecting: isConnecting,
            connected: isConnected
          });
        }
      }, 5000); // 5 second grace period to handle StrictMode and navigation
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAudioChunk = useCallback(async (base64Chunk: string) => {
    if (!enableAudio || !audioEnabled || !base64Chunk) return;

    try {
      // Initialize or get existing audio context
      let audioContext = audioContextRef.current;
      if (!audioContext) {
        audioContext = new AudioContext({
          sampleRate: PCM_SAMPLE_RATE,
          latencyHint: "interactive",
        });
        audioContextRef.current = audioContext;
        console.info("[WilmaRealtime] Audio context created", { sampleRate: audioContext.sampleRate, state: audioContext.state });
      }

      // Resume audio context if suspended (required for autoplay policies)
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.info("[WilmaRealtime] Audio context resumed");
      }

      // Create or get analyser
      let analyser = analyserRef.current;
      if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
      }

      // Decode base64 to PCM16
      const binaryString = atob(base64Chunk);
      const buffer = new ArrayBuffer(binaryString.length);
      const view = new Uint8Array(buffer);
      for (let index = 0; index < binaryString.length; index += 1) {
        view[index] = binaryString.charCodeAt(index);
      }

      // Convert PCM16 to Float32
      const pcm16 = new Int16Array(buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let index = 0; index < pcm16.length; index += 1) {
        float32[index] = pcm16[index] / 32768;
      }

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
      audioBuffer.copyToChannel(float32, 0);

      // Stop previous source if it exists and is playing
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (e) {
          // Source may have already stopped
        }
      }

      // Create and play new source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start(0);
      audioSourceRef.current = source;

      console.log("[WilmaRealtime] Playing audio chunk", {
        duration: audioBuffer.duration,
        length: float32.length,
        contextState: audioContext.state
      });
    } catch (error) {
      console.error("[WilmaRealtime] Failed to play audio chunk", error);
      setLastError("Audio playback issue. Check your device output.");
    }
  }, [audioEnabled, enableAudio]);

  const handleRealtimeEvent = useCallback(
    (event: MessageEvent<string>) => {
      const data = safeJsonParse(event.data);
      if (!data) return;

      console.log("[WilmaRealtime] received event:", data.type, data);

      switch (data.type) {
        case "proxy.connecting": {
          console.info("[WilmaRealtime] Backend creating OpenAI session...");
          break;
        }
        case "session.updated": {
          // Session is now ready - mark as fully connected
          console.info("[WilmaRealtime] Session ready, fully connected");
          setIsConnected(true);
          setIsConnecting(false);
          break;
        }
        case "session.created": {
          // With client secrets, the session is pre-configured and ready immediately
          console.info("[WilmaRealtime] Session created by OpenAI, connection ready!");

          // Update session to configure the voice to "verse"
          console.info("[WilmaRealtime] Updating session to use 'verse' voice...");
          sendFrame({
            type: "session.update",
            session: {
              voice: "verse",
            },
          });

          setIsConnected(true);
          setIsConnecting(false);
          break;
        }
        case "error": {
          console.error("[WilmaRealtime] OpenAI error event:", data);
          const errorMsg = data.error?.message || data.error?.type || JSON.stringify(data.error) || "Unknown error";
          setLastError(`OpenAI: ${errorMsg}`);
          break;
        }
        case "response.message": {
          const content = data?.response?.output_text?.join?.(" ") ?? data?.message?.content ?? "";
          if (!content) return;
          setMessages((prev) => [
            ...prev,
            {
              id: data.response?.id ?? crypto.randomUUID(),
              role: "wilma",
              text: content,
              timestamp: Date.now(),
            },
          ]);
          break;
        }
        case "response.output_text.delta": {
          const text = data.delta;
          if (!text) return;
          setMessages((prev) => {
            if (prev.length === 0) {
              return [
                {
                  id: crypto.randomUUID(),
                  role: "wilma",
                  text,
                  timestamp: Date.now(),
                },
              ];
            }
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "wilma") {
              updated[updated.length - 1] = { ...last, text: `${last.text}${text}` };
              return updated;
            }
            return [
              ...updated,
              { id: crypto.randomUUID(), role: "wilma", text, timestamp: Date.now() },
            ];
          });
          break;
        }
        case "response.audio.delta":
        case "response.output_audio.delta": {
          const chunk = data.delta;
          if (chunk) {
            void playAudioChunk(chunk);
          }
          break;
        }
        case "conversation.item.created": {
          const message = data.item;
          const text = message?.content?.[0]?.text ?? message?.content?.text ?? "";
          if (text) {
            setMessages((prev) => [
              ...prev,
              {
                id: message?.id ?? crypto.randomUUID(),
                role: message?.author === "user" ? "candidate" : "wilma",
                text,
                timestamp: Date.now(),
              },
            ]);
          }
          break;
        }
        default:
          break;
      }
    },
    [playAudioChunk],
  );

  const connect = useCallback(async () => {
    if (isConnecting || isConnected || socketRef.current) {
      console.info("[WilmaRealtime] connect called but already connecting/connected, skipping");
      return;
    }
    console.info("[WilmaRealtime] initiating connection");
    setIsConnecting(true);
    setLastError(null);

    try {
      // NEW APPROACH: Get ephemeral token and connect DIRECTLY to OpenAI (like test page)
      console.info("[WilmaRealtime] Requesting ephemeral token from backend...");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.withwilma.com'}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`Failed to get session token: ${response.status}`);
      }
      const sessionData = await response.json();
      const token = sessionData.value;
      const model = sessionData.session?.model || 'gpt-4o-realtime-preview';

      console.info("[WilmaRealtime] Got ephemeral token, connecting directly to OpenAI...");

      // Connect DIRECTLY to OpenAI (no proxy!)
      const openaiUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;
      console.info("[WilmaRealtime] connecting to OpenAI", openaiUrl);
      const ws = new WebSocket(openaiUrl, ['realtime', `openai-insecure-api-key.${token}`]);
      socketRef.current = ws;
      // Preserve across HMR
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.__wilmaRealtimeSocket = ws;
      }

      ws.onopen = () => {
        console.info("[WilmaRealtime] ✅ WebSocket OPEN", {
          readyState: ws.readyState,
          url: ws.url,
          protocol: ws.protocol,
          extensions: ws.extensions,
          binaryType: ws.binaryType,
        });
        // Keep isConnecting true until we get session.updated

        // OpenAI keeps the connection alive automatically, no need for client-side ping
      };

      ws.onmessage = (event) => {
        console.info("[WilmaRealtime] socket message received, length:", event.data?.length);
        console.info("[WilmaRealtime] socket message data:", event.data);
        handleRealtimeEvent(event);
      };

      ws.onerror = (event) => {
        console.error("Realtime socket error", event);
        setLastError("Wilma had trouble connecting. Please retry.");
        setIsConnecting(false);
      };

      // Track connection time for debugging
      const connectAttemptTime = Date.now();

      ws.onclose = (event) => {
        const duration = Date.now() - connectAttemptTime;
        console.warn("[WilmaRealtime] ❌ WebSocket CLOSED", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          durationMs: duration,
          readyState: ws.readyState,
        });

        // Log code meanings for easier debugging
        const codeMessage = {
          1000: "Normal Closure",
          1001: "Going Away",
          1002: "Protocol Error",
          1003: "Unsupported Data",
          1005: "No Status Received",
          1006: "Abnormal Closure (no close frame)",
          1007: "Invalid frame payload data",
          1008: "Policy Violation",
          1009: "Message Too Big",
          1010: "Mandatory Extension Missing",
          1011: "Internal Server Error",
          1015: "TLS Handshake Failure",
        }[event.code];

        if (codeMessage) {
          console.warn(`[WilmaRealtime] Close code ${event.code}: ${codeMessage}`);
        }

        // Only clear the socket if it's the same one that closed
        if (socketRef.current === ws) {
          socketRef.current = null;
          setIsConnected(false);
          setIsMicStreaming(false);
          setIsConnecting(false);

          // Clear HMR reference
          if (typeof window !== 'undefined') {
            // @ts-ignore
            window.__wilmaRealtimeSocket = null;
          }

          if (event.code !== 1000 || event.reason) {
            setLastError(
              `Connection closed (code ${event.code}${event.reason ? `, reason: ${event.reason}` : ""
              })`,
            );
          }
        }
      };
    } catch (error) {
      console.error(error);
      setLastError(error instanceof Error ? error.message : "Failed to connect to Wilma");
      setIsConnecting(false);
    }
  }, [handleRealtimeEvent, isConnecting, isConnected]);

  const sendFrame = useCallback((frame: unknown) => {
    if (!socketRef.current) {
      console.warn("[WilmaRealtime] Cannot send frame: socket is null");
      return;
    }
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WilmaRealtime] Cannot send frame: socket state is", socketRef.current.readyState, "expected", WebSocket.OPEN);
      return;
    }
    console.log("[WilmaRealtime] Sending frame:", (frame as any).type || frame);
    socketRef.current.send(JSON.stringify(frame));
  }, []);

  const createResponse = useCallback(
    (instructions: string) => {
      console.log("[WilmaRealtime] creating response with instructions:", instructions.substring(0, 100) + "...");
      sendFrame({
        type: "response.create",
        response: {
          instructions,
        },
      });
    },
    [sendFrame],
  );

  const sendUserMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "candidate", text, timestamp: Date.now() },
      ]);

      createResponse(text);
    },
    [createResponse],
  );

  const startMicrophone = useCallback(async () => {
    if (!enableAudio || isMicStreaming) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      microphoneStreamRef.current = stream;

      // Create audio context to convert to PCM16
      const audioContext = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
      const source = audioContext.createMediaStreamSource(stream);

      // Use larger buffer size (8192 samples = ~341ms at 24kHz) to ensure we have enough audio
      const processor = audioContext.createScriptProcessor(8192, 1, 1);

      // Buffer to accumulate audio chunks
      let audioBuffer: Int16Array[] = [];
      let bufferSize = 0;
      const MIN_BUFFER_SIZE = 24000 * 0.1; // 100ms minimum (2400 samples)

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);

        // Convert float32 to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Add to buffer
        audioBuffer.push(pcm16);
        bufferSize += pcm16.length;

        // Only send when we have at least 100ms of audio
        if (bufferSize >= MIN_BUFFER_SIZE) {
          // Combine all buffered chunks
          const combined = new Int16Array(bufferSize);
          let offset = 0;
          for (const chunk of audioBuffer) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }

          // Convert to base64 and send
          const base64 = arrayBufferToBase64(combined.buffer);
          const durationMs = (bufferSize / 24000) * 1000;
          console.log(`[WilmaRealtime] Sending audio buffer: ${bufferSize} samples (~${durationMs.toFixed(1)}ms)`);
          sendFrame({ type: "input_audio_buffer.append", audio: base64 });

          // Reset buffer
          audioBuffer = [];
          bufferSize = 0;
        }
      };

      // Store references for cleanup
      (audioContext as any).__wilmaProcessor = processor;
      (audioContext as any).__wilmaSource = source;
      audioContextRef.current = audioContext;

      setIsMicStreaming(true);
      console.info("[WilmaRealtime] Microphone started with PCM16 encoding, buffer size: 8192 samples (~341ms)");
    } catch (error) {
      console.error(error);
      setLastError("We couldn't access your mic. Check permissions and try again.");
    }
  }, [enableAudio, isMicStreaming, sendFrame]);

  useEffect(() => {
    if (isConnected && !autoStartAttemptedRef.current) {
      autoStartAttemptedRef.current = true;
      void startMicrophone();
    }
  }, [isConnected, startMicrophone]);

  const stopMicrophone = useCallback(() => {
    // Clean up audio processor and context
    const audioContext = audioContextRef.current;
    if (audioContext) {
      const processor = (audioContext as any).__wilmaProcessor;
      const source = (audioContext as any).__wilmaSource;

      if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
      }
      if (source) {
        source.disconnect();
      }

      // Note: Don't close the audioContext as it's used for playback too
    }

    // Stop media tracks
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    setIsMicStreaming(false);

    // Commit any remaining audio
    sendFrame({ type: "input_audio_buffer.commit" });

    console.info("[WilmaRealtime] Microphone stopped");
  }, [sendFrame]);

  const toggleAudioEnabled = useCallback(() => {
    setAudioEnabled((prev) => {
      if (prev) {
        audioSourceRef.current?.stop();
      } else {
        audioContextRef.current?.resume().catch(() => undefined);
      }
      return !prev;
    });
  }, []);

  return {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    isMicStreaming,
    sendUserMessage,
    createResponse,
    startMicrophone,
    stopMicrophone,
    toggleAudioEnabled,
    audioEnabled,
    audioAnalyser: analyserRef.current,
    messages,
    lastError,
  };
}
