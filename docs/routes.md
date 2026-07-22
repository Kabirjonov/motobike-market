# Route xaritasi

## 1. Konvensiyalar

- Public route’lar autentifikatsiyasiz; admin route’lar `/admin/login` dan tashqari session talab qiladi.
- Locale URL segment emas. Default/canonical til `uz`; saqlangan `uz | ru | en` preference client UI’da qo‘llanadi.
- Page’lar Server Component-first; interaktiv qismlar alohida Client Component.
- Public registration, public login va user cabinet route’lari yaratilmaydi.

## 2. Public page route’lari

| Method | Route                          | Vazifa                                             | Rendering / SEO                                             |
| ------ | ------------------------------ | -------------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/`                            | Landing, featured category/productlar              | Cached Server Component, index                              |
| GET    | `/catalog`                     | Barcha active mahsulotlar, qidiruv/filtr/sort/page | Cached query, index/canonical normalizatsiya                |
| GET    | `/catalog/[type]`              | `motorcycle`, `part`, `accessory`, `gear` kesimi   | Type validatsiyasi, index                                   |
| GET    | `/products/[slug]`             | Lokalized product detail                           | Cached Server Component, Product JSON-LD                    |
| GET    | `/cart`                        | Lokal savatni ko‘rish va tahrirlash                | Client cart, `noindex`                                      |
| GET    | `/checkout`                    | Guest checkout formasi                             | Dynamic, `noindex`                                          |
| GET    | `/order-success/[orderNumber]` | Yangi order confirmation                           | Guessable bo‘lmagan raqam, `noindex`, sensitive detail yo‘q |

### Katalog query parametrlari

| Parametr                                                                     | Qiymat                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| `q`                                                                          | Qidiruv matni                                   |
| `type`                                                                       | `MOTORCYCLE`, `PART`, `ACCESSORY`, `GEAR`       |
| `category`                                                                   | Category slug                                   |
| `minPrice`, `maxPrice`                                                       | Manfiy bo‘lmagan decimal                        |
| `make`, `model`, `yearFrom`, `yearTo`, `condition`                           | Motorcycle filterlari                           |
| `brand`, `partNumber`, `compatibleMake`, `compatibleModel`, `compatibleYear` | Part filterlari                                 |
| `sort`                                                                       | `newest`, `price-asc`, `price-desc`, `name-asc` |
| `page`                                                                       | Musbat integer, default `1`                     |

Default page size `24`. `/catalog/[type]` path qiymati query `type` dan ustun va conflict query olib tashlanib canonical URL tuziladi.

## 3. Admin page route’lari

| Method | Route                  | Vazifa                                                             |
| ------ | ---------------------- | ------------------------------------------------------------------ |
| GET    | `/admin/login`         | Admin credential login; active session bo‘lsa dashboardga redirect |
| GET    | `/admin`               | Dashboard: order/product summary va action talab qiluvchi holatlar |
| GET    | `/admin/products`      | Product table, search/filter/pagination                            |
| GET    | `/admin/products/new`  | Product yaratish formasi                                           |
| GET    | `/admin/products/[id]` | Product, translation, spec, stock, SEO va media edit               |
| GET    | `/admin/categories`    | Category CRUD/archive va tarjimalar                                |
| GET    | `/admin/orders`        | Order table va status/date qidiruvi                                |
| GET    | `/admin/orders/[id]`   | Order snapshot, customer/delivery va status history                |

Admin layout navigatsiya, session check va logout beradi. Data access va mutationlar layout tekshiruvidan tashqari mustaqil authorization qiladi.

## 4. Route Handlers

API base `/api`; JSON contract success `{ data, meta? }`, error `{ error: { code, message, fieldErrors? } }`.

### Auth

| Method   | Route                     | Auth            | Vazifa                                     |
| -------- | ------------------------- | --------------- | ------------------------------------------ |
| GET/POST | `/api/auth/[...nextauth]` | Auth.js managed | CSRF, credentials callback, session/logout |
| GET      | `/api/admin/session`      | Active admin    | DB-revalidated minimal admin identity      |

Login/logout UI Auth.js server actions orqali ishlaydi. `/admin/:path*` Proxy optimistic redirect qiladi, ammo dashboard layout va admin API’lar alohida DB-backed authorizationni bajaradi.

### Public read va checkout

| Method | Route                          | Auth                | Vazifa                                            |
| ------ | ------------------------------ | ------------------- | ------------------------------------------------- |
| GET    | `/api/catalog/products`        | Public              | Xuddi page bilan bir query contract va pagination |
| GET    | `/api/catalog/products/[slug]` | Public              | Active product detail                             |
| GET    | `/api/catalog/categories`      | Public              | Active localized categorylar                      |
| POST   | `/api/checkout`                | Public + rate limit | Zod validate, transactional guest order yaratish  |

Checkout request faqat customer/contact/address/note va `{ productId, quantity }[]` qabul qiladi. Response `201` va `{ data: { orderNumber, status } }`. Client narxi rad etiladi yoki e’tiborsiz qoldiriladi; server DB narxidan hisoblaydi.

### Admin catalog

| Method        | Route                                       | Vazifa                               |
| ------------- | ------------------------------------------- | ------------------------------------ |
| GET, POST     | `/api/admin/products`                       | List va create                       |
| GET, PATCH    | `/api/admin/products/[id]`                  | Detail va update/archive             |
| GET, POST     | `/api/admin/categories`                     | List va create                       |
| GET, PATCH    | `/api/admin/categories/[id]`                | Detail va update/archive             |
| POST          | `/api/admin/media/upload-url`               | Validated signed upload URL          |
| POST          | `/api/admin/products/[id]/images`           | Uploaded object metadata attach      |
| PATCH, DELETE | `/api/admin/products/[id]/images/[imageId]` | Order/primary/alt update yoki detach |

### Admin orders

| Method | Route                           | Vazifa                          |
| ------ | ------------------------------- | ------------------------------- |
| GET    | `/api/admin/orders`             | Filterlangan paginated list     |
| GET    | `/api/admin/orders/[id]`        | Detail va status history        |
| PATCH  | `/api/admin/orders/[id]/status` | Zod-validated status transition |

Har admin mutation session+role check qiladi, typed error qaytaradi va muvaffaqiyatdan keyin tegishli cache tagni revalidate qiladi.

## 5. HTTP va error qoidalari

- `200/201`: muvaffaqiyat; `204`: body’siz muvaffaqiyat.
- `400`: malformed input; `401`: session yo‘q; `403`: rol yetarli emas.
- `404`: resource yo‘q/yashirilgan; `409`: SKU/slug conflict, stock yoki invalid state transition.
- `422`: field validation; `429`: rate limit; `500`: safe generic error.
- API personal data, auth token yoki stack trace’ni error response’da qaytarmaydi.
