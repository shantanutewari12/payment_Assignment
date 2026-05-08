import { useCallback, useRef } from "react";
import { MAX_ATTEMPTS, usePaymentStore } from "@/store/paymentStore";
import type { CardType, PaymentApiResponse, PaymentPayload, Transaction } from "@/types";

interface SubmitInput {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  brand: CardType;
}

const TIMEOUT_MS = 6000;

export function usePayment() {
  const txnIdRef = useRef<string | null>(null);
  const lastInputRef = useRef<SubmitInput | null>(null);

  const {
    status,
    currentAttempt,
    currentTxnId,
    lastFailureReason,
    setStatus,
    startTransaction,
    incrementAttempt,
    setFailureReason,
    upsertTransaction,
    resetCurrent,
  } = usePaymentStore();

  const submit = useCallback(
    async (input: SubmitInput): Promise<void> => {
      lastInputRef.current = input;
      let txnId = txnIdRef.current;
      if (!txnId) {
        txnId = crypto.randomUUID();
        txnIdRef.current = txnId;
        startTransaction(txnId);
      }
      const attemptNumber = usePaymentStore.getState().currentAttempt + 1;
      if (attemptNumber > MAX_ATTEMPTS) return;
      incrementAttempt();
      setStatus("processing");

      const payload: PaymentPayload = {
        transactionId: txnId,
        cardholderName: input.cardholderName.trim(),
        cardNumber: input.cardNumber.replace(/\s/g, ""),
        expiry: input.expiry,
        cvv: input.cvv,
        amount: input.amount,
        currency: "INR",
        brand: input.brand,
      };

      const baseTxn: Transaction = {
        id: txnId,
        amount: input.amount,
        currency: "INR",
        status: "processing",
        timestamp: new Date().toISOString(),
        attempts: attemptNumber,
        cardLast4: payload.cardNumber.slice(-4),
        cardholderName: payload.cardholderName,
        brand: input.brand,
      };
      upsertTransaction(baseTxn);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch("/api/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error("network");
        const data = (await res.json()) as PaymentApiResponse;
        if (data.success && data.status === "success") {
          setStatus("success");
          setFailureReason(null);
          upsertTransaction({ ...baseTxn, status: "success", attempts: attemptNumber });
        } else {
          const reason = data.reason ?? "Payment was declined";
          setStatus("failed");
          setFailureReason(reason);
          upsertTransaction({
            ...baseTxn,
            status: "failed",
            failureReason: reason,
            attempts: attemptNumber,
          });
        }
      } catch (err) {
        clearTimeout(timer);
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        const status = isAbort ? "timeout" : "failed";
        const reason = isAbort
          ? "The request took too long. Please try again."
          : "We couldn't reach the payment service. Please try again.";
        setStatus(status);
        setFailureReason(reason);
        upsertTransaction({
          ...baseTxn,
          status,
          failureReason: reason,
          attempts: attemptNumber,
        });
      }
    },
    [incrementAttempt, setFailureReason, setStatus, startTransaction, upsertTransaction],
  );

  const retry = useCallback(async (): Promise<void> => {
    if (!lastInputRef.current) return;
    if (currentAttempt >= MAX_ATTEMPTS) return;
    await submit(lastInputRef.current);
  }, [currentAttempt, submit]);

  const reset = useCallback((): void => {
    txnIdRef.current = null;
    lastInputRef.current = null;
    resetCurrent();
  }, [resetCurrent]);

  return {
    status,
    currentAttempt,
    currentTxnId,
    lastFailureReason,
    maxAttempts: MAX_ATTEMPTS,
    canRetry: currentAttempt < MAX_ATTEMPTS,
    submit,
    retry,
    reset,
  };
}
