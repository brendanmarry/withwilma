import { extractStructuredJobs } from "@/lib/jobs/scrape";
import { normaliseJob } from "@/lib/llm/pipelines/job_normalisation";

jest.mock("@/lib/llm/pipelines/job_normalisation", () => ({
  normaliseJob: jest.fn(),
}));

const mockedNormaliseJob = normaliseJob as jest.MockedFunction<
  typeof normaliseJob
>;

describe("extractStructuredJobs", () => {
  beforeEach(() => {
    mockedNormaliseJob.mockReset();
    mockedNormaliseJob.mockImplementation(async ({ raw }) => ({
      title: "Normalised Title",
      department: "",
      location: "",
      employment_type: "",
      summary: raw.slice(0, 120),
      responsibilities: [],
      requirements: [],
      nice_to_have: [],
      seniority_level: "",
      company_values_alignment: "",
      clean_text: raw,
    }));
  });

  it("extracts jobs from HTML and normalises their descriptions", async () => {
    const lengthyDescription = `
      We are seeking a collaborative engineer with strong experience across modern web stacks.
      In this role you will design, build, and maintain services at scale, partner with cross-functional
      stakeholders, and continually improve user experience. Candidates should be comfortable with cloud
      infrastructure, CI/CD pipelines, and mentoring teammates. This paragraph intentionally continues to exceed
      two hundred characters so the parser recognises it as a valid job posting section.`;

    const html = `
      <section>
        <h2>Software Engineer</h2>
        <div class="location">Remote</div>
        <p>${lengthyDescription}</p>
      </section>
      <section>
        <h2>Product Manager</h2>
        <p>${lengthyDescription}</p>
      </section>
    `;

    const items = await extractStructuredJobs(html);

    expect(items).toHaveLength(2);
    expect(mockedNormaliseJob).toHaveBeenCalledTimes(2);
    expect(items[0]?.raw.title).toBe("Software Engineer");
    expect(items[0]?.normalised.title).toBe("Normalised Title");
    expect(items[1]?.raw.title).toBe("Product Manager");
  });
});

