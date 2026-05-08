import { expectedCardLength, formatCardNumber } from "@/utils/formatting";
import type { CardType } from "@/types";

interface Props {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  brand: CardType;
}

const brandLabel: Record<CardType, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
  rupay: "RuPay»",
  unknown: "CARD",
};

const brandGradient: Record<CardType, string> = {
  visa: "linear-gradient(135deg, #1a1f71 0%, #2a3eb1 50%, #5b7fff 100%)",
  mastercard: "linear-gradient(135deg, #1a1a2e 0%, #b8002a 60%, #ff6f3c 100%)",
  amex: "linear-gradient(135deg, #006fcf 0%, #00428a 100%)",
  rupay: "linear-gradient(135deg, #097969 0%, #f47216 100%)",
  unknown: "linear-gradient(135deg, hsl(220 10% 25%) 0%, hsl(220 10% 15%) 100%)",
};

export function CardPreview({ cardNumber, cardholderName, expiry, brand }: Props) {
  const len = expectedCardLength(brand === "unknown" ? "visa" : brand);
  const digits = cardNumber.replace(/\D/g, "").slice(0, len);
  const padded = digits + "•".repeat(Math.max(0, len - digits.length));
  const masked = formatCardNumber(padded, brand === "unknown" ? "visa" : brand);

  return (
    <div
      className="relative w-full max-w-md aspect-[1.586/1] rounded-2xl p-6 text-white shadow-card overflow-hidden transition-all duration-500"
      style={{ backgroundImage: brandGradient[brand] }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid" />
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="h-9 w-12 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner" />
          <span className="text-sm font-bold tracking-widest italic">
            {brandLabel[brand]}
          </span>
        </div>
        <div className="font-mono text-xl sm:text-2xl tracking-[0.2em] [font-variant-numeric:tabular-nums] drop-shadow">
          {masked}
        </div>
        <div className="flex justify-between items-end gap-4">
          <div>
            <div className="text-[10px] uppercase opacity-70">Cardholder</div>
            <div className="text-sm font-medium uppercase truncate max-w-[12rem]">
              {cardholderName.trim() || "Your Name"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-70">Expires</div>
            <div className="text-sm font-medium font-mono">{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
