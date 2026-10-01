"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { QRCodeSVG } from "qrcode.react";

type Invoice = {
  invoiceNo: string;
  address: string;
  amountXmr: string;
  expiresAt: string;
  uri: string;
};

type Access = {
  status: string;
  canUseService: boolean;
  reviewDeadline: string | null;
  suspensionReason: string | null;
};

type Receipt = {
  fileName: string;
  transactionId: string;
};

type PaymentResponse = {
  invoice: Invoice | null;
  access: Access;
  error?: string;
};

type ReceiptResponse = {
  access: Access;
  receipt: Receipt | null;
  error?: string;
};

const FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export function MemberPayment({ locale }: { locale: "tr" | "en" }) {
  const tr = locale === "tr";
  const choose = (turkish: string, english: string) =>
    tr ? turkish : english;

  const locked = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [access, setAccess] = useState<Access | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [alreadySent, setAlreadySent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);

  const errorText = useCallback((code?: string) => {
    const messages: Record<string, [string, string]> = {
      authentication_required: [
        "Oturumunuz sona erdi. Tekrar giriş yapın.",
        "Your session expired. Sign in again.",
      ],
      profile_required: [
        "Önce üyelik profilinizi tamamlayın.",
        "Complete your membership profile first.",
      ],
      payment_not_ready: [
        "Alım adresi henüz yapılandırılmadı. Ödeme göndermeyin.",
        "The receiving address is not configured. Do not pay yet.",
      ],
      rate_unavailable: [
        "XMR kuru alınamadı. Daha sonra tekrar deneyin.",
        "The XMR rate is unavailable. Try again later.",
      ],
      invalid_receipt: [
        "En fazla 5 MB boyutunda PDF, JPG veya PNG dekont yükleyin.",
        "Upload a PDF, JPG or PNG receipt up to 5 MB.",
      ],
      invalid_transaction_id: [
        "İşlem kimliği 64 karakterli TXID olmalıdır.",
        "Enter the 64-character transaction ID (TXID).",
      ],
      already_approved: [
        "Ödemeniz zaten onaylanmış. Sayfayı yenileyin.",
        "Your payment is already approved. Refresh the page.",
      ],
      receipt_limit_reached: [
        "24 saatte en fazla 5 dekont gönderebilirsiniz.",
        "You can submit up to 5 receipts in 24 hours.",
      ],
    };

    const pair = messages[code ?? ""];

    return pair
      ? pair[tr ? 0 : 1]
      : tr
        ? "İşlem tamamlanamadı. Durumu yenileyip tekrar deneyin."
        : "The operation failed. Refresh the status and try again.";
  }, [tr]);

  const loadState = useCallback(async () => {
    const [paymentResponse, receiptResponse] = await Promise.all([
      fetch("/api/payment", { cache: "no-store" }),
      fetch("/api/payment/receipt", { cache: "no-store" }),
    ]);

    const paymentBody =
      (await paymentResponse.json()) as PaymentResponse;
    const receiptBody =
      (await receiptResponse.json()) as ReceiptResponse;

    if (!paymentResponse.ok) {
      throw new Error(errorText(paymentBody.error));
    }

    if (!receiptResponse.ok) {
      throw new Error(errorText(receiptBody.error));
    }

    setInvoice(paymentBody.invoice);
    setAccess(receiptBody.access);
    setReceipt(receiptBody.receipt);
    setLoaded(true);
  }, [errorText]);

  const refresh = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);

    try {
      await loadState();
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorText(),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }, [loadState, errorText]);

  useEffect(() => {
    void refresh();

    const poll = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 60000);

    function visible() {
      if (!document.hidden) void refresh();
    }

    document.addEventListener("visibilitychange", visible);

    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function createQuote() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        cache: "no-store",
      });

      const body = (await response.json()) as PaymentResponse;

      if (!response.ok) {
        throw new Error(errorText(body.error));
      }

      setInvoice(body.invoice);
      setAccess(body.access);
      setLoaded(true);
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorText(),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function submitReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;

    if (
      !file ||
      !file.size ||
      file.size > 5 * 1024 * 1024 ||
      !FILE_TYPES.has(file.type)
    ) {
      setFailed(true);
      setMessage(errorText("invalid_receipt"));
      return;
    }

    const txid = transactionId.trim().toLowerCase();

    if (!/^[0-9a-f]{64}$/.test(txid)) {
      setFailed(true);
      setMessage(errorText("invalid_transaction_id"));
      return;
    }

    locked.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);

    try {
      const form = new FormData();
      form.set("receipt", file);
      form.set("transactionId", txid);

      const response = await fetch("/api/payment/receipt", {
        method: "POST",
        body: form,
      });

      const body = (await response.json()) as ReceiptResponse;

      if (!response.ok) {
        throw new Error(errorText(body.error));
      }

      setAccess(body.access);
      setReceipt(body.receipt);
      setFile(null);
      setTransactionId("");
      setAlreadySent(true);

      if (fileInput.current) fileInput.current.value = "";

      setMessage(
        body.access.canUseService
          ? choose(
              "Dekont kaydedildi. Hizmet erişiminiz açıldı; ödeme yönetici incelemesini bekliyor.",
              "Receipt saved. Service access is open pending administrator review.",
            )
          : choose(
              "Dekont kaydedildi. Hesabın yeniden açılması için yönetici onayı gerekiyor.",
              "Receipt saved. Administrator approval is required to restore access.",
            ),
      );
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorText(),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setMessage(choose("Kopyalandı.", "Copied."));
    } catch {
      setFailed(true);
      setMessage(choose(
        "Metni seçip elle kopyalayın.",
        "Select and copy the text manually.",
      ));
    }
  }

  const timedOut = Boolean(
    access?.status === "under_review" &&
    access.reviewDeadline &&
    now &&
    Date.parse(access.reviewDeadline) <= now,
  );

  const status = timedOut ? "suspended" : access?.status;
  const approved = status === "approved";
  const suspended = status === "suspended";
  const reviewing = status === "under_review";
  const waiting = status === "awaiting_receipt";

  const expired = Boolean(
    invoice && now && Date.parse(invoice.expiresAt) <= now,
  );

  const showPayment =
    waiting && invoice && !expired && !alreadySent;

  const date = (value: string) =>
    new Intl.DateTimeFormat(tr ? "tr-TR" : "en-GB", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));

  const fieldStyle = {
    display: "block",
    width: "100%",
    padding: 12,
    marginTop: 8,
    marginBottom: 18,
    background: "#f4f8f7",
    color: "#0b1f33",
    border: "1px solid #b8cbcd",
    borderRadius: 8,
  } as const;

  return (
    <section
      id="payment"
      aria-labelledby="payment-heading"
      style={{
        marginTop: 24,
        padding: 24,
        background: "#ffffff",
        color: "#0b1f33",
        border: "1px solid #d6e2e3",
        borderRadius: 16,
        scrollMarginTop: 100,
        overflowWrap: "anywhere",
      }}
    >
      <h2 id="payment-heading">
        {choose("Hizmet bedeli ve ödeme", "Service fee and payment")}
      </h2>

      <p style={{ fontSize: 28, fontWeight: 700 }}>1.000 €</p>

      <p>
        {choose(
          "Tek seferlik hizmet bedeli XMR ile doğrudan alım adresimize ödenir. Otomatik blockchain kontrolü yapılmaz; dekont yönetici tarafından incelenir.",
          "Pay the one-time fee in XMR directly to our receiving address. Receipts are reviewed by an administrator; there is no automatic blockchain verification.",
        )}
      </p>

      {!loaded && (
        <p>{choose("Ödeme bilgileri yükleniyor…", "Loading payment details…")}</p>
      )}

      {approved && (
        <div style={{ background: "#edf8f4", padding: 16, borderRadius: 10 }}>
          <strong>{choose("Ödemeniz onaylandı.", "Your payment is approved.")}</strong>
          <p>{choose("Hizmet erişiminiz aktif.", "Your service access is active.")}</p>
        </div>
      )}

      {reviewing && (
        <div style={{ background: "#fff7df", padding: 16, borderRadius: 10 }}>
          <strong>{choose("Dekont incelemesi bekleniyor.", "Receipt review is pending.")}</strong>
          <p>
            {choose(
              "Hizmetleri geçici olarak kullanabilirsiniz. Son tarihe kadar yönetici onayı verilmezse hesabınız otomatik askıya alınır.",
              "You have temporary service access. Without administrator approval by the deadline, your account will be suspended automatically.",
            )}
          </p>
          {access?.reviewDeadline && (
            <p>
              <strong>{choose("Son onay tarihi: ", "Review deadline: ")}</strong>
              {date(access.reviewDeadline)}
            </p>
          )}
        </div>
      )}

      {suspended && (
        <div style={{ background: "#fff1f2", color: "#9f1239", padding: 16, borderRadius: 10 }}>
          <strong>{choose("Hizmet erişiminiz askıya alındı.", "Your service access is suspended.")}</strong>
          <p>
            {timedOut || access?.suspensionReason === "review_timeout"
              ? choose(
                  "15 günlük inceleme süresi yönetici onayı olmadan doldu.",
                  "The 15-day review period expired without approval.",
                )
              : access?.suspensionReason || choose(
                  "Ödeme incelemesinde hesabınız askıya alındı.",
                  "Your account was suspended during payment review.",
                )}
          </p>
          <p>
            {choose(
              "Yeni başvuru gönderemezsiniz. Yeni dekont gönderebilirsiniz; bu işlem süreyi yenilemez veya hesabı açmaz. Yönetici onayı gerekir.",
              "New applications are blocked. You may submit another receipt, but it will not reset the deadline or restore access. Administrator approval is required.",
            )}
          </p>
        </div>
      )}

      {waiting && (
        <>
          <p>
            {choose(
              "İlk dekont kaydedilince 15 günlük geçici hizmet erişimi başlar.",
              "Saving your first receipt starts 15 days of temporary service access.",
            )}
          </p>

          <label style={{ display: "block", margin: "16px 0" }}>
            <input
              type="checkbox"
              checked={alreadySent}
              disabled={busy}
              onChange={(event) => setAlreadySent(event.target.checked)}
            />{" "}
            {choose(
              "Ödemeyi zaten gönderdim; dekont yükleyeceğim.",
              "I already sent the payment and will upload my receipt.",
            )}
          </label>

          {!alreadySent && (!invoice || expired) && (
            <>
              {expired && (
                <p>
                  {choose(
                    "Kur teklifinin süresi doldu. Ödeme gönderdiyseniz tekrar ödeme yapmayın; yukarıdaki kutuyu işaretleyip dekont yükleyin.",
                    "The quote expired. If you already paid, do not pay again; check the box above and upload your receipt.",
                  )}
                </p>
              )}
              <button
                className="btn primary"
                type="button"
                disabled={busy}
                onClick={createQuote}
              >
                {choose(
                  invoice ? "XMR tutarını yenile" : "XMR ödeme bilgilerini oluştur",
                  invoice ? "Refresh XMR quote" : "Create XMR payment details",
                )}
              </button>
            </>
          )}
        </>
      )}

      {showPayment && invoice && (
        <div style={{ marginTop: 20 }}>
          <p><strong>{invoice.invoiceNo}</strong></p>
          <p>
            {choose("Gönderilecek tutar: ", "Amount to send: ")}
            <strong>{invoice.amountXmr} XMR</strong>
          </p>
          <p>{choose("Kur teklifi sonu: ", "Quote valid until: ")}{date(invoice.expiresAt)}</p>

          <div style={{ background: "#fff", padding: 12, width: "fit-content" }}>
            <QRCodeSVG value={invoice.uri} size={220} />
          </div>

          <label htmlFor="payment-address">
            {choose("XMR alım adresi", "XMR receiving address")}
          </label>
          <textarea
            id="payment-address"
            readOnly
            value={invoice.address}
            rows={3}
            style={fieldStyle}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button type="button" className="btn secondary" onClick={() => copy(invoice.address)}>
              {choose("Adresi kopyala", "Copy address")}
            </button>
            <button type="button" className="btn secondary" onClick={() => copy(invoice.amountXmr)}>
              {choose("Tutarı kopyala", "Copy amount")}
            </button>
          </div>
        </div>
      )}

      {receipt && (
        <div style={{ marginTop: 20 }}>
          <strong>{choose("Son gönderilen dekont", "Latest receipt")}</strong>
          <p>{receipt.fileName}</p>
          <p>TXID: {receipt.transactionId}</p>
        </div>
      )}

      {loaded && !approved && (
        <form onSubmit={submitReceipt} style={{ marginTop: 24 }}>
          <h3>
            {choose(
              receipt ? "Yeni dekont gönder" : "Ödeme dekontunu yükle",
              receipt ? "Submit another receipt" : "Upload payment receipt",
            )}
          </h3>
          <p>
            {choose(
              "PDF, JPG veya PNG; en fazla 5 MB. Cüzdanınızdan işlemin TXID bilgisini kopyalayın. Seed veya özel anahtar göndermeyin.",
              "PDF, JPG or PNG, up to 5 MB. Copy the transaction ID from your wallet. Do not submit a seed or private key.",
            )}
          </p>

          <label htmlFor="payment-txid">TXID</label>
          <input
            id="payment-txid"
            type="text"
            required
            maxLength={64}
            pattern="[0-9a-fA-F]{64}"
            autoComplete="off"
            spellCheck={false}
            value={transactionId}
            disabled={busy}
            onChange={(event) => setTransactionId(event.target.value)}
            style={fieldStyle}
          />

          <label htmlFor="payment-receipt">
            {choose("Dekont dosyası", "Receipt file")}
          </label>
          <input
            ref={fileInput}
            id="payment-receipt"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            disabled={busy}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            style={fieldStyle}
          />

          <button className="btn primary" type="submit" disabled={busy || !file}>
            {busy
              ? choose("İşlem sürüyor…", "Processing…")
              : choose("Dekontu gönder", "Submit receipt")}
          </button>
        </form>
      )}

      <button
        type="button"
        className="btn secondary"
        disabled={busy}
        onClick={() => {
          setMessage("");
          setFailed(false);
          void refresh();
        }}
        style={{ marginTop: 20 }}
      >
        {choose("Durumu yenile", "Refresh status")}
      </button>

      {message && (
        <p
          role={failed ? "alert" : "status"}
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 10,
            background: failed ? "#fff1f2" : "#edf8f4",
            color: failed ? "#9f1239" : "#145344",
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}