"use client"

import { useRef, useState } from "react"
import { UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CVUploaderProps {
  onFileSelected: (file: File | null) => void
  helperText?: string
}

export function CVUploader({ onFileSelected, helperText }: CVUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null
    setFile(selectedFile)
    onFileSelected(selectedFile)
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    setFile(null)
    onFileSelected(null)
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-purple-50/60 px-5 py-7 text-center shadow-sm transition hover:border-purple-300 hover:bg-purple-50 md:px-6 md:py-8",
      )}
    >
      <UploadCloud className="h-8 w-8 text-purple-500" />
      <p className="mt-3 text-sm font-semibold text-gray-900">
        {file ? `Selected: ${file.name}` : "Drag & drop your CV or click to upload"}
      </p>
      <p className="mt-2 max-w-sm text-xs text-gray-500">
        {helperText ?? "Accepted formats: PDF, DOCX. Max size 10MB."}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <Button
          variant="subtle"
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-100"
        >
          {file ? "Replace file" : "Upload CV"}
        </Button>
        {file ? (
          <Button type="button" size="icon" variant="ghost" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

