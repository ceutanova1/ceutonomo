# Database Schema

## Identity and ownership

### User

- `id`, `email`, `emailVerifiedAt`, `locale`, `role`, timestamps
- Optional in Phase 1; required for saved cross-device history and admin.

### BusinessProfile

- `id`, optional `userId`, `name`, `structure`, `businessStatus`
- Ceuta residence/activity facts are stored separately from conclusions.

### TaxProfile

- residence country/city, residence start date, Ceuta registration flag
- previous RETA registration facts, unemployment/job-seeker flags
- optional subsidy-relevant flags with explicit collection purpose

### Activity

- preset, description, optional CNAE/IAE, start date
- establishment location, work location, office model, employees and planned employees

### ClientDistribution

- mainland Spain, Ceuta, EU B2B, EU B2C, non-EU percentages
- validated to total 100% for a complete profile

## Simulation inputs

### Expense

- label, category, amount cents, frequency, deductible basis points
- tax treatment, notes, evidence status

### SimulationScenario

- owner/profile, name, tax year, structure, status, source scenario
- immutable input snapshot and ruleset reference for reproducibility

### SimulationYear

- year index, revenue inputs, expense inputs, staffing, salary, dividends, retained earnings

### SimulationResult

- totals by semantic category: income, tax, contribution, grant, cash flow, savings
- calculation trace, assumptions, warnings, fingerprint, calculated timestamp

## Rule system

### RuleSet

- tax year, semantic version, status (`DRAFT`, `REVIEW`, `PUBLISHED`, `RETIRED`)
- effective dates, published timestamp, reviewer, checksum

### Benefit

- stable benefit identity, official name, category, jurisdiction, administration

### BenefitRuleVersion

- ruleset, eligibility expression, calculation definition, compatibility graph
- deadlines, pre-start requirements, required documents, confidence
- immutable after publication

### TaxRuleVersion / SocialSecurityRuleVersion / IPSIRuleVersion

- typed parameters and calculation definition
- official-source references and verification metadata

### GrantProgram / GrantWindow

- separates the stable program from time-limited calls
- amount method, budget, application window, eligible action window, maintenance period, status
- no deadline may be inferred when an official call has not been verified

### LegalSource

- title, issuer, URL, legal reference, publication/effective dates
- retrieved/verified timestamps, checksum, notes

### RuleSource

- many-to-many link from a rule version to sources with a precise locator and purpose

### RuleAuditLog

- actor, action, entity, before/after hashes, rationale, timestamp

## Workflow and eligibility

### EligibilityEvaluation / EligibilityFact

- evaluated rule version, outcome, reason codes, missing facts, warnings

### Roadmap / RoadmapStep

- ordered steps, administration, deadline, documents, warning, completion status
- a generated step keeps its source rule version so later rule edits do not rewrite history silently

### GrantApplication

- optional user tracking record; status only, not an assertion of administrative approval

## Integrity constraints

- Money columns are `BIGINT` cents.
- Ratios are integer basis points where possible.
- Published rule versions are immutable.
- Results reference an exact ruleset version.
- All externally meaningful records have `createdAt` and `updatedAt`; audit records are append-only.
- Soft deletion is used only where legal retention and audit needs require it.

