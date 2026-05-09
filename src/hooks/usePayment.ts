import { useCallback, useRef } from "react";
import { MAX_ATTEMPTS, usePaymentStore } from "@/store/paymentStore";
import type { CardType, PaymentPayload, Transaction } from "@/types";

interface SubmitInput {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  brand: CardType;
}

const SIMULATED_DELAY_MS = 2500;

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

      // Simulation: Wait for processing
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

      // Simulation: 80% Success Rate, 20% failure on first 2 attempts, then success
      const isSuccess = Math.random() > 0.2 || attemptNumber === MAX_ATTEMPTS;

      if (isSuccess) {
        setStatus("success");
        setFailureReason(null);
        upsertTransaction({ ...baseTxn, status: "success", attempts: attemptNumber });
      } else {
        const failureReasons = [
          "Insufficient funds in account",
          "Transaction declined by issuing bank",
          "Security verification failed",
          "Daily transaction limit exceeded",
        ];
        const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

        setStatus("failed");
        setFailureReason(reason);
        upsertTransaction({
          ...baseTxn,
          status: "failed",
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
