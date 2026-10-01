import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getSupabase } from "@/db";

export async function getPaymentAdmin() {
  const user = await getChatGPTUser();

  if (!user) return null;

  const { data, error } = await getSupabase()
    .from("payment_review_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data ? user : null;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function adminJson(
  body: Record<string, unknown>,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}