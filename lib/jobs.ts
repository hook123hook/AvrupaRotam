import { getSupabase } from "@/db";

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

type Listing = {
  source_id: string;
  source_url: string;
  country_code: string;
  title: string;
  company: string;
  city: string;
  sector: string;
  employment_type: string;
};

const countries: Record<
  string,
  { tr: string; en: string; flag: string }
> = {
  DE: { tr: "Almanya", en: "Germany", flag: "🇩🇪" },
  AT: { tr: "Avusturya", en: "Austria", flag: "🇦🇹" },
  PL: { tr: "Polonya", en: "Poland", flag: "🇵🇱" },
  NL: { tr: "Hollanda", en: "Netherlands", flag: "🇳🇱" },
};

export async function getPublishedJobs(
  locale: "tr" | "en",
): Promise<Job[]> {
  try {
    const supabase = getSupabase();

    const { data: sources, error: sourceError } = await supabase
      .from("job_sources")
      .select("id,name")
      .eq("enabled", true)
      .eq("access_status", "ready");

    if (sourceError) throw sourceError;
    if (!sources?.length) return [];

    const sourceNames = new Map(
      sources.map((source) => [
        String(source.id),
        String(source.name),
      ]),
    );

    const { data, error } = await supabase
      .from("job_listings")
      .select(
        "source_id,source_url,country_code,title,company,city,sector,employment_type",
      )
      .in("source_id", [...sourceNames.keys()])
      .eq("status", "active")
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("verified_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(200);

    if (error) throw error;

    return ((data ?? []) as Listing[]).flatMap((listing) => {
      const country = countries[listing.country_code];
      if (!country) return [];

      return [{
        country: country[locale],
        flag: country.flag,
        sector: listing.sector || (
          locale === "tr" ? "Diğer" : "Other"
        ),
        title: listing.title,
        company: listing.company || (
          locale === "tr"
            ? "İşveren bilgisi belirtilmemiş"
            : "Employer not specified"
        ),
        city: listing.city,
        type: listing.employment_type,
        source: sourceNames.get(listing.source_id) ?? "",
        url: listing.source_url,
      }];
    });
  } catch {
    console.error("job_listings_load_failed");
    return [];
  }
}