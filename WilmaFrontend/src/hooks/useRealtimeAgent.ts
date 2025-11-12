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
  sessionEndpoint?: string;
  model?: string;
  realtimeUrl?: string;
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

const DEFAULT_SESSION_ENDPOINT = "/api/realtime/session";
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview-2024-12-17";
const DEFAULT_REALTIME_URL =
  process.env.NEXT_PUBLIC_OPENAI_REALTIME_URL ?? "wss://api.openai.com/v1/realtime";
const PCM_SAMPLE_RATE = 24000;

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

export function useRealtimeAgent({
  sessionEndpoint = DEFAULT_SESSION_ENDPOINT,
  model = DEFAULT_MODEL,
  realtimeUrl = DEFAULT_REALTIME_URL,
  enableAudio = true,
}: UseRealtimeAgentOptions = {}): UseRealtimeAgent {
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoStartAttemptedRef = useRef(false);

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
    mediaRecorderRef.current?.stop();
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    mediaRecorderRef.current = null;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    socketRef.current = null;
    autoStartAttemptedRef.current = false;
    setIsConnected(false);
    setIsMicStreaming(false);
  }, []);

  useEffect(() => disconnect, [disconnect]);

  const playAudioChunk = useCallback(async (base64Chunk: string) => {
    if (!enableAudio || !audioEnabled || !base64Chunk) return;

    try {
      const audioContext =
        audioContextRef.current ??
        new AudioContext({
          sampleRate: PCM_SAMPLE_RATE,
          latencyHint: "interactive",
        });
      audioContextRef.current = audioContext;

      const analyser = analyserRef.current ?? audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const binaryString = atob(base64Chunk);
      const buffer = new ArrayBuffer(binaryString.length);
      const view = new Uint8Array(buffer);
      for (let index = 0; index < binaryString.length; index += 1) {
        view[index] = binaryString.charCodeAt(index);
      }

      const pcm16 = new Int16Array(buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let index = 0; index < pcm16.length; index += 1) {
        float32[index] = pcm16[index] / 32768;
      }

      const audioBuffer = audioContext.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
      audioBuffer.copyToChannel(float32, 0);

      audioSourceRef.current?.stop();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();
      audioSourceRef.current = source;
    } catch (error) {
      console.error("Failed to play audio chunk", error);
      setLastError("Audio playback issue. Check your device output.");
    }
  }, [audioEnabled, enableAudio]);

  const handleRealtimeEvent = useCallback(
    (event: MessageEvent<string>) => {
      const data = safeJsonParse(event.data);
      if (!data) return;

      switch (data.type) {
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
        case "response.audio.delta": {
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
    if (isConnecting || socketRef.current) return;
    setIsConnecting(true);
    setLastError(null);

    try {
      const response = await fetch(sessionEndpoint, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to create OpenAI Realtime session");
      }
      const session = await response.json();
      const token = session.client_secret?.value ?? session.client_secret ?? session.token;
      if (!token) {
        throw new Error("Realtime session token missing in response");
      }

      const ws = new WebSocket(`${realtimeUrl}?model=${model}`, ["realtime", "openai-insecure-api-key", token]);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = handleRealtimeEvent;

      ws.onerror = (event) => {
        console.error("Realtime socket error", event);
        setLastError("Wilma had trouble connecting. Please retry.");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsMicStreaming(false);
        socketRef.current = null;
      };
    } catch (error) {
      console.error(error);
      setLastError(error instanceof Error ? error.message : "Failed to connect to Wilma");
      setIsConnecting(false);
    }
  }, [handleRealtimeEvent, isConnecting, model, realtimeUrl, sessionEndpoint]);

  const sendFrame = useCallback((frame: unknown) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify(frame));
  }, []);

  const createResponse = useCallback(
    (instructions: string, options?: { modalities?: ("text" | "audio")[] }) => {
      const modalities = options?.modalities ?? (enableAudio ? ["text", "audio"] : ["text"]);
      sendFrame({
        type: "response.create",
        response: {
          modalities,
          instructions,
        },
      });
    },
    [enableAudio, sendFrame],
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (event) => {
        if (!event.data.size) return;
        const buffer = await event.data.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        sendFrame({ type: "input_audio_buffer.append", audio: base64 });
      };

      recorder.onstop = () => {
        sendFrame({ type: "input_audio_buffer.commit" });
        setIsMicStreaming(false);
      };

      recorder.start(250);
      setIsMicStreaming(true);
      sendFrame({ type: "input_audio_buffer.start" });
    } catch (error) {
      console.error(error);
      setLastError("We couldn’t access your mic. Check permissions and try again.");
    }
  }, [enableAudio, isMicStreaming, sendFrame]);

  useEffect(() => {
    if (isConnected && !autoStartAttemptedRef.current) {
      autoStartAttemptedRef.current = true;
      void startMicrophone();
    }
  }, [isConnected, startMicrophone]);

  const stopMicrophone = useCallback(() => {
    mediaRecorderRef.current?.stop();
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    mediaRecorderRef.current = null;
    setIsMicStreaming(false);
  }, []);

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
