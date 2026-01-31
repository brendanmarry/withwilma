KNOWLEDGE CHUNKING SYSTEM PROMPT

Break the following document into chunks suitable for embedding.

Chunking Rules

- Each chunk 200–500 tokens
- Must preserve meaning
- Do NOT split sentences
- Keep semantic coherence (topic-aligned)
- Tag with metadata (source, section, job-related or company-related)

Output Format
```
{
  "chunks": [
    {
      "chunk_id": "",
      "text": "",
      "metadata": {
        "source_url": "",
        "document_id": "",
        "section": "",
        "tags": []
      }
    }
  ]
}
```

