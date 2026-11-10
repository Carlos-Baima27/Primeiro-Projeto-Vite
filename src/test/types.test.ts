import { describe, expect, it } from "vitest";
import { isCategoria } from "../types";

describe("isCategoria", () => {
  it("accepts supported categories", () => {
    expect(isCategoria("alimento")).toBe(true);
    expect(isCategoria("saúde")).toBe(true);
  });

  it("rejects values outside the category list", () => {
    expect(isCategoria("inexistente")).toBe(false);
    expect(isCategoria("")).toBe(false);
  });
});
