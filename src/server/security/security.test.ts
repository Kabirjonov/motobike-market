import { describe, expect, it } from "vitest";

import { contentSecurityPolicy } from "./headers";
import { isTrustedMutationRequest } from "./request";

describe("security regression", () => {
  it("builds a cache-compatible CSP that blocks objects and framing", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("rejects cross-origin and non-JSON mutations", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://shop.example/api/checkout", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "https://evil.example",
            "sec-fetch-site": "cross-site",
          },
        }),
        "https://shop.example",
      ),
    ).toBe(false);
    expect(
      isTrustedMutationRequest(
        new Request("https://shop.example/api/checkout", {
          method: "POST",
          headers: { "content-type": "text/plain" },
        }),
        "https://shop.example",
      ),
    ).toBe(false);
  });

  it("accepts same-origin JSON mutations", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://shop.example/api/checkout", {
          method: "POST",
          headers: {
            "content-type": "application/json; charset=utf-8",
            origin: "https://shop.example",
            "sec-fetch-site": "same-origin",
          },
        }),
        "https://shop.example",
      ),
    ).toBe(true);
  });
});
