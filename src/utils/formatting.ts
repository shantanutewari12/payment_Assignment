import type { CardType } from "@/types";

export function expectedCardLength(type: CardType): number {
  return type === "amex" ? 15 : 16;
}

export function formatCardNumber(value: string, type: CardType = "unknown"): string {
  const max = expectedCardLength(type === "unknown" ? "visa" : type);
  const digits = value.replace(/\D/g, "").slice(0, max);
  if (type === "amex") {
    // 4-6-5
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 10);
    const c = digits.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function detectCardType(value: string): CardType {
  const d = value.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^(60|65|81|82|508)/.test(d)) return "rupay";
  return "unknown";
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCardNumber(value: string, type: CardType = "unknown"): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  const last4 = digits.slice(-4);
  const first = digits.slice(0, type === "amex" ? 4 : 4);
  const len = expectedCardLength(type === "unknown" ? "visa" : type);
  const middleLen = Math.max(0, len - first.length - 4);
  return formatCardNumber(first + "•".repeat(middleLen) + last4, type);
}

export function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}
