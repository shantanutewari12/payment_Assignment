import type { CardType } from "@/types";
import { expectedCardLength } from "@/utils/formatting";

export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(value: string, brand: CardType): string | null {
  const d = value.replace(/\D/g, "");
  if (brand === "unknown") return "Select a card type first";
  if (!d) return "Card number is required";
  const expected = expectedCardLength(brand);
  if (d.length !== expected) return `${brand === "amex" ? "Amex" : brand === "rupay" ? "RuPay" : brand[0].toUpperCase() + brand.slice(1)} card must be ${expected} digits`;
  if (!luhnCheck(d)) return "Card number is invalid";
  return null;
}

export function validateExpiry(value: string): string | null {
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return "Use MM/YY format";
  const month = parseInt(m[1], 10);
  const year = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return "Invalid month";
  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59);
  if (expiryDate < now) return "Card has expired";
  return null;
}

export function validateCVV(value: string, cardType: CardType): string | null {
  const d = value.replace(/\D/g, "");
  const expected = cardType === "amex" ? 4 : 3;
  if (d.length !== expected) return `CVV must be ${expected} digits`;
  return null;
}

export function validateAmount(value: string): string | null {
  if (!value) return "Amount is required";
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Up to 2 decimal places";
  const n = parseFloat(value);
  if (!(n > 0)) return "Amount must be positive";
  if (n > 1_000_000) return "Amount too large";
  return null;
}

export function validateCardholder(value: string): string | null {
  const v = value.trim();
  if (!v) return "Cardholder name is required";
  if (v.length < 2) return "Name is too short";
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return "Letters only";
  return null;
}
