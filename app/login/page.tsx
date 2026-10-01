"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowser();

      const result = isSignUp
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo:
                window.location.origin + "/auth/callback",
            },
          })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (!result.data.session) {
        setMessage(
          "Kayıt alındı. E-postanızdaki doğrulama bağlantısını aynı tarayıcıda açın. Gerekirse ardından giriş yapın.",
        );
        return;
      }

      const target = new URLSearchParams(
        window.location.search,
      ).get("return_to");

      const safeTarget =
        target?.startsWith("/") &&
        !target.startsWith("//") &&
        !target.includes("\\")
          ? target
          : "/account";

      window.location.assign(safeTarget);
    } catch {
      setMessage("İşlem tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <a className="back-link" href="/">
          ← Ana sayfaya dön
        </a>

        <h1 style={{ marginTop: 24 }}>
          {isSignUp ? "Hesap oluştur" : "Giriş yap"}
        </h1>

        <form onSubmit={submit} aria-busy={busy}>
          <label htmlFor="email">E-posta</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@eposta.com"
            required
            disabled={busy}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={isSignUp ? 8 : undefined}
            autoComplete={
              isSignUp ? "new-password" : "current-password"
            }
            placeholder={
              isSignUp ? "En az 8 karakter" : "Şifrenizi girin"
            }
            required
            disabled={busy}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={busy}>
            {busy
              ? "Bekleyin…"
              : isSignUp
                ? "Hesap oluştur"
                : "Giriş yap"}
          </button>
        </form>

        <p role="status" aria-live="polite">
          {message}
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
            setPassword("");
          }}
        >
          {isSignUp
            ? "Hesabım var, giriş yap"
            : "Hesabım yok, hesap oluştur"}
        </button>
      </div>
    </main>
  );
}