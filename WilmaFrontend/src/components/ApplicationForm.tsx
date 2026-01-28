"use client"

import { FormEvent, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

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

  // Screening Questions
  const [permit, setPermit] = useState<string>("")
  const [interest, setInterest] = useState<string>("")
  const [availability, setAvailability] = useState("")
  const [weekends, setWeekends] = useState<string>("")
  const [languages, setLanguages] = useState<string>("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Validation
    if (!name || !email) {
      setError("Please provide your name and email.")
      return
    }
    if (!email.includes("@")) {
      setError("Please provide a valid email address.")
      return
    }
    if (!permit || !interest || !availability || !weekends || !languages) {
      setError("Please answer all screening questions.")
      return
    }
    if (!cvFile) {
      setError("Please upload your CV.");
      return;
    }
    if (linkedin && linkedin !== LINKEDIN_BASE_URL && !linkedin.startsWith(LINKEDIN_BASE_URL)) {
      setError("Please use a LinkedIn profile URL starting with https://www.linkedin.com/in/.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("jobId", job.id);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("linkedin", linkedin === LINKEDIN_BASE_URL ? "" : linkedin);
      formData.append("cv", cvFile);

      // Screening Data
      const screeningData = {
        permit,
        interest,
        availability,
        weekends,
        languages
      };
      formData.append("screeningData", JSON.stringify(screeningData));

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
      setError(err instanceof Error ? err.message : "We couldn’t save your application. Please verify the backend is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="mb-12 text-center">
        <p className="text-[var(--brand-primary)] font-black tracking-widest uppercase text-sm mb-3 opacity-60">
          Apply Now
        </p>
        <h1 className="text-4xl md:text-6xl font-black text-[var(--brand-primary)] uppercase tracking-tighter leading-none">
          {job.title}
        </h1>
      </div>

      {/* Info Box - Moved to Top */}
      <div className="mb-12 rounded-[2rem] bg-stone-100/50 p-8 border border-white">
        <p className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">Process Overview</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "01", text: "Wilma analyzes your CV against the role." },
            { icon: "02", text: "A few tailored questions are prepared for you." },
            { icon: "03", text: "Record short video answers to show your personality." }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-[var(--brand-primary)] font-black text-2xl leading-none opacity-40">{item.icon}</span>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* Section 1: Personal Info */}
        <Card className="shadow-xl border-0 bg-white rounded-[2rem] overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[var(--brand-primary)] uppercase tracking-tight">Personal Info</h2>
              <p className="text-slate-500 text-sm font-medium">How should we reach you?</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Morgan Smith"
                required
                className="bg-[#FAF8F2] border-0 focus:ring-4 focus:ring-[var(--brand-secondary)]/20 rounded-2xl h-14 text-lg px-6"
              />
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="morgan@domain.com"
                required
                className="bg-[#FAF8F2] border-0 focus:ring-4 focus:ring-[var(--brand-secondary)]/20 rounded-2xl h-14 text-lg px-6"
              />
              <Input
                label="LinkedIn (Optional)"
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                placeholder={LINKEDIN_BASE_URL}
                className="bg-[#FAF8F2] border-0 focus:ring-4 focus:ring-[var(--brand-secondary)]/20 rounded-2xl h-14 text-lg px-6"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Screening Questions */}
        <Card className="shadow-xl border-0 bg-white rounded-[2rem] overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[var(--brand-primary)] uppercase tracking-tight">Quick Screening</h2>
              <p className="text-slate-500 text-sm font-medium">Helping us match you better.</p>
            </div>

            <div className="space-y-6">
              {/* Permit */}
              <div className="p-6 bg-[#FAF8F2] rounded-3xl space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block">Do you have a permit to work in Zurich?</label>
                <div className="flex gap-8">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="permit"
                        value={opt}
                        checked={permit === opt}
                        onChange={(e) => setPermit(e.target.value)}
                        className="w-6 h-6 border-2 border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all cursor-pointer"
                      />
                      <span className="text-lg font-bold text-gray-600 group-hover:text-black transition-colors uppercase">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Interest */}
              <div className="p-6 bg-[#FAF8F2] rounded-3xl space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block">Work Interest</label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-white border-0 focus:ring-4 focus:ring-[var(--brand-secondary)]/20 rounded-2xl px-6 py-4 text-lg font-bold transition-all h-14"
                  required
                >
                  <option value="">Select option...</option>
                  <option value="Full-time">Full-time Only</option>
                  <option value="Part-time">Part-time Only</option>
                  <option value="Both">Both Full & Part Time</option>
                </select>
              </div>

              {/* Availability */}
              <div className="p-6 bg-[#FAF8F2] rounded-3xl space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block">Available from?</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-white border-0 focus:ring-4 focus:ring-[var(--brand-secondary)]/20 rounded-2xl px-6 py-4 text-lg font-bold transition-all h-14"
                  required
                >
                  <option value="">Select option...</option>
                  <option value="Now">Now</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="Longer">Longer</option>
                </select>
              </div>

              {/* Weekends */}
              <div className="p-6 bg-[#FAF8F2] rounded-3xl space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block">Available for weekend work?</label>
                <div className="flex gap-8">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="weekends"
                        value={opt}
                        checked={weekends === opt}
                        onChange={(e) => setWeekends(e.target.value)}
                        className="w-6 h-6 border-2 border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all cursor-pointer"
                      />
                      <span className="text-lg font-bold text-gray-600 group-hover:text-black transition-colors uppercase">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="p-6 bg-[#FAF8F2] rounded-3xl space-y-4">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block">Are you comfortable in English and German?</label>
                <div className="flex gap-8">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="languages"
                        value={opt}
                        checked={languages === opt}
                        onChange={(e) => setLanguages(e.target.value)}
                        className="w-6 h-6 border-2 border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all cursor-pointer"
                      />
                      <span className="text-lg font-bold text-gray-600 group-hover:text-black transition-colors uppercase">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: CV Upload */}
        <Card className="shadow-xl border-0 bg-white rounded-[2rem] overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[var(--brand-primary)] uppercase tracking-tight">CV / Resume</h2>
              <p className="text-slate-500 text-sm font-medium">Upload your latest CV.</p>
            </div>

            <div className="rounded-[2.5rem] border-4 border-dashed border-[#FAF8F2] bg-[#FAF8F2]/50 p-8 group hover:bg-[#FAF8F2] hover:border-[var(--brand-secondary)]/30 transition-all duration-300">
              <CVUploader
                onFileSelected={setCvFile}
                helperText="Please upload your CV (PDF or DOCX)."
              />
            </div>
          </div>
        </Card>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 shadow-sm"
          >
            <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
            <p className="font-bold uppercase text-sm tracking-tight">{error}</p>
          </motion.div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-[var(--brand-primary)] hover:scale-[1.01] active:scale-[0.99] text-white h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl hover:shadow-xl transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
