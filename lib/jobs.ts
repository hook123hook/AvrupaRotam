export type Job = {
  country: string;
  flag: string;
  sector: string;
  title: string;
  company: string;
  city: string;
  type: string;
  source: string;
  url: string;
};

const urls = {
  physio: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-10000-1206395313-S",
  pharmacist: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-10000-1206984162-S",
  painter: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-10000-1205877550-S",
  industrial: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-10001-1002712743-S",
  building: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-10001-1001694593-S",
  facilities: "https://www.make-it-in-germany.com/en/working-in-germany/job-listings/job/job-15718-k43631.10494-S",
  warehouseA: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/6a4c06d8e4c45b6b7a563568321e5aeb",
  warehouseB: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/14b447778ae2f710b7d4d0fed4549a20",
  metal: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/6c4a055c427d9fa55eff54f52d4239af",
  java: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/80ec0e565f4a4897c8d527291620ac81",
  qa: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/4b7f7c32501811e44217abcaecef1e73",
  driver: "https://oferty.praca.gov.pl/portal/lista-ofert/szczegoly-oferty/25093e703f8930f6dd65a5d6f52b491a",
  ams: "https://jobs.ams.at/public/emps/",
  werk: "https://www.werk.nl/werkzoekenden/vacatures/",
};

export const jobsTr: Job[] = [
  {country:"Almanya",flag:"🇩🇪",sector:"Sağlık",title:"Fizyoterapist",company:"Christian Konz Krankengymnastik",city:"Ettlingen",type:"Süresiz",source:"Make it in Germany / BA",url:urls.physio},
  {country:"Almanya",flag:"🇩🇪",sector:"Sağlık",title:"Eczacı",company:"Apotheke im Markt-Center",city:"Potsdam",type:"Tam / yarı zamanlı",source:"Make it in Germany / BA",url:urls.pharmacist},
  {country:"Almanya",flag:"🇩🇪",sector:"Üretim",title:"Araç Boya Ustası",company:"Karosserie & Lackzentrum Hallertau",city:"Rudelzhausen",type:"Tam zamanlı",source:"Make it in Germany / BA",url:urls.painter},
  {country:"Almanya",flag:"🇩🇪",sector:"Teknik & İnşaat",title:"Endüstriyel Elektrikçi",company:"Tönnies Lebensmittel GmbH",city:"Rheda-Wiedenbrück",type:"Tam zamanlı",source:"Make it in Germany / BA",url:urls.industrial},
  {country:"Almanya",flag:"🇩🇪",sector:"Teknik & İnşaat",title:"Bina Elektrikçisi",company:"Bausanierung Bender",city:"Saarbrücken",type:"Tam zamanlı",source:"Make it in Germany / BA",url:urls.building},
  {country:"Almanya",flag:"🇩🇪",sector:"Teknik & İnşaat",title:"İşletme Elektrikçisi",company:"Michels Brandenburgklinik SE",city:"Bernau bei Berlin",type:"Süresiz",source:"Make it in Germany / BA",url:urls.facilities},
  {country:"Polonya",flag:"🇵🇱",sector:"Lojistik",title:"Depo Personeli — Konteyner Boşaltma",company:"İşveren bilgisi resmî ilanda",city:"Polonya",type:"5 pozisyon",source:"ePraca",url:urls.warehouseA},
  {country:"Polonya",flag:"🇵🇱",sector:"Lojistik",title:"Depo Personeli",company:"İşveren bilgisi resmî ilanda",city:"Polonya",type:"80 pozisyon",source:"ePraca / EURES",url:urls.warehouseB},
  {country:"Polonya",flag:"🇵🇱",sector:"Üretim",title:"Metal Üretim Teknoloğu / Programcısı",company:"İşveren bilgisi resmî ilanda",city:"Polonya",type:"40 saat / hafta",source:"ePraca",url:urls.metal},
  {country:"Polonya",flag:"🇵🇱",sector:"Bilişim",title:"Kıdemli Java Geliştirici",company:"İşveren bilgisi resmî ilanda",city:"Kraków",type:"Tam zamanlı",source:"ePraca / EURES",url:urls.java},
  {country:"Polonya",flag:"🇵🇱",sector:"Bilişim",title:"Quality Assurance Engineering Lead",company:"İşveren bilgisi resmî ilanda",city:"Polonya",type:"Tam zamanlı",source:"ePraca",url:urls.qa},
  {country:"Polonya",flag:"🇵🇱",sector:"Lojistik",title:"Depocu + Sürücü Belgesi",company:"İşveren bilgisi resmî ilanda",city:"Polonya",type:"40 saat / hafta",source:"ePraca",url:urls.driver},
  {country:"Avusturya",flag:"🇦🇹",sector:"Sağlık",title:"Hemşirelik ve Bakım Pozisyonları",company:"AMS güncel sonuçları",city:"Avusturya geneli",type:"Resmî arama",source:"AMS Österreich",url:urls.ams},
  {country:"Avusturya",flag:"🇦🇹",sector:"Üretim",title:"CNC / Üretim Teknisyeni Pozisyonları",company:"AMS güncel sonuçları",city:"Avusturya geneli",type:"Resmî arama",source:"AMS Österreich",url:urls.ams},
  {country:"Hollanda",flag:"🇳🇱",sector:"Lojistik",title:"Depo ve Lojistik Pozisyonları",company:"Werk.nl güncel sonuçları",city:"Hollanda geneli",type:"Resmî arama",source:"UWV / Werk.nl",url:urls.werk},
  {country:"Hollanda",flag:"🇳🇱",sector:"Bilişim",title:"Yazılım Geliştirme Pozisyonları",company:"Werk.nl güncel sonuçları",city:"Hollanda geneli",type:"Resmî arama",source:"UWV / Werk.nl",url:urls.werk},
];

