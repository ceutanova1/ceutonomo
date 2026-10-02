# MVP Implementation Plan

## Phase 0 — Foundations

1. Scaffold Next.js/TypeScript and the visual system.
2. Add domain, application, infrastructure, rules, and UI boundaries.
3. Add Prisma schema and local development database workflow.
4. Add rule-schema validation, source registry, money primitives, and test harness.
5. Seed the supplied €75,600 software consultant demo profile.

Exit: architecture builds, rule fixtures validate, and core money/revenue tests pass.

## Phase 1 — Trustworthy autónomo MVP

1. Build onboarding and editable profile state.
2. Implement revenue and deductible-expense calculations.
3. Verify and implement complete 2026 RETA brackets/components.
4. Implement Ceuta autónomo bonus eligibility, component scope, and compatibility.
5. Verify and implement complete 2026 IRPF state/Ceuta scales and relevant personal minimums.
6. Implement article 68.4 attributable-quota deduction with partial qualifying income.
7. Catalogue only verified PROCESA 2026 calls; never infer dates.
8. Generate benefit results, warnings, calculation traces, and sources.
9. Deliver the dashboard with recurring versus one-time benefits separated.
10. Verify responsive UX, accessibility, unit/regression tests, and the critical Playwright flow.

Exit: the seeded demo produces a fully sourced, reconcilable result or explicitly reports which official 2026 parameter is still missing. No placeholder result is shown.

### Current implementation status — 2026-09-28

- Complete: editable personal/business/implantation onboarding with explicit unknown-fact handling.
- Complete: revenue, deductible-expense, 2026 RETA and general IRPF calculations for the documented Phase 1 scope.
- Complete: central benefit evaluator returning `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE`, or `NEEDS_VERIFICATION`, with rule and source references.
- Complete: traced IRPF and RETA result cards, calculation explanation, official-source links, responsive navigation, and negative-case browser verification.
- Complete: manual or derived revenue, itemized expense editor with per-line frequency/deductibility/treatment/notes, and validated client distribution.
- Complete: date-sensitive 2026 Ceuta RETA bonus (50% through September; 75% from October) and a three-year timeline that withholds unsourced 2027–2028 values.
- Complete: 2026 Ceuta 10% difficult-to-justify expense with the 2,000 euro cap, explicit incompatibility control, and safe capital-asset handling that does not deduct purchase price as a current expense.
- Complete: RDL 22/2026 extraordinary direct aid with individual and five legal-entity amount bands, AEAT deadline, tax exemption, and missing-fact evaluation.
- Complete: dashboard separating net annual/monthly cash, recurring IRPF savings, recurring Social Security savings, and one-time potential aid. Unverified aid is never added to the recurring total.
- Complete: connected Phase 1 navigation. Eligibility facts now share state with the economic simulator, benefit results, verified grants, personalized roadmap, and official-source register.
- Complete: functional Simulador, Beneficios, Ayudas, Hoja de ruta, and Fuentes views on desktop and mobile; no Phase 1 navigation item remains a placeholder.
- Partial: reduced-fee personal eligibility and request timing are modeled. The 2026 amount and compatibility/priority against the Ceuta bonus remain `NEEDS_VERIFICATION` because the official sources inspected do not publish those parameters.
- Complete: dated fifth/sixth 2026 PROCESA indefinite-hiring windows, amount bands, apply-before-hire warning, source links, and current-window evaluation.
- Pending: any additional individually verified PROCESA calls, full grant application workflow, and personalized roadmap. The autoemployment page remains limited to 2022 calls and is intentionally disabled for 2026.
- Verified: 70 deterministic unit/regression tests, lint, production build, and 12 Playwright flows across desktop and mobile, including shared-state navigation through every Phase 1 view, all four export formats, consent-gated analytics behavior, and repeatable demo restoration.
- Security note: `npm audit --omit=dev` currently reports four high-severity advisories in Prisma 7.10 transitive tooling (`deepmerge-ts` and `mysql2`). The offered automatic fix downgrades Prisma to 6 and is therefore not applied without a planned migration. Recheck upstream before deployment and do not expose Prisma CLI tooling in the runtime image.
- Complete: CI quality workflow for lint, deterministic tests, production build, and browser journeys on pushes and pull requests.
- Complete for the private demo: linked privacy information, legal/demo limitations, local-storage disclosure, and the contact-a-gestor handoff. Final legal wording and business identification still require owner/legal approval before commercial launch.
- Complete: automated WCAG 2.1 A/AA checks for the dashboard, eligibility flow, dark theme, legal pages and the keyboard skip-link path on desktop and mobile.
- Complete: a concrete fiscal, source-freshness, legal/privacy and assisted-technology sign-off checklist in `docs/phase-one-review-checklist.md` for the remaining human approvals.
- Complete for demo readiness: client-side PDF, CSV, JSON and XML exports containing the scenario, assumptions, warnings, generation date and official-source provenance without sending scenario data to the server.
- Complete for demo readiness: consent-gated Google Analytics integration with no tracking before opt-in, no simulation values in events, a withdrawal control, and a disabled honest state until the measurement ID is configured.
- Complete for demo readiness: confirmed one-action restoration of the seeded scenario while preserving language, theme and cookie preferences between guided demonstrations.
- Complete for demo readiness: an eight-minute private-demo runbook with preflight values, compliant talking points, recovery steps and post-demo notes.
- Pending before public production launch: assisted-technology review with representative users, final brand/legal approval, independent fiscal reviewer approval, and a decision on whether persistence/authentication remains deferred.

## Phase 2 — Structural decisions

1. Verify and implement Corporate Tax and shareholder tax rules.
2. Add SL/SLU simulation, qualifying-profit share, and retained capital.
3. Add neutral structure comparison and explanation.
4. Add break-even curves across specified revenue levels.
5. Add scenario cloning/comparison, three-year forecast, and personalized roadmap.

## Phase 3 — Operations

1. Add authenticated accounts and history.
2. Add protected rule administration and two-step publication.
3. Add audit log, source freshness monitoring, and deadline tracking.
4. Add reviewed PDF reports.

## Decision gates

- Owner confirms brand identity and public/private launch mode.
- Fiscal reviewer approves each published rule family.
- Privacy owner approves persistence before personal profiles leave the browser.
- Production launch requires a complete source freshness review and a signed ruleset version.

## Immediate implementation order

1. Complete the assisted-technology review with representative users.
2. Obtain fiscal review of the published 2026 ruleset.
3. Confirm final brand/legal wording and whether persistence/authentication remains deferred before public launch.
