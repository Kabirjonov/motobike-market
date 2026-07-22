# Tizim arxitekturasi

## 1. Kontekst va tamoyillar

Loyiha Next.js 16.2.11 App Router monoliti: UI, Server Components, Server Actions va Route Handlers bir deployable ichida, PostgreSQL esa Prisma orqali ishlatiladi. Alohida backend servis rejalashtirilmaydi.

Asosiy tamoyillar:

- Server Component default; client boundary faqat browser API yoki interaktiv state kerak bo‘lganda.
- Server authoritative: auth, validation, price, stock, total va status transition serverda hal qilinadi.
- Public read va admin mutationlar alohida service/repository funksiyalaridan foydalanadi.
- Route Handler va Server Action biznes qoidalarini takrorlamaydi; ikkalasi ham shared server service’ni chaqiradi.

## 2. Tavsiya etilgan papka daraxti

```text
.
├── docs/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
└── src/
    ├── app/
    │   ├── (store)/
    │   ├── admin/
    │   │   ├── (auth)/
    │   │   └── (dashboard)/
    │   ├── api/
    │   ├── robots.ts
    │   └── sitemap.ts
    ├── components/
    │   ├── ui/
    │   └── shared/
    ├── features/
    │   ├── admin/
    │   ├── cart/
    │   ├── catalog/
    │   ├── checkout/
    │   └── i18n/
    ├── lib/
    │   ├── axios/
    │   ├── env/
    │   └── utils/
    ├── schemas/
    ├── server/
    │   ├── auth/
    │   ├── db/
    │   ├── repositories/
    │   └── services/
    ├── stores/
    └── types/
```

`app` routing/composition, `features` domain UI, `server` server-only biznes va persistence, `schemas` shared Zod kontraktlari, `components/ui` shadcn primitive’lari uchun. `server-only` importi DB, auth va secret ishlatadigan modullarda boundary’ni himoya qiladi.

## 3. Server/client chegarasi

### Server Components

- Layout, home, katalog result, product detail, admin page shell va read-heavy view’lar.
- Prisma read, locale-aware projection, authorization va metadata generation.
- URL `searchParams` ni parse qilib typed katalog filteriga aylantirish.

### Client Components

- Locale switcher va localStorage hydration.
- Zustand savat, quantity controls, drawer/dialog va interactive gallery.
- Filter control’lari URL’ni yangilaydi; result rendering serverda qoladi.
- TanStack Query ishlatadigan admin table/form mutationlari va upload progress.

Keraksiz global providerlardan qochiladi. Zustand faqat cart/UI holati uchun; server data cache sifatida ishlatilmaydi. TanStack Query/Axios public SEO read’larini almashtirmaydi.

## 4. Data va API oqimi

```text
Page/Client UI
  → Server Action yoki Route Handler
  → Zod parse + auth/authorization
  → domain service
  → Prisma repository
  → PostgreSQL transaction
  → typed result + cache revalidation
```

- Server Actions first-party form/mutationlar uchun.
- Route Handlers TanStack Query/Axios, upload callback yoki tashqi integration uchun.
- API success: `{ data, meta? }`; error: `{ error: { code, message, fieldErrors? } }` va mos HTTP status.
- Server log internal detailni saqlaydi, client xavfsiz lokalized xabar oladi.

### Katalog query kontrakti

`q`, `type`, `category`, `minPrice`, `maxPrice`, motorcycle uchun `make`, `model`, `yearFrom`, `yearTo`, `condition`; part uchun `brand`, `partNumber`, `compatibleMake`, `compatibleModel`, `compatibleYear`; umumiy `sort`, `page`. Default: `sort=newest`, `page=1`, `pageSize=24`.

### Checkout kontrakti

Client kontakt/manzil va `{ productId, quantity }[]` yuboradi. Service transaction ichida products’ni lock-safe usulda qayta o‘qiydi, status/stockni tekshiradi, DB narxlaridan subtotal/fee/total hisoblaydi, order snapshot yaratadi va stockni kamaytiradi. Client hisoblagan pul qiymatlari qabul qilinmaydi.

## 5. PostgreSQL va Prisma

- Pul `Decimal(12,2)`, currency uch harfli ISO kodi; JavaScript `number` bilan moliyaviy arifmetika qilinmaydi.
- Timestamps UTC’da; UI locale/timezone bo‘yicha formatlaydi.
- SKU, slug, order number va admin email unique constraint bilan himoyalanadi.
- Product translation composite unique `(productId, locale)`; kategoriya tarjimasida ham shunday.
- Katalog querylari uchun status/type/category/createdAt, price va turga xos filter indexlari qo‘yiladi.
- Checkout va order status mutationlari Prisma transaction’da bajariladi.
- Product va category hard-delete o‘rniga archive/deactivate; order snapshot tarixni saqlaydi.

