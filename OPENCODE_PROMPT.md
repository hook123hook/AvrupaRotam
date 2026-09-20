# AvrupaRotam — OpenCode geliştirme görevi

Bu klasördeki mevcut projeyi devral. Çalışma dizini Windows üzerinde D:\AvrupaRotam. Yeni bir projeyle üzerine yazma. Önce README_OPENCODE.md, package.json, vite.config.ts, app/, components/career-platform.tsx, components/member-dashboard.tsx, db/, lib/jobs.ts ve JOB_REFRESH_PROCEDURE.md dosyalarını incele. Mevcut özelliklerin envanterini çıkar, eksikleri doğrula ve çalışır bir yerel sürüme kadar ilerle. Kullanıcının dosyalarını koru; anahtar ve parolaları raporlama.

## Amaç ve yaratıcı yön
Site bir filmde kullanılacak profesyonel Avrupa iş ve kariyer danışmanlığı platformudur. Türkçe marka AvrupaRotam, İngilizce marka EuropeRoute. Türkçe slogan: “Avrupa’daki işe, doğru rotayla.” İngilizce slogan: “The right route to your next job in Europe.” Lacivert #0b1f33, turkuaz #159b8c ve kontrollü yeşil vurgular; temiz tipografi, güçlü hiyerarşi, ferah kartlar, mobil ve masaüstünde tutarlı görünüm. Mükemmeliyeti ölçülebilir okunabilirlik, erişilebilirlik, doğru durum yönetimi ve hatasız akış olarak uygula.

Kullanıcıya görünen sayfalarda demo, deneme, prototip, örnek, sample, placeholder, yayın öncesi veya benzeri geçici ifadeler bulunmasın. Teknik kurulum ve film bilgileri geliştirici belgelerinde kalsın. Önceden kaldırılmış sarı ilan bilgilendirme bandını geri getirme. Gerçek olmayan izin numarası, şirket yetkisi, işveren, maaş veya istihdam garantisi üretme.

## Dil ayrımı
Türkçe / ve /account, İngilizce /en/ ve /en/account ayrı içerikler olsun. Başlıklar, açıklamalar, menüler, form alanları, doğrulama hataları, yükleme durumları, başarı mesajları ve erişilebilirlik etiketleri tamamen yerelleştirilsin. İngilizce arayüze Türkçe kelime/karakter girmesin; buna metadata, logo metadatası, modal kapatma etiketi ve tarih biçimi de dahil. Kullanıcının kendi adı/CV adı gibi verilerini çevirme veya bozma. Sunucunun ürettiği html lang değeri rotaya göre doğru olsun; yalnızca tarayıcıdaki effect ile düzeltmeye dayanma.

## Logo
AvrupaRotam-logo.png yeni üretilen tasarım, public/logo-premium.png aynı dosyanın uygulama varlığıdır. Orijinal dosyayı koru. Görünürlük, kenar boşlukları, ölçekleme ve arka plan uyumunu kontrol ederek Türkçe markaya entegre et. İngilizce sürümde Türkçe marka yazılı görsel kullanma; mevcut nötr simgeyi koru veya aynı simgeye EuropeRoute kelime markası uygula. Mevcut SVG logo geri dönüş için korunmuştur.

## İçerik ve hizmetler
Odak ülkeler Almanya, Avusturya, Hollanda, Polonya. Odak sektörler sağlık, lojistik, üretim, teknik/inşaat, bilişim. Danışmanlık sadece bu meslek ve ülkelerle sınırlı değildir: vasıflı ve vasıfsız çalışanlar, destek personeli ve yeni başlayanlar da değerlendirilir. Diğer Avrupa ülkeleri adayın dili, deneyimi, mesleği ve uygunluğuna göre ele alınır. İş/vize garantisi verme.

Önceki sürümlerdeki ülke bilgileri, beş adımlı süreç, güven ilkeleri ve SSS bölümlerini denetle; sunuculu yapıya geçişte kaybolmuşsa tutarlı biçimde geri getir. Footer gizlilik/koşul bağlantıları alakasız bölüm çapalarına gitmesin. Gereken içerikleri ayrı iki dilde oluştur; işletmeye ait bilinmeyen gerçek bilgileri uydurma.

## Üyelik ve CV
Mevcut uygulama Sites tarafından iletilen kullanıcı kimliği ve /signin-with-chatgpt akışına bağlıdır. Bu başlıkları dış dünyadan güvenilir kabul etme. Windows/OpenCode dışında gerçek giriş için desteklenen bir kimlik sağlayıcı veya sunucuda doğrulanan oturum mimarisi kur. Yerel geliştirme kimlik adaptörü gerekiyorsa yalnızca açık geliştirme ayarıyla çalışsın, üretimde kesinlikle kapalı olsun. Sahte giriş ekranını çalışan üyelik diye sunma. Giriş, çıkış, yeni üyelik, mevcut profil görüntüleme/güncelleme ve başvuru geçmişini tamamla. İzin gerektiren harici servis açılışlarından önce yapılabilecek tüm kodu ve kurulum belgesini hazırla.

