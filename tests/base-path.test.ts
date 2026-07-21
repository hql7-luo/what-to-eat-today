import { describe, expect, it } from "vitest";

import { prefixWithBasePath } from "@/lib/base-path";

describe("GitHub Pages base path", () => {
  it("prefixes public assets for the repository subpath", () => {
    expect(prefixWithBasePath("/food/dishes/latte.jpg", "/what-to-eat-today"))
      .toBe("/what-to-eat-today/food/dishes/latte.jpg");
  });

  it("keeps local development paths unchanged", () => {
    expect(prefixWithBasePath("/food/dishes/latte.jpg", ""))
      .toBe("/food/dishes/latte.jpg");
  });

  it("does not apply the repository prefix twice", () => {
    expect(prefixWithBasePath("/what-to-eat-today/food/dishes/latte.jpg", "/what-to-eat-today"))
      .toBe("/what-to-eat-today/food/dishes/latte.jpg");
  });
});
