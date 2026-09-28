import { describe, expect, it } from "vitest";
import { applyBasisPoints, parseEuro } from "./money";

describe("money", () => {
  it("parses euros without floating-point arithmetic", () => {
    expect(parseEuro("300.25").cents).toBe(30_025);
    expect(parseEuro("19,9").cents).toBe(1_990);
  });
  it("rounds basis-point calculations to the nearest cent", () => {
    expect(applyBasisPoints(parseEuro("10.01"), 5_000).cents).toBe(501);
  });
  it("rejects more than two decimal places", () => {
    expect(() => parseEuro("10.001")).toThrow();
  });
});

