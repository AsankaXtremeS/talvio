import { z } from "zod";

const formatUrl = (val: unknown): string | null | undefined => {
  if (val === null || val === undefined) return val as null | undefined;
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const safeUrl = z.preprocess(
  formatUrl,
  z
    .string()
    .max(500)
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
        } catch {
          return false;
        }
      },
      { message: "Must be a valid URL (e.g. https://example.com)" }
    )
    .optional()
    .nullable()
    .or(z.literal(""))
);

const currentYear = new Date().getFullYear();

const safeNumber = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return null;
  const num = typeof val === "string" ? parseInt(val, 10) : Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().int().min(1800, "Founded year must be 1800 or later").max(currentYear, "Founded year cannot be in the future").optional().nullable());

const safeString = (maxLen: number) =>
  z.preprocess(
    (val) => (val === null || val === undefined ? null : String(val).trim()),
    z.string().max(maxLen).optional().nullable().or(z.literal(""))
  );

export const updateProfileSchema = z.object({
  companyName:        z.preprocess((val) => (val === null || val === undefined ? undefined : String(val).trim()), z.string().min(1, "Company name cannot be empty").max(200).optional()),
  companyDescription: safeString(2000),
  companyWebsite:     safeUrl,
  companyLocation:    safeString(255),
  companyLogoUrl:     safeUrl,
  coverImageUrl:      safeUrl,
  industry:           safeString(100),
  companyType:        safeString(100),
  companySize:        safeString(50),
  foundedYear:        safeNumber,
  specialties:        safeString(2000),
  linkedInUrl:        safeUrl,
  facebookUrl:        safeUrl,
  twitterUrl:         safeUrl,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;