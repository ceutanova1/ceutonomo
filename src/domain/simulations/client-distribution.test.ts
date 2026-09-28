import { describe, expect, it } from "vitest";

import { analyzeClientDistribution } from "./client-distribution";

describe("analyzeClientDistribution", () => {
  it("accepts a complete mixed client portfolio", () => {
    const result = analyzeClientDistribution([
      { id: "mainland", label: "Península B2B", region: "MAINLAND_SPAIN", clientKind: "B2B", shareBasisPoints: 7_000 },
      { id: "eu", label: "UE B2B", region: "EU", clientKind: "B2B", shareBasisPoints: 3_000 },
    ]);
    expect(result.isComplete).toBe(true);
    expect(result.unallocatedBasisPoints).toBe(0);
  });

  it("reports the share that still needs classification", () => {
    const result = analyzeClientDistribution([
      { id: "ceuta", label: "Ceuta", region: "CEUTA", clientKind: "B2B", shareBasisPoints: 4_000 },
    ]);
    expect(result.isComplete).toBe(false);
    expect(result.unallocatedBasisPoints).toBe(6_000);
  });

  it("rejects a portfolio above 100%", () => {
    expect(() => analyzeClientDistribution([
      { id: "a", label: "A", region: "EU", clientKind: "B2B", shareBasisPoints: 6_000 },
      { id: "b", label: "B", region: "NON_EU", clientKind: "B2C", shareBasisPoints: 5_000 },
    ])).toThrow("cannot exceed 100%");
  });
});
