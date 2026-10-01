import { getStore } from "@netlify/blobs";
import { getSupabase } from "@/db";
import {
  adminJson,
  getPaymentAdmin,
  isUuid,
} from "@/lib/payment-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const admin = await getPaymentAdmin();

    if (!admin) {
      return adminJson({ error: "admin_required" }, 403);
    }

    const id =
      new URL(request.url).searchParams.get("id") ?? "";

    if (!isUuid(id)) {
      return adminJson({ error: "invalid_receipt" }, 400);
    }

    const { data: receipt, error } = await getSupabase()
      .from("member_payment_receipts")
      .select("id,user_id,blob_key,content_type")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!receipt) {
      return adminJson({ error: "receipt_not_found" }, 404);
    }

    const extensions: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
    };

    const extension = extensions[receipt.content_type];

    if (
      !extension ||
      receipt.blob_key !==
        `receipts/${receipt.user_id}/${receipt.id}`
    ) {
      return adminJson({ error: "invalid_receipt" }, 400);
    }

    const file = await getStore("payment-receipts").get(
      receipt.blob_key,
      {
        type: "arrayBuffer",
        consistency: "strong",
      },
    );

    if (!file) {
      return adminJson({ error: "receipt_file_missing" }, 404);
    }

    return new Response(file, {
      headers: {
        "Content-Type": receipt.content_type,
        "Content-Disposition":
          `attachment; filename="receipt-${receipt.id}.${extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        Vary: "Cookie",
      },
    });
  } catch {
    console.error("admin_receipt_download_failed");
    return adminJson({ error: "service_unavailable" }, 503);
  }
}