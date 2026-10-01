"use client";

import { useEffect, useRef, useState } from "react";

type Account = {
  user_id: string;
  full_name: string;
  email: string;
  effective_status: string;
  review_deadline: string | null;
  suspension_reason: string | null;
};

type Receipt = {
  id: string;
  file_name: string;
  transaction_id: string;
  created_at: string;
};

const STATUS_NAMES: Record<string, string> = {
  under_review: "İnceleme bekliyor",
  approved: "Onaylandı",
  suspended: "Askıya alındı",
  awaiting_receipt: "Dekont bekleniyor",
};

function errorText(code?: string) {
  const messages: Record<string, string> = {
    admin_required: "Yönetici oturumunuz yok. Tekrar giriş yapın.",
    receipt_required: "Dekont bulunmadan ödeme onaylanamaz.",
    reason_required: "Askıya alma gerekçesi yazın.",
    account_not_found: "Hesap bulunamadı.",
  };

  return messages[code ?? ""] ??
    "İşlem tamamlanamadı. Listeyi yenileyip tekrar deneyin.";
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}

export function PaymentReviewDashboard() {
  const actionLock = useRef(false);
  const [filter, setFilter] = useState("under_review");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Account | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptPage, setReceiptPage] = useState(0);
  const [receiptMore, setReceiptMore] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setAccounts([]);
    setHasMore(false);

    async function load() {
      try {
        const response = await fetch(
          `/api/admin/payments?status=${filter}&page=${page}`,
          { cache: "no-store", signal: controller.signal },
        );

        const body = await response.json() as {
          accounts?: Account[];
          hasMore?: boolean;
          error?: string;
        };

        if (!response.ok) throw new Error(errorText(body.error));

        if (!controller.signal.aborted) {
          setAccounts(body.accounts ?? []);
          setHasMore(body.hasMore ?? false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFailed(true);
          setMessage(
            error instanceof Error ? error.message : errorText(),
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [filter, page, revision]);

  useEffect(() => {
    if (!selected) return;

    const controller = new AbortController();
    const userId = selected.user_id;
    setReceiptLoading(true);
    setReceipts([]);
    setReceiptMore(false);
    setConfirmed(false);

    async function load() {
      try {
        const response = await fetch(
          `/api/admin/payments?userId=${userId}&page=${receiptPage}`,
          { cache: "no-store", signal: controller.signal },
        );

        const body = await response.json() as {
          receipts?: Receipt[];
          hasMore?: boolean;
          error?: string;
        };

        if (!response.ok) throw new Error(errorText(body.error));

        if (!controller.signal.aborted) {
          setReceipts(body.receipts ?? []);
          setReceiptMore(body.hasMore ?? false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFailed(true);
          setMessage(
            error instanceof Error ? error.message : errorText(),
          );
        }
      } finally {
        if (!controller.signal.aborted) setReceiptLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [selected, receiptPage, revision]);

  function selectAccount(account: Account) {
    setSelected(account);
    setReceiptPage(0);
    setConfirmed(false);
    setReason("");
    setMessage("");
    setFailed(false);
  }

  async function review(action: "approve" | "suspend") {
    if (!selected || actionLock.current) return;

    if (action === "approve" && (!confirmed || !receipts.length)) {
      setFailed(true);
      setMessage("Ödemeyi Feather üzerinden kontrol edip kutuyu işaretleyin.");
      return;
    }

    if (action === "suspend" && !reason.trim()) {
      setFailed(true);
      setMessage("Kullanıcıya gösterilecek askıya alma gerekçesini yazın.");
      return;
    }

    actionLock.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selected.user_id,
          action,
          reason: reason.trim(),
        }),
      });

      const body = await response.json() as { error?: string };

      if (!response.ok) throw new Error(errorText(body.error));

      setMessage(
        action === "approve"
          ? "Ödeme onaylandı. Hizmet erişimi aktif."
          : "Hesap askıya alındı. Yeni hizmet işlemleri engellendi.",
      );
      setSelected(null);
      setConfirmed(false);
      setReason("");
      setRevision((value) => value + 1);
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : errorText(),
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  const panelStyle = {
    padding: 20,
    marginTop: 20,
    background: "#fff",
    color: "#0b1f33",
    border: "1px solid #d6e2e3",
    borderRadius: 12,
    overflowWrap: "anywhere" as const,
  };

  return (
    <main style={{
      minHeight: "100vh",
      padding: 24,
      background: "#f4f8f7",
      color: "#0b1f33",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <a href="/account">← Hesabıma dön</a>
        <h1>Ödeme inceleme yönetimi</h1>
        <p>
          Dekontu ve TXID bilgisini inceleyin. Gerçek ödemeyi Feather
          üzerinden kontrol ettikten sonra onaylayın.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <label>
            Durum{" "}
            <select
              value={filter}
              disabled={busy}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(0);
                setSelected(null);
                setMessage("");
              }}
              style={{ background: "#fff", color: "#0b1f33", padding: 10 }}
            >
              <option value="under_review">İnceleme bekleyenler</option>
              <option value="suspended">Askıya alınanlar</option>
              <option value="approved">Onaylananlar</option>
              <option value="awaiting_receipt">Dekont bekleyenler</option>
              <option value="all">Tümü</option>
            </select>
          </label>

          <button
            className="btn secondary"
            disabled={busy || loading}
            onClick={() => {
              setSelected(null);
              setMessage("");
              setRevision((value) => value + 1);
            }}
          >
            Listeyi yenile
          </button>
        </div>

        {message && (
          <p role={failed ? "alert" : "status"} style={{
            ...panelStyle,
            background: failed ? "#fff1f2" : "#edf8f4",
            color: failed ? "#9f1239" : "#145344",
          }}>
            {message}
          </p>
        )}

        <section style={panelStyle}>
          {loading ? <p>Yükleniyor…</p> : accounts.length ? (
            accounts.map((account) => (
              <article key={account.user_id} style={{
                padding: "16px 0",
                borderBottom: "1px solid #d6e2e3",
              }}>
                <strong>{account.full_name || account.email || account.user_id}</strong>
                <p>{account.email}</p>
                <p>{STATUS_NAMES[account.effective_status] ?? account.effective_status}</p>
                <p>Son onay tarihi: {formatDate(account.review_deadline)}</p>
                <button
                  className="btn secondary"
                  disabled={busy}
                  onClick={() => selectAccount(account)}
                >
                  Dekontları ve hesabı incele
                </button>
              </article>
            ))
          ) : <p>Bu durumda kayıt bulunmuyor.</p>}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              disabled={busy || loading || page === 0}
              onClick={() => {
                setPage((value) => value - 1);
                setSelected(null);
              }}
            >
              Önceki
            </button>
            <span>Sayfa {page + 1}</span>
            <button
              disabled={busy || loading || !hasMore}
              onClick={() => {
                setPage((value) => value + 1);
                setSelected(null);
              }}
            >
              Sonraki
            </button>
          </div>
        </section>

        {selected && (
          <section style={panelStyle}>
            <h2>{selected.full_name || selected.email || "Hesap incelemesi"}</h2>
            <p>{selected.email}</p>
            <p>Kullanıcı ID: {selected.user_id}</p>
            <p>Son onay tarihi: {formatDate(selected.review_deadline)}</p>

            {selected.suspension_reason && (
              <p>Askıya alma gerekçesi: {selected.suspension_reason}</p>
            )}

            <h3>Dekont geçmişi</h3>
            {receiptLoading ? <p>Dekontlar yükleniyor…</p> : receipts.length ? (
              receipts.map((receipt) => (
                <article key={receipt.id} style={{
                  marginBottom: 16,
                  padding: 14,
                  background: "#f4f8f7",
                  borderRadius: 8,
                }}>
                  <strong>{receipt.file_name}</strong>
                  <p>{formatDate(receipt.created_at)}</p>
                  <p>TXID: {receipt.transaction_id}</p>
                  <a
                    className="btn secondary"
                    href={`/api/admin/payments/receipt?id=${receipt.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dekontu indir
                  </a>
                </article>
              ))
            ) : <p>Dekont bulunmuyor.</p>}

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                disabled={busy || receiptLoading || receiptPage === 0}
                onClick={() => setReceiptPage((value) => value - 1)}
              >
                Önceki dekontlar
              </button>
              <button
                disabled={busy || receiptLoading || !receiptMore}
                onClick={() => setReceiptPage((value) => value + 1)}
              >
                Daha eski dekontlar
              </button>
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={confirmed}
                disabled={busy || receiptLoading}
                onChange={(event) => setConfirmed(event.target.checked)}
              />{" "}
              Adresi, tutarı ve ödemeyi Feather üzerinden doğruladım.
            </label>

            <label htmlFor="review-reason">
              İnceleme notu / askıya alma gerekçesi
            </label>
            <textarea
              id="review-reason"
              value={reason}
              maxLength={1000}
              disabled={busy}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                margin: "8px 0 16px",
                background: "#fff",
                color: "#0b1f33",
                border: "1px solid #b8cbcd",
                borderRadius: 8,
              }}
            />
            <p>Askıya alma gerekçesi kullanıcıya gösterilir.</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button
                className="btn primary"
                disabled={
                  busy || receiptLoading || !confirmed || !receipts.length
                }
                onClick={() => void review("approve")}
              >
                Ödemeyi onayla ve erişimi aç
              </button>
              <button
                className="btn secondary"
                disabled={busy || !reason.trim()}
                onClick={() => void review("suspend")}
              >
                Hesabı askıya al
              </button>
              <button
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                İncelemeyi kapat
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}