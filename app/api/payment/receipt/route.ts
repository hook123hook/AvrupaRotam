import { getStore } from "@netlify/blobs";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getSupabase } from "@/db";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;

const TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const ACCESS_FIELDS =
  "effective_status,can_use_service,first_receipt_at,review_deadline,reviewed_at,suspension_reason";

type AccessRow = {
  effective_status: string;
  can_use_service: boolean;
  first_receipt_at: string | null;
  review_deadline: string | null;
  reviewed_at: string | null;
  suspension_reason: string | null;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

function publicAccess(row: AccessRow | null) {
  return {
    status: row?.effective_status ?? "awaiting_receipt",
    canUseService: row?.can_use_service ?? false,
    firstReceiptAt: row?.first_receipt_at ?? null,
    reviewDeadline: row?.review_deadline ?? null,
    reviewedAt: row?.reviewed_at ?? null,
    suspensionReason: row?.suspension_reason ?? null,
  };
}

async function state(userId: string) {
  const db = getSupabase();

  const { data: access, error: accessError } = await db
    .from("member_service_access")
    .select(ACCESS_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (accessError) throw accessError;

  const { data: receipt, error: receiptError } = await db
    .from("member_payment_receipts")
    .select("id,file_name,transaction_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (receiptError) throw receiptError;

  return {
    access: publicAccess(access as AccessRow | null),
    receipt: receipt
      ? {
          id: receipt.id,
          fileName: receipt.file_name,
          transactionId: receipt.transaction_id,
          createdAt: receipt.created_at,
        }
      : null,
  };
}

export async function GET() {
  try {
    const user = await getChatGPTUser();

    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    return json(await state(user.id));
  } catch {
    console.error("receipt_status_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}

async function validSignature(file: File) {
  const bytes = new Uint8Array(
    await file.slice(0, 8).arrayBuffer(),
  );

  if (file.type === "application/pdf") {
    return [37, 80, 68, 70, 45].every(
      (value, index) => bytes[index] === value,
    );
  }

  if (file.type === "image/jpeg") {
    return [255, 216, 255].every(
      (value, index) => bytes[index] === value,
    );
  }

  return [137, 80, 78, 71, 13, 10, 26, 10].every(
    (value, index) => bytes[index] === value,
  );
}

export async function POST(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(request.url).origin
  ) {
    return json({ error: "forbidden" }, 403);
  }

  try {
    const user = await getChatGPTUser();

    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const length = Number(
      request.headers.get("content-length"),
    );

    if (
      Number.isFinite(length) &&
      length > MAX_SIZE + 256 * 1024
    ) {
      return json({ error: "invalid_receipt" }, 413);
    }

    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("multipart/form-data")
    ) {
      return json({ error: "invalid_request" }, 400);
    }

    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return json({ error: "invalid_request" }, 400);
    }

    const file = form.get("receipt");
    const txid = String(form.get("transactionId") ?? "")
      .trim()
      .toLowerCase();

    if (!/^[0-9a-f]{64}$/.test(txid)) {
      return json(
        { error: "invalid_transaction_id" },
        400,
      );
    }

    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > MAX_SIZE ||
      !TYPES.has(file.type) ||
      !(await validSignature(file))
    ) {
      return json({ error: "invalid_receipt" }, 400);
    }

    const db = getSupabase();

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return json({ error: "profile_required" }, 409);
    }

    const current = await state(user.id);

    if (current.access.status === "approved") {
      return json({ error: "already_approved" }, 409);
    }

    const receiptId = crypto.randomUUID();
    const key = `receipts/${user.id}/${receiptId}`;

    const filename =
      file.name
        .replace(/[\x00-\x1f\x7f/\\]/g, "_")
        .trim()
        .slice(0, 200) || "receipt";

    await getStore("payment-receipts").set(key, file, {
      metadata: {
        ownerId: user.id,
        contentType: file.type,
        purpose: "payment-receipt",
      },
    });

    const { error } = await db.rpc(
      "submit_member_payment_receipt",
      {
        p_user_id: user.id,
        p_receipt_id: receiptId,
        p_transaction_id: txid,
        p_blob_key: key,
        p_file_name: filename,
        p_content_type: file.type,
        p_file_size: file.size,
      },
    );

    if (error) {
      const known: [string, string, number][] = [
        ["PROFILE_REQUIRED", "profile_required", 409],
        ["ALREADY_APPROVED", "already_approved", 409],
        [
          "RECEIPT_LIMIT_REACHED",
          "receipt_limit_reached",
          429,
        ],
        [
          "INVALID_TRANSACTION_ID",
          "invalid_transaction_id",
          400,
        ],
        ["INVALID_RECEIPT", "invalid_receipt", 400],
      ];

      const match = known.find(([marker]) =>
        error.message.includes(marker),
      );

      if (match) {
        try {
          await getStore("payment-receipts").delete(key);
        } catch {
          console.error("receipt_cleanup_failed");
        }

        return json({ error: match[1] }, match[2]);
      }

      // Belirsiz ağ hatasında kaydedilmiş olabilecek
      // dekont dosyasını silmeyiz.
      throw error;
    }

    return json(await state(user.id));
  } catch {
    console.error("receipt_submission_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}