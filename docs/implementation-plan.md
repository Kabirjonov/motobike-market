# Amalga oshirish rejasi

Har bosqich faqat o‘z scope’ini to‘liq yakunlaydi. Bosqich oxirida format, ESLint, TypeScript, tegishli unit/integration/E2E test va production build muvaffaqiyatli bo‘lishi kerak; test o‘chirish yoki qoida susaytirish orqali xato yashirilmaydi.

## 0. Discovery va qarorlarni yopish

- [x] Product requirements, architecture, routes va data modelni hujjatlashtirish.
- [x] Ochiq biznes savollariga xavfsiz MVP defaultlarini belgilash.
- [ ] Tegishli bosqichdan oldin [ochiq savollar](./open-questions.md) egalaridan tasdiq olish.

**Deliverable:** faqat `docs/`; feature yoki schema yo‘q.

## 1. Foundation

- [ ] Next.js 16 installed qo‘llanmalariga ko‘ra Cache Components va App Router konvensiyalarini sozlash.
- [ ] Tailwind/shadcn design tokenlari, responsive shell va accessible base componentlar.
- [ ] Type-safe env validation va secretsiz `.env.example`.
- [ ] Zod, Zustand, TanStack Query va Axios’ni mos, deprecated bo‘lmagan versiyalarda o‘rnatish.
- [ ] Test runner, Testing Library va E2E framework; CI’da lint/typecheck/test/build.
- [ ] `src` papka boundarylari va `server-only` himoyasi.

**Acceptance:** starter o‘rniga accessible app shell; env xatosi aniq; barcha quality gate green.

## 2. Prisma va admin auth

- [ ] PostgreSQL datasource va [data model](./data-model.md) asosida Prisma schema.
- [ ] Initial additive migration; productionda destructive command yo‘q.
- [ ] Idempotent seed orqali env’dan yagona `SUPER_ADMIN`; plain password log/source’da yo‘q.
- [ ] Next.js 16 bilan mos auth library, Argon2id, DB session, secure cookie va logout.
- [ ] `/admin/login`, protected admin shell, per-mutation authorization va login rate limit.
- [ ] Auth success/failure/expired/revoked/rate-limit integration testlari.

**Manual/env:** `DATABASE_URL`, admin seed credential, auth secret; migration deploy komandasi aniq hujjatlashtiriladi.

## 3. Lokalizatsiya va design system

- [ ] `uz | ru | en` typed dictionaries; `uz` default/fallback.
- [ ] localStorage locale persistence va hydration-safe locale provider/switcher.
- [ ] DB translation helper bir xil fallback qoidasida.
- [ ] shadcn form, dialog, table, toast, skeleton, empty/error state primitive’lari.
- [ ] Keyboard, focus, label/error association va screen-reader audit.

**Acceptance:** uch til switch ishlaydi, invalid/missing preference `uz`; fallback va hydration testlari green.

## 4. Public katalog

- [ ] Category/product repositories va localized DTO projection.
- [ ] `/`, `/catalog`, `/catalog/[type]`, `/products/[slug]` route’lari.
- [ ] Query contract: search, type/category/price/spec filter, sort va 24-item pagination.
- [ ] URL-driven interactive filterlar; Server Component resultlar.
- [ ] Loading/empty/error/404, responsive cards/detail va accessible gallery.
- [ ] `use cache`, cache life/taglar; public API read endpointlari zarur client consumers uchun.
- [ ] Repository filter, query parser, fallback va public visibility testlari.

**Acceptance:** faqat active productlar; canonical query normalizatsiya; stock-out add-to-cart bloklanadi.

## 5. Savat va guest checkout

- [ ] Minimal `{ productId, quantity }` Zustand persisted cart va server refresh.
- [ ] `/cart`, stale/unavailable item handling, quantity/stock feedback.
- [ ] Zod guest checkout formasi va `/api/checkout`.
- [ ] Server-only price/totals, conditional stock decrement, order/item snapshots va initial history transaction.
- [ ] `/order-success/[orderNumber]`, submit protection va successdan keyin cart clear.
- [ ] Empty/validation/price-change/stock-conflict/concurrent-order/rollback testlari.

**Acceptance:** client narxini o‘zgartirish totalga ta’sir qilmaydi; oversell yo‘q; order number qaytadi.

## 6. Admin katalog va buyurtmalar

- [ ] Product list/create/edit/archive: common fields, uch tarjima va type-spec invariantlari.
- [ ] Category create/edit/archive va in-use himoyasi.
- [ ] Stock/status/SEO boshqaruvi, SKU/slug conflict mapping.
- [ ] Order list/detail, filterlar va valid status transition + history.
- [ ] TanStack Query/Axios mutation state, typed API errors va cache revalidation.
- [ ] Unauthorized/forbidden, validation, CRUD, archive va transition testlari.

**Acceptance:** har mutation auth+Zod; active product talablari bajarilmasa publish rad; relevant public cache yangilanadi.

## 7. Media va SEO

- [ ] S3-compatible signed upload, MIME/size allowlist, progress va retry.
- [ ] Image attach/order/primary/alt/delete; remote image host allowlist.
- [ ] Lokalized/default metadata, canonical, Open Graph va Product/Breadcrumb JSON-LD.
- [ ] Sitemap faqat active canonical URL’lar; robots admin/API’ni bloklaydi; transactional page’lar noindex.
- [ ] Upload authorization/validation va metadata/structured-data testlari.

**Manual/env:** object storage endpoint, region, bucket, access keys va public media base URL.

## 8. Hardening va deploy

- [ ] Security headers, CSRF/origin, rate limit store va request/upload limitlari.
- [ ] Structured redacted logging, error monitoring, health/readiness.
- [ ] DB backup/restore va migration rollout/rollback runbook.
- [ ] Production seed o‘rniga xavfsiz first-admin provisioning/recovery siyosati.
- [ ] Accessibility audit, responsive browser matrix, performance/SEO audit.
- [ ] Checkout critical E2E, admin smoke E2E va production build.

**Release gate:** env/migration checklist tasdiqlangan; real production DB’da destructive operatsiya yo‘q; blockerlar va manual ishlar release note’da.
