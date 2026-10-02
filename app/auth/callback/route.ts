import { NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const recovery =
    url.searchParams.get("next") === "/reset-password";

  function redirect(path: string) {
    const response = NextResponse.redirect(
      new URL(path, url.origin),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const code = url.searchParams.get("code");

  // Gizli kod veya token değerlerini kaydetmez.
  console.info("auth_callback_received", {
    hasCode: Boolean(code),
    recovery,
    parameterNames: [...url.searchParams.keys()],
    providerError: url.searchParams.get("error"),
    providerErrorCode: url.searchParams.get("error_code"),
  });

  try {
    if (code) {
      const supabase = await getSupabaseAuth();
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return redirect(
          recovery ? "/reset-password" : "/account",
        );
      }

      console.error("auth_code_exchange_failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
  } catch (error) {
    console.error("auth_callback_failed", {
      message:
        error instanceof Error
          ? error.message
          : "unknown_error",
    });
  }

  return redirect(
    recovery
      ? "/forgot-password?error=expired"
      : "/login?error=confirmation_failed",
  );
}