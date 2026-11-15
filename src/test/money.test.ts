import { describe, expect, it } from "vitest";
import { fromCents, sumInCents, sumValues, toCents } from "../money";

describe("money calculations", () => {
  it("converts decimal values to cents without float drift", () => {
    expect(toCents(0.1)).toBe(10);
    expect(toCents(0.2)).toBe(20);
    expect(toCents("0,10")).toBe(10);
    expect(toCents(25.5)).toBe(2550);
  });

  it("adds values using integer cents", () => {
    expect(sumInCents([0.1, 0.2, 0.3])).toBe(60);
    expect(sumInCents(["0,10", "0,20", "0,30"])).toBe(60);
    expect(sumValues([0.1, 0.2])).toBe(0.3);
    expect(fromCents(35.5 * 100)).toBe(35.5);
  });
});
