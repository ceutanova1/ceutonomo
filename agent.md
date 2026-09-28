# CEUTONOMO — Working Instructions

## Mission

Build a trustworthy, Spanish-first decision platform for entrepreneurs, autónomos, and small companies evaluating economic activity in Ceuta.

## Non-negotiable principles

- Treat every calculation as an informational estimate, never professional tax or legal advice.
- Verify every implemented tax, Social Security, IPSI, and grant rule against an official source.
- Do not use placeholder formulas or silently infer legal eligibility.
- Keep financial formulas in a deterministic domain layer, outside UI components.
- Store rule parameters by tax year and expose source, legal basis, assumptions, and verification date.
- Distinguish tax savings, Social Security savings, grants, cash flow, and net income.
- Use `ELIGIBLE`, `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE`, or `NEEDS_VERIFICATION` for rule outcomes.
- Preserve Spanish as the primary language while keeping the content architecture ready for English.
- Make warnings prominent when applying, registering, purchasing, or starting too early could destroy eligibility.

## Proposed implementation baseline

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- Zod validation
- Auth.js when accounts enter scope
- Recharts for comparisons and break-even charts
- Integer cents or a decimal library for monetary arithmetic
- Vitest, React Testing Library, and Playwright
- Vercel-compatible deployment architecture

## Approval points

Ask before making a decision that materially changes:

- legal or fiscal assumptions;
- supported user segments or Phase 1 scope;
- branding and public-facing identity;
- authentication, billing, or collection of personal data;
- production hosting or external services;
- publication of unverified calculations.

## Repository workflow

- Canonical repository: `https://github.com/ceutanova1/ceutonomo.git`.
- After a meaningful, verified unit of work, create a concise commit whose message explains the user-facing outcome and push it to the canonical repository.
- Do not commit secrets, local environment files, generated builds, dependencies, or browser-test artifacts.
- Run the relevant tests and quality checks before committing; report any check that could not be run.

## Definition of done for a rule

A rule is implemented only when it has:

1. An official source URL.
2. Legal basis and responsible administration.
3. Applicable tax year and effective dates.
4. A documented formula and assumptions.
5. Eligibility and compatibility logic.
6. Unit and regression tests.
7. A visible calculation explanation.
8. A last-verified date.
