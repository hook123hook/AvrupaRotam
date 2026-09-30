"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/account",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Giriş bağlantısı e-posta adresinize gönderildi.");
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Giriş Yap</h1>

      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginTop: 20, padding: 10 }}
      />

      <button
        onClick={login}
        style={{ marginTop: 20, padding: 10 }}
      >
        Giriş bağlantısı gönder
      </button>

      <p>{message}</p>
    </main>
  );
}
