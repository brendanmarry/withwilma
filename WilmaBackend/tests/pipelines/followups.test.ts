import { generateFollowUps } from "@/lib/llm/pipelines/followups";
import { callJsonLLM } from "@/lib/llm/utils";

jest.mock("@/lib/llm/utils", () => ({
  callJsonLLM: jest.fn().mockResolvedValue({
    follow_up_questions: [
      {
        question: "Can you share a project where you led React performance improvements?",
        why_this_question: "Understand ownership and impact",
        competency_targeted: "Leadership",
      },
      {
        question: "How do you ensure accessibility in your interfaces?",
        why_this_question: "Gauge accessibility awareness",
        competency_targeted: "Accessibility",
      },
      {
        question: "Describe your experience collaborating with product managers.",
        why_this_question: "Collaboration depth",
        competency_targeted: "Collaboration",
      },
    ],
  }),
}));

describe("generateFollowUps", () => {
  it("produces exactly three follow-up questions", async () => {
    const result = await generateFollowUps({ matchSummary: { gaps: ["Accessibility"] } });
    expect(callJsonLLM).toHaveBeenCalled();
    expect(result.follow_up_questions).toHaveLength(3);
    expect(result.follow_up_questions[0]?.competency_targeted).toBeDefined();
  });
});

