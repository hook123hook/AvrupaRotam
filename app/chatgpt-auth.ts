import { redirect } from "next/navigation";
import { getSupabaseAuth } from "@/lib/supabase-server";

export type ChatGPTUser = {
  id: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const supabase = await getSupabaseAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    displayName:
      user.user_metadata?.full_name ??
      user.email ??
      "User",
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? null,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();

  if (user) return user;

  redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
}

export function chatGPTSignInPath(returnTo: string): string {
  return `/login?return_to=${encodeURIComponent(returnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `/logout?return_to=${encodeURIComponent(returnTo)}`;
}
