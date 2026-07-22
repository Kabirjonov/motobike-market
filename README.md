# Motobike Shop

Mototsikllar, ehtiyot qismlar, aksessuarlar va ekipirovkalar uchun Next.js App Router online market. Hozirgi bosqich production foundation: biznes katalogi, checkout, Prisma va auth keyingi yakunlangan bosqichlarda qo‘shiladi.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Tailwind CSS 4 va shadcn/ui-compatible design system
- Zod environment validation
- Vitest, ESLint, Prettier va import sorting
- PostgreSQL, Prisma 7 va `pg` driver adapter
- Auth.js v5 credentials-based admin auth va Argon2id
- Rejalashtirilgan: S3-compatible storage

Arxitektura va product qarorlari [`docs/`](./docs) ichida.

## Talablar

- Node.js Next.js 16 qo‘llab-quvvatlaydigan LTS versiyasi
- npm
- Keyingi data bosqichlari uchun PostgreSQL va S3-compatible storage

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run dev
```

`http://localhost:3000` public foundation, `http://localhost:3000/admin/login` admin login, `http://localhost:3000/api/health` health endpoint.

Foundation sahifalari secretsiz build bo‘ladi. DB/auth/storage funksiyasi ulansa, typed config getter birinchi ishlatilganda `.env.local` qiymatlarini Zod bilan tekshiradi. `.env.example` placeholderlarini production qiymat sifatida ishlatmang.

## Scriptlar

| Buyruq                      | Vazifa                                                 |
| --------------------------- | ------------------------------------------------------ |
| `npm run dev`               | Development server                                     |
| `npm run build`             | Production build                                       |
| `npm run start`             | Production server                                      |
| `npm run lint`              | ESLint va import order tekshiruvi                      |
| `npm run lint:fix`          | ESLint auto-fix                                        |
| `npm run format`            | Prettier formatlash                                    |
| `npm run format:check`      | Formatni o‘zgartirmasdan tekshirish                    |
| `npm run typecheck`         | TypeScript strict tekshiruv                            |
| `npm run test`              | Vitest testlari                                        |
| `npm run test:coverage`     | Unit test coverage hisoboti                            |
| `npm run test:component`    | React/jsdom component testlari                         |
| `npm run test:integration`  | Izolyatsiyalangan PostgreSQL integration testlari      |
| `npm run test:db:setup`     | Test DB migration va deterministik seed                |
| `npm run test:e2e`          | Playwright desktop/mobile va accessibility testlari    |
| `npm run test:e2e:install`  | Chromium va Firefox test browserlarini o‘rnatish       |
| `npm run db:generate`       | Prisma Client generatsiyasi                            |
| `npm run db:validate`       | Prisma schema validatsiyasi                            |
| `npm run db:format`         | Prisma schema formatlash                               |
| `npm run db:migrate:dev`    | Local development migration yaratish/qo‘llash          |
| `npm run db:migrate:deploy` | Mavjud migrationlarni production/staging’da qo‘llash   |
| `npm run db:seed`           | Development demo ma’lumotlarini idempotent seed qilish |

## Papka chegaralari

- `src/app`: route, layout va Route Handler composition
- `src/components`: shared va shadcn UI
- `src/features`: domain feature UI/client behavior
- `src/lib`: universal utility va public config
- `src/server`: `server-only` env/config, keyinchalik DB/repository/service
- `src/schemas`: Zod input/environment schema
- `src/messages`: `uz`, `ru`, `en` UI dictionaries
- `src/types`: shared public TypeScript contractlar

## Environment

`.env.example` ni `.env.local` ga nusxalang. Secret qiymatlarni commit qilmang.

- `NEXT_PUBLIC_APP_URL`: public absolute URL
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: kamida 32 belgili secret
- `AUTH_URL`: deploymentning aniq public origin’i
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`: barcha app instance’lari uchun bir xil barqaror base64 AES-GCM key
- `STORAGE_*`: S3-compatible endpoint, bucket va credentiallar
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`: faqat development seed admini

## Database va migration

Prisma 7 schema [`prisma/schema.prisma`](./prisma/schema.prisma), CLI konfiguratsiyasi `prisma.config.ts` ichida. Generated client `src/generated/prisma` ga yoziladi va Git’da saqlanmaydi.

