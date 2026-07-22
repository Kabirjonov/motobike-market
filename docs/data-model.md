# Data model

## 1. Umumiy qoidalar

- PostgreSQL + Prisma ORM.
- Primary keylar `String` UUID/CUID; tashqi ko‘rinadigan order identifikatori alohida `orderNumber`.
- Barcha timestamp UTC: `createdAt`, `updatedAt`; kerakli joyda `archivedAt`, `expiresAt`.
- Pul `Decimal(12,2)` va `currency String @db.Char(3)`; `Float` ishlatilmaydi.
- Locale enum: `UZ`, `RU`, `EN`; application mapping `uz | ru | en`.
- Product/category hard-delete qilinmaydi; archive/deactivate qilinadi.

## 2. Enumlar

```text
ProductType      MOTORCYCLE | PART | ACCESSORY | GEAR
ProductStatus    DRAFT | ACTIVE | ARCHIVED
MotorCondition  NEW | USED
OrderStatus      PENDING | CONFIRMED | PROCESSING | SHIPPED | COMPLETED | CANCELLED
AdminRole        SUPER_ADMIN
Locale           UZ | RU | EN
```

Order status transitionlari [product requirements](./product-requirements.md) dagi oqim bilan cheklanadi.

## 3. Entitylar

### AdminUser

| Maydon         | Tip / qoida                        |
| -------------- | ---------------------------------- |
| `id`           | PK                                 |
| `email`        | normalized lowercase, unique       |
| `passwordHash` | Argon2id hash                      |
| `name`         | required                           |
| `role`         | `AdminRole`, default `SUPER_ADMIN` |
| `isActive`     | boolean, default true              |
| `lastLoginAt`  | nullable                           |
| timestamps     | created/updated                    |

Relations: `AdminUser 1—N AdminSession`, `AdminUser 1—N OrderStatusHistory` actor sifatida. Prisma modeli kelajakdagi vazifalarni ajratish uchun `SUPER_ADMIN`, `CATALOG_MANAGER`, `ORDER_MANAGER` rollarini qo‘llaydi.

### AdminSession

| Maydon                    | Tip / qoida                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `id`                      | PK                                                              |
| `adminId`                 | FK → Admin, cascade on admin deletion faqat dev/test siyosatida |
| `tokenHash`               | unique, raw token saqlanmaydi                                   |
| `expiresAt`               | required/indexed                                                |
| `revokedAt`               | nullable                                                        |
| `createdAt`, `lastUsedAt` | audit                                                           |

Index: `(adminId, expiresAt)`, `expiresAt`.

### AdminAuditLog

Admin login success/failure, logout va protected access denial hodisalari. Optional admin FK, HMAC-hashed identifier/IP, safe user-agent, JSON metadata va timestamp saqlanadi; raw password, session token yoki to‘liq PII saqlanmaydi.

### AuthRateLimit

HMAC-derived unique key, atomic attempts counter, window start, block expiry va update timestamp. Login email va ishonchli proxy taqdim etgan IP bo‘yicha 5 urinish/15 daqiqa siyosatini ta’minlaydi.

### Category

| Maydon      | Tip / qoida        |
| ----------- | ------------------ |
| `id`        | PK                 |
| `slug`      | unique             |
| `isActive`  | default true       |
| `sortOrder` | integer, default 0 |
| timestamps  | created/updated    |

Relations: `Category 1—N CategoryTranslation`, `Category 1—N Product`. MVP kategoriya bir darajali; hierarchy keyingi qaror.

### CategoryTranslation

`id`, `categoryId`, `locale`, `name`, optional `description`, optional `seoTitle`, optional `seoDescription`. Unique `(categoryId, locale)`; `(locale, name)` search index.

### Brand

`id`, unique `name` va `slug`, optional website URL, active/archive holati va timestamps. `Brand 1—N Product`; brand hard-delete qilinmaydi.

### Product

| Maydon       | Tip / qoida                                      |
| ------------ | ------------------------------------------------ |
| `id`         | PK                                               |
| `type`       | `ProductType`                                    |
| `status`     | `ProductStatus`, default `DRAFT`                 |
| `sku`        | unique, case-normalized                          |
| `categoryId` | FK → Category, restrict delete                   |
| `brandId`    | optional FK → Brand, restrict delete             |
| `price`      | `Decimal(12,2)`, non-negative service validation |
| `currency`   | ISO code, MVP `UZS`                              |
| `stock`      | integer, `>= 0`                                  |
| `archivedAt` | nullable; status bilan izchil                    |
| timestamps   | created/updated                                  |

Relations: translations, images, optional motorcycle spec, optional part spec, order item references. Indexlar: `(status, type, createdAt)`, `(status, categoryId, createdAt)`, `(status, price)`.

Invariantlar:

- `MOTORCYCLE` aynan bitta `MotorcycleSpec`, `PART` aynan bitta `PartSpec` oladi.
- `ACCESSORY`/`GEAR` type-spec olmaydi.
- `ACTIVE` qilishdan oldin `uz` translation, active category, price, SKU, slug va kamida bitta image talab qilinadi.

### ProductTranslation

`id`, `productId`, `locale`, `slug`, `name`, `description`, optional `shortDescription`, optional `seoTitle`, optional `seoDescription`. Unique `(productId, locale)` va `(locale, slug)`; qidiruv uchun `(locale, name)` index. `UZ` active mahsulot uchun majburiy, `RU/EN` optional va `UZ` ga fallback.

