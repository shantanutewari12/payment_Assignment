import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import type { PaymentStatus } from "@/types";
import { formatAmount } from "@/utils/formatting";

interface Props {
  status: PaymentStatus;
  attempt: number;
  maxAttempts: number;
  failureReason: string | null;
  txnId: string | null;
  amount: number;
  canRetry: boolean;
  onRetry: () => void;
  onReset: () => void;
}

function playSuccessChime(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      const end = start + 0.35;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.05);
    });
    setTimeout(() => void ctx.close(), 2500);
  } catch {
    /* audio not available */
  }
}

function fireFireworks(): void {
  const duration = 3500;
  const end = Date.now() + duration;
  const colors = ["#ff4d8d", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#9b5de5"];

  // Initial big burst
  confetti({
    particleCount: 160,
    spread: 90,
    startVelocity: 55,
    origin: { y: 0.6 },
    colors,
  });

  const interval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(interval);
      return;
    }
    // Left firework
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 75,
      startVelocity: 50,
      origin: { x: Math.random() * 0.3, y: Math.random() * 0.4 + 0.2 },
      colors,
      shapes: ["circle", "square"],
    });
    // Right firework
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 75,
      startVelocity: 50,
      origin: { x: 1 - Math.random() * 0.3, y: Math.random() * 0.4 + 0.2 },
      colors,
      shapes: ["circle", "square"],
    });
  }, 350);
}

export function StatusScreen({
  status,
  attempt,
  maxAttempts,
  failureReason,
  txnId,
  amount,
  canRetry,
  onRetry,
  onReset,
}: Props) {
  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    focusRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status === "success") {
      playSuccessChime();
      fireFireworks();
    }
  }, [status]);

  return (
    <div
      ref={focusRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-border bg-card p-8 shadow-elegant outline-none focus:ring-2 focus:ring-ring"
    >
      {status === "processing" && (
        <div className="flex flex-col items-center text-center gap-4">
          <Spinner />
          <h2 className="text-lg font-semibold">Processing your payment…</h2>
          <p className="text-sm text-muted-foreground">
            Please don't close this window. Attempt {attempt} of {maxAttempts}.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center text-center gap-4 animate-scale-in">
          <div className="h-16 w-16 rounded-full bg-success/15 text-success grid place-items-center text-4xl ring-4 ring-success/20 animate-pulse">
            ✓
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Payment successful 🎉</h2>
          <div className="text-3xl font-bold font-mono bg-gradient-brand bg-clip-text text-transparent">
            {formatAmount(amount)}
          </div>
          {txnId && (
            <p className="text-xs text-muted-foreground break-all">
              Transaction ID: <span className="font-mono">{txnId}</span>
            </p>
          )}
          <button
            onClick={onReset}
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            New payment
          </button>
        </div>
      )}

      {(status === "failed" || status === "timeout") && (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-destructive/15 text-destructive grid place-items-center text-3xl">
            {status === "timeout" ? "⏱" : "✕"}
          </div>
          <h2 className="text-xl font-semibold">
            {status === "timeout" ? "Payment timed out" : "Payment failed"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {failureReason ?? "Something went wrong. Please try again."}
          </p>
          <p className="text-xs text-muted-foreground">
            Attempt {attempt} of {maxAttempts}
          </p>
          <div className="flex gap-2 mt-2">
            {canRetry ? (
              <button
                onClick={onRetry}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                Retry payment
              </button>
            ) : (
              <p className="text-sm text-destructive">
                Maximum attempts reached. Please start a new payment.
              </p>
            )}
            <button
              onClick={onReset}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
      aria-hidden
    />
  );
}
