"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeakOptions = Partial<Pick<SpeechSynthesisUtterance, "rate" | "pitch" | "lang">> & {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

const PREFERRED_VOICES = [
  "Google UK English Female",
  "Google US English",
  "Google US English Female",
  "Samantha",
  "Victoria",
  "Karen",
  "Tessa",
];

let cachedVoice: SpeechSynthesisVoice | null = null;

const chooseVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  let selected =
    PREFERRED_VOICES.map((name) => voices.find((voice) => voice.name === name)).find(
      (voice): voice is SpeechSynthesisVoice => Boolean(voice),
    ) ?? null;

  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  const englishVoicesByGender = englishVoices.find(
    (voice) => /female/i.test(voice.name) || /female/i.test(voice.voiceURI),
  );

  if (!selected) {
    selected = englishVoicesByGender ?? null;
  }

  if (!selected && englishVoices.length) {
    selected = englishVoices.find((voice) => voice.default) ?? englishVoices[0] ?? null;
  }

  if (!selected) {
    selected =
      voices.find((voice) => /female/i.test(voice.name) || /female/i.test(voice.voiceURI)) ?? null;
  }

  return selected ?? voices.find((voice) => voice.default) ?? voices[0] ?? null;
};

export const useWilmaVoice = () => {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isReady, setIsReady] = useState(false);

  const updateVoice = useCallback(() => {
    const selected = chooseVoice();
    if (selected) {
      cachedVoice = selected;
      setVoice(selected);
      setIsReady(true);
      console.log("[useWilmaVoice] Voice selected and ready:", selected.name);
    } else {
      console.warn("[useWilmaVoice] No voice could be selected");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("[useWilmaVoice] Speech synthesis not supported in this environment");
      return;
    }

    console.log("[useWilmaVoice] Initializing voice system");

    const initialise = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("[useWilmaVoice] Available voices:", voices.length);
      
      if (!cachedVoice) {
        updateVoice();
      } else {
        setVoice(cachedVoice);
        setIsReady(true);
        console.log("[useWilmaVoice] Using cached voice:", cachedVoice.name);
      }
    };

    // Try to get voices immediately
    const voices = window.speechSynthesis.getVoices();
    console.log("[useWilmaVoice] Initial voices check:", voices.length, "voices found");
    
    if (voices.length > 0) {
      initialise();
    } else {
      console.log("[useWilmaVoice] No voices yet, waiting for voiceschanged event");
    }

    // Listen for voiceschanged event (needed for Chrome and some other browsers)
    window.speechSynthesis.addEventListener("voiceschanged", updateVoice);
    
    // Multiple fallback timers to ensure voices load
    const fallbackTimer1 = setTimeout(() => {
      if (!isReady) {
        console.log("[useWilmaVoice] Fallback 1: trying to initialize after 100ms");
        initialise();
      }
    }, 100);
    
    const fallbackTimer2 = setTimeout(() => {
      if (!isReady) {
        console.log("[useWilmaVoice] Fallback 2: trying to initialize after 500ms");
        initialise();
      }
    }, 500);

    return () => {
      clearTimeout(fallbackTimer1);
      clearTimeout(fallbackTimer2);
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoice);
    };
  }, [updateVoice, isReady]);

  const speak = useCallback(
    (text: string, { rate = 1, pitch = 1, lang = "en-US", onStart, onEnd, onError }: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
        console.warn("[useWilmaVoice] Speech synthesis not available or empty text");
        if (onError) onError();
        return null;
      }

      const synth = window.speechSynthesis;
      
      // Only cancel if something is actually speaking or pending
      if (synth.speaking || synth.pending) {
        console.log("[useWilmaVoice] Canceling previous speech");
        synth.cancel();
        // Give a tiny moment for cancel to complete
        setTimeout(() => {}, 10);
      }
      
      // Force load voices if not already loaded
      const voices = synth.getVoices();
      console.log("[useWilmaVoice] Current voices available:", voices.length);
      
      if (voices.length === 0) {
        console.error("[useWilmaVoice] ERROR: No voices available! Cannot speak.");
        if (onError) onError();
        return null;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      const selectedVoice = voice ?? cachedVoice ?? chooseVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        cachedVoice = selectedVoice;
        setVoice(selectedVoice);
        console.log("[useWilmaVoice] Using voice:", selectedVoice.name);
        const resolvedLang = selectedVoice.lang?.startsWith("en")
          ? selectedVoice.lang
          : lang ?? "en-US";
        utterance.lang = resolvedLang;
      } else {
        console.warn("[useWilmaVoice] WARNING: No voice selected, will use browser default");
        utterance.lang = lang ?? "en-US";
      }

      if (onStart) {
        utterance.onstart = () => {
          console.log("[useWilmaVoice] Speech started");
          onStart();
        };
      }
      
      if (onEnd) {
        utterance.onend = () => {
          console.log("[useWilmaVoice] Speech ended");
          onEnd();
        };
      }
      
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const errorType = event.error;
        
        // "canceled" errors during cleanup are normal, don't treat as real errors
        if (errorType === "canceled") {
          console.log("[useWilmaVoice] Speech was canceled (this is normal during cleanup)");
          // Still call onError to clean up state, but don't log as an error
          if (onError) onError();
          return;
        }
        
        const errorMessage = errorType === "not-allowed" 
          ? "Browser blocked audio (autoplay policy - user must click first)"
          : errorType;
        
        console.error("[useWilmaVoice] Speech error type:", errorType);
        console.error("[useWilmaVoice] Full error:", errorMessage);
        console.error("[useWilmaVoice] Event details:", {
          type: event.type,
          error: event.error,
          charIndex: event.charIndex,
          elapsedTime: event.elapsedTime,
          utteranceText: event.utterance?.text?.substring(0, 50)
        });
        if (onError) onError();
      };

      console.log("[useWilmaVoice] Speaking text:", text.substring(0, 50) + "...");
      synth.speak(utterance);
      
      // Workaround for some browsers that pause speech
      setTimeout(() => {
        if (synth.paused) {
          console.log("[useWilmaVoice] Resuming paused speech");
          synth.resume();
        }
      }, 100);
      
      return utterance;
    },
    [voice],
  );

  return { voice, speak, isReady };
};