Batafsil entitylar [data model](./data-model.md) da.

## 6. Admin authentication va authorization

- Next.js 16/React 19 compatible Auth.js v5 credentials va JWT session lifecycle uchun ishlatiladi.
- Parol Argon2id bilan hash qilinadi; seed plain passwordni DB yoki source’da saqlamaydi.
- Auth.js JWT cookie `HttpOnly`, productionda `Secure`, `SameSite=Lax` va 8 soat expiry bilan; har protected request adminning active/deleted holatini DB’dan qayta tekshiradi.
- Login HMAC-hashed IP+identifier asosida atomic DB rate-limit qilinadi; generic invalid-credential xabari beriladi va PII’siz audit yoziladi.
- Route protection faqat layout redirectiga tayanmaydi: har bir data access va mutation session/role tekshiradi.
- MVP rol `SUPER_ADMIN`; model keyingi rollarga kengayadigan enum bilan quriladi.
- CSRF himoyasi auth library va SameSite bilan, origin tekshiruvi mutation endpointlarida qo‘llanadi.

## 7. Lokalizatsiya

- `Locale = "uz" | "ru" | "en"`; `DEFAULT_LOCALE = "uz"` va fallback ham `uz`.
- UI dictionary type-safe modulelarda; entity kontenti translation tablelarda.
- Locale client localStorage’da saqlanadi. Serverning birinchi renderi SEO va hydration stability uchun `uz`; client preference yuklangach tarjima UI boundary orqali yangilanadi.
- URL prefix yo‘qligi sabab `uz` canonical/indexable. `ru/en` indexable URL strategiyasi alohida biznes qarori.

## 8. Media

- Binary fayllar DB yoki repositoryga joylanmaydi; S3-compatible object storage ishlatiladi.
- Upload admin-only signed flow: server MIME/size ni tekshiradi, unique object key yaratadi, client upload qiladi, server metadata yozuvini tasdiqlaydi.
- MVP formatlar JPEG/PNG/WebP/AVIF, maksimal hajm konfiguratsiyadan; SVG upload taqiqlanadi.
- DB URL/key, sortOrder, isPrimary va `uz/ru/en` alt textni saqlaydi.
- Object o‘chirish DB referensi olib tashlanganidan keyin best-effort cleanup; orphan cleanup job keyingi hardening bosqichida.
- `next/image` remotePatterns allowlist env/config orqali aniq provider hostiga cheklanadi.

## 9. Caching va freshness

Next.js 16 Cache Components yoqilgach public katalog/category/product read funksiyalari `use cache`, `cacheLife` va `cacheTag` bilan cache qilinadi. Dynamic runtime qiymat cached funksiya argumenti sifatida uzatiladi.

- Tags: `products`, `product:{id}`, `product-slug:{slug}`, `categories`.
- Product/category admin mutationidan so‘ng tegishli taglar revalidate qilinadi.
- Katalog filtrlari funksiya argumenti bo‘lib cache key’ga kiradi.
- Admin, cart va checkout cache qilinmaydi; request-time data Suspense boundary ichida olinadi.
- Stock checkout’da har doim DB’dan tekshiriladi; cached public stock faqat display uchun.

## 10. SEO

- Root metadata default `uz`; product/category uchun Server Component `generateMetadata`.
- Unique title, description, canonical, Open Graph image va product availability/price metadata.
- Product va breadcrumb JSON-LD serverda serializatsiya qilinadi, user content xavfsiz escape qilinadi.
- `sitemap.ts` faqat `ACTIVE` canonical productlar va public static route’larni beradi.
- `robots.ts` `/admin` va `/api` ni disallow qiladi; checkout/success sahifalari `noindex`.
- `404`, archived va draft mahsulotlar sitemapga kirmaydi.

## 11. Xavfsizlik va observability

- Barcha input Zod orqali serverda validatsiya; outputlarda zarur maydonlargina qaytariladi.
- Secretlar faqat validated env module orqali; `.env.example` nom va izohlarni, real qiymatlarni emas, saqlaydi.
- Security headers, upload allowlist, request size limit va rate limit production hardeningda.
- Structured log request/order ID bilan; secret, password, session token va to‘liq personal data log qilinmaydi.
- Checkout/order mutation xatolari monitoringga yuboriladi; health va DB readiness deploy bosqichida qo‘shiladi.
