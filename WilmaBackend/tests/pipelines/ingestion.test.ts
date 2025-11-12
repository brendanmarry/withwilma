import { ingestDocuments } from "@/lib/llm/pipelines/ingestion";
import { prisma } from "@/lib/db";
import { indexDocumentChunks } from "@/lib/vector/retriever";

jest.mock("@/lib/vector/retriever", () => ({
  indexDocumentChunks: jest.fn().mockResolvedValue(undefined),
}));

const mockedIndexDocumentChunks = indexDocumentChunks as jest.MockedFunction<
  typeof indexDocumentChunks
>;

const TEST_ORG_ID = "00000000-0000-0000-0000-000000000002";

describe("ingestDocuments", () => {
  beforeAll(async () => {
    await prisma.organisation.upsert({
      where: { id: TEST_ORG_ID },
      update: {},
      create: {
        id: TEST_ORG_ID,
        name: "Test Org (Ingestion)",
        rootUrl: "https://ingestion.test",
      },
    });
  });

  beforeEach(async () => {
    await prisma.documentChunk.deleteMany({
      where: { document: { organisationId: TEST_ORG_ID } },
    });
    await prisma.document.deleteMany({
      where: { organisationId: TEST_ORG_ID },
    });
    mockedIndexDocumentChunks.mockClear();
  });

  it("persists uploaded content and schedules chunk indexing", async () => {
    const result = await ingestDocuments({
      organisationId: TEST_ORG_ID,
      items: [
        {
          type: "text",
          content: "Employee handbook content with policies and procedures.",
          metadata: { uploadedBy: "qa@test.com" },
        },
      ],
    });

    expect(result.documents).toHaveLength(1);

    const stored = await prisma.document.findFirstOrThrow({
      where: { organisationId: TEST_ORG_ID },
    });

    expect(stored.textContent).toContain("Employee handbook");
    expect(stored.sourceType).toBe("upload");
    expect(stored.metadata).toMatchObject({ uploadedBy: "qa@test.com" });
    expect(mockedIndexDocumentChunks).toHaveBeenCalledTimes(1);
    expect(mockedIndexDocumentChunks.mock.calls[0]?.[0]?.id).toBe(stored.id);

    const chunks = mockedIndexDocumentChunks.mock.calls[0]?.[1];
    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks?.[0]?.text).toContain("Employee handbook");
  });
});

