# AvrupaRotam — OpenCode kaynak paketi

Bu paket en son yerel üyelik/CV geliştirmesinin kaynak kodudur; canlı sitedeki sürümle aynı olduğu veya üyelik akışının canlı ortamda test edildiği iddia edilmez. Önceki kaynak derlemesi başarılıdır. Bu pakette Windows komutları uyarlanmıştır; Windows üzerinde henüz çalıştırılmamıştır.

## Windows'a yerleştirme
ZIP içindeki üst klasör AvrupaRotam'dır. ZIP'i D:\ içine açınca D:\AvrupaRotam oluşur. Mevcut aynı adlı klasör varsa önce yedekle; üzerine otomatik yazma.

PowerShell (ZIP dosyası İndirilenler klasöründeyse):

```powershell
$zipPath = Join-Path $env:USERPROFILE 'Downloads\AvrupaRotam-OpenCode.zip'
if (Test-Path 'D:\AvrupaRotam') { throw 'Hedef klasör var. Önce yedekleyin veya başka konuma çıkarın.' }
Expand-Archive -LiteralPath $zipPath -DestinationPath 'D:\'
Set-Location 'D:\AvrupaRotam'
npm ci
npm run dev
```

Node.js 22.13 veya üzeri ve npm gereklidir. Terminalin bildirdiği yerel adresi açın. OpenCode'da bu klasörü çalışma dizini seçin ve OPENCODE_PROMPT.md içeriğini görev olarak verin. OpenCode kurulumu bu pakete dahil değildir.

## Neler var?
- Türkçe/İngilizce sayfalar, iş filtreleri ve danışmanlık içeriği.
- Üyelik, hesap ve ön başvuru kaynak kodu; iki aşamada zorunlu CV alanı.
- D1 şeması ve migration; R2 dosya kaydı; kullanıcı kimliğine bağlı veri sorguları.
- AvrupaRotam-logo.png ve public/logo-premium.png: yeni PNG tasarım. Eski SVG korunur; yeni logo arayüze henüz bağlanmadı.
- OPENCODE_PROMPT.md: önceki isteklerin gereksinimleri ve kalan teknik işler.

## Taşınabilirlik ve açık işler
Sites kullanıcı başlıkları ile /signin-with-chatgpt dış ortamda kendiliğinden çalışmaz. Yerel sayfalar açılabilse de üyelik için kimlik adaptasyonu gerekir. D1 migration'ları uygulanmalı ve R2 bağlanmalıdır. Bulut verileri, CV'ler, oturumlar ve ChatGPT zamanlanmış görevleri ZIP'e dahil değildir. İlan kaynağı lib/jobs.ts'dir; eski prosedürdeki dist yolları artık geçerli değildir.

Dışa aktarmada Sites proje kimliği kaldırıldı; kaynak projede değişmedi. Bu paket mevcut Site'ye otomatik yayın yapmaz. Geliştirme cache'leri, .git geçmişi, node_modules, gizli ortam dosyaları ve kişisel veriler eklenmedi. npm scriptleri Windows uyumludur; scripts/ altındaki eski Bash yardımcıları yalnızca referans içindir. Eski npm test hedefi bulunmayan test klasörüne işaret ettiği için kaldırıldı; OpenCode anlamlı testleri oluşturmalıdır.

Kontroller: npm run build, npm run typecheck. Üyelik ve CV güvenliği dahil ayrıntılı tamamlanma ölçütleri OPENCODE_PROMPT.md'dedir.

## Logo üretimi
Yerleşik görsel oluşturma ile üretildi. İstek: sofistike Avrupa kariyer danışmanlığı kimliği; A harfi ile yükselen rota birleşimi, lacivert/turkuaz, AvrupaRotam kelime markası, PNG. Bu tasarımın İngilizce sayfaya Türkçe marka metni taşımadan uyarlanması gerekir.