### MotorcycleSpec

| Maydon      | Tip / qoida                      |
| ----------- | -------------------------------- |
| `productId` | PK/FK → Product, one-to-one      |
| `make`      | required/indexed                 |
| `model`     | required/indexed                 |
| `year`      | integer, reasonable range Zod’da |
| `engineCc`  | positive integer                 |
| `mileageKm` | non-negative integer             |
| `condition` | `MotorCondition`                 |

Composite indexlar: `(make, model, year)`, `(condition, year)`.

### PartSpec

`productId` PK/FK, `brand` required/indexed, `partNumber` required. Normalized `(brand, partNumber)` unique bo‘lishi biznes tasdig‘igacha majburiy emas, ammo indexlanadi. Relations: `PartSpec 1—N PartCompatibility`.

### PartCompatibility

`id`, `partSpecId`, `make`, `model`, optional `yearFrom`, optional `yearTo`, optional `engineCc`, optional `note`. `yearFrom <= yearTo` Zod/service bilan tekshiriladi. Duplicate’ni cheklash uchun `(partSpecId, make, model, yearFrom, yearTo, engineCc)` composite unique. Bu entity promptdagi structured compatibility’ni ifodalaydi.

### ProductImage

`id`, `productId`, `objectKey` unique, `url`, `sortOrder`, `isPrimary`, `altUz`, optional `altRu`, optional `altEn`, timestamps. Index `(productId, sortOrder)`. Har product uchun faqat bitta primary image service va imkon bo‘lsa partial unique DB index bilan ta’minlanadi.

### Order

| Maydon                             | Tip / qoida                                  |
| ---------------------------------- | -------------------------------------------- |
| `id`                               | PK                                           |
| `orderNumber`                      | unique, guessable bo‘lmagan public reference |
| `status`                           | `OrderStatus`, default `PENDING`             |
| `paymentMethod`, `paymentStatus`   | Payment lifecycle snapshot/current state     |
| `fulfillmentStatus`                | Fulfillment lifecycle current state          |
| `customerName`, `phone`            | required                                     |
| `email`                            | nullable                                     |
| `region`, `city`, `addressLine`    | required snapshot                            |
| `postalCode`, `note`               | nullable                                     |
| `subtotal`, `deliveryFee`, `total` | `Decimal(12,2)`                              |
| `currency`                         | ISO code                                     |
| timestamps                         | created/updated                              |

Invariant: `total = subtotal + deliveryFee` MVP’da soliq/discount yo‘qligi sabab. Indexlar: `(status, createdAt)`, `createdAt`, normalized phone.

### OrderItem

| Maydon                               | Tip / qoida                                |
| ------------------------------------ | ------------------------------------------ |
| `id`                                 | PK                                         |
| `orderId`                            | FK → Order, cascade faqat order bilan      |
| `productId`                          | nullable FK → Product, `SetNull`           |
| `productType`, `sku`, `slug`, `name` | checkout-time snapshot                     |
| `unitPrice`                          | `Decimal(12,2)` snapshot                   |
| `quantity`                           | positive integer                           |
| `lineTotal`                          | `Decimal(12,2)` server hisoblagan snapshot |

Order item snapshot product keyinchalik o‘zgarsa/arxivlansa ham tarixni saqlaydi. Unique `(orderId, productId)` productId mavjud holat uchun service darajasida cart consolidation bilan ta’minlanadi.

### OrderStatusHistory

Audit entity: `id`, `orderId`, `fromStatus` nullable, `toStatus`, payment/fulfillment old/new statuslari, `actorAdminUserId` nullable (checkout initial event), optional `note`, `createdAt`. Index `(orderId, createdAt)`.

### SiteSetting

Localized konfiguratsiya: `key`, `locale`, JSON `value`, description va public flag. Unique `(key, locale)`.

### Redirect

Unique source path, destination path, `301 | 308 | 307` semantikasidagi status enum, active/expiry va timestamps. Redirect loop service darajasida rad etiladi.

## 4. Munosabatlar

```text
AdminUser 1 ── N AdminSession
AdminUser 1 ── N OrderStatusHistory
AdminUser 1 ── N AdminAuditLog
Category 1 ── N CategoryTranslation
Category 1 ── N Product
Brand 1 ── N Product
Product 1 ── N ProductTranslation
Product 1 ── N ProductImage
Product 1 ── 0..1 MotorcycleSpec
Product 1 ── 0..1 PartSpec
PartSpec 1 ── N PartCompatibility
Order 1 ── N OrderItem
Order 1 ── N OrderStatusHistory
Product 1 ── N OrderItem (nullable historical reference)
```

## 5. Transaction va concurrency

- Checkout: barcha productlarni qayta o‘qish → active/stock check → totals → order/items/history create → conditional stock decrement, bitta transaction.
- Concurrent checkout oversell qilmasligi uchun stock decrement `stock >= requested` sharti bilan atomic bo‘ladi; bittasi muvaffaqiyatsiz bo‘lsa transaction rollback.
- Admin SKU/slug conflict DB unique error’dan typed `409` ga map qilinadi.
- Order status update current statusni tekshiradi, history yozadi va bitta transactionda yangilaydi.
- Cancellation stock restore biznes qarorigacha avtomatik qilinmaydi.
