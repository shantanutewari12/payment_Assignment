import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CardInput, type CardFormState } from "@/components/CardInput";
import { CardPreview } from "@/components/CardPreview";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { usePayment } from "@/hooks/usePayment";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Secure Checkout — Pay" },
      {
        name: "description",
        content: "Simulated payment gateway with realtime card validation, retry logic and transaction history.",
      },
    ],
  }),
});

const initialForm: CardFormState = {
  brand: "unknown",
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
};

function Index() {
  const [form, setForm] = useState<CardFormState>(initialForm);

  const {
    status,
    currentAttempt,
    currentTxnId,
    lastFailureReason,
    maxAttempts,
    canRetry,
    submit,
    retry,
    reset,
  } = usePayment();

  const showStatus = status !== "idle";

  const handleSubmit = () => {
    void submit({
      cardholderName: form.cardholderName,
      cardNumber: form.cardNumber,
      expiry: form.expiry,
      cvv: form.cvv,
      amount: parseFloat(form.amount),
      brand: form.brand,
    });
  };

  const handleReset = () => {
    reset();
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center text-primary-foreground font-bold">
            ƥ
          </div>
          <span className="font-semibold tracking-tight">PayDeck</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Secure simulated checkout
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Complete your payment</h1>
        <p className="text-sm text-muted-foreground mb-8">
          All transactions on this page are simulated. No real card is charged.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex justify-center mb-6">
                <CardPreview
                  cardNumber={form.cardNumber}
                  cardholderName={form.cardholderName}
                  expiry={form.expiry}
                  brand={form.brand}
                />
              </div>
              {showStatus ? (
                <StatusScreen
                  status={status}
                  attempt={currentAttempt}
                  maxAttempts={maxAttempts}
                  failureReason={lastFailureReason}
                  txnId={currentTxnId}
                  amount={parseFloat(form.amount) || 0}
                  canRetry={canRetry}
                  onRetry={() => void retry()}
                  onReset={handleReset}
                />
              ) : (
                <CardInput
                  value={form}
                  onChange={setForm}
                  onSubmit={handleSubmit}
                  disabled={false}
                />
              )}
            </div>
          </div>

          <aside>
            <TransactionHistory />
          </aside>
        </div>
      </main>
    </div>
  );
}
