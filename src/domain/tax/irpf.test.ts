import { describe, expect, it } from "vitest";

import { euro, parseEuro } from "../money";
import { irpf2026GeneralRules } from "@/rules/2026/irpf";
import { calculateIrpfGeneral, calculateTaxpayerMinimum } from "./irpf";

describe("calculateIrpfGeneral", () => {
  it("reproduces the general-base portion of AEAT's Ceuta worked example", () => {
    const result = calculateIrpfGeneral({
      generalTaxableBase: parseEuro("34200"),
      qualifyingCeutaGeneralBase: parseEuro("31000"),
      taxpayerAge: 40,
      additionalPersonalFamilyMinimum: euro(0),
      applyCeutaDeduction: true,
    }, irpf2026GeneralRules);

    expect(result.stateGrossQuota.cents).toBe(421_275);
    expect(result.complementaryGrossQuota.cents).toBe(421_275);
    expect(result.stateMinimumQuota.cents).toBe(52_725);
    expect(result.stateGeneralQuota.cents).toBe(368_550);
    expect(result.normalGeneralIrpf.cents).toBe(737_100);
    expect(result.ceutaGeneralDeduction.cents).toBe(400_878);
    expect(result.estimatedGeneralIrpf.cents).toBe(336_222);
  });

  it("never applies the Ceuta deduction to more than the taxable base", () => {
    const full = calculateIrpfGeneral({
      generalTaxableBase: parseEuro("20000"),
      qualifyingCeutaGeneralBase: parseEuro("50000"),
      taxpayerAge: 35,
      additionalPersonalFamilyMinimum: euro(0),
      applyCeutaDeduction: true,
    }, irpf2026GeneralRules);
    expect(full.ceutaGeneralDeduction.cents).toBe(Math.floor(full.normalGeneralIrpf.cents * 0.6));
  });

  it("returns zero tax for a zero base", () => {
    const result = calculateIrpfGeneral({
      generalTaxableBase: euro(0),
      qualifyingCeutaGeneralBase: euro(0),
      taxpayerAge: 35,
      additionalPersonalFamilyMinimum: euro(0),
      applyCeutaDeduction: true,
    }, irpf2026GeneralRules);
    expect(result.estimatedGeneralIrpf.cents).toBe(0);
    expect(result.effectiveRateBasisPoints).toBe(0);
  });

  it("applies age-related taxpayer minimums exactly at statutory ages", () => {
    expect(calculateTaxpayerMinimum(65, irpf2026GeneralRules).cents).toBe(555_000);
    expect(calculateTaxpayerMinimum(66, irpf2026GeneralRules).cents).toBe(670_000);
    expect(calculateTaxpayerMinimum(76, irpf2026GeneralRules).cents).toBe(810_000);
  });
});