Yangi local database setup:

```bash
docker compose up -d postgres
cp .env.example .env.local
npm run db:generate
npm run db:migrate:dev
npm run db:seed
```

`db:seed` faqat `development` yoki `test` muhitida ishlaydi va admin email/parolini env’dan talab qiladi. Seed qayta ishga tushirilsa SKU, slug va unique keylar bo‘yicha ma’lumotlarni yangilaydi.

Production deploy:

```bash
npm run db:migrate:deploy
```

Production’da `prisma migrate dev`, `prisma db push`, migration reset yoki boshqa destructive buyruq ishlatmang. Deploydan oldin backup va migration SQL review majburiy.

## Test va QA

DB testlari faqat nomi `_test` bilan tugaydigan `TEST_DATABASE_URL` bazasida
ishlaydi; wrapper production URL yoki `DATABASE_URL` bilan bir xil URLni rad
etadi. Birinchi local ishga tushirish:

```bash
createdb motobike_shop_test
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/motobike_shop_test npm run test:db:setup
npm run test:e2e:install
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/motobike_shop_test npm run test:integration
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/motobike_shop_test npm run test:e2e
```

E2E runner test muhitiga mos production build yaratib, alohida `3100` portda
server ochadi. Manual regression ro‘yxati [`docs/qa-checklist.md`](./docs/qa-checklist.md)
ichida. Production yoki shared development bazasini `TEST_DATABASE_URL` sifatida
bermang.

`20260722030000_admin_catalog_crud` migration mahsulotga `compareAtPrice` va `isFeatured` maydonlarini qo‘shadi. Admin katalogida Products server pagination/filter/sort bilan, Categories va Brands esa uch tilli tahrirlash hamda archive/restore bilan boshqariladi. `ACTIVE` mahsulot stock’i `0` bo‘lsa UI’da `OUT OF STOCK` ko‘rsatiladi; restore mahsulotni avtomatik sotuvga chiqarmasdan `DRAFT` holatiga qaytaradi.

`20260722050000_checkout_idempotency` migration guest checkout uchun unique idempotency key, request fingerprint, `DeliveryMethod` va `CASH_ON_DELIVERY` payment usulini qo‘shadi. Checkout product narxini clientdan olmaydi; order snapshot va stock decrement serializable transaction ichida bajariladi.

Media upload development’da `STORAGE_DRIVER=local` bilan `.local-storage/` ichida ishlaydi. Production’da `STORAGE_DRIVER=s3` tanlanib, `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` va public CDN `STORAGE_PUBLIC_URL` berilishi shart. Bucket public-read/CDN siyosati, CORS va object lifecycle infratuzilmada sozlanadi; credentiallar repoga yozilmaydi. DB yozuvi muvaffaqiyatsiz bo‘lsa yangi object o‘chiriladi, delete vaqtida storage xatosi esa orphan cleanup logiga chiqariladi.

## Admin yaratish va authentication

Public signup, customer login yoki account route’i mavjud emas. Development admin faqat seed orqali, `.env.local` dagi `SEED_ADMIN_EMAIL` va `SEED_ADMIN_PASSWORD` qiymatlaridan yaratiladi:

```bash
npm run db:migrate:dev
npm run db:seed
```

Production admin uchun default credential yo‘q. Tasdiqlangan ops jarayoni env’dan kuchli vaqtinchalik credential bilan seed/provisioning’ni bir marta bajarishi, keyin credentialni rotation qilishi kerak. Seed `NODE_ENV=production` holatida ishlamaydi.

Auth.js JWT session 8 soat amal qiladi. Cookie HttpOnly, SameSite=Lax va production HTTPS’da Secure; active/deleted admin holati har protected page va API requestida DB’dan qayta tekshiriladi. Login email+IP bo‘yicha 5 urinish/15 daqiqada bloklanadi va auth hodisalari audit jadvaliga yoziladi.

Loyiha Next.js 16 va React 19’ni peer dependency sifatida qo‘llaydigan `next-auth@5.0.0-beta.32` versiyasiga aniq pin qilingan. Stable Auth.js v5 chiqqanda release note va migration guide ko‘rilib, nazoratli upgrade qilinadi.