export const jobsEn: Job[] = [
  {country:"Germany",flag:"🇩🇪",sector:"Healthcare",title:"Physiotherapist",company:"Christian Konz Physiotherapy Practice",city:"Ettlingen",type:"Permanent",source:"Make it in Germany / BA",url:urls.physio},
  {country:"Germany",flag:"🇩🇪",sector:"Healthcare",title:"Pharmacist",company:"Pharmacy at Markt-Center",city:"Potsdam",type:"Full or part time",source:"Make it in Germany / BA",url:urls.pharmacist},
  {country:"Germany",flag:"🇩🇪",sector:"Manufacturing",title:"Vehicle Painter",company:"Hallertau Body and Paint Center",city:"Rudelzhausen",type:"Full time",source:"Make it in Germany / BA",url:urls.painter},
  {country:"Germany",flag:"🇩🇪",sector:"Technical & Construction",title:"Industrial Electrician",company:"Tonnies Lebensmittel GmbH",city:"Rheda-Wiedenbruck",type:"Full time",source:"Make it in Germany / BA",url:urls.industrial},
  {country:"Germany",flag:"🇩🇪",sector:"Technical & Construction",title:"Building Electrician",company:"Bausanierung Bender",city:"Saarbrucken",type:"Full time",source:"Make it in Germany / BA",url:urls.building},
  {country:"Germany",flag:"🇩🇪",sector:"Technical & Construction",title:"Facilities Electrician",company:"Michels Brandenburg Clinic",city:"Bernau near Berlin",type:"Permanent",source:"Make it in Germany / BA",url:urls.facilities},
  {country:"Poland",flag:"🇵🇱",sector:"Logistics",title:"Warehouse Worker — Container Unloading",company:"Employer details at the official source",city:"Poland",type:"5 openings",source:"ePraca",url:urls.warehouseA},
  {country:"Poland",flag:"🇵🇱",sector:"Logistics",title:"Warehouse Worker",company:"Employer details at the official source",city:"Poland",type:"80 openings",source:"ePraca / EURES",url:urls.warehouseB},
  {country:"Poland",flag:"🇵🇱",sector:"Manufacturing",title:"Metal Production Technologist / Programmer",company:"Employer details at the official source",city:"Poland",type:"40 hours per week",source:"ePraca",url:urls.metal},
  {country:"Poland",flag:"🇵🇱",sector:"Technology",title:"Senior Java Developer",company:"Employer details at the official source",city:"Krakow",type:"Full time",source:"ePraca / EURES",url:urls.java},
  {country:"Poland",flag:"🇵🇱",sector:"Technology",title:"Quality Assurance Engineering Lead",company:"Employer details at the official source",city:"Poland",type:"Full time",source:"ePraca",url:urls.qa},
  {country:"Poland",flag:"🇵🇱",sector:"Logistics",title:"Warehouse Worker with Driving Licence",company:"Employer details at the official source",city:"Poland",type:"40 hours per week",source:"ePraca",url:urls.driver},
  {country:"Austria",flag:"🇦🇹",sector:"Healthcare",title:"Nursing and Care Roles",company:"Current AMS results",city:"Across Austria",type:"Official search",source:"AMS Austria",url:urls.ams},
  {country:"Austria",flag:"🇦🇹",sector:"Manufacturing",title:"CNC and Production Technician Roles",company:"Current AMS results",city:"Across Austria",type:"Official search",source:"AMS Austria",url:urls.ams},
  {country:"Netherlands",flag:"🇳🇱",sector:"Logistics",title:"Warehouse and Logistics Roles",company:"Current Werk.nl results",city:"Across the Netherlands",type:"Official search",source:"UWV / Werk.nl",url:urls.werk},
  {country:"Netherlands",flag:"🇳🇱",sector:"Technology",title:"Software Development Roles",company:"Current Werk.nl results",city:"Across the Netherlands",type:"Official search",source:"UWV / Werk.nl",url:urls.werk},
];
