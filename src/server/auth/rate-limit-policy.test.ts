import { describe, expect, it } from "vitest";

import { toRateLimitDecision } from "./rate-limit-policy";

describe("login rate-limit policy", () => {
  const now = new Date("2026-07-22T10:00:00.000Z");

  it("allows an unblocked key", () => {
    expect(toRateLimitDecision(null, now)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("returns a bounded retry delay for a blocked key", () => {
    expect(
      toRateLimitDecision(new Date("2026-07-22T10:00:30.001Z"), now),
    ).toEqual({
      allowed: false,
      retryAfterSeconds: 31,
    });
  });
});
