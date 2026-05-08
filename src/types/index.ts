export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";
export type CardType = "visa" | "mastercard" | "amex" | "rupay" | "unknown";
export type Currency = "INR";

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  timestamp: string;
  failureReason?: string;
  attempts: number;
  cardLast4?: string;
  cardholderName?: string;
  brand?: CardType;
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
  brand: CardType;
}

export interface PaymentApiResponse {
  success: boolean;
  status: "success" | "failed";
  transactionId: string;
  reason?: string;
}
