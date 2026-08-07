# SEO production checklist

## Release oldidan

- `NEXT_PUBLIC_APP_URL` production HTTPS originiga teng va trailing path yo‘q.
- `/robots.txt` va `/sitemap.xml` production origin bilan javob beradi.
- URL prefixsiz yagona canonical ishlatiladi; faqat default `uz` indekslanadi.
- Active product/category/brand URL’lari sitemapda; draft, archived, admin, cart va checkout yo‘q.
- Filterlangan katalog `noindex,follow`; canonical locale katalogning querysiz URL’i.
- Product JSON-LD Google Rich Results Test’da `Product` va `Offer` sifatida taniladi; rating faqat haqiqiy DB ma’lumoti bo‘lsa qo‘shiladi.
- Product narx, currency, availability va rasmlar DB javobiga mos.
- Open Graph/Twitter preview uch locale va mobil ulashishda tekshirilgan.
- Slug o‘zgartirish eski URL’dan yangi localized URL’ga permanent redirect yaratadi; redirect chain/loop yo‘q.
- Bitta sahifada bitta semantik `h1`, keyingi sarlavhalar tartibli, barcha content rasmlarda mazmunli localized `alt` mavjud.
- Google Search Console sitemap yuborilgan, indexing va Core Web Vitals kuzatuvi yoqilgan.

## Katta katalog

50 000 URL chegarasiga yaqinlashganda `generateSitemaps` orqali mahsulot sitemaplarini barqaror ID diapazonlari bo‘yicha bo‘lish kerak. Har sitemap 50 MB uncompressed limitidan kichik qolishi shart.
