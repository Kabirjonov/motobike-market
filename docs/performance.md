# Performance plan

## Current architecture

- Public catalog/product queries select only card/detail fields, avoid per-row queries and use Prisma relation selects. Catalog and product reads use cache tags; admin mutations revalidate affected tags and paths.
- Checkout/admin/session routes remain dynamic. Static assets and immutable local media use long-lived caching. `next/image` supplies responsive image sizing and format negotiation.
- Database indexes cover product status/type/category/brand/price/stock, translated locale+slug, order status/date, phone and redirect source paths.
- Client state is limited to interactive filters, cart, forms and shell controls. Data-heavy catalog and admin reads remain Server Components.

## Budgets and measurement

- Targets at p75 mobile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, TTFB ≤800ms.
- Record field Web Vitals with a privacy-safe analytics endpoint: metric name, value, rating, route template, locale and build ID only. Do not send URLs containing order numbers or customer input.
- Run Lighthouse mobile against `/uz`, `/uz/catalog`, a representative product, cart and checkout on every release candidate. Compare bundle output and route rendering mode from `next build`.
- Use PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` with anonymized representative filters before adding indexes. Monitor slow-query percentiles and cache hit rates in production.

## Scaling actions

- Replace the PostgreSQL rate-limit adapter with Redis when multiple regions or sustained abuse makes DB writes material.
- Cache redirect misses/hits at the edge only with short TTL and invalidate when slugs change.
- Split sitemap generation before 50,000 URLs. Paginate all admin/public lists and cap exports.
- Put media behind an S3-compatible CDN with immutable object keys. Keep hero/LCP images correctly sized and priority-load only the single actual LCP candidate.
- Investigate route-specific regressions before expanding global cache lifetimes; stock and checkout data must never be statically cached.
