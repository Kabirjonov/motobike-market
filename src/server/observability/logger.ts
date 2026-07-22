import "server-only";

type SafeContext = Record<string, string | number | boolean | null | undefined>;

export function logServerError(
  event: string,
  error: unknown,
  context: SafeContext = {},
) {
  const safeError =
    error instanceof Error
      ? {
          name: error.name,
          code:
            "code" in error && typeof error.code === "string"
              ? error.code
              : undefined,
        }
      : { name: "UnknownError" };
  console.error(
    JSON.stringify({ level: "error", event, error: safeError, ...context }),
  );
}