Üyelik oluştururken CV zorunlu. Her ön başvuruda ayrıca CV alanı zorunlu. PDF, DOC, DOCX; en fazla 5 MB. Dosya yokken istemci ve sunucu reddetsin. Uzantı, MIME ve dosya imzası uyumunu doğrula; yalnızca tarayıcının MIME bilgisine güvenme. Sunucuda gövde boyutu sınırı uygula. CV baytları özel dosya depolamada, sahiplik/metaveri ilişkisel veritabanında olsun. Kullanıcı yalnızca kendi profilini, CV'sini ve başvurularını görebilsin. Güvenli indirme ve CV değiştirme ekle; eski veya veritabanına kaydedilemeyen dosyaları temizle. Dosya yükleme ve kayıt hatasında form verilerini koru, açık hata ver, kayıt gerçekten tamamlanmadan başarı gösterme. Çifte gönderimi engelle; CSRF, oturum doğrulama, sunucu tarafı alan doğrulaması ve oran sınırlaması uygula. Rıza/bilgilendirme kontrolünü sunucuda da doğrula, gerekli kaydı tut.

D1 profiles ve applications şeması ile R2 BUCKET entegrasyonu var. Hazır Drizzle migration dosyaları var; uygulanmış migration'ları değiştirme. Yerelde migration ve depolama kurulumu yoksa tamamla. Üyelik sunucusu dışarı taşınacaksa D1/R2 yerine uyumlu kalıcı depolama adaptörü kullan; localStorage'ı üyelik veya CV için asıl kayıt yeri yapma. Kimlik/depolama çözümünü ve nedenini belgede açıkla.

## İlanlar ve periyodik yenileme
lib/jobs.ts içinde 16 kayıt var; bazıları tekil ilan değil resmî arama koleksiyonu. Bu ayrımı veri modelinde açık tut, arama sayfasını tekil doğrulanmış açık ilan gibi sunma. Kaynaklar: EURES, Bundesagentur für Arbeit / Make it in Germany, AMS, UWV/Werk.nl, ePraca. Mevcut kayıtlar yeni bir doğrulamadan geçirilmiş sayılmaz.

Hedef: her odak ülke için en az iki ve her odak sektör için en az iki doğrulanabilir gerçek ilan; aynı ilan her iki koşulu da karşılayabilir. Uygun kayıt bulunamazsa uydurma; eksikliği bakım kaydında belirt. Daha fazla açık pozisyon olduğunu profesyonel bir bağlantıyla vurgula.

Gerçek bir arka plan görevi uygula: varsayılan günde bir, yapılandırılabilir; Windows Görev Zamanlayıcı veya seçilen sunucu zamanlayıcısı. Tarayıcı açık olmasına bağlı olmasın. HTTP 200 tek başına açık ilan kanıtı değildir. Son başvuru tarihi, kapalı/kaldırıldı içerikleri ve kaynak detaylarını kontrol et. 403/429/5xx veya zaman aşımını otomatik “kapalı” sayma. Kanıtlı kapanan ilanı yayından kaldır/arşivle; aynı ülke ve tercihen aynı sektörden yeni doğrulanmış ilanla değiştir. Her iki dilin aynı kaynak kimliklerine bağlı kalmasını sağla. Son kontrol zamanını gerçek başarılı kontrolden yaz. Tekrarlı çalıştırmada kopya kayıt üretme; timeout, geri çekilme, istek hızı, eşzamanlı çalışma kilidi ve bakım raporu ekle. Kaynak erişim koşullarına uy; korumaları aşma. Harici ChatGPT otomasyonu ZIP ile taşınmaz: bu görev ayrıca kurulmalı.

## Teknik uygulama ve kabul
Mevcut stack React 19, TypeScript, Vinext/Vite, Tailwind ve Shadcn; Cloudflare Worker/D1/R2. Windows uyumlu npm dev/build/start/db:generate komutları ihracat paketinde var. node_modules ve derleme çıktıları dahil değildir. Node >=22.13 gerekir. Gereksiz bağımlılık veya mimari değişiklik yapma; harici ortam için gereken farkları kontrollü uygula.

Önce npm ci ve derleme/typecheck sonuçlarını değerlendir. API kimlik doğrulaması, sahiplik, zorunlu CV, bozuk/yanlış tür/aşırı büyük dosya, kayıt hatası, tekrar gönderim ve iki dilli durumlar için anlamlı testler ekle. Kayıt -> CV -> yeniden giriş -> profil -> ön başvuru -> geçmiş zincirini uçtan uca doğrula. Mobil/masaüstü, klavye odağı, modal kapatma, boş liste ve servis hatalarını kontrol et. Kaybolan içerik ve kırık bağlantıları gider. Gereksiz silme, canlı yayına alma veya ücretli servis açma yapma. Sonunda çalışan özellikleri, kalan dış servis gereksinimlerini ve Windows başlatma komutlarını kısa ve dürüst biçimde raporla.
