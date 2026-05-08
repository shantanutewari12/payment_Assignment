import { create } from "zustand";
import type { PaymentStatus, Transaction } from "@/types";

const STORAGE_KEY = "payment_history_v1";

function loadHistory(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Transaction[];
  } catch {
    return [];
  }
}

function saveHistory(history: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore quota errors */
  }
}

interface PaymentState {
  status: PaymentStatus;
  currentTxnId: string | null;
  currentAttempt: number;
  lastFailureReason: string | null;
  transactionHistory: Transaction[];
  hydrated: boolean;
  hydrate: () => void;
  setStatus: (s: PaymentStatus) => void;
  startTransaction: (txnId: string) => void;
  incrementAttempt: () => void;
  setFailureReason: (reason: string | null) => void;
  upsertTransaction: (txn: Transaction) => void;
  resetCurrent: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  status: "idle",
  currentTxnId: null,
  currentAttempt: 0,
  lastFailureReason: null,
  transactionHistory: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ transactionHistory: loadHistory(), hydrated: true });
  },
  setStatus: (s) => set({ status: s }),
  startTransaction: (txnId) =>
    set({ currentTxnId: txnId, currentAttempt: 0, lastFailureReason: null, status: "idle" }),
  incrementAttempt: () => set((st) => ({ currentAttempt: st.currentAttempt + 1 })),
  setFailureReason: (reason) => set({ lastFailureReason: reason }),
  upsertTransaction: (txn) =>
    set((st) => {
      const idx = st.transactionHistory.findIndex((t) => t.id === txn.id);
      let next: Transaction[];
      if (idx >= 0) {
        next = [...st.transactionHistory];
        next[idx] = txn;
      } else {
        next = [txn, ...st.transactionHistory];
      }
      saveHistory(next);
      return { transactionHistory: next };
    }),
  resetCurrent: () =>
    set({ status: "idle", currentTxnId: null, currentAttempt: 0, lastFailureReason: null }),
}));

export const MAX_ATTEMPTS = 3;
