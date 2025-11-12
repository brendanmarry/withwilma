"use client"

import { FormEvent, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { CVUploader } from "@/components/CVUploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { submitApplication } from "@/lib/api"
import { Job } from "@/lib/types"
import { useInterviewStore } from "@/store/interview-store"

interface ApplicationFormProps {
  job: Job
}

const LINKEDIN_BASE_URL = "https://www.linkedin.com/in/";

export function ApplicationForm({ job }: ApplicationFormProps) {
  const router = useRouter()
  const setApplication = useInterviewStore((state) => state.setApplication)
  const setFollowUpQuestions = useInterviewStore((state) => state.setFollowUpQuestions)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [linkedin, setLinkedin] = useState(LINKEDIN_BASE_URL)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!cvFile) {
      setError("Please upload your CV before continuing.");
      return;
    }
    if (!linkedin.startsWith(LINKEDIN_BASE_URL)) {
      setError("Please use a LinkedIn profile URL starting with https://www.linkedin.com/in/.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const formData = new FormData();
      formData.append("jobId", job.id);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("linkedin", linkedin);
      formData.append("cv", cvFile);

      const { applicationId, matchScore, recommendedQuestions } = await submitApplication(formData);

      setApplication({
        id: applicationId,
        data: { jobId: job.id, name, email, linkedin, cvFile },
        matchScore,
      });
      setFollowUpQuestions(recommendedQuestions);

      router.push(`/questions/${applicationId}`);
    } catch (err) {
      console.error(err);
      setError("We couldn’t save your application. Please verify the backend is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="space-y-6 bg-white/90 p-10 shadow-xl">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-500">Step 3</p>
        <h1 className="text-3xl font-semibold text-slate-900">Share your details with Wilma</h1>
        <p className="text-sm text-slate-600">
          Wilma will compare your experience to the role and ask a few follow-up questions so the talent team has the best possible picture of you.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Morgan Smith"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="morgan@domain.com"
            required
          />
        </div>
        <Input
          label="LinkedIn profile"
          value={linkedin}
          onChange={(event) => setLinkedin(event.target.value)}
          placeholder={LINKEDIN_BASE_URL}
          helperText="We recommend the format https://www.linkedin.com/in/your-profile"
          required
        />
        <CVUploader
          onFileSelected={setCvFile}
          helperText="Upload your CV as PDF or DOCX. Max size 10MB."
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button
          type="submit"
          className="h-12 w-full bg-purple-600 text-base text-white hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving your application…
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </form>

      <div className="rounded-3xl bg-slate-100 p-6 text-sm text-slate-600">
        <p className="font-medium text-slate-800">What happens next?</p>
        <ol className="mt-3 space-y-2 text-left">
          <li>• Wilma compares your CV to the {job.title} description.</li>
          <li>• She prepares a couple of focused follow-up questions.</li>
          <li>• You record short answers (30 seconds each) that go straight to the hiring team.</li>
        </ol>
      </div>
    </Card>
  );
}

