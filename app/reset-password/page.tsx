"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const lock = useRef(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data, error } =
          await getSupabaseBrowser().auth.getUser();

        if (!active) return;

        if (error || !data.user) {
          setMessage(
            "Geçerli oturum bulunamadı. Şifremi unuttum ekranından yeni kod isteyin.",
          );
          return;
        }

        setReady(true);
      } catch {
        if (active) {
          setMessage(
            "Oturum kontrol edilemedi. Lütfen sayfayı yenileyin.",
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ready || lock.current || done) return;

    if (password.length < 8 || password !== repeat) {
      setMessage(
        "Şifre en az 8 karakter olmalı ve iki alanda aynı yazılmalı.",
      );
      return;
    }

    lock.current = true;
    setBusy(true);
    setMessage("");

    try {
      const { error } =
        await getSupabaseBrowser().auth.updateUser({
          password,
        });

      if (error) {
        setMessage(
          "Şifre güncellenemedi. Öncekinden farklı, en az 8 karakterli bir şifre deneyin.",
        );
        return;
      }

      setPassword("");
      setRepeat("");
      setDone(true);
      setMessage("Şifreniz başarıyla güncellendi.");
    } catch {
      setMessage(
        "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Yeni şifre belirleyin</h1>

        {checking && (
          <p role="status">Oturum kontrol ediliyor…</p>
        )}

        {ready && !done && (
          <form onSubmit={submit} aria-busy={busy}>
            <label htmlFor="new-password">
              Yeni şifre
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={busy}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <label htmlFor="repeat-password">
              Yeni şifre tekrar
            </label>
            <input
              id="repeat-password"
              name="repeatPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={busy}
              value={repeat}
              onChange={(event) =>
                setRepeat(event.target.value)
              }
            />

            <button type="submit" disabled={busy}>
              {busy
                ? "Kaydediliyor…"
                : "Şifreyi güncelle"}
            </button>
          </form>
        )}

        <p role="status" aria-live="polite">
          {message}
        </p>

        {done ? (
          <a href="/account">Hesabıma devam et →</a>
        ) : (
          !checking &&
          !ready && (
            <a href="/forgot-password">
              Yeni doğrulama kodu iste
            </a>
          )
        )}
      </div>
    </main>
  );
}