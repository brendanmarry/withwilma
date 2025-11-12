"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Job } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card padded className="space-y-6">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <CardTitle className="text-2xl text-gray-900">{job.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 text-gray-600">
              {job.department ? (
                <Badge variant="outline" className="text-sm">
                  {job.department}
                </Badge>
              ) : null}
              {job.location ? (
                <Badge variant="outline" className="text-sm">
                  {job.location}
                </Badge>
              ) : null}
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <>
                Hide details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View role <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen ? (
        <CardContent className="rounded-2xl bg-gray-50 p-6 text-sm leading-relaxed text-gray-700">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{job.description}</pre>
        </CardContent>
      ) : null}

      <CardContent className="flex flex-col gap-3 rounded-2xl bg-purple-50 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-purple-900">
            Ready to learn more directly from Wilma’s AI assistant?
          </p>
          <p className="text-xs text-purple-700">
            Have a conversation tailored to {job.title} and get the inside scoop on the team, culture, and expectations.
          </p>
        </div>

        <Button asChild className="w-full md:w-auto">
          <Link href={`/interview/${job.id}`}>I’m Interested</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

