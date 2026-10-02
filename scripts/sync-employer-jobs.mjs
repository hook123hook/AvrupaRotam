import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const COUNTRIES = new Set(["DE", "AT", "PL", "NL"]);
const LIMIT = 100;
const MAX_PAGES = 100;

function ensure(condition, code) {
  if (!condition) throw new Error(code);
}

export function normalizePosting(post, board) {
  ensure(post && typeof post === "object", "INVALID_POSTING");
  ensure(
    typeof post.id === "string" && post.id.trim(),
    "INVALID_POSTING_ID",
  );

  const country =
    typeof post.country === "string"
      ? post.country.toUpperCase()
      : "";

  if (!COUNTRIES.has(country)) return null;

  ensure(
    typeof post.text === "string" && post.text.trim(),
    "INVALID_TITLE",
  );

  const url = new URL(post.hostedUrl);
  const host =
    board.region === "eu"
      ? "jobs.eu.lever.co"
      : "jobs.lever.co";

  ensure(
    url.protocol === "https:" &&
      url.hostname === host &&
      !url.username &&
      !url.password &&
      !url.port,
    "INVALID_JOB_URL",
  );

  ensure(
    url.pathname === `/${board.slug}/${post.id}` ||
      url.pathname === `/${board.slug}/${post.id}/`,
    "INVALID_JOB_PATH",
  );

  const categories = post.categories ?? {};
  const description = [
    post.descriptionPlain,
    post.additionalPlain,
  ]
    .filter((value) => typeof value === "string")
    .join("\n\n")
    .slice(0, 30000);

  return {
    external_id: post.id,
    source_url: url.href,
    country_code: country,
    title: post.text.trim().slice(0, 500),
    company: board.company,
    city: String(categories.location ?? "").slice(0, 500),
    sector: String(
      categories.team || categories.department || "Other",
    ).slice(0, 500),
    employment_type: [
      categories.commitment,
      post.workplaceType,
    ]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 500),
    description,
    source_language: "",
    published_at: null,
    expires_at: null,
  };
}

async function jsonRequest(
  url,
  options = {},
  readOnly = true,
) {
  const attempts = readOnly ? 3 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: "error",
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        if (
          readOnly &&
          [429, 502, 503, 504].includes(response.status) &&
          attempt + 1 < attempts
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1)),
          );
          continue;
        }

        throw new Error(`HTTP_${response.status}`);
      }

      const length = Number(
        response.headers.get("content-length") ?? 0,
      );
      ensure(length <= 20000000, "RESPONSE_TOO_LARGE");

      const chunks = [];
      let bytes = 0;

      for await (const chunk of response.body) {
        bytes += chunk.byteLength;
        ensure(bytes <= 20000000, "RESPONSE_TOO_LARGE");
        chunks.push(Buffer.from(chunk));
      }

      return JSON.parse(
        Buffer.concat(chunks).toString("utf8"),
      );
    } catch (error) {
      if (
        attempt + 1 === attempts ||
        !["TimeoutError", "TypeError"].includes(error.name)
      ) {
        throw error;
      }
    }
  }
}

export async function fetchBoard(
  board,
  request = jsonRequest,
) {
  const host =
    board.region === "eu"
      ? "api.eu.lever.co"
      : "api.lever.co";

  const postings = [];
  const ids = new Set();

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(
      `https://${host}/v0/postings/${board.slug}`,
    );

    url.searchParams.set("mode", "json");
    url.searchParams.set("limit", String(LIMIT));
    url.searchParams.set("skip", String(page * LIMIT));

    const rows = await request(url.href, {
      headers: { Accept: "application/json" },
    });

    ensure(
      Array.isArray(rows) && rows.length <= LIMIT,
      "INVALID_PAGE",
    );

    for (const post of rows) {
      ensure(
        typeof post?.id === "string" &&
          post.id &&
          !ids.has(post.id),
        "DUPLICATE_OR_INVALID_ID",
      );

      ids.add(post.id);

      const normalized = normalizePosting(post, board);
      if (normalized) postings.push(normalized);
    }

    if (rows.length < LIMIT) {
      return { postings, ids };
    }
  }

  throw new Error("PAGINATION_LIMIT_REACHED");
}

export function sameIds(first, second) {
  return (
    first.size === second.size &&
    [...first].every((id) => second.has(id))
  );
}

