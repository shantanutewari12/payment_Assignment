import { useEffect, useState } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import type { Transaction } from "@/types";
import { formatAmount, formatTimestamp } from "@/utils/formatting";

const statusStyles: Record<string, string> = {
  success: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  timeout: "bg-amber-500/15 text-amber-500",
  processing: "bg-primary/15 text-primary",
  idle: "bg-muted text-muted-foreground",
};

export function TransactionHistory() {
  const history = usePaymentStore((s) => s.transactionHistory);
  const hydrate = usePaymentStore((s) => s.hydrate);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Transaction history</h3>
        <span className="text-xs text-muted-foreground">{history.length} total</span>
      </header>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No transactions yet. Your payments will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-border max-h-[24rem] overflow-y-auto -mx-2">
          {history.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setSelected(t)}
                className="w-full flex items-center justify-between gap-3 px-2 py-3 text-left hover:bg-accent/50 rounded-md transition"
              >
                <div className="min-w-0">
                  <div className="text-sm font-mono truncate">{t.id.slice(0, 8)}…</div>
                  <div className="text-xs text-muted-foreground">{formatTimestamp(t.timestamp)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold font-mono">
                    {formatAmount(t.amount)}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                      statusStyles[t.status] ?? statusStyles.idle
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-semibold mb-4">Transaction detail</h4>
            <dl className="space-y-2 text-sm">
              <Row label="ID" value={selected.id} mono />
              <Row label="Amount" value={formatAmount(selected.amount)} />
              <Row label="Status" value={selected.status} />
              <Row label="Attempts" value={String(selected.attempts)} />
              <Row label="When" value={formatTimestamp(selected.timestamp)} />
              {selected.cardholderName && (
                <Row label="Cardholder" value={selected.cardholderName} />
              )}
              {selected.cardLast4 && <Row label="Card" value={`•••• ${selected.cardLast4}`} mono />}
              {selected.failureReason && (
                <Row label="Reason" value={selected.failureReason} />
              )}
            </dl>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right break-all ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
