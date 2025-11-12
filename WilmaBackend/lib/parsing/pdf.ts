import pdfParse from "pdf-parse";

export const pdfToText = async (buffer: Buffer): Promise<string> => {
  const result = await pdfParse(buffer);
  return result.text.replace(/\s+\n/g, "\n").trim();
};

