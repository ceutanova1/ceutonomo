import grants from "./grants.json";
import irpf from "./irpf.json";
import socialSecurity from "./social-security.json";
import corporateTax from "./corporate-tax.json";
import sources from "./sources.json";
import { legalSourceSchema, verifiedRuleSchema, type LegalSource, type VerifiedRule } from "../schema";

export type RuleCatalog = Readonly<{
  sources: LegalSource[];
  rules: VerifiedRule[];
}>;

export const load2026RuleCatalog = (): RuleCatalog => ({
  sources: sources.map((source) => legalSourceSchema.parse(source)),
  rules: [...irpf, ...socialSecurity, ...corporateTax, ...grants].map((rule) => verifiedRuleSchema.parse(rule)),
});
