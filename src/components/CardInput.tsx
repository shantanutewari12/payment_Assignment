import { useMemo, useState } from "react";
import type { CardType } from "@/types";
import { expectedCardLength, formatCardNumber } from "@/utils/formatting";
import {
  validateAmount,
  validateCVV,
  validateCardNumber,
  validateCardholder,
  validateExpiry,
} from "@/utils/validation";

export interface CardFormState {
  brand: CardType;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
}

interface Props {
  value: CardFormState;
  onChange: (next: CardFormState) => void;
  onSubmit: () => void;
  disabled: boolean;
}

type FieldKey = "cardholderName" | "cardNumber" | "expiry" | "cvv" | "amount";

const BRANDS: { id: CardType; label: string; sub: string }[] = [
  { id: "visa", label: "Visa", sub: "16 digits" },
  { id: "mastercard", label: "Mastercard", sub: "16 digits" },
  { id: "rupay", label: "RuPay", sub: "16 digits" },
  { id: "amex", label: "Amex", sub: "15 digits" },
];

export function CardInput({ value, onChange, onSubmit, disabled }: Props) {
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    cardholderName: false,
    cardNumber: false,
    expiry: false,
    cvv: false,
    amount: false,
  });

  const brandSelected = value.brand !== "unknown";
  const fieldsDisabled = disabled || !brandSelected;

  const errors = useMemo(
    () => ({
      cardholderName: validateCardholder(value.cardholderName),
      cardNumber: validateCardNumber(value.cardNumber, value.brand),
      expiry: validateExpiry(value.expiry),
      cvv: validateCVV(value.cvv, value.brand),
      amount: validateAmount(value.amount),
    }),
    [value],
  );

  const isValid = brandSelected && Object.values(errors).every((e) => e === null);

  const set = <K extends keyof CardFormState>(key: K, v: CardFormState[K]) =>
    onChange({ ...value, [key]: v });

  const blur = (k: FieldKey) => setTouched((t) => ({ ...t, [k]: true }));
  const showErr = (k: FieldKey) => touched[k] && errors[k];

  const inputBase =
    "w-full rounded-lg border bg-input/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed";
  const errBorder = "border-destructive/60";
  const okBorder = "border-border";

  const maxNumLen = brandSelected ? expectedCardLength(value.brand) : 16;
  const maxFormatted = value.brand === "amex" ? 17 : 19; // including spaces

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({
          cardholderName: true,
          cardNumber: true,
          expiry: true,
          cvv: true,
          amount: true,
        });
        if (isValid && !disabled) onSubmit();
      }}
      noValidate
    >
      <div>
        <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
          Card type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BRANDS.map((b) => {
            const active = value.brand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                disabled={disabled}
                onClick={() => set("brand", b.id)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="text-sm font-semibold">{b.label}</div>
                <div className="text-[10px] text-muted-foreground">{b.sub}</div>
              </button>
            );
          })}
        </div>
        {!brandSelected && (
          <p className="mt-2 text-xs text-muted-foreground">
            Select a card type to continue.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cardholderName" className="block text-xs font-medium mb-1.5 text-muted-foreground">
          Cardholder name
        </label>
        <input
          id="cardholderName"
          type="text"
          autoComplete="cc-name"
          value={value.cardholderName}
          onChange={(e) => set("cardholderName", e.target.value)}
          onBlur={() => blur("cardholderName")}
          aria-invalid={!!showErr("cardholderName")}
          aria-describedby="cardholderName-err"
          placeholder="Jane Doe"
          className={`${inputBase} ${showErr("cardholderName") ? errBorder : okBorder}`}
          disabled={fieldsDisabled}
        />
        <p id="cardholderName-err" className="mt-1 text-xs text-destructive min-h-[1rem]">
          {showErr("cardholderName") ? errors.cardholderName : ""}
        </p>
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-xs font-medium mb-1.5 text-muted-foreground">
          Card number
        </label>
        <input
          id="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          value={formatCardNumber(value.cardNumber, value.brand)}
          onChange={(e) =>
            set("cardNumber", e.target.value.replace(/\D/g, "").slice(0, maxNumLen))
          }
          onBlur={() => blur("cardNumber")}
          aria-invalid={!!showErr("cardNumber")}
          aria-describedby="cardNumber-err"
          placeholder={value.brand === "amex" ? "3782 822463 10005" : "4242 4242 4242 4242"}
          maxLength={maxFormatted}
          className={`${inputBase} font-mono tracking-wider ${showErr("cardNumber") ? errBorder : okBorder}`}
          disabled={fieldsDisabled}
        />
        <p id="cardNumber-err" className="mt-1 text-xs text-destructive min-h-[1rem]">
          {showErr("cardNumber") ? errors.cardNumber : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-xs font-medium mb-1.5 text-muted-foreground">
            Expiry (MM/YY)
          </label>
          <input
            id="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={value.expiry}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              const formatted = digits.length < 3 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
              set("expiry", formatted);
            }}
            onBlur={() => blur("expiry")}
            aria-invalid={!!showErr("expiry")}
            aria-describedby="expiry-err"
            placeholder="12/29"
            maxLength={5}
            className={`${inputBase} font-mono ${showErr("expiry") ? errBorder : okBorder}`}
            disabled={fieldsDisabled}
          />
          <p id="expiry-err" className="mt-1 text-xs text-destructive min-h-[1rem]">
            {showErr("expiry") ? errors.expiry : ""}
          </p>
        </div>
        <div>
          <label htmlFor="cvv" className="block text-xs font-medium mb-1.5 text-muted-foreground">
            CVV
          </label>
          <input
            id="cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            value={value.cvv}
            onChange={(e) =>
              set("cvv", e.target.value.replace(/\D/g, "").slice(0, value.brand === "amex" ? 4 : 3))
            }
            onBlur={() => blur("cvv")}
            aria-invalid={!!showErr("cvv")}
            aria-describedby="cvv-err"
            placeholder={value.brand === "amex" ? "1234" : "123"}
            maxLength={4}
            className={`${inputBase} font-mono ${showErr("cvv") ? errBorder : okBorder}`}
            disabled={fieldsDisabled}
          />
          <p id="cvv-err" className="mt-1 text-xs text-destructive min-h-[1rem]">
            {showErr("cvv") ? errors.cvv : ""}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="block text-xs font-medium mb-1.5 text-muted-foreground">
          Amount (₹)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
            ₹
          </span>
          <input
            id="amount"
            inputMode="decimal"
            value={value.amount}
            onChange={(e) => set("amount", e.target.value)}
            onBlur={() => blur("amount")}
            aria-invalid={!!showErr("amount")}
            aria-describedby="amount-err"
            placeholder="0.00"
            className={`${inputBase} pl-8 font-mono ${showErr("amount") ? errBorder : okBorder}`}
            disabled={fieldsDisabled}
          />
        </div>
        <p id="amount-err" className="mt-1 text-xs text-destructive min-h-[1rem]">
          {showErr("amount") ? errors.amount : ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={!isValid || disabled}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? "Processing…" : `Pay ₹${value.amount || "0.00"}`}
      </button>
    </form>
  );
}