function validateConfig(config) {
  ensure(
    Array.isArray(config) && config.length > 0,
    "EMPTY_CONFIG",
  );

  const slugs = new Set();

  for (const board of config) {
    ensure(
      /^[a-z0-9-]{1,80}$/.test(board.slug),
      "INVALID_BOARD_SLUG",
    );
    ensure(!slugs.has(board.slug), "DUPLICATE_BOARD");
    slugs.add(board.slug);

    ensure(
      ["global", "eu"].includes(board.region),
      "INVALID_REGION",
    );
    ensure(
      typeof board.company === "string" &&
        board.company.trim(),
      "INVALID_COMPANY",
    );
    ensure(
      typeof board.enabled === "boolean",
      "INVALID_ENABLED_FLAG",
    );
    ensure(
      typeof board.permissionReference === "string" &&
        board.permissionReference.startsWith("https://"),
      "MISSING_PERMISSION_REFERENCE",
    );
  }
}

async function main() {
  const args = process.argv.slice(2);

  ensure(
    args.every((arg) => arg === "--dry-run"),
    "UNKNOWN_ARGUMENT",
  );

  const dryRun = args.includes("--dry-run");

  const config = JSON.parse(
    await readFile(
      new URL(
        "../config/employer-job-sources.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );

  validateConfig(config);

  const active = config.filter((board) => board.enabled);
  ensure(active.length > 0, "NO_ENABLED_SOURCES");

  const runtimeEnv = process.env;
  const base = runtimeEnv.SUPABASE_URL;
  const key = runtimeEnv.SUPABASE_SECRET_KEY;

  if (!dryRun) {
    ensure(
      base && key,
      "MISSING_SUPABASE_CONFIGURATION",
    );
  }

  if (base) {
    const parsed = new URL(base);

    ensure(
      parsed.protocol === "https:" &&
        parsed.hostname.endsWith(".supabase.co") &&
        parsed.pathname === "/" &&
        !parsed.username &&
        !parsed.password &&
        !parsed.search &&
        !parsed.hash &&
        !parsed.port,
      "INVALID_SUPABASE_URL",
    );
  }

  const headers = {
    apikey: key ?? "",
    Authorization: `Bearer ${key ?? ""}`,
    "Content-Type": "application/json",
  };

  let failures = 0;

  for (const board of active) {
    try {
      // İki tam taramada ilan kimliklerinin aynı olduğunu doğrula.
      const first = await fetchBoard(board);
      const second = await fetchBoard(board);

      ensure(
        sameIds(first.ids, second.ids),
        "UNSTABLE_SNAPSHOT",
      );

      console.log(
        JSON.stringify({
          board: board.slug,
          fetched: second.ids.size,
          targetCountries: second.postings.length,
          dryRun,
        }),
      );

      for (const country of COUNTRIES) {
        const jobs = second.postings.filter(
          (job) => job.country_code === country,
        );

        const sourceId =
          `lever-${board.slug}-${country.toLowerCase()}`;

        if (!jobs.length) {
          // Boş sonuç nedeniyle mevcut ilanları topluca kapatma.
          console.warn(
            JSON.stringify({
              source: sourceId,
              status: "empty_country_preserved",
            }),
          );
          continue;
        }

        if (dryRun) {
          console.log(
            JSON.stringify({
              source: sourceId,
              count: jobs.length,
            }),
          );
          continue;
        }

        const result = await jsonRequest(
          `${base.replace(/\/$/, "")}/rest/v1/rpc/sync_employer_snapshot`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              p_source_id: sourceId,
              p_jobs: jobs,
            }),
          },
          false,
        );

        console.log(
          JSON.stringify({
            source: sourceId,
            status: "synced",
            result,
          }),
        );
      }
    } catch (error) {
      failures++;

      // Gizli anahtarları veya istek adreslerini yazdırma.
      const safeCode = /^[A-Z0-9_]+$/.test(error.message)
        ? error.message
        : "SOURCE_SYNC_FAILED";

      console.error(
        JSON.stringify({
          board: board.slug,
          error: safeCode,
        }),
      );
    }
  }

  if (failures) process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(
      /^[A-Z0-9_]+$/.test(error.message)
        ? error.message
        : "SYNC_FAILED",
    );
    process.exitCode = 1;
  });
}