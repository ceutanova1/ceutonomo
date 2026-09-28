# 2026 Rule Configuration Design

## Storage layout

```text
src/rules/2026/
  manifest.json
  irpf.json
  social-security.json
  corporate-tax.json
  ipsi.json
  grants.json
  sources.json
```

Files are validated at build/startup and imported into a draft `RuleSet`. Production calculations use the published database version, not mutable files. The files provide reviewable seed data and regression fixtures.

## Manifest

The manifest records schema version, tax year, semantic ruleset version, status, effective period, verification date, source IDs, and a checksum of every rule file.

## Rule shape

Each rule contains:

- stable ID and version;
- effective dates and jurisdiction;
- typed eligibility predicates;
- typed calculation parameters;
- compatibility and precedence rules;
- missing-information behavior;
- source IDs with article/section locators;
- reviewer status and last verification date.

Free-form executable JavaScript is forbidden in configuration. The domain engine supports an allow-list of operators and formula types.

## Initial verified foundations

### IRPF Ceuta/Melilla deduction

- Official basis: article 68.4 of Law 35/2006.
- The current consolidated text specifies a 60% deduction of the part of the combined state and regional gross quotas proportionally corresponding to qualifying Ceuta/Melilla income.
- Configuration therefore stores the deduction rate, qualifying-income rules, residency branch, and source locator. It does not reduce marginal IRPF rates by 60%.
- Computing the normal IRPF quota requires the complete applicable 2026 state and Ceuta scales plus personal/family inputs; until those are verified and implemented, the product must not display a fabricated final IRPF figure.

### Gastos de difícil justificación en Ceuta

- Para el período impositivo 2026, el RDL 22/2026 eleva al 10% el porcentaje aplicable a actividades económicas calificadas en Ceuta en estimación directa simplificada, con límite anual de 2.000 euros.
- Se calcula sobre el rendimiento neto positivo previo y no se acumula con la reducción incompatible para determinados trabajadores autónomos económicamente dependientes o con cliente único no vinculado.
- Una compra de equipamiento no se deduce automáticamente por su precio: el simulador exige que la amortización anual fiscal se confirme antes de introducirla como deducible.

### Ceuta/Melilla autónomo contribution bonus

- The official rule applies 50% to the common-contingencies contribution through September 2026. Article 36 and final provision 3.2 of Royal Decree-law 22/2026 increase it to 75% for contributions accrued from 1 October 2026.
- Sector, residence, activity location, contribution base, and compatibility remain explicit inputs/rules.
- The bonus is not applied to the total contribution unless the official rule says that every component is covered.
- Annual 2026 calculations split the year by accrual month: 50% for January–September and 75% for October–December. The increase is not backdated.

### Reduced fee for a new activity

- Article 38 ter defines the personal eligibility, initial twelve-month period, optional second period below annual SMI, and application timing.
- The transitional €80 amount expressly covered 2023–2025. The official Social Security page inspected still describes €80 for that period, while the law requires the 2026 amount to be set by the State Budget for the exercise.
- Therefore the 2026 catalog evaluates personal eligibility but does not calculate or display a reduced amount. Compatibility or priority against the Ceuta article 36 bonus also remains `NEEDS_VERIFICATION` until an authoritative source resolves it.

### Impuesto sobre Sociedades y comparación con SL

- La escala 2026 para microempresas se configura al 19% sobre los primeros 50.000 euros de base imponible y al 21% sobre el exceso. La entidad de nueva creación puede usar el 15% cuando se cumplen los requisitos legales.
- La bonificación de Ceuta se calcula separadamente sobre la cuota íntegra atribuible a rentas obtenidas en Ceuta; el escenario permite editar ese porcentaje y aplica el 60% vigente en 2026.
- El resultado mostrado para la SL es beneficio retenido después del Impuesto sobre Sociedades, no renta neta personal del socio.
- Hasta incorporar y verificar IRPF del salario, RETA societario y tributación de dividendos, esos importes permanecen explícitamente fuera de la comparación. No se suman ni se aproximan silenciosamente.

### Grants

- A stable grant program and each dated call are separate records.
- PROCESA windows are active only when an official call has been individually verified.
- The public auto-employment page currently surfaced an old 2022 call, so it must not be represented as an active 2026 deadline.
- The official PROCESA indefinite-hiring page publishes a fifth 2026 window through 30 September at 13:00 and a sixth window from 1 October through 30 December at 13:00. Both require the subsidized hire to follow the application.
- The configured result remains `NEEDS_VERIFICATION` until the candidate group, job-seeker registration, workforce increase, prior relationship, working time, and other required facts are supplied. Availability of a window never implies award; the program is competitive and budget-limited.

## Publication gate

A rule cannot become `PUBLISHED` if it lacks a reachable official source, precise locator, effective date, formula type, tests, reviewer, or verification date. Low-confidence interpretation remains visible only as `NEEDS_VERIFICATION` guidance.
