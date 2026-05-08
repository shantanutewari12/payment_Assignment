import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardInput, type CardFormState } from "@/components/CardInput";
import { CardPreview } from "@/components/CardPreview";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { usePayment } from "@/hooks/usePayment";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PayDeck — Premium Payments" },
      {
        name: "description",
        content: "Experience the next generation of seamless checkouts with PayDeck 3D cards.",
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <main className="min-h-screen bg-mesh relative selection:bg-primary/30 transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-50 transition-opacity duration-700">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[140px] rounded-full animate-float-3d" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[140px] rounded-full animate-float-3d"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      <nav className="sticky top-0 z-50 py-4 px-6 mb-10 transition-colors duration-500 bg-white/70 backdrop-blur-xl border-b border-black/5 dark:bg-[#050505] dark:border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img
                src={theme === "dark" ? "/logo.png" : "/logo-light.png"}
                alt="PayDeck Logo"
                className="h-8 w-auto object-contain transition-all duration-500 group-hover:scale-105"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-glow hidden sm:inline text-black dark:text-white">
              Pay<span className="text-primary italic">Deck</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <div className="hidden md:flex px-5 py-2 rounded-full border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[9px] font-black tracking-widest uppercase text-black/60 dark:text-white/60">
              Secure PayDeck Engine
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <header className="mb-14 text-center relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-5 leading-tight text-glow text-black dark:text-white">
              PayDeck <span className="text-primary italic">Premium</span>
            </h1>
            <p className="text-base text-black/60 dark:text-white/60 font-medium leading-relaxed">
              The most advanced, professional, and seamless payment experience for modern platforms.
            </p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-border bg-card/60 p-4 sm:p-12 shadow-elegant backdrop-blur-md relative overflow-hidden group transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex justify-center mb-10 sm:mb-16 relative z-10">
                <CardPreview
                  cardNumber={form.cardNumber}
                  cardholderName={form.cardholderName}
                  expiry={form.expiry}
                  brand={form.brand}
                />
              </div>

              <div className="relative z-10 w-full max-w-xl mx-auto">
                <AnimatePresence mode="wait">
                  {showStatus ? (
                    <StatusScreen
                      key="status"
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
                      key="input"
                      value={form}
                      onChange={setForm}
                      onSubmit={handleSubmit}
                      disabled={false}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full space-y-8"
          >
            <TransactionHistory />

            <div className="rounded-[1.5rem] border border-border bg-card/60 p-8 shadow-elegant backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary glow-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight text-foreground dark:text-white">
                    PCI-DSS Secure
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-80 dark:text-white/50">
                    Verified Processing
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium relative z-10 opacity-90 dark:text-white/60">
                PayDeck uses end-to-end encryption to protect your sensitive information with the
                highest standards.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>

      <footer className="mt-16 py-12 text-center transition-colors duration-500 bg-white/70 dark:bg-[#050505] border-t border-black/5 dark:border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.05)]">
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/40 dark:text-white/60">
          PayDeck Engine v4.2.0 — Developed by Shantanu Tiwari
        </p>
      </footer>
    </main>
  );
}
