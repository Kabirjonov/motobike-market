# Ochiq biznes savollari va MVP defaultlari

Bu defaultlar implementatsiyani xavfsiz boshlash uchun vaqtinchalik. Ular biznes qarori emas. “Tasdiqlash muddati” ustunidagi bosqich boshlanishidan oldin product owner javobi olinadi; javob bo‘lmasa ko‘rsatilgan default qo‘llanadi va konfiguratsiyalanadigan qilib quriladi.

| #   | Ochiq savol                                      | Xavfsiz MVP default                                                                                  | Tasdiqlash muddati                  |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | Asosiy currency va boshqa currency kerakmi?      | Faqat `UZS`; model ISO currency saqlaydi, conversion yo‘q                                            | Prisma/schema bosqichidan oldin     |
| 2   | Payment provider va payment flow qanday?         | `CASH_OR_MANUAL`; online payment va card data yo‘q, order `PENDING`                                  | Checkout bosqichidan oldin          |
| 3   | Yetkazib berish hududi va narxi qanday?          | Bitta konfiguratsion xizmat hududi va bitta flat fee; hudud tashqarisi rad etiladi                   | Checkout bosqichidan oldin          |
| 4   | Soliq narx ichidami va alohida ko‘rsatiladimi?   | Soliq alohida hisoblanmaydi; product price final katalog narxi                                       | Checkout bosqichidan oldin          |
| 5   | Stock qachon rezerv/kamayadi?                    | Muvaffaqiyatli checkout transactionida darhol kamayadi; alohida reservation expiry yo‘q              | Checkout bosqichidan oldin          |
| 6   | Cancellation stockni avtomatik qaytaradimi?      | Yo‘q; admin warning va manual stock adjustment. Audit talab qilinadi                                 | Order admin bosqichidan oldin       |
| 7   | Order notification kanallari qaysi?              | Email/SMS/Telegram integratsiyasiz; admin panel list va dashboard orqali tracking                    | Checkout/release oldidan            |
| 8   | Media provider va limitlar qanday?               | S3-compatible provider; JPEG/PNG/WebP/AVIF; SVG yo‘q; max size env/config                            | Media bosqichidan oldin             |
| 9   | Admin soni, rollar, 2FA va recovery?             | Bitta `SUPER_ADMIN`; public invite/recovery/2FA yo‘q; credential ops orqali boshqariladi             | Auth va production release oldidan  |
| 10  | Part compatibility qanchalik chuqur?             | Make/model, optional year range va engine; VIN/OEM catalog integration yo‘q                          | Prisma va katalog bosqichidan oldin |
| 11  | Ko‘p tilli sahifalar SEO’da indekslanadimi?      | URL prefix yo‘q, faqat `uz` canonical/indexable; `ru/en` UI preference                               | Public katalog bosqichidan oldin    |
| 12  | Category hierarchy kerakmi?                      | Bir darajali category; parent/child yo‘q                                                             | Prisma bosqichidan oldin            |
| 13  | Motorcycle condition qiymatlari?                 | `NEW`, `USED`; certified/damaged kabi subtype yo‘q                                                   | Prisma bosqichidan oldin            |
| 14  | Order success sahifasida qancha detail ochiladi? | Faqat guessable bo‘lmagan order number, status va generic yo‘riqnoma; manzil/item PII ko‘rsatilmaydi | Checkout bosqichidan oldin          |
| 15  | Discount, promo va refund kerakmi?               | MVP’dan tashqari; total = subtotal + delivery fee                                                    | Checkout bosqichidan oldin          |

## Qaror qayd etish formati

Har savol yopilganda jadval defaulti yangilanadi va quyidagi decision log qo‘shiladi:

```text
Sana:
Qaror egasi:
Qaror:
Sabab:
Ta'sirlangan hujjat/bosqich:
Migration yoki backward compatibility ta'siri:
```

## Bloklovchi qoidalar

- Currency precision, tax yoki payment provider defaultdan farq qilsa checkout/schema implementatsiyasi tasdiqsiz boshlanmaydi.
- Stock restore/reservation o‘zgarsa concurrency va order lifecycle testlari qayta belgilanishi kerak.
- Locale-prefixed SEO tanlansa route xaritasi, canonical/hreflang, sitemap va persistence strategiyasi birga yangilanadi.
- Media provider tanlanmaguncha provider adapter interface qurilishi mumkin, lekin production upload yoqilmaydi.
- 2FA/recovery bo‘lmasa production admin credential uchun ops runbook va secret rotation majburiy.
