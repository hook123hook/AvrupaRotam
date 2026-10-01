import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getSupabase } from "@/db";

export const dynamic = "force-dynamic";

const QUOTE_FIELDS =
  "id,invoice_no,address,amount_eur,amount_xmr,fx_rate,expires_at,created_at" as const;

const ACCESS_FIELDS =
  "user_id,effective_status,can_use_service,first_receipt_at,review_deadline,reviewed_at,suspension_reason" as const;

type Quote = {
  id: string;
  invoice_no: string;
  address: string;
  amount_eur: number | string;
  amount_xmr: number | string;
  fx_rate: number | string;
  expires_at: string;
  created_at: string;
};

type Access = {
  user_id: string;
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

async function getPaymentState(userId: string) {
  const supabase = getSupabase();

  const { data: access, error: accessError } = await supabase
    .from("member_service_access")
    .select(ACCESS_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (accessError) throw accessError;

  const { data: quote, error: quoteError } = await supabase
    .from("member_payment_quotes")
    .select(QUOTE_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (quoteError) throw quoteError;

  return {
    access: access as Access | null,
    quote: quote as Quote | null,
  };
}

function publicState(quote: Quote | null, access: Access | null) {
  const status = access?.effective_status ?? "awaiting_receipt";

  const serviceAccess = {
    status,
    canUseService: access?.can_use_service ?? false,
    firstReceiptAt: access?.first_receipt_at ?? null,
    reviewDeadline: access?.review_deadline ?? null,
    reviewedAt: access?.reviewed_at ?? null,
    suspensionReason: access?.suspension_reason ?? null,
  };

  if (!quote) {
    return {
      paid: status === "approved",
      access: serviceAccess,
      invoice: null,
    };
  }

  const amount = Number(quote.amount_xmr).toFixed(12);

  return {
    paid: status === "approved",
    access: serviceAccess,
    invoice: {
      id: quote.id,
      invoiceNo: quote.invoice_no,
      address: quote.address,
      amountEur: Number(quote.amount_eur),
      amountXmr: amount,
      rate: Number(quote.fx_rate),
      status: status === "approved" ? "credited" : status,
      expiresAt: quote.expires_at,
      createdAt: quote.created_at,
      expired: Date.parse(quote.expires_at) <= Date.now(),
      uri:
        `monero:${quote.address}?tx_amount=${amount}` +
        `&tx_description=${encodeURIComponent(quote.invoice_no)}`,
    },
  };
}

async function getRate() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=eur",
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("rate_unavailable");

  const data = (await response.json()) as {
    monero?: { eur?: number };
  };

  const rate = Number(data.monero?.eur);

  if (!Number.isFinite(rate) || rate < 20 || rate > 5000) {
    throw new Error("rate_unavailable");
  }

  return rate;
}

export async function GET() {
  try {
    const user = await getChatGPTUser();

    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const { quote, access } = await getPaymentState(user.id);

    return json(publicState(quote, access));
  } catch {
    console.error("payment_status_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return json({ error: "forbidden" }, 403);
  }

  try {
    const user = await getChatGPTUser();

    if (!user) {
      return json({ error: "authentication_required" }, 401);
    }

    const existing = await getPaymentState(user.id);

    // Dekont gönderilmiş veya hesap onaylanmış/askıya alınmışsa
    // yeni ödeme istemeyiz ve inceleme süresini değiştirmeyiz.
    if (
      existing.access &&
      (
        existing.access.effective_status !== "awaiting_receipt" ||
        existing.access.first_receipt_at !== null
      )
    ) {
      return json(publicState(existing.quote, existing.access));
    }

    // Geçerli kur teklifini yeniden kullan.
    if (
      existing.quote &&
      Date.parse(existing.quote.expires_at) > Date.now()
    ) {
      return json(publicState(existing.quote, existing.access));
    }

    // Alım adresini çalışma anında oku.
    const runtimeEnv = process.env;
    const address = runtimeEnv["XMR_RECEIVING_ADDRESS"]?.trim();

    if (
      !address ||
      !/^[48][1-9A-HJ-NP-Za-km-z]{94}$/.test(address)
    ) {
      return json({ error: "payment_not_ready" }, 503);
    }

    let rate: number;

    try {
      rate = await getRate();
    } catch {
      return json({ error: "rate_unavailable" }, 502);
    }

    const supabase = getSupabase();

    const { error } = await supabase.rpc(
      "create_member_manual_quote",
      {
        p_user_id: user.id,
        p_fx_rate: rate,
        p_address: address,
      },
    );

    if (error) {
      if (error.message.includes("PROFILE_REQUIRED")) {
        return json({ error: "profile_required" }, 409);
      }

      if (error.message.includes("INVALID_ADDRESS")) {
        return json({ error: "payment_not_ready" }, 503);
      }

      if (error.message.includes("NO_NEW_PAYMENT_REQUIRED")) {
        const state = await getPaymentState(user.id);
        return json(publicState(state.quote, state.access));
      }

      throw error;
    }

    // Aynı anda dekont gönderilmişse güncel erişim durumunu döndür.
    const state = await getPaymentState(user.id);

    return json(publicState(state.quote, state.access));
  } catch {
    console.error("payment_creation_failed");
    return json({ error: "service_unavailable" }, 503);
  }
}