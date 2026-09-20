> Dışa aktarılan pakette zamanlanmış görev çalışmaz; bu belge uygulanacak bakım prosedürüdür. OpenCode promptundaki güncel veri ve doğrulama kuralları önceliklidir.

# İlan Yenileme Prosedürü

Bu prosedür AvrupaRotam/sitesi resmi kaynak bağlantılı ilanların periyodik bakımını tanımlar. Amaç kapanmış veya kaldırılmış ilanları sitede tutmamak, bunların yerine aynı ülke ve mümkün olduğunca aynı sektörden güncel ilan koymaktır.

## Kapsam

- Türkçe ilan verisi: `lib/jobs.ts` (jobsTr)
- İngilizce ilan verisi: `lib/jobs.ts` (jobsEn)
- Türkçe kaynak kontrol tarihi: `app/page.tsx`
- İngilizce kaynak kontrol tarihi: `app/en/page.tsx`
- Öncelikli kaynaklar: EURES, Make it in Germany / Bundesagentur für Arbeit, AMS Austria, UWV/Werk.nl ve Polonya ePraca.

## Her çalıştırmada uygulanacak sıra

1. Mevcut `jobs` dizilerindeki her benzersiz kaynak URL'sini ziyaret et.
2. HTTP yanıtının başarılı olması tek başına yeterli değildir. Sayfada ilanın süresinin dolduğu, kaldırıldığı, bulunamadığı veya başvuruya kapandığına ilişkin içerik kontrolü yap.
3. Kaynakta açıkça bir son başvuru tarihi varsa geçerli tarihle karşılaştır.
4. Aynı URL'deki başlık, şehir, sözleşme, ücret, çalışma süresi ve yayın tarihi değişmişse Türkçe ve İngilizce kartı güncelle.
5. İlan kapalıysa önce aynı resmî portalda aynı ülke + aynı sektör kombinasyonunda yeni ve açık bir ilan ara.
6. Aynı sektör bulunamazsa aynı ülkedeki benzer beceri seviyesinde bir ilan kullan. Bu da bulunamazsa ilanı uydurma; mevcut kartı değiştirmeden bakım raporunda engeli belirt.
7. Yeni ilanı kabul etmek için iş unvanı, ülke/şehir, kaynak kurumu, doğrudan ilan URL'si veya resmî canlı arama URL'si ve güncellik kanıtı bulunmalıdır.
8. Maaş, vize desteği, konaklama veya denklik bilgisi kaynakta yoksa tahmin etme ve ekleme.
9. Türkçe ve İngilizce dizilerde aynı ilan sayısını, aynı sıralamayı ve aynı kaynak URL'lerini koru. İngilizce sayfaya Türkçe kelime ya da Türkçe karakter sokma.
10. Her sektör için en az iki sonuç ve Almanya, Avusturya, Hollanda, Polonya ülkelerinin her biri için en az iki sonuç veya resmî canlı arama kaydı bulundurmaya devam et.
11. Her iki sayfadaki “son kaynak kontrolü” tarihini gerçek kontrol tarihiyle güncelle.
12. `node --check dist/app.js` ve `node --check dist/en/app.js` kontrollerini çalıştır.
13. İngilizce dosyalarda `[çğıöşüÇĞİÖŞÜ]` ve yaygın Türkçe arayüz kelimelerini tara; eşleşme varsa yayından önce düzelt.
14. Değişiklik varsa mevcut AvrupaRotam Sites projesine yeni sürüm olarak kaydet ve mevcut özel erişim politikasını değiştirmeden yayımla.
15. Değişiklik yoksa yeni site sürümü oluşturma.

## Güvenlik ve yayın kuralları

- İş ilanı veya işveren uydurulmaz.
- Arama motoru özeti tek kanıt sayılmaz; mümkünse doğrudan resmî ilan sayfası açılır.
- Ticari iş panoları yalnızca resmî kaynakta uygun ilan bulunamadığında araştırma ipucu olarak kullanılabilir; site kartının kaynak bağlantısı resmî kuruma gitmelidir.
- Kapanmış ilan yeni ilan bulunmadan sessizce başka bir ülke veya sektörle değiştirilmez.
- Site erişimi, alan adı, yasal uyarılar ve İŞKUR izin alanı otomatik görev tarafından değiştirilmez.
- Her çalıştırma sonunda kontrol edilen, değiştirilen ve doğrulanamayan ilan sayıları kısa raporda belirtilir.
