import { describe, expect, it } from "vitest";
import { vpnProviders } from "../data/vpnProviders";

describe("vpnProviders dataset", () => {
  it("contains at least three curated providers", () => {
    expect(vpnProviders.length).toBeGreaterThanOrEqual(3);
  });

  it("structures each entry with core metadata", () => {
    for (const provider of vpnProviders) {
      expect(provider.name).toBeTruthy();
      expect(provider.summary).toBeTruthy();
      expect(typeof provider.serverCount).toBe("number");
      expect(provider.serverCount).toBeGreaterThan(0);
      expect(provider.tags.length).toBeGreaterThan(0);
    }
  });
});
