import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { createApplication } from "@/db/repository";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "authentication_required" }, { status: 401 });

  try {
    const form = await request.formData();
    const cv = form.get("cv");
    if (!(cv instanceof File) || !cv.size || cv.size > MAX_SIZE || !ALLOWED_TYPES.has(cv.type)) {
      return Response.json({ error: "invalid_cv" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const cvKey = `applications/${user.id}/${id}-${safeName(cv.name)}`;
    await env.BUCKET.put(cvKey, cv.stream(), {
      httpMetadata: { contentType: cv.type },
      customMetadata: { ownerId: user.id, purpose: "application-cv" },
    });
    await createApplication({
      id,
      userId: user.id,
      jobTitle: required(form, "jobTitle"),
      country: required(form, "country"),
      profession: required(form, "profession"),
      message: String(form.get("message") ?? "").trim().slice(0, 3000),
      cvKey,
      cvName: cv.name,
      cvType: cv.type,
      cvSize: cv.size,
    });
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error("application_failed", error);
    return Response.json({ error: "service_unavailable" }, { status: 503 });
  }
}

function required(form: FormData, key: string) {
  const value = String(form.get(key) ?? "").trim();
  if (!value) throw new Error(`Missing ${key}`);
  return value.slice(0, 500);
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}
