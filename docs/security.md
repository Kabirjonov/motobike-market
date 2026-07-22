# Security model

## Trust boundaries

- Public users can only read the active catalog and submit a guest checkout. Client prices, totals, stock, status and product snapshots are never trusted.
- Admin pages are convenience guards only; every Server Action and admin Route Handler performs its own DB-backed session and role check.
- All mutation payloads are parsed through Zod allowlists. Prisma parameterization is the only database query interface; the login limiter uses `Prisma.sql` parameters.

## Implemented controls

- Auth.js credential sessions use HttpOnly, SameSite=Lax and production Secure cookies. Disabled/deleted admins are rejected on protected access.
- Login is limited by hashed email and IP. Checkout is limited by a hashed IP key in PostgreSQL. The limiter API accepts a policy and key list so a Redis/distributed adapter can replace persistence without changing callers.
- Checkout rejects cross-site requests and non-JSON content before parsing. Next.js Server Actions retain framework Origin validation and each action re-authorizes.
- CSP uses a per-request nonce, `strict-dynamic`, no plugins, restricted base/form targets and `frame-ancestors 'none'`. HSTS is production-only. Nosniff, referrer, frame, opener and permissions policies apply globally.
- Image uploads have byte/pixel/dimension/signature/MIME limits, random object keys, product-scoped mutations and are decoded then re-encoded to WebP, dropping EXIF and untrusted ancillary data.
- Redirect inputs are internal allowlisted paths. Product/media mutations scope child IDs to their parent, preventing cross-product IDOR.
- Structured server error logs contain event names, safe codes and explicitly allowlisted context only. Customer PII, credentials, request bodies and secrets must never be logged.
- JSON-LD is serialized with `<` escaping. React escapes normal UI data.

## Operations

- Rotate `AUTH_SECRET`, database and object-storage credentials through the deployment secret manager. Never copy production secrets to `.env` files.
- Run `npm audit --omit=dev` and container/image scanning in CI. Apply non-breaking security patches after tests; review major upgrades separately.
- The 2026-07-22 audit still reports Next's optional `sharp@0.34.5` (GHSA-f88m-g3jw-g9cj). The safe Sharp release is outside Next 16.2.11's declared range, so no forced incompatible override or Next downgrade is applied. Uploaded images are processed by direct `sharp@0.35.x`, remote image origins are allowlisted, and the Next advisory must be rechecked on each Next patch.
- The same audit reports Next's pinned `postcss@8.4.31` (GHSA-qx2v-qp2m-jg93). A package override leaves npm's dependency tree invalid because Next pins the exact version, so it is not shipped. Application CSS is repository-controlled rather than generated from public input; upgrade Next as soon as it carries patched transitive versions.
- Alert on rate-limit spikes, repeated login failures, checkout 409/429 rates, audit-write failures and media cleanup failures.
- Configure the reverse proxy with a request-body limit at or below the application upload limit and TLS 1.2+.

## Regression checklist

- Anonymous and wrong-role admin mutations return no data change.
- A product image ID belonging to another product cannot be updated/deleted/reordered.
- External redirect targets, duplicate cart IDs, client prices, cross-site checkout and MIME/signature mismatches are rejected.
- CSP is tested in report-only mode against the production build before tightening a directive.
