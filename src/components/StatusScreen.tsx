import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

function playFailureChime(): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [220.0, 196.0]; // A3 G3
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const start = now + i * 0.15;
      const end = start + 0.4;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.linearRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.05);
    });
    setTimeout(() => void ctx.close(), 2000);
  } catch {
    /* audio not available */
  }
}

function fireFireworks(): void {
  const duration = 3500;
  const end = Date.now() + duration;
  const colors = ["#ff4d8d", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#9b5de5"];

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
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 75,
      startVelocity: 50,
      origin: { x: Math.random() * 0.3, y: Math.random() * 0.4 + 0.2 },
      colors,
      shapes: ["circle", "square"],
    });
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
    } else if (status === "failed" || status === "timeout") {
      playFailureChime();
    }
  }, [status]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        ref={focusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={`rounded-2xl border border-border bg-card/50 p-8 shadow-elegant outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-md ${
          status === "failed" || status === "timeout" ? "animate-shake" : ""
        }`}
      >
        {status === "processing" && (
          <div className="flex flex-col items-center text-center gap-6">
            <Spinner />
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Processing Securely</h2>
              <p className="text-sm text-muted-foreground">
                Authorizing your payment. Attempt {attempt} of {maxAttempts}.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center text-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="h-20 w-20 rounded-full bg-success/15 text-success grid place-items-center text-5xl ring-8 ring-success/10"
            >
              ✓
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Payment Successful!</h2>
              <div className="text-4xl font-black font-mono text-primary">
                {formatAmount(amount)}
              </div>
            </div>
            {txnId && (
              <div className="px-4 py-2 bg-muted/40 rounded-lg border border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">
                  Transaction ID
                </p>
                <p className="text-xs font-mono break-all">{txnId}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="mt-4 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              Start New Payment
            </motion.button>
          </div>
        )}

        {(status === "failed" || status === "timeout") && (
          <div className="flex flex-col items-center text-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-16 w-16 rounded-full bg-destructive/15 text-destructive grid place-items-center text-4xl ring-8 ring-destructive/10"
            >
              {status === "timeout" ? "⏱" : "✕"}
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-destructive">
                {status === "timeout" ? "Payment Timed Out" : "Payment Failed"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm px-4">
                {failureReason ?? "We couldn't authorize your card. Please check your details."}
              </p>
            </div>
            <div className="text-xs font-medium text-muted-foreground/60">
              Final attempt {attempt} of {maxAttempts}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              {canRetry && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg"
                >
                  Retry Payment
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold hover:bg-accent"
              >
                Start Over
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
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
