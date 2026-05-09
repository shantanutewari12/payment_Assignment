import { memo, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
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

export const TransactionHistory = memo(function TransactionHistory() {
  const history = usePaymentStore((s) => s.transactionHistory);
  const hydrate = usePaymentStore((s) => s.hydrate);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 100);
    doc.text("PayDeck Transaction Report", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
    doc.text(`Total Transactions: ${history.length}`, 20, 33);

    // Table Header
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Date", 22, 47);
    doc.text("ID", 70, 47);
    doc.text("Amount", 130, 47);
    doc.text("Status", 165, 47);
    doc.line(20, 52, 190, 52);

    // Table Rows
    doc.setFont("helvetica", "normal");
    let y = 60;
    history.forEach((t) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(formatTimestamp(t.timestamp), 22, y);
      doc.setFontSize(8);
      doc.text(t.id, 70, y);
      doc.setFontSize(10);
      doc.text(formatAmount(t.amount), 130, y);
      doc.text(t.status.toUpperCase(), 165, y);
      y += 10;
    });

    doc.save("paydeck-history.pdf");
  };

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-elegant backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <header className="flex items-center justify-between mb-6 relative">
        <div>
          <h3 className="text-base font-bold tracking-tight">Transaction History</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
            Realtime activity
          </p>
        </div>
        <span className="text-xs font-bold bg-muted px-2 py-1 rounded-md text-muted-foreground border border-border/50">
          {history.length}
        </span>
      </header>

      {history.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="text-3xl opacity-20">📭</div>
          <p className="text-sm text-muted-foreground max-w-[12rem] mx-auto">
            No transactions yet. Start a payment to see activity.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border/40 max-h-[26rem] overflow-y-auto -mx-2 pr-2 scrollbar-thin">
            {history.map((t) => (
              <li key={t.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={() => setSelected(t)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-4 text-left hover:bg-primary/5 rounded-xl transition-all group/item"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold font-mono text-foreground/90 group-hover/item:text-primary transition-colors">
                      {t.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                      {formatTimestamp(t.timestamp)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono">{formatAmount(t.amount)}</div>
                    <span
                      className={`inline-block mt-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full border border-current transition-all ${
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

          {history.length > 1 && (
            <button
              onClick={generatePDF}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-muted/50 hover:bg-muted py-3 text-xs font-bold transition-all border border-border/50 group/pdf"
            >
              <svg
                className="w-4 h-4 text-muted-foreground group-hover/pdf:text-primary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download History (PDF)
            </button>
          )}
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand" />

            <header className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black tracking-tight">Transaction Detail</h4>
              <button
                onClick={() => setSelected(null)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                ✕
              </button>
            </header>

            <dl className="space-y-4">
              <DetailRow label="Transaction ID" value={selected.id} mono />
              <DetailRow label="Amount" value={formatAmount(selected.amount)} highlight />
              <DetailRow
                label="Status"
                value={selected.status.toUpperCase()}
                status={selected.status}
              />
              <DetailRow label="Date & Time" value={formatTimestamp(selected.timestamp)} />
              <DetailRow label="Attempts" value={`${selected.attempts} of 3`} />
              {selected.cardLast4 && (
                <DetailRow label="Card ending in" value={`•••• ${selected.cardLast4}`} mono />
              )}
              {selected.failureReason && (
                <DetailRow label="Reason for failure" value={selected.failureReason} error />
              )}
            </dl>

            <button
              onClick={() => setSelected(null)}
              className="mt-10 w-full rounded-2xl bg-foreground text-background py-4 text-sm font-bold shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  );
});


function DetailRow({
  label,
  value,
  mono,
  highlight,
  status,
  error,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  status?: string;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/40 pb-3">
      <dt className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
        {label}
      </dt>
      <dd
        className={`text-sm ${mono ? "font-mono" : "font-bold"} ${highlight ? "text-2xl font-black text-primary" : ""} ${status ? (status === "success" ? "text-success" : "text-destructive") : ""} ${error ? "text-destructive italic" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
