import { getSupabase } from "@/db";
import {
  adminJson,
  getPaymentAdmin,
  isUuid,
} from "@/lib/payment-admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const admin = await getPaymentAdmin();

    if (!admin) {
      return adminJson({ error: "admin_required" }, 403);
    }

    const url = new URL(request.url);
    const supabase = getSupabase();
    const userId = url.searchParams.get("userId");
    const rawPage = url.searchParams.get("page") ?? "0";

    if (!/^\d{1,6}$/.test(rawPage)) {
      return adminJson({ error: "invalid_page" }, 400);
    }

    const page = Number(rawPage);

    // Seçilen kullanıcının dekont geçmişi.
    if (userId) {
      if (!isUuid(userId)) {
        return adminJson({ error: "invalid_user" }, 400);
      }

      const { data, error } = await supabase
        .from("member_payment_receipts")
        .select(
          "id,file_name,transaction_id,content_type,file_size,created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(
          page * PAGE_SIZE,
          page * PAGE_SIZE + PAGE_SIZE,
        );

      if (error) throw error;

      const { data: quote, error: quoteError } = await supabase
        .from("member_payment_quotes")
        .select("user_id,invoice_no,address,amount_eur,amount_xmr,fx_rate,created_at,expires_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (quoteError) throw quoteError;

      return adminJson({
        quote: quote ?? null,
        receipts: (data ?? []).slice(0, PAGE_SIZE),
        hasMore: (data?.length ?? 0) > PAGE_SIZE,
        page,
      });
    }

    const status =
      url.searchParams.get("status") ?? "under_review";

    const allowedStatuses = new Set([
      "all",
      "under_review",
      "approved",
      "suspended",
      "awaiting_receipt",
    ]);

    if (!allowedStatuses.has(status)) {
      return adminJson({ error: "invalid_status" }, 400);
    }

    let query = supabase
      .from("member_service_access")
      .select(
        "user_id,effective_status,can_use_service,first_receipt_at,review_deadline,reviewed_at,suspension_reason",
      );

    if (status !== "all") {
      query = query.eq("effective_status", status);
    }

    const { data, error } = await query
      .order("review_deadline", {
        ascending: true,
        nullsFirst: false,
      })
      .order("user_id", { ascending: true })
      .range(
        page * PAGE_SIZE,
        page * PAGE_SIZE + PAGE_SIZE,
      );

    if (error) throw error;

    const accounts = (data ?? []).slice(0, PAGE_SIZE);
    const userIds = accounts.map((account) => account.user_id);

    if (!userIds.length) {
      return adminJson({
        accounts: [],
        hasMore: false,
        page,
      });
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,full_name")
      .in("id", userIds);

    if (profileError) throw profileError;

    return adminJson({
      accounts: accounts.map((account) => {
        const profile = profiles?.find(
          (item) => String(item.id) === account.user_id,
        );

        return {
          ...account,
          email: profile?.email ?? "",
          full_name: profile?.full_name ?? "",
        };
      }),
      hasMore: (data?.length ?? 0) > PAGE_SIZE,
      page,
    });
  } catch {
    console.error("admin_payment_list_failed");
    return adminJson({ error: "service_unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return adminJson({ error: "forbidden" }, 403);
  }

  try {
    const admin = await getPaymentAdmin();

    if (!admin) {
      return adminJson({ error: "admin_required" }, 403);
    }

    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("application/json")
    ) {
      return adminJson({ error: "invalid_request" }, 400);
    }

    const text = await request.text();

    if (text.length > 5000) {
      return adminJson({ error: "invalid_request" }, 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(text);
    } catch {
      return adminJson({ error: "invalid_request" }, 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return adminJson({ error: "invalid_request" }, 400);
    }

    const input = body as Record<string, unknown>;
    const userId = String(input.userId ?? "");
    const action = String(input.action ?? "");
    const reason = String(input.reason ?? "").trim();

    if (
      !isUuid(userId) ||
      !["approve", "suspend"].includes(action) ||
      reason.length > 1000
    ) {
      return adminJson({ error: "invalid_request" }, 400);
    }

    if (action === "suspend" && !reason) {
      return adminJson({ error: "reason_required" }, 400);
    }

    const { data, error } = await getSupabase().rpc(
      "review_member_payment",
      {
        // Yönetici kimliği oturumdan alınır.
        p_admin_id: admin.id,
        p_user_id: userId,
        p_action: action,
        p_reason: reason || null,
      },
    );

    if (error) {
      if (error.message.includes("RECEIPT_REQUIRED")) {
        return adminJson({ error: "receipt_required" }, 409);
      }

      if (error.message.includes("ACCOUNT_NOT_FOUND")) {
        return adminJson({ error: "account_not_found" }, 404);
      }

      if (error.message.includes("ADMIN_REQUIRED")) {
        return adminJson({ error: "admin_required" }, 403);
      }

      throw error;
    }

    return adminJson({
      ok: true,
      access: data?.[0] ?? null,
    });
  } catch {
    console.error("admin_payment_review_failed");
    return adminJson({ error: "service_unavailable" }, 503);
  }
}