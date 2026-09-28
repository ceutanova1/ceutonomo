# Architecture

## Product boundary

CEUTONOMO is a Spanish-first decision-support application. It must produce reproducible estimates, show the provenance of every rule, and downgrade uncertain administrative interpretations to `NEEDS_VERIFICATION`.

## Runtime architecture

```text
Browser
  -> Next.js App Router pages and client interaction islands
  -> Server Actions / Route Handlers (Zod input boundary)
  -> Application services (use cases, authorization, transactions)
  -> Pure domain packages (money, tax, eligibility, simulations)
  -> Repositories (Prisma)
  -> PostgreSQL

Rule publication flow
  Admin draft -> validation -> reviewer approval -> immutable rule version -> active ruleset
```

## Layer rules

### Presentation

- Server Components render source-backed data by default.
- Client Components are limited to the wizard, editable simulations, charts, scenario comparison, theme, and local interaction state.
- UI components may format domain results but must never contain tax formulas.

### Application

- Coordinates use cases such as `runAutonomoSimulation`, `evaluateBenefits`, and `publishRuleSet`.
- Parses external input with Zod and maps domain errors to user-safe messages.
- Loads exactly one immutable ruleset for the selected tax year.

### Domain

- Pure TypeScript with no Next.js, database, network, or browser dependencies.
- Money is stored as integer cents; ratios use integer basis points or an explicit decimal type.
- Every calculation emits line items, assumptions, rule references, warnings, and a reproducibility fingerprint.

### Infrastructure

- Prisma implements repositories and transactions.
- PostgreSQL stores profiles, scenarios, rule versions, sources, roadmaps, grants, and audit records.
- Official-source snapshots and checksums support auditability; source text is not treated as executable logic.

## Security and privacy

- Anonymous simulation is supported in the initial product slice without collecting names, identity numbers, disability details, or exact addresses.
- Accounts and persistent personal history are deferred until Phase 3 unless the owner changes scope.
- Sensitive eligibility circumstances are represented as optional, minimal-purpose flags with explicit consent when persistence is introduced.
- Admin access requires authentication, role checks, immutable audit entries, and separation between drafting and publishing.

## Deployment

- Vercel-compatible Next.js application.
- Managed PostgreSQL accessed only from server code.
- Environment-specific secrets are never embedded in rule JSON or client bundles.
- Database migrations run as a controlled release step.

## Current framework evidence

The design follows current Next.js App Router guidance: asynchronous Server Components for server-side reads, validated Server Actions for mutations, and explicit cache invalidation after writes. Domain calculations remain ordinary pure TypeScript modules outside `app/`.
