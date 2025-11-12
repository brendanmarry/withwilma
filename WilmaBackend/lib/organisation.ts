import { prisma } from "@/lib/db";

const ensureProtocol = (value: string): string => {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return `https://${value}`;
  }
  return value;
};

const tryParseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const canonicaliseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const attempts = [trimmed, ensureProtocol(trimmed)];
  for (const attempt of attempts) {
    const parsed = tryParseUrl(attempt);
    if (parsed) {
      const host = parsed.hostname.toLowerCase();
      const port = parsed.port ? `:${parsed.port}` : "";
      return `${parsed.protocol}//${host}${port}`;
    }

    const encoded = attempt.replace(/\s+/g, "%20");
    const encodedParsed = tryParseUrl(encoded);
    if (encodedParsed) {
      const host = encodedParsed.hostname.toLowerCase();
      const port = encodedParsed.port ? `:${encodedParsed.port}` : "";
      return `${encodedParsed.protocol}//${host}${port}`;
    }
  }

  return trimmed.toLowerCase();
};

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const deriveNameFromUrl = (normalizedUrl: string): string => {
  const decoded = safeDecode(normalizedUrl);
  const parsed = tryParseUrl(decoded);
  if (parsed) {
    return parsed.hostname.replace(/^www\./, "");
  }
  return decoded;
};

const buildRootVariants = (input: string): string[] => {
  const variants = new Set<string>();
  const canonical = canonicaliseUrl(input);
  variants.add(canonical);
  variants.add(canonical.toLowerCase());

  const decoded = safeDecode(canonical);
  if (decoded && decoded !== canonical) {
    variants.add(decoded);
    variants.add(decoded.toLowerCase());
  }

  const raw = input.trim();
  if (raw && raw !== canonical) {
    variants.add(raw);
    variants.add(raw.toLowerCase());
    const rawDecoded = safeDecode(raw);
    if (rawDecoded) {
      variants.add(rawDecoded);
      variants.add(rawDecoded.toLowerCase());
    }
  }

  return Array.from(variants).filter(Boolean);
};

export const findOrganisationByRootUrl = async (rootUrl: string) => {
  const variants = buildRootVariants(rootUrl);
  for (const candidate of variants) {
    const organisation = await prisma.organisation.findFirst({
      where: {
        rootUrl: {
          equals: candidate,
          mode: "insensitive",
        },
      },
    });
    if (organisation) {
      return organisation;
    }
  }
  return null;
};

export const ensureOrganisationByRootUrl = async (rootUrl: string) => {
  const canonical = canonicaliseUrl(rootUrl);
  let organisation = await findOrganisationByRootUrl(canonical);

  if (organisation) {
    if (organisation.rootUrl !== canonical) {
      organisation = await prisma.organisation.update({
        where: { id: organisation.id },
        data: { rootUrl: canonical },
      });
    }
    return organisation;
  }

  const name = deriveNameFromUrl(canonical);

  return prisma.organisation.create({
    data: {
      name,
      rootUrl: canonical,
    },
  });
};

export const normaliseOrganisationRootUrl = canonicaliseUrl;


