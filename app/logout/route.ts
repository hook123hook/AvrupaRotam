import { NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Başka bir siteden gönderilen çıkış isteklerini reddet.
  if (request.headers.get("origin") !== url.origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await request.formData();
  const returnTo = form.get("return_to") === "/en/" ? "/en/" : "/";

  const supabase = await getSupabaseAuth();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response("Çıkış yapılamadı. Lütfen tekrar deneyin.", {
      status: 500,
    });
  }

  const response = NextResponse.redirect(
    new URL(returnTo, url.origin),
    303,
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}