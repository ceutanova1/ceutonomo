# CEUTONOMO Phase 1 Review Checklist

This document is the handoff gate for moving the current private demo from technically verified to professionally approved. A checked engineering item does not replace the named fiscal, legal, or accessibility approval.

## Release identity

- Product: CEUTONOMO
- Scope: anonymous Spanish-first private demo with locally saved scenarios
- Tax year: 2026
- Production: <https://ceutonomo.vercel.app>
- Rules last internally verified: 28 September 2026
- Owner: Mohamed Ali Ben Ali

## Fiscal review

The fiscal reviewer should record `Approved`, `Changes required`, or `Not reviewed` for every family and add a dated note with the source version inspected.

| Rule family | What must be confirmed | Main implementation | Status |
| --- | --- | --- | --- |
| IRPF general calculation | State and Ceuta scales, personal minimum by age, proportional attributable-quota method, and exclusions | `src/rules/2026/irpf.ts`, `src/domain/tax/irpf.ts` | Not reviewed |
| Ceuta IRPF deduction | Article 68.4 scope, 60% rate, qualifying-income percentage, residence and activity facts | `src/rules/2026/benefits.ts` | Not reviewed |
| Difficult-to-justify expenses | 10% rate, €2,000 cap, simplified direct estimation, incompatibility and capital-asset treatment | `src/domain/tax/economic-activity.ts` | Not reviewed |
| RETA 2026 | Net-return adjustment, all brackets, minimum bases and contribution components | `src/rules/2026/reta.ts` | Not reviewed |
| Ceuta RETA bonus | Eligible sectors, common-contingencies scope, 50% January–September and 75% October–December | `src/domain/social-security/reta.ts` | Not reviewed |
| Reduced fee | Personal eligibility and timing only; amount and priority against the Ceuta bonus remain withheld | `src/domain/eligibility/reduced-fee.ts` | Not reviewed |
| Extraordinary direct aid | Eligibility facts, amount bands, deadline and tax treatment | `src/domain/grants/ceuta-extraordinary-aid.ts` | Not reviewed |
| PROCESA indefinite hiring | Fifth/sixth window dates, amount bands, apply-before-hire rule, maintenance and candidate conditions | `src/rules/2026/grant-programs.ts` | Not reviewed |
| Autónomo versus SL | Corporate rates and retained-profit framing; verify that excluded salary, dividends and societary RETA are sufficiently prominent | `src/domain/tax/corporate-tax.ts`, `src/components/structure-comparison.tsx` | Not reviewed |

### Mandatory negative checks

- [ ] Missing facts never become eligibility.
- [ ] A one-time grant is never added to recurring annual savings.
- [ ] The Ceuta IRPF deduction is not represented as a 60% reduction of marginal rates.
- [ ] The Ceuta RETA bonus applies only to the sourced contribution component.
- [ ] No 2027 or 2028 amount is projected from 2026 rules.
- [ ] No active 2026 auto-employment call is inferred from the 2022 PROCESA material.
- [ ] Reduced-fee amount and compatibility stay uncalculated until an authoritative 2026 source is approved.
- [ ] Retained SL profit is not presented as the shareholder's personal disposable income.

## Source freshness

Run `npm run test:sources` before a review session to check that every registered official URL is technically reachable. A passing result proves availability only; it does not confirm legal interpretation, effective dates or the absence of later amendments.

For each source shown in the in-product register:

- [ ] The URL is reachable.
- [ ] The issuer is official.
- [ ] The cited article, section, call or deadline is precise.
- [ ] The effective date covers the displayed 2026 result.
- [ ] Later corrections, amendments or administrative guidance have been checked.
- [ ] The review date in `src/rules/2026/sources.json` is updated only after inspection.

## Legal and privacy review

- [ ] Confirm the complete legal identity and any legally required address/registration details.
- [ ] Approve `/legal` wording and limitations.
- [ ] Approve `/privacidad`, the controller contact and retention wording.
- [ ] Confirm whether Google Analytics will be activated; if yes, complete consent mode and vendor disclosures before loading it.
- [ ] Confirm the contact-a-gestor workflow, recipient and retention process.
- [ ] Confirm whether the private-demo label and access model remain appropriate for the live URL.

## Accessibility review

Engineering evidence currently covers automated WCAG 2.1 A/AA checks, keyboard skip navigation, desktop/mobile layouts, light/dark themes, the eligibility journey and legal pages.

Human validation still required:

- [ ] Run the structured first-time-user protocol in `docs/first-time-user-readability-test.md` and meet every stated threshold.
- [ ] Complete the principal journey with keyboard only.
- [ ] Complete the principal journey with VoiceOver or NVDA.
- [ ] Check zoom at 200% and text spacing overrides.
- [ ] Review Spanish labels and error messages with a representative user.
- [ ] Confirm that charts and status colors remain understandable without color alone.

## Sign-off

| Role | Name | Decision | Date | Notes/reference |
| --- | --- | --- | --- | --- |
| Product owner | Mohamed Ali Ben Ali | Pending | — | — |
| Fiscal reviewer | — | Pending | — | — |
| Legal/privacy reviewer | — | Pending | — | — |
| Accessibility reviewer | — | Pending | — | — |

Attach anonymized session records or a consolidated findings document to this checklist before changing the accessibility or product-owner decision from `Pending`.

Phase 1 is approved for wider release only when all required reviewers have recorded a decision and every `Changes required` item has a linked follow-up.
