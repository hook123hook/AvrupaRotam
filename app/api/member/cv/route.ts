import { getStore } from "@netlify/blobs";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getMemberCv, updateMemberCv } from "@/db/repository";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE = 5 * 1024 * 1024;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isSameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

async function cleanupCv(key: string) {
  if (!key) return true;

  try {
    await getStore("member-cvs").delete(key);
    return true;
  } catch {
    console.error("member_cv_cleanup_failed");
    return false;
  }
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "forbidden" }, 403);
  }

  let newKey = "";
  let committed = false;

  try {
    const user = await getChatGPTUser();
    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const profile = await getMemberCv(user.id);
    if (!profile) {
      return json({ error: "profile_required" }, 404);
    }

    const form = await request.formData();
    const cv = form.get("cv");

    if (
      !(cv instanceof File) ||
      !cv.size ||
      cv.size > MAX_SIZE ||
      !ALLOWED_TYPES.has(cv.type)
    ) {
      return json({ error: "invalid_cv" }, 400);
    }

    newKey = `members/${user.id}/${crypto.randomUUID()}-${safeName(cv.name)}`;

    await getStore("member-cvs").set(newKey, cv, {
      metadata: {
        contentType: cv.type,
        ownerId: user.id,
        purpose: "membership-cv",
      },
    });

    const updated = await updateMemberCv({
      userId: user.id,
      previousCvKey: profile.cvKey,
      cvKey: newKey,
      cvName: cv.name,
      cvType: cv.type,
      cvSize: cv.size,
    });

    if (!updated) {
      await cleanupCv(newKey);
      return json({ error: "cv_changed_retry" }, 409);
    }

    committed = true;

    const cleaned = await cleanupCv(profile.cvKey);

    return json({
      ok: true,
      cvName: cv.name,
      cleanupPending: !cleaned,
    });
  } catch {
    if (newKey && !committed) {
      await cleanupCv(newKey);
    }

    console.error("member_cv_update_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ error: "forbidden" }, 403);
  }

  try {
    const user = await getChatGPTUser();
    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const profile = await getMemberCv(user.id);
    if (!profile) {
      return json({ error: "profile_required" }, 404);
    }

    if (!profile.cvKey) {
      return json({ ok: true });
    }

    const updated = await updateMemberCv({
      userId: user.id,
      previousCvKey: profile.cvKey,
      cvKey: "",
      cvName: "",
      cvType: "",
      cvSize: 0,
    });

    if (!updated) {
      return json({ error: "cv_changed_retry" }, 409);
    }

    const cleaned = await cleanupCv(profile.cvKey);

    return json({
      ok: true,
      cleanupPending: !cleaned,
    });
  } catch {
    console.error("member_cv_delete_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}