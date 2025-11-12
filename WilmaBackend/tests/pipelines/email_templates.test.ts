import { generateEmailTemplate } from "@/lib/llm/pipelines/email_templates";

jest.mock("@/lib/llm/utils", () => ({
  callJsonLLM: jest.fn().mockResolvedValue({
    interview: {
      subject: "Interview Invitation",
      body: "We would love to meet you!",
    },
    rejection: {
      subject: "Appreciate your application",
      body: "Thank you for your time.",
    },
  }),
}));

describe("generateEmailTemplate", () => {
  it("returns interview templates when requested", async () => {
    const template = await generateEmailTemplate({
      type: "schedule",
      candidateName: "Avery",
      roleTitle: "Senior Engineer",
      companyName: "Wilma Labs",
      recruiterName: "Jordan",
    });
    expect(template.subject).toContain("Interview");
  });

  it("returns rejection templates when requested", async () => {
    const template = await generateEmailTemplate({
      type: "reject",
      candidateName: "Avery",
      roleTitle: "Senior Engineer",
      companyName: "Wilma Labs",
    });
    expect(template.subject.toLowerCase()).toContain("appreciate");
  });
});

