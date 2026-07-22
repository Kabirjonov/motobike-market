# Mahsulot talablari

## 1. Maqsad va scope

Motobike Shop mototsikllar, ehtiyot qismlar, aksessuarlar va ekipirovkalarni uch tilda ko‘rsatadigan, mehmon xaridorlarga akkauntsiz buyurtma berish va administratorga katalog hamda buyurtmalarni boshqarish imkonini beradigan online marketdir.

Ushbu MVP doirasida:

- public ro‘yxatdan o‘tish, login va foydalanuvchi kabineti bo‘lmaydi;
- faqat admin login va himoyalangan admin panel bo‘ladi;
- online payment, murakkab delivery kalkulyatori, discount va review tizimi biznes tasdig‘igacha kiritilmaydi;
- katalog turlari `MOTORCYCLE`, `PART`, `ACCESSORY`, `GEAR` bilan cheklanadi.

Bog‘liq hujjatlar: [arxitektura](./architecture.md), [route xaritasi](./routes.md), [data model](./data-model.md), [amalga oshirish rejasi](./implementation-plan.md), [ochiq savollar](./open-questions.md).

## 2. Rollar

### Visitor

- Bosh sahifa, katalog va mahsulot sahifalarini autentifikatsiyasiz ko‘radi.
- Mahsulotlarni qidiradi, filtrlaydi va saralaydi.
- Mahsulotni savatga qo‘shadi; savat brauzerda saqlanadi.
- Guest checkout orqali buyurtma beradi va buyurtma raqamini oladi.
- `uz`, `ru`, `en` tillaridan birini tanlaydi.

### Admin

- Credential orqali login qiladi; public admin yaratish oqimi yo‘q.
- Dashboard, mahsulotlar, kategoriyalar va buyurtmalarni boshqaradi.
- Mahsulot tarjimalari, stock, rasmlar, SEO va statusni tahrirlaydi.
- Buyurtma tafsilotini ko‘radi va ruxsat etilgan statusga o‘tkazadi.

## 3. Public katalog

### 3.1 Ko‘rish va qidirish

- Faqat `ACTIVE` mahsulotlar public ko‘rinadi.
- Kartada lokalized nom, asosiy rasm, narx, mavjudlik va tur ko‘rsatiladi.
- Qidiruv tanlangan tildagi nom, fallback `uz` nomi, SKU, motorcycle make/model va part brand/part number bo‘yicha ishlaydi.
- Katalog URL query-state ishlatadi:
  - `q`: trim qilingan matn;
  - `type`: bitta `ProductType`;
  - `category`: category slug;
  - `minPrice`, `maxPrice`: manfiy bo‘lmagan decimal qiymat;
  - `make`, `model`, `yearFrom`, `yearTo`, `condition`: motorcycle filtrlari;
  - `brand`, `partNumber`, `compatibleMake`, `compatibleModel`, `compatibleYear`: part filtrlari;
  - `sort`: `newest` (default), `price-asc`, `price-desc`, `name-asc`;
  - `page`: 1 dan boshlanadi, default `1`; page size MVP’da `24`.
- Noma’lum yoki yaroqsiz query qiymatlari serverda xavfsiz defaultga normalizatsiya qilinadi.

### 3.2 Turga xos ma’lumot

- `MOTORCYCLE`: make, model, year, engine displacement, mileage va condition majburiy.
- `PART`: brand va part number majburiy; compatibility strukturali ro‘yxat sifatida ko‘rsatiladi.
- `ACCESSORY` va `GEAR`: umumiy mahsulot maydonlaridan foydalanadi.
- Barcha turlar: SKU, slug, uch tildagi nom va tavsif, price, currency, stock, status, category, images va SEO maydonlariga ega.

### 3.3 Mahsulot tafsiloti

- Lokalized nom/tavsif, galereya, narx, stock holati, kategoriya va tegishli spec’lar ko‘rsatiladi.
- `stock = 0` bo‘lsa savatga qo‘shish bloklanadi.
- Noto‘g‘ri yoki public bo‘lmagan slug `404` qaytaradi.
- Miqdor 1 dan stockgacha cheklanadi, ammo checkout serveri stockni qayta tekshiradi.

## 4. Savat

- Savat public akkauntga bog‘lanmaydi va Zustand persist orqali localStorage’da saqlanadi.
- Saqlanadigan minimal ma’lumot: `productId`, `quantity`; nom, rasm, narx va stock serverdan qayta olinadi.
- Bir mahsulot qayta qo‘shilsa miqdor oshadi; foydalanuvchi miqdorni o‘zgartirishi yoki item’ni olib tashlashi mumkin.
- O‘chirilgan, arxivlangan yoki stocki yetmaydigan mahsulot aniq ogohlantirish bilan belgilanadi.
- Client subtotal faqat preview; yakuniy summaning authoritative manbasi serverdir.

## 5. Guest checkout va buyurtma

### 5.1 Input kontrakti

Checkout quyidagilarni qabul qiladi:

