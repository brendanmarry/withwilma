import { scoreMatch } from "@/lib/llm/pipelines/match_scoring";
import { callJsonLLM } from "@/lib/llm/utils";

jest.mock("@/lib/llm/utils", () => ({
  callJsonLLM: jest.fn().mockResolvedValue({
    match_score: 82,
    strengths: ["Strong JavaScript experience"],
    gaps: ["Limited cloud deployments"],
    role_alignment_summary: "Candidate aligns well with frontend role.",
    recommended_questions: [
      { question: "Tell us about a complex UI you've built.", reason: "Ownership" },
      { question: "How do you approach accessibility?", reason: "Accessibility" },
      { question: "Describe a time you collaborated with back-end teams.", reason: "Collaboration" },
    ],
    extracted_skills: ["React", "TypeScript"],
    experience_summary: "5 years in modern web development.",
    confidence: "high",
  }),
}));

describe("scoreMatch", () => {
  it("returns structured match scoring data", async () => {
    const result = await scoreMatch({
      jobDescription: "Looking for a senior frontend engineer with React experience.",
      cvText: "Experienced React engineer with 5 years building SPAs.",
      companyKnowledge: "We value collaboration and accessibility.",
    });

    expect(callJsonLLM).toHaveBeenCalled();
    expect(result.match_score).toBe(82);
    expect(result.recommended_questions).toHaveLength(3);
    expect(result.strengths[0]).toContain("Strong");
  });
});

