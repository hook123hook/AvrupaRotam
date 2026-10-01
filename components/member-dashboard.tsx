"use client";

import { useRef, useState, type FormEvent } from "react";
import { MemberPayment } from "@/components/member-payment";

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

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

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
  const fileInput = useRef<HTMLInputElement>(null);
  const [cvName, setCvName] = useState(profile?.cvName ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function errorMessage(code?: string) {
    switch (code) {
      case "authentication_required":
        return tr
          ? "Oturumunuz sona erdi. Lütfen tekrar giriş yapın."
          : "Your session has expired. Please sign in again.";
      case "invalid_cv":
        return tr
          ? "PDF, DOC veya DOCX dosyası seçin. Dosya en fazla 5 MB olabilir."
          : "Select a PDF, DOC or DOCX file, up to 5 MB.";
      case "profile_required":
        return tr
          ? "Önce üyelik profilinizi tamamlayın."
          : "Complete your membership profile first.";
      case "cv_changed_retry":
        return tr
          ? "CV başka bir işlemle değişti. Sayfayı yenileyip tekrar deneyin."
          : "Your CV changed in another request. Refresh and try again.";
      default:
        return tr
          ? "İşlem tamamlanamadı. Lütfen tekrar deneyin."
          : "The operation could not be completed. Please try again.";
    }
  }

  async function updateCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setMessage("");
    setFailed(false);

    if (
      !selectedFile ||
      !selectedFile.size ||
      selectedFile.size > 5 * 1024 * 1024 ||
      !ALLOWED_TYPES.has(selectedFile.type)
    ) {
      setFailed(true);
      setMessage(errorMessage("invalid_cv"));
      return;
    }

    setBusy(true);
    setConfirmDelete(false);

    try {
      const form = new FormData();
      form.set("cv", selectedFile);

      const response = await fetch("/api/member/cv", {
        method: "PUT",
        body: form,
      });

      const result = (await response.json()) as {
        error?: string;
        cvName?: string;
        cleanupPending?: boolean;
      };

      if (!response.ok) {
        throw new Error(errorMessage(result.error));
      }

      setCvName(result.cvName ?? selectedFile.name);
      setSelectedFile(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setMessage(
        result.cleanupPending
          ? tr
            ? "Yeni CV kaydedildi. Eski dosya depodan silinemedi; destek kontrolü gerekiyor."
            : "Your new CV was saved, but the old stored file could not be deleted. Contact support."
          : tr
            ? "CV’niz başarıyla güncellendi."
            : "Your CV was updated successfully.",
      );
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorMessage(),
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteCv() {
    if (busy) return;

    setBusy(true);
    setMessage("");
    setFailed(false);

    try {
      const response = await fetch("/api/member/cv", {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        error?: string;
        cleanupPending?: boolean;
      };

      if (!response.ok) {
        throw new Error(errorMessage(result.error));
      }

      setCvName("");
      setSelectedFile(null);
      setConfirmDelete(false);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setMessage(
        result.cleanupPending
          ? tr
            ? "CV profilinizden kaldırıldı ancak depodaki dosya silinemedi; destek kontrolü gerekiyor."
            : "Your CV was removed from your profile, but the stored file could not be deleted. Contact support."
          : tr
            ? "CV’niz silindi. Profil bilgileriniz korundu."
            : "Your CV was deleted. Your profile details were preserved.",
      );
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorMessage(),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-page">
      <div className="wrap">
        <a className="back-link" href={tr ? "/" : "/en/"}>
          ← {tr ? "Ana sayfaya dön" : "Back to home"}
        </a>

        <div className="account-head">
          <div>
            <span className="eyebrow">
              {tr ? "Üye hesabı" : "Member account"}
            </span>
            <h1>{tr ? "Kariyer dosyanız" : "Your career file"}</h1>
            <p>
              {tr
                ? "Ödemenizi, profilinizi, CV’nizi ve ön başvuru geçmişinizi yönetin."
                : "Manage your payment, profile, CV and initial application history."}
            </p>
          </div>

          <form action="/logout" method="post">
            <input
              type="hidden"
              name="return_to"
              value={tr ? "/" : "/en/"}
            />
            <button
              className="btn secondary"
              type="submit"
              disabled={busy}
            >
              {tr ? "Çıkış yap" : "Sign out"}
            </button>
          </form>
        </div>

        {profile ? (
          <>
            <MemberPayment locale={locale} />

            <section
              className="account-card"
              style={{ marginTop: 24 }}
            >
              <div>
                <small>{tr ? "Aday" : "Candidate"}</small>
                <strong>{profile.fullName}</strong>
                <span>{profile.email}</span>
              </div>

              <div>
                <small>{tr ? "Meslek" : "Occupation"}</small>
                <strong>{profile.occupation}</strong>
                <span>{profile.phone}</span>
              </div>

              <div>
                <small>{tr ? "Kayıtlı CV" : "Stored CV"}</small>
                <strong style={{ overflowWrap: "anywhere" }}>
                  {cvName || (tr ? "CV yüklenmedi" : "No CV uploaded")}
                </strong>
                <span>
                  {cvName
                    ? tr
                      ? "Güvenli dosya kaydı"
                      : "Secure file record"
                    : tr
                      ? "Aşağıdan yeni CV yükleyebilirsiniz."
                      : "You can upload a CV below."}
                </span>
              </div>
            </section>

            <section
              aria-labelledby="cv-heading"
              style={{
                marginTop: 24,
                padding: 24,
                background: "#ffffff",
                color: "#0b1f33",
                border: "1px solid #d6e2e3",
                borderRadius: 16,
              }}
            >
              <h2 id="cv-heading">
                {tr ? "CV’nizi yönetin" : "Manage your CV"}
              </h2>

              <p style={{ color: "#425b70", lineHeight: 1.6 }}>
                {tr
                  ? "PDF, DOC veya DOCX dosyası yükleyin. En fazla 5 MB. Yeni dosya kaydedildiğinde önceki profil CV’si kaldırılır."
                  : "Upload a PDF, DOC or DOCX file, up to 5 MB. Saving a new file replaces your previous profile CV."}
              </p>

              <form onSubmit={updateCv}>
                <label
                  htmlFor="member-cv"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  {tr ? "Yeni CV seçin" : "Choose a new CV"}
                </label>

                <input
                  ref={fileInput}
                  id="member-cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  disabled={busy}
                  onChange={(event) => {
                    setSelectedFile(event.target.files?.[0] ?? null);
                    setMessage("");
                    setFailed(false);
                    setConfirmDelete(false);
                  }}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    background: "#f4f8f7",
                    color: "#0b1f33",
                    padding: 12,
                    border: "1px solid #b8cbcd",
                    borderRadius: 8,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={busy || !selectedFile}
                  >
                    {busy
                      ? tr
                        ? "İşlem sürüyor…"
                        : "Processing…"
                      : cvName
                        ? tr
                          ? "CV’yi değiştir"
                          : "Replace CV"
                        : tr
                          ? "CV yükle"
                          : "Upload CV"}
                  </button>

                  {cvName && !confirmDelete && (
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setConfirmDelete(true);
                        setMessage("");
                        setFailed(false);
                      }}
                    >
                      {tr ? "CV’yi sil" : "Delete CV"}
                    </button>
                  )}
                </div>
              </form>

              {confirmDelete && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: "#fff4ed",
                    color: "#7c2d12",
                    border: "1px solid #fed7aa",
                    borderRadius: 10,
                  }}
                >
                  <p>
                    {tr
                      ? "Kayıtlı CV’nizi silmek istiyor musunuz? Profil bilgileriniz korunacak."
                      : "Delete your stored CV? Your profile details will be preserved."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <button
                      className="btn primary"
                      type="button"
                      disabled={busy}
                      onClick={deleteCv}
                    >
                      {tr ? "Evet, CV’yi sil" : "Yes, delete CV"}
                    </button>

                    <button
                      className="btn secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDelete(false)}
                    >
                      {tr ? "Vazgeç" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <p
                  role={failed ? "alert" : "status"}
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 10,
                    background: failed ? "#fff1f2" : "#edf8f4",
                    color: failed ? "#9f1239" : "#145344",
                    lineHeight: 1.6,
                  }}
                >
                  {message}
                </p>
              )}
            </section>
          </>
        ) : (
          <section className="empty-account">
            <h2>
              {tr
                ? "Üyelik profilinizi tamamlayın"
                : "Complete your membership profile"}
            </h2>

            <p>
              {tr
                ? "Profil ve zorunlu CV kaydı için ana sayfadaki üyelik formunu kullanın. Tamamladığınızda 1.000 € hizmet bedeli için ödeme ekranı açılacaktır."
                : "Use the membership form on the home page to save your profile and CV. The €1,000 service payment screen will open after completion."}
            </p>

            <a
              className="btn primary"
              href={tr ? "/#membership" : "/en/#membership"}
            >
              {tr ? "Üyeliğe git" : "Go to membership"}
            </a>
          </section>
        )}

        <section className="applications-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                {tr ? "Başvurular" : "Applications"}
              </span>
              <h2>
                {tr ? "Ön başvuru geçmişi" : "Initial application history"}
              </h2>
            </div>
            <span className="count">{applications.length}</span>
          </div>

          {applications.length ? (
            <div className="application-list">
              {applications.map((application) => (
                <article key={application.id}>
                  <div>
                    <strong>{application.jobTitle}</strong>
                    <span>
                      {application.country} · {application.profession}
                    </span>
                  </div>

                  <div>
                    <span className="status">
                      {tr ? "Alındı" : "Received"}
                    </span>
                    <small>
                      {new Intl.DateTimeFormat(
                        tr ? "tr-TR" : "en-GB",
                        { dateStyle: "medium" },
                      ).format(new Date(application.createdAt))}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-row">
              {tr
                ? "Henüz ön başvuru bulunmuyor."
                : "No initial applications yet."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}