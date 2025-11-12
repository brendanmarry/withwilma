declare module "mammoth" {
  export type Result = {
    value: string;
    messages: Array<{ type: string; message: string }>;
  };

  export function extractRawText(
    input: { path?: string; buffer?: Buffer },
  ): Promise<Result>;

  const mammoth: {
    extractRawText: typeof extractRawText;
  };

  export default mammoth;
}

