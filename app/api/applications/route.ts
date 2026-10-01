import { getStore } from "@netlify/blobs";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getSupabase } from "@/db";
import { createApplication } from "@/db/repository";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE = 5 * 1024 * 1024;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

function accessDenied(status?: string) {
  return json(
    {
      error: "payment_required",
      reason:
        status === "suspended"
          ? "account_suspended"
          : "receipt_required",
      paymentUrl: "/account#payment",
    },
    402,
  );
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return json({ error: "forbidden" }, 403);
  }

  let uploadedKey = "";
  let saved = false;

  try {
    const user = await getChatGPTUser();

    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const supabase = getSupabase();

    const { data: access, error: accessError } = await supabase
      .from("member_service_access")
      .select("effective_status,can_use_service")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accessError) throw accessError;

    if (!access?.can_use_service) {
      return accessDenied(access?.effective_status);
    }

    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return json({ error: "invalid_fields" }, 400);
    }

    const cv = form.get("cv");

    if (
      !(cv instanceof File) ||
      !cv.size ||
      cv.size > MAX_SIZE ||
      !ALLOWED_TYPES.has(cv.type)
    ) {
      return json({ error: "invalid_cv" }, 400);
    }

    const jobTitle = required(form, "jobTitle");
    const country = required(form, "country");
    const profession = required(form, "profession");

    if (!jobTitle || !country || !profession) {
      return json({ error: "invalid_fields" }, 400);
    }

    const id = crypto.randomUUID();

    uploadedKey =
      `applications/${user.id}/${id}-${safeName(cv.name)}`;

    await getStore("application-cvs").set(uploadedKey, cv, {
      metadata: {
        contentType: cv.type,
        ownerId: user.id,
        purpose: "application-cv",
      },
    });

    // Veritabanı tetikleyicisi kaydetme anında erişimi
    // yeniden kontrol eder. Yükleme sırasında süre dolmuş
    // veya hesap askıya alınmışsa kayıt reddedilir.
    await createApplication({
      id,
      userId: user.id,
      jobTitle,
      country,
      profession,
      message: String(form.get("message") ?? "")
        .trim()
        .slice(0, 3000),
      cvKey: uploadedKey,
      cvName: cv.name,
      cvType: cv.type,
      cvSize: cv.size,
    });

    saved = true;

    return json({ ok: true, id });
  } catch (error) {
    const message =
      error &&
      typeof error === "object" &&
      "message" in error
        ? String(error.message)
        : "";

    if (message.includes("SERVICE_ACCESS_REQUIRED")) {
      if (uploadedKey && !saved) {
        try {
          await getStore("application-cvs").delete(uploadedKey);
        } catch {
          console.error("application_cv_cleanup_failed");
        }
      }

      return accessDenied("suspended");
    }

    // Bağlantı hatasında veritabanı kaydı gerçekleşmiş
    // olabilir. Kayıtlı başvurunun CV'sini kaybetmemek
    // için belirsiz hatalarda dosyayı silmeyiz.
    console.error("application_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}

function required(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim().slice(0, 500);
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}