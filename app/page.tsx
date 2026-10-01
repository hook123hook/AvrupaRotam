import { CareerPlatform, type PlatformCopy } from "@/components/career-platform";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { getPublishedJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

const copy: PlatformCopy = {
  skip:"İçeriğe geç", official:"Resmî kaynak bağlantılı güncel iş fırsatları", checked:"Kaynaklar düzenli olarak kontrol edilir",
  jobs:"İş ilanları", advisory:"Danışmanlık", process:"Süreç", account:"Üye hesabım", member:"Üye ol", language:"TR / EN",
  eyebrow:"Şeffaf Avrupa kariyer platformu", title:"Avrupa’daki işe,", titleAccent:"doğru rotayla.", lead:"Vasıflı ve vasıfsız çalışanlar için doğrulanabilir iş fırsatları, profil danışmanlığı ve güvenli başvuru yönetimi.",
  viewJobs:"Açık pozisyonları gör ↓", generalApply:"Genel ön başvuru", statCountries:"odak ülke", statProfiles:"profil danışmanlığı", statOpportunities:"güncel fırsat",
  routeTitle:"Rotanı filtrele", routeText:"Ülke ve meslek alanına göre açık pozisyonları bul.", all:"Tümü", country:"Ülke", sector:"Sektör", show:"İlanları getir →", assessment:"Başvurular profil ve pozisyon uygunluğuna göre değerlendirilir.",
  memberEyebrow:"AvrupaRotam üyeliği", memberTitle:"Kariyer dosyanız tek yerde.", memberText:"Üyeliğinizi oluşturun, CV’nizi güvenle ekleyin ve ön başvurularınızı hesabınızdan takip edin.",
  memberBenefit1:"Kişisel aday profili", memberBenefit2:"Güvenli CV kaydı", memberBenefit3:"Başvuru geçmişi", openMembership:"Üyeliğimi oluştur",
  currentEyebrow:"Güncel açık pozisyonlar", currentTitle:"Doğrulanabilir fırsatlar", currentText:"İlan ayrıntılarını resmî kaynağında inceleyin ve CV’nizle ön başvuru yapın.",
  officialSource:"Resmî kaynak", verify:"Kaynakta doğrula", interested:"Ön başvuru", moreTitle:"Daha fazla açık pozisyon var.", moreText:"EURES ve ulusal istihdam portallarında yeni fırsatlar düzenli olarak yayımlanır.", eures:"EURES fırsatları",
  advisoryTitle:"Profilinize göre Avrupa rotası.", advisoryText:"Danışmanlık, belirli meslekler veya dört odak ülkeyle sınırlı değildir.", skilledTitle:"Vasıflı ve vasıfsız çalışanlar", skilledText:"Meslek sahipleri, teknik çalışanlar, yeni başlayanlar ve destek personeli için profil değerlendirmesi ve süreç danışmanlığı.",
  countriesTitle:"Uygun profillere daha fazla ülke", countriesText:"Dil, deneyim, meslek, vize uygunluğu ve işveren talebine göre diğer Avrupa ülkeleri de değerlendirilir.",
  processTitle:"Beş adımda şeffaf süreç", steps:["Üyelik ve CV","Profil değerlendirme","İşveren görüşmesi","Teklif ve sözleşme","Vize ve yerleşim"],
  footerLine:"Avrupa’daki işe, doğru rotayla.", corporate:"Kurumsal", privacy:"Gizlilik ve güven", terms:"Kullanım koşulları",
  membershipDialog:"Üyeliğinizi oluşturun", membershipDescription:"Aday profiliniz ve CV’niz hesabınıza güvenli biçimde kaydedilir.", fullName:"Ad soyad", email:"E-posta", phone:"Telefon", occupation:"Meslek / uzmanlık",
  cv:"Özgeçmiş (CV)", cvHelp:"PDF, DOC veya DOCX · En fazla 5 MB", consent:"Kişisel verilerimin üyelik ve aday değerlendirmesi kapsamında işlenmesini kabul ediyorum.", saveMembership:"Üyeliği tamamla", saving:"Kaydediliyor…", membershipSuccess:"Üyeliğiniz oluşturuldu ve CV’niz güvenle kaydedildi.",
  applicationDialog:"Ön başvurunuzu tamamlayın", applicationDescription:"Her ön başvuru güncel bir CV ile birlikte değerlendirilir.", targetRole:"Pozisyon", targetCountry:"Hedef ülke", experience:"Deneyim ve dil seviyesi",
  sendApplication:"Ön başvuruyu gönder", applicationSuccess:"Ön başvurunuz ve CV’niz alınmıştır. Ekibimiz uygunluk değerlendirmesi için sizinle iletişime geçecektir.",
  error:"İşlem şu anda tamamlanamadı. Bilgilerinizi koruyarak yeniden deneyin.", invalidCv:"Lütfen 5 MB’tan küçük PDF, DOC veya DOCX biçiminde bir CV ekleyin.", signIn:"Giriş yap",
};

export default async function Home() {
  const user = await getChatGPTUser();
  const jobs = await getPublishedJobs("tr");
  return <CareerPlatform locale="tr" brand="AvrupaRotam" languageHref="/en/" jobs={jobs} copy={copy} user={user && { displayName:user.displayName, email:user.email }} signInPath={chatGPTSignInPath("/")} />;
}
