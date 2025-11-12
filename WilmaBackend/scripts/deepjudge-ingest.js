/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "node",
  esModuleInterop: true,
});

require("ts-node/register/transpile-only");

const path = require("path");
const { register } = require("tsconfig-paths");
const { readFile } = require("fs/promises");
const { prisma } = require("../lib/db");
const { logger, logFilePath } = require("../lib/logger");

register({
  baseUrl: path.resolve(__dirname, ".."),
  paths: {
    "@/*": ["*"],
  },
});

const vectorModule = require("../lib/vector/retriever");
vectorModule.embedTexts = async (texts) =>
  texts.map((_text) => Array(32).fill(0.01));
vectorModule.embedText = async (_text) => Array(32).fill(0.01);

const ensureEnvDefaults = () => {
  process.env.DATABASE_URL ??= "postgresql://wilma:wilma@localhost:5432/wilma";
  process.env.OPENAI_API_KEY ??= "test-openai-key";
  process.env.S3_BUCKET ??= "wilma-local";
  process.env.S3_REGION ??= "us-east-1";
  process.env.S3_ACCESS_KEY_ID ??= "wilma";
  process.env.S3_SECRET_ACCESS_KEY ??= "wilma-secret";
  process.env.S3_ENDPOINT ??= "http://localhost:9000";
  process.env.S3_FORCE_PATH_STYLE ??= "true";
  process.env.ADMIN_JWT_SECRET ??= "test-admin-secret";
  process.env.APP_URL ??= "http://localhost:3000";
};

const DEEPJUDGE_ORG_ID = "00000000-0000-0000-0000-00000000DEEP";

const run = async () => {
  ensureEnvDefaults();

  const utilsModule = require("../lib/llm/utils");
  utilsModule.callJsonLLM = async ({ userContent }) => {
    const text = typeof userContent === "string" ? userContent : "";
    const qaPairs = [
      {
        question: "Where is DeepJudge hiring for engineering roles?",
        answer:
          "DeepJudge is hiring engineering talent primarily in Zurich, Switzerland, according to the latest careers page.",
      },
      {
        question: "Which teams are currently expanding at DeepJudge?",
        answer:
          "DeepJudge lists openings across engineering, product, design, marketing, and go-to-market functions.",
      },
      {
        question: "Does DeepJudge offer remote opportunities?",
        answer:
          "Several roles, including Content Marketing Manager and Enterprise Account Director, offer remote options within the USA or Europe.",
      },
      {
        question: "What is DeepJudge’s core mission?",
        answer:
          "DeepJudge focuses on empowering law firms to leverage internal knowledge through AI-driven search and workflow automation.",
      },
      {
        question: "What type of customers rely on DeepJudge?",
        answer:
          "DeepJudge is trusted by leading legal teams at firms like Freshfields, Holland & Knight, and Gunderson Dettmer.",
      },
    ];

    return {
      faqs: qaPairs.map((item, idx) => ({
        ...item,
        confidence: "high",
        source_evidence: text.slice(0, 120),
        id: idx,
      })),
    };
  };

  const { ingestDocuments } = require("../lib/llm/pipelines/ingestion");
  const { generateFAQs } = require("../lib/llm/pipelines/question_generation");
  const { scrapeJobsFromHtml } = require("../lib/jobs/scrape");

  await prisma.organisation.upsert({
    where: { id: DEEPJUDGE_ORG_ID },
    update: {
      name: "DeepJudge",
      rootUrl: "https://www.deepjudge.ai",
    },
    create: {
      id: DEEPJUDGE_ORG_ID,
      name: "DeepJudge",
      rootUrl: "https://www.deepjudge.ai",
    },
  });

  const homeHtmlPath = path.resolve(__dirname, "../tmp-deepjudge-home.html");
  const careersHtmlPath = path.resolve(
    __dirname,
    "../tmp-deepjudge-careers.html",
  );

  const [homeHtml, careersHtml] = await Promise.all([
    readFile(homeHtmlPath, "utf-8"),
    readFile(careersHtmlPath, "utf-8"),
  ]);

  await logger.info("📄 Ingesting DeepJudge marketing and careers pages...");

  const ingestionResult = await ingestDocuments({
    organisationId: DEEPJUDGE_ORG_ID,
    items: [
      {
        type: "html",
        content: homeHtml,
        sourceUrl: "https://www.deepjudge.ai",
        tags: ["site", "marketing"],
        metadata: { source: "deepjudge-home" },
      },
      {
        type: "html",
        content: careersHtml,
        sourceUrl: "https://www.deepjudge.ai/careers",
        tags: ["careers", "jobs"],
        metadata: { source: "deepjudge-careers" },
      },
    ],
  });

  await logger.info(
    `✅ Stored ${ingestionResult.documents.length} documents for DeepJudge`,
  );

  const chunksCount = await prisma.documentChunk.count({
    where: { document: { organisationId: DEEPJUDGE_ORG_ID } },
  });

  await logger.info(`🔎 Indexed ${chunksCount} document chunks for retrieval.`);

  const jobs = await scrapeJobsFromHtml(careersHtml);
  await logger.info(
    `💼 Parsed ${jobs.length} job postings from the careers page.`,
  );
  for (const [index, job] of jobs.slice(0, 5).entries()) {
    await logger.info(
      `   • [${index + 1}] ${job.title} — ${
        job.location ?? "Location not listed"
      }`,
    );
  }

  await logger.info("❓ Generating FAQs via stubbed LLM response...");
  const faqs = await generateFAQs({
    organisationId: DEEPJUDGE_ORG_ID,
    maxItems: 5,
  });

  await logger.info(`🤖 Generated ${faqs.length} FAQs for recruiter review.`);
  for (const [index, faq] of faqs.entries()) {
    await logger.info(`   Q${index + 1}: ${faq.question}`);
    await logger.info(`       → ${faq.answer}`);
  }

  await logger.info(
    "🎯 DeepJudge ingestion and FAQ generation complete.",
    { logFilePath },
  );
};

run()
  .catch(async (error) => {
    await logger.error("❌ DeepJudge ingestion workflow failed", {
      error: error instanceof Error ? error.message : error,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

