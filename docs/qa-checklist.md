# QA release checklist

## Automated gates

- `npm ci`, Prisma generate and migrations complete on a dedicated `*_test` PostgreSQL database.
- Format, ESLint, strict TypeScript, unit coverage, jsdom component tests, Prisma integration tests and production build pass.
- Playwright passes on desktop Chromium, desktop Firefox and mobile Chromium. Axe has no serious/critical WCAG A/AA findings.
- Test failures are fixed at the cause; retries are diagnostic only and timeouts are not increased to hide flakes.

## Desktop and mobile

- Check 320, 375, 768, 1024 and 1440 px widths: header, filters, product gallery, sticky purchase bar, cart, checkout and all admin tables/forms.
- Keyboard-only navigation has visible focus, logical order and no traps. Zoom to 200%; content remains available without horizontal page scrolling.
- Chrome and Firefox: product images, selects, persisted cart/theme/locale and back/forward filter state behave consistently.

## Core flows

- UZ/RU/EN: home → catalog filters → localized product slug → quantity → cart → guest checkout → success receipt.
- Validation covers malformed phone/email/address, empty cart, stale price, insufficient stock, duplicate idempotency key and server/network failure.
- Admin: invalid/rate-limited login, successful login/logout, product create/edit/archive, three translations, media management, category/brand CRUD, order detail/transition/cancel.
- Loading, empty, validation, error and success states are readable and actionable on every main route.

## Data and security

- Automated setup refuses any DB not ending `_test`; production credentials are absent from test runners and artifacts.
- Wrong-role/anonymous mutations, foreign child IDs, cross-site checkout, unsafe redirect, formula CSV input and malicious image signatures are rejected.
- Cancellation retry restores stock once and creates one cancellation audit event. Checkout stores server-derived price/name/SKU snapshots.
- Logs, traces, screenshots and Playwright reports contain no real customer PII or secrets.

## SEO and i18n

- Each locale has correct `lang`, canonical, reciprocal hreflang and localized metadata; filtered catalog is noindex.
- Sitemap includes only active localized records; robots excludes admin/API/cart/checkout. Product/Breadcrumb JSON-LD passes Rich Results validation.
- Message key parity test passes. Check overflow with long Russian/English strings and UZ fallback for intentionally missing DB translation.

## Release sign-off

- Record browser/OS/device, commit SHA, DB migration version, failed scenarios and evidence links.
- Run Lighthouse mobile and review field Web Vitals targets from `docs/performance.md`.
- Product owner signs off checkout totals/delivery rules; operations signs off backup, secrets, alerting and rollback.
