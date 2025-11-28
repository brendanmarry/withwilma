import { z } from "zod";
import { callJsonLLM } from "@/lib/llm/utils";

const aiDetectionSchema = z.object({
  isAiGenerated: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  indicators: z.array(z.string()).optional().default([]),
});

export type AIDetectionResult = z.infer<typeof aiDetectionSchema>;

/**
 * Detects if audio/video content appears to be AI-generated
 * Analyzes transcript text and audio characteristics
 */
export const detectAIGeneratedContent = async ({
  transcript,
  audioMetadata,
}: {
  transcript: string;
  audioMetadata?: {
    duration?: number;
    sampleRate?: number;
    channels?: number;
  };
}): Promise<AIDetectionResult> => {
  // Simple heuristics first - check for common AI generation patterns
  const aiIndicators: string[] = [];
  
  // Check for overly perfect or generic language
  const genericPhrases = [
    "I am excited to",
    "I believe I would be",
    "I am confident that",
    "I am passionate about",
    "I am a team player",
    "I am detail-oriented",
    "I am a quick learner",
  ];
  
  const transcriptLower = transcript.toLowerCase();
  const genericCount = genericPhrases.filter(phrase => 
    transcriptLower.includes(phrase.toLowerCase())
  ).length;
  
  if (genericCount >= 3) {
    aiIndicators.push("High frequency of generic professional phrases");
  }
  
  // Check for unnatural pauses or perfect grammar
  const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  
  if (avgWordsPerSentence > 25) {
    aiIndicators.push("Unusually long sentences (common in AI-generated text)");
  }
  
  // Check for lack of natural speech patterns (um, uh, like, etc.)
  const naturalFillers = ["um", "uh", "like", "you know", "well", "actually"];
  const fillerCount = naturalFillers.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    return count + (transcript.match(regex)?.length || 0);
  }, 0);
  
  if (fillerCount === 0 && wordCount > 50) {
    aiIndicators.push("Lack of natural speech fillers");
  }
  
  // Use LLM for more sophisticated detection if we have enough text
  if (transcript.length > 100) {
    try {
      const prompt = `You are an expert at detecting AI-generated or synthetic audio/video content. Analyze the following transcript from a candidate's video interview response.

Transcript:
${transcript}

${audioMetadata ? `Audio metadata: Duration ${audioMetadata.duration}s, Sample rate: ${audioMetadata.sampleRate}Hz` : ""}

Determine if this appears to be AI-generated or synthetic content. Look for:
- Unnatural speech patterns
- Overly polished or generic language
- Lack of natural pauses, hesitations, or corrections
- Repetitive phrasing
- Unusual consistency in tone and structure
- Signs of text-to-speech or voice synthesis

Return a JSON response with:
- isAiGenerated: boolean
- confidence: "high" | "medium" | "low"
- reasoning: brief explanation
- indicators: array of specific indicators found`;

      const result = await callJsonLLM({
        systemPrompt: "You are an expert at detecting synthetic or AI-generated audio/video content.",
        userContent: prompt,
        schema: aiDetectionSchema,
      });
      
      const parsed = aiDetectionSchema.parse(result);
      
      // Combine LLM indicators with heuristic indicators
      return {
        ...parsed,
        indicators: [...(parsed.indicators || []), ...aiIndicators],
      };
    } catch (error) {
      // Fallback to heuristic-based detection
      console.warn("AI detection LLM call failed, using heuristics", error);
    }
  }
  
  // Heuristic-based detection
  const isAiGenerated = aiIndicators.length >= 2;
  const confidence: "high" | "medium" | "low" = 
    aiIndicators.length >= 3 ? "high" :
    aiIndicators.length >= 2 ? "medium" : "low";
  
  return {
    isAiGenerated,
    confidence,
    reasoning: aiIndicators.length > 0 
      ? `Detected ${aiIndicators.length} potential AI generation indicators`
      : "No strong indicators of AI generation detected",
    indicators: aiIndicators,
  };
};

