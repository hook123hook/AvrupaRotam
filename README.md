# AvrupaRotam

Slogan: **Avrupa’daki işe, doğru rotayla.**

İki dilli, mobil uyumlu Avrupa iş fırsatları ve aday üyelik platformu. Almanya, Avusturya, Hollanda ve Polonya için resmî portal bağlantılı güncel ilanlar; güvenli üyelik, CV saklama ve ön başvuru takibi içerir.

Türkçe sürüm `/`, tamamen ayrı İngilizce sürüm `/en/` adresindedir. Her iki sürümde vasıflı ve vasıfsız çalışanlara danışmanlık verilebileceği; dört odak ülke dışında profil uygunluğuna göre başka Avrupa ülkelerinin de değerlendirilebileceği açıklanır.

## Geliştirme

```bash
npm install
npm run dev
```

## Operasyon ve mevzuat

1. İŞKUR özel istihdam bürosu yetkilendirmesini ve yurt dışı ilan izinlerini tamamlayın.
2. Şirket unvanı, adres, MERSİS/vergi bilgileri ve iletişim kanallarını ekleyin.
3. KVKK aydınlatma, açık rıza, çerez ve yurt dışı veri aktarımı metinlerini hukuk danışmanıyla doğrulayın.
4. İlan güncelliğini otomatik kontrol eden zamanlanmış görevi ve arşivleme kayıtlarını izleyin.
5. `AvrupaRotam` adı için alan adı, marka ve ticaret unvanı uygunluğunu doğrulayın.

## Veri modeli

- `employers`: doğrulanmış işveren, ülke, şirket kayıt numarası, irtibat.
- `jobs`: kaynak URL, referans numarası, ülke/şehir, sektör, maaş, saat, sözleşme, vize/denklik, yayın ve son kontrol tarihi.
- `profiles`: kullanıcıya bağlı aday profili ve güncel CV bilgileri.
- `applications`: kullanıcıya bağlı ön başvurular ve CV dosya kayıtları.
- CV dosyaları özel nesne depolamada, dosya bilgileri ilişkisel veritabanında tutulur.

Not: `lib/jobs.ts` içindeki ilanlar 6 Eylül 2026 tarihinde araştırılmıştır. İlanların güncel durumu daima kaynak portalda kontrol edilmelidir.

Periyodik kontrol ve değiştirme kuralları `JOB_REFRESH_PROCEDURE.md` dosyasında tanımlanmıştır. Günlük otomasyon, yalnızca doğrulanmış bir değişiklik bulunduğunda yeni site sürümü yayımlar.
