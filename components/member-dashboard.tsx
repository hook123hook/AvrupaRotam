type Application = {
  id: string;
  jobTitle: string;
  country: string;
  profession: string;
  status: string;
  cvName: string;
  createdAt: string;
};

type Profile = {
  email: string;
  fullName: string;
  phone: string;
  occupation: string;
  cvName: string;
  updatedAt: string;
};

export function MemberDashboard({
  locale,
  profile,
  applications,
}: {
  locale: "tr" | "en";
  profile: Profile | null;
  applications: Application[];
}) {
  const tr = locale === "tr";
  return <main className="account-page">
    <div className="wrap">
      <a className="back-link" href={tr ? "/" : "/en/"}>← {tr ? "Ana sayfaya dön" : "Back to home"}</a>
      <div className="account-head"><div><span className="eyebrow">{tr ? "Üye hesabı" : "Member account"}</span><h1>{tr ? "Kariyer dosyanız" : "Your career file"}</h1><p>{tr ? "Profilinizi, kayıtlı CV’nizi ve ön başvuru geçmişinizi görüntüleyin." : "View your profile, stored CV and initial application history."}</p></div><a className="btn secondary" href={`/signout-with-chatgpt?return_to=${encodeURIComponent(tr ? "/" : "/en/")}`}>{tr ? "Çıkış yap" : "Sign out"}</a></div>
      {profile ? <section className="account-card"><div><small>{tr ? "Aday" : "Candidate"}</small><strong>{profile.fullName}</strong><span>{profile.email}</span></div><div><small>{tr ? "Meslek" : "Occupation"}</small><strong>{profile.occupation}</strong><span>{profile.phone}</span></div><div><small>{tr ? "Kayıtlı CV" : "Stored CV"}</small><strong>{profile.cvName}</strong><span>{tr ? "Güvenli dosya kaydı" : "Secure file record"}</span></div></section> : <section className="empty-account"><h2>{tr ? "Üyelik profilinizi tamamlayın" : "Complete your membership profile"}</h2><p>{tr ? "Profil ve zorunlu CV kaydı için ana sayfadaki üyelik formunu kullanın." : "Use the membership form on the home page to save your profile and required CV."}</p><a className="btn primary" href={tr ? "/#membership" : "/en/#membership"}>{tr ? "Üyeliğe git" : "Go to membership"}</a></section>}
      <section className="applications-panel"><div className="section-head"><div><span className="eyebrow">{tr ? "Başvurular" : "Applications"}</span><h2>{tr ? "Ön başvuru geçmişi" : "Initial application history"}</h2></div><span className="count">{applications.length}</span></div>
        {applications.length ? <div className="application-list">{applications.map((application) => <article key={application.id}><div><strong>{application.jobTitle}</strong><span>{application.country} · {application.profession}</span></div><div><span className="status">{tr ? "Alındı" : "Received"}</span><small>{new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle:"medium" }).format(new Date(application.createdAt))}</small></div></article>)}</div> : <div className="empty-row">{tr ? "Henüz ön başvuru bulunmuyor." : "No initial applications yet."}</div>}
      </section>
    </div>
  </main>;
}
