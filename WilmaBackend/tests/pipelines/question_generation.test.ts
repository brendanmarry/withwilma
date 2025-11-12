import { prisma } from "@/lib/db";
import { generateFAQs } from "@/lib/llm/pipelines/question_generation";
import { callJsonLLM } from "@/lib/llm/utils";

jest.mock("@/lib/llm/utils", () => ({
  callJsonLLM: jest.fn(),
}));

const mockedCallJsonLLM = callJsonLLM as jest.MockedFunction<typeof callJsonLLM>;

const TEST_ORG_ID = "00000000-0000-0000-0000-000000000003";

describe("generateFAQs", () => {
  beforeAll(async () => {
    await prisma.organisation.upsert({
      where: { id: TEST_ORG_ID },
      update: {},
      create: {
        id: TEST_ORG_ID,
        name: "Test Org (FAQs)",
        rootUrl: "https://faqs.test",
      },
    });
  });

  beforeEach(async () => {
    await prisma.fAQ.deleteMany({
      where: { organisationId: TEST_ORG_ID },
    });
    await prisma.document.deleteMany({
      where: { organisationId: TEST_ORG_ID },
    });

    mockedCallJsonLLM.mockReset();
    mockedCallJsonLLM.mockResolvedValue({
      faqs: Array.from({ length: 10 }).map((_, index) => ({
        question: `Question ${index + 1}`,
        answer: `Answer ${index + 1}`,
      })),
    });
  });

  it("creates FAQs from recently ingested documents", async () => {
    await prisma.document.create({
      data: {
        organisationId: TEST_ORG_ID,
        sourceType: "upload",
        textContent: "Company policies and values for candidates.",
      },
    });

    const created = await generateFAQs({
      organisationId: TEST_ORG_ID,
      maxItems: 5,
    });

    expect(created).toHaveLength(5);
    expect(mockedCallJsonLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        schema: expect.anything(),
      }),
    );

    const storedFaqs = await prisma.fAQ.findMany({
      where: { organisationId: TEST_ORG_ID },
    });
    expect(storedFaqs).toHaveLength(5);
    expect(storedFaqs[0]?.recruiterApproved).toBe(false);
  });
});

