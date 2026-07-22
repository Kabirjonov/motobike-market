import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("health endpoint", () => {
  it("returns a non-cacheable healthy response", async () => {
    const response = GET();
    const body = (await response.json()) as {
      service: string;
      status: string;
      timestamp: string;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.service).toBe("motobike-shop");
    expect(body.status).toBe("ok");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
