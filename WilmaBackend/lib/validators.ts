import { z } from "zod";

export const organisationRootSchema = z.object({
  rootUrl: z.string().url(),
});

export const ingestUrlSchema = organisationRootSchema.extend({
  additionalUrls: z.array(z.string().url()).optional(),
  depth: z.number().int().min(1).max(5).default(2),
  tags: z.array(z.string()).optional(),
});

export const generateFaqSchema = organisationRootSchema.extend({
  maxItems: z.number().int().min(5).max(50).default(30),
});

export const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  recruiterApproved: z.boolean().optional(),
});

export const jobsFetchSchema = organisationRootSchema.extend({
  careersUrl: z.string().url(),
  label: z.string().min(1).optional(),
});

export const jobsSelectSchema = z.object({
  jobIds: z.array(z.string().uuid()).min(1),
  wilmaEnabled: z.boolean(),
});

export const jobUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["open", "closed"]).optional(),
  wilmaEnabled: z.boolean().optional(),
});

export const applicationSubmitSchema = z.object({
  jobId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  linkedin: z.string().url().optional(),
});

export const followupQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

export const emailTemplateSchema = z.object({
  type: z.enum(["schedule", "reject"]),
  candidateName: z.string().min(1),
  roleTitle: z.string().min(1),
  companyName: z.string().min(1),
  recruiterName: z.string().min(1).optional(),
  schedulingLink: z.string().url().optional(),
  notes: z.string().optional(),
});

export type IngestUrlInput = z.infer<typeof ingestUrlSchema>;
export type GenerateFaqInput = z.infer<typeof generateFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type JobsFetchInput = z.infer<typeof jobsFetchSchema>;
export type JobsSelectInput = z.infer<typeof jobsSelectSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;
export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

