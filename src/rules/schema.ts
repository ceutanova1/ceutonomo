import { z } from "zod";

export const legalSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().min(1),
  url: z.url(),
  legalLocator: z.string().min(1),
  lastVerified: z.iso.date(),
});

export const verifiedRuleSchema = z.object({
  id: z.string().min(1),
  taxYear: z.number().int().min(2026),
  version: z.string().min(1),
  status: z.enum(["VERIFIED_FOUNDATION", "PUBLISHED", "NEEDS_VERIFICATION"]),
  effectiveFrom: z.iso.date(),
  effectiveUntil: z.iso.date().nullable(),
  sourceIds: z.array(z.string()).min(1),
  parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  assumptions: z.array(z.string()),
});

export type LegalSource = z.infer<typeof legalSourceSchema>;
export type VerifiedRule = z.infer<typeof verifiedRuleSchema>;

