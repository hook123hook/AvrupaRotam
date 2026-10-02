"use client";

import { useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const lock = useRef(false);
  const [email, setEmail] = useState("");
  const [requestedEmail, setRequestedEmail] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setMessage("");

    const address = email.trim();

    try {
      const { error } =
        await getSupabaseBrowser().auth.resetPasswordForEmail(address);

      if (error) {
        setMessage(
          error.status === 429
            ? "Çok sık istek gönderildi. Bir süre sonra tekrar deneyin."
            : "Kod gönderilemedi. Lütfen tekrar deneyin.",
        );
        return;
      }

      setRequestedEmail(address);
      setToken("");
      setMessage(
        "Bu adresle bir hesap varsa doğrulama kodu gönderildi. En son maildeki kodu girin; spam klasörünü de kontrol edin.",
      );
    } catch {
      setMessage("Bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !requestedEmail) return;

    const code = token.trim();

    if (!/^\d{6,10}$/.test(code)) {
      setMessage("E-postadaki sayısal kodu eksiksiz girin.");
      return;
    }

    lock.current = true;
    setBusy(true);
    setMessage("");

    try {
      const { data, error } =
        await getSupabaseBrowser().auth.verifyOtp({
          email: requestedEmail,
          token: code,
          type: "recovery",
        });

      if (error || !data.session) {
        setMessage(
          error?.status === 429
            ? "Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin."
            : "Kod geçersiz veya süresi dolmuş. En son maildeki kodu kontrol edin; gerekirse yeni kod isteyin.",
        );
        return;
      }

      window.location.assign("/reset-password");
    } catch {
      setMessage("Kod doğrulanamadı. Lütfen tekrar deneyin.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <a className="back-link" href="/login">
          ← Girişe dön
        </a>

        <h1 style={{ marginTop: 24 }}>Şifremi unuttum</h1>

        {!requestedEmail ? (
          <>
            <p>Hesabınıza kayıtlı e-posta adresini yazın.</p>

            <form onSubmit={requestCode} aria-busy={busy}>
              <label htmlFor="recovery-email">E-posta</label>
              <input
                id="recovery-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={busy}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <button type="submit" disabled={busy}>
                {busy ? "Gönderiliyor…" : "Doğrulama kodu gönder"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p>
              <strong>{requestedEmail}</strong> adresine gönderilen
              kodu girin.
            </p>

            <form onSubmit={verifyCode} aria-busy={busy}>
              <label htmlFor="recovery-code">Doğrulama kodu</label>
              <input
                id="recovery-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                minLength={6}
                maxLength={10}
                required
                disabled={busy}
                value={token}
                onChange={(event) =>
                  setToken(event.target.value.replace(/\D/g, ""))
                }
              />

              <button type="submit" disabled={busy}>
                {busy ? "Doğrulanıyor…" : "Kodu doğrula"}
              </button>
            </form>

            <button
              type="button"
              disabled={busy}
              style={{ marginTop: 16 }}
              onClick={() => {
                setRequestedEmail("");
                setToken("");
                setMessage("");
              }}
            >
              Yeni kod iste / E-posta adresini değiştir
            </button>
          </>
        )}

        <p role="status" aria-live="polite">
          {message}
        </p>
      </div>
    </main>
  );
}