- `customerName`, `phone` — majburiy;
- `email` — ixtiyoriy, berilsa valid email;
- `region`, `city`, `addressLine` — majburiy;
- `postalCode`, `note` — ixtiyoriy;
- `items`: kamida bitta `{ productId, quantity }`.

Client narx, subtotal, delivery fee yoki total yuborsa ham server ularga ishonmaydi. Server active status, joriy narx va stockni tekshiradi, delivery defaultini qo‘llaydi va transaction ichida order yaratib stockni kamaytiradi.

### 5.2 Natija

- Muvaffaqiyatli javob `{ orderNumber, status }` qaytaradi; boshlang‘ich status `PENDING`.
- Success sahifasi buyurtma raqami, holati va keyingi aloqa haqida xabar ko‘rsatadi.
- Muvaffaqiyatdan keyingina savat tozalanadi.
- Stock yoki narx o‘zgarsa checkout xatosi item darajasida ko‘rsatiladi va savat yangilanishi taklif qilinadi.
- Takror submitdan himoya uchun request davomida tugma bloklanadi; keyingi bosqichda idempotency key qo‘llanadi.

## 6. Admin talablari

### 6.1 Auth

- Login email va parol bilan; xatolar account mavjudligini oshkor qilmaydi.
- Himoyalangan har bir page, Route Handler va Server Action session va rolni tekshiradi.
- Logout sessionni serverda bekor qiladi va cookie’ni o‘chiradi.

### 6.2 Katalog boshqaruvi

- Product list qidiruv, type/status/category filtrlari va pagination beradi.
- Create/edit barcha umumiy maydonlar, uch tarjima, type-spec, category, stock, images va SEO’ni qamraydi.
- SKU va slug unique; type o‘zgarsa mos kelmaydigan spec server qoidasi bilan rad etiladi.
- Mahsulot hard-delete qilinmaydi; `ARCHIVED` qilinadi.
- Kategoriya uch tilda tahrirlanadi; foydalanilayotgan kategoriya o‘chirilmaydi, deactivate/archive qilinadi.
- Image upload, tartiblash, primary belgilash, localized alt text va o‘chirish mavjud.

### 6.3 Buyurtmalar

- Admin order number, mijoz, telefon, sana va status bo‘yicha ko‘radi/filtrlaydi.
- Detail sahifada snapshot itemlar, kontakt, manzil, summalar, izoh va status tarixi ko‘rsatiladi.
- Ruxsat etilgan oqim: `PENDING → CONFIRMED → PROCESSING → SHIPPED → COMPLETED`; `PENDING`, `CONFIRMED` yoki `PROCESSING` dan `CANCELLED`.
- MVP’da cancelled order stockni avtomatik qaytarmaydi; admin ogohlantiriladi. Bu siyosat biznes tasdig‘igacha [ochiq savol](./open-questions.md).

## 7. Lokalizatsiya

- Qo‘llab-quvvatlanadigan locale union: `uz | ru | en`.
- Default va fallback locale `uz`.
- Tanlov localStorage’da `locale` kaliti bilan saqlanadi; yaroqsiz qiymat `uz` ga tushadi.
- UI dictionary va DB tarjimalari bir xil fallback qoidasidan foydalanadi.
- URL locale prefix ishlatmaydi; MVP SEO uchun faqat `uz` canonical/indexable kontent hisoblanadi.
- Admin formasi uch tarjimani boshqaradi; `uz` majburiy, `ru`/`en` bo‘sh qolsa public UI `uz` ni ko‘rsatadi.

## 8. Holatlar va acceptance criteria

Har bir async oqim semantic va accessible loading, empty, error va success holatlariga ega bo‘ladi:

| Oqim           | Talab                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Katalog        | Skeleton/loading, filtrga mos mahsulot yo‘q empty state, retry’li error, pagination va fokus saqlanishi |
| Product detail | Loading shell, `404`, unavailable/stock-out holati, savatga qo‘shilganda accessible confirmation        |
| Savat          | Empty CTA, stale item warning, quantity validation, subtotal refresh                                    |
| Checkout       | Label va inline error, submit pending, server conflict, umumiy error, success redirect                  |
| Admin login    | Pending, generic invalid credential, rate-limit xabari, muvaffaqiyatli redirect                         |
| Admin CRUD     | Initial loading, empty list, field/server error, unsaved/pending holat, save confirmation               |
| Order status   | Pending control, invalid transition error, success toast va yangilangan history                         |

Keyboard navigation, ko‘rinadigan focus, form label/error association, semantic heading/table va mazmunli image alt text majburiy. UI mobile-first va desktopgacha responsive bo‘ladi.

## 9. Non-functional talablar

- Server inputlari Zod bilan parse qilinadi; TypeScript strict saqlanadi.
- Secretlar repo ichiga yozilmaydi; kerakli qiymatlar `.env.example` da hujjatlashtiriladi.
- Public sahifalar SEO, performance va accessibility uchun Server Component-first quriladi.
- Order/stock yozuvlari atomic transaction bo‘ladi; auditga muhim timestamp va actor saqlanadi.
- Production DB’da destructive migration yoki buyruq ishlatilmaydi.
