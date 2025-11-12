import { appendFile, mkdir } from "fs/promises";
import path from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

const logDir =
  process.env.WILMA_LOG_DIR ?? path.resolve(process.cwd(), "logs");
const logFileName = process.env.WILMA_LOG_FILE ?? "wilma.log";
const logFilePath = path.join(logDir, logFileName);

let initialisePromise: Promise<void> | null = null;

const ensureDirectory = () => {
  if (!initialisePromise) {
    initialisePromise = mkdir(logDir, { recursive: true }).catch((error) => {
      initialisePromise = null;
      throw error;
    });
  }
  return initialisePromise;
};

const consoleMethodByLevel: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const MAX_SERIALISABLE_DEPTH = 4;
const MAX_STRING_LENGTH = 4000;

const truncateString = (value: string) =>
  value.length > MAX_STRING_LENGTH
    ? `${value.slice(0, MAX_STRING_LENGTH)}…`
    : value;

const toSerializable = (value: unknown, depth = 0): unknown => {
  if (depth >= MAX_SERIALISABLE_DEPTH) {
    return "[Truncated]";
  }

  if (value === null || value === undefined) return value;

  if (typeof value === "string") return truncateString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item, depth + 1));
  }

  if (typeof value === "object") {
    const input = value as Record<string | number | symbol, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(input)) {
      output[key] = toSerializable(entry, depth + 1);
    }
    return output;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
};

export const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    const serialised: Record<string, unknown> = {
      name: error.name,
      message: truncateString(error.message),
    };

    if (error.stack) {
      serialised.stack = truncateString(error.stack);
    }

    const anyError = error as Error & { cause?: unknown };
    if (anyError.cause !== undefined) {
      serialised.cause = toSerializable(anyError.cause);
    }

    for (const key of Object.getOwnPropertyNames(error)) {
      if (["name", "message", "stack", "cause"].includes(key)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(error, key);
      if (!descriptor || typeof descriptor.value === "undefined") continue;
      serialised[key] = toSerializable(descriptor.value);
    }
    return serialised;
  }

  return toSerializable(error);
};

const writeLog = async (
  level: LogLevel,
  message: string,
  metadata?: unknown,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const record = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(metadata === undefined ? {} : { metadata: toSerializable(metadata) }),
  };

  try {
    await ensureDirectory();
    await appendFile(logFilePath, `${JSON.stringify(record)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to write Wilma log file:", error);
  }

  const consoleMethod = consoleMethodByLevel[level] ?? console.log;
  if (metadata === undefined) {
    consoleMethod(`[${timestamp}] [${record.level}] ${message}`);
  } else {
    consoleMethod(`[${timestamp}] [${record.level}] ${message}`, record.metadata);
  }
};

export const logger = {
  debug: (message: string, metadata?: unknown) =>
    writeLog("debug", message, metadata),
  info: (message: string, metadata?: unknown) =>
    writeLog("info", message, metadata),
  warn: (message: string, metadata?: unknown) =>
    writeLog("warn", message, metadata),
  error: (message: string, metadata?: unknown) =>
    writeLog("error", message, metadata),
};

export { logFilePath };

