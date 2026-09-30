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
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    })
  : await supabase.auth.signInWithPassword({ email, password });

if (result.error) {
  setMessage(result.error.message);
  return;
}
      if (!result.data.session) {
        setMessage(
          "Kayıt alındı. E-postanızdaki doğrulama bağlantısına tıklayıp bu sayfadan giriş yapın.",
        );
        return;
      }

      const target = new URLSearchParams(window.location.search).get("return_to");
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
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1>{isSignUp ? "Hesap oluştur" : "Giriş yap"}</h1>

      <form onSubmit={submit}>
        <label htmlFor="email">E-posta</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ display: "block", width: "100%", margin: "8px 0 20px", padding: 12 }}
        />

        <label htmlFor="password">Şifre</label>
        <input
          id="password"
          type="password"
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ display: "block", width: "100%", margin: "8px 0 20px", padding: 12 }}
        />

        <button type="submit" disabled={busy}>
          {busy ? "Bekleyin…" : isSignUp ? "Hesap oluştur" : "Giriş yap"}
        </button>
      </form>

      <p role="status">{message}</p>

      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage("");
        }}
      >
        {isSignUp ? "Hesabım var, giriş yap" : "Hesabım yok, hesap oluştur"}
      </button>
    </main>
  );
}