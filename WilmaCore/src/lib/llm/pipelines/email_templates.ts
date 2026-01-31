import type { EmailTemplateInput } from "@/lib/validators";

/**
 * Generate email templates using simple string templates for fast, predictable results.
 * No LLM call needed for these simple, professional emails.
 */
export const generateEmailTemplate = async (
  input: EmailTemplateInput,
): Promise<{ subject: string; body: string }> => {
  const { candidateName, roleTitle, companyName, recruiterName, schedulingLink } = input;

  if (input.type === "schedule") {
    const subject = `Interview Invitation - ${roleTitle} at ${companyName}`;
    const body = `Hi ${candidateName},

Thank you for your interest in the ${roleTitle} position at ${companyName}. We were impressed with your application and would like to invite you for an interview.

Please use the following link to schedule a time that works for you:
${schedulingLink || "[Calendar booking link will be inserted here]"}

We look forward to speaking with you soon.

Best regards,
${recruiterName || `The ${companyName} Team`}`;

    return { subject, body };
  }

  if (input.type === "reject") {
    const subject = `Update on your application - ${roleTitle} at ${companyName}`;
    const body = `Hi ${candidateName},

Thank you for taking the time to apply for the ${roleTitle} position at ${companyName}. We appreciate your interest in joining our team.

After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs.

We encourage you to keep an eye on our careers page for future opportunities that might be a better fit.

Thank you again for your interest in ${companyName}.

Best regards,
${recruiterName || `The ${companyName} Team`}`;

    return { subject, body };
  }

  throw new Error(`Unknown email type: ${input.type}`);
};

