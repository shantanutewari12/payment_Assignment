import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import type { CardType } from "@/types";
import { getCardBrand } from "@/utils/validation";

export interface CardFormState {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
  amount: string;
  brand: CardType;
}

interface Props {
  value: CardFormState;
  onChange: (value: CardFormState) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CardInput({ value, onChange, onSubmit, disabled }: Props) {
  const id = useId();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showCVV, setShowCVV] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ") : digits;
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleInputChange = (field: keyof CardFormState, val: string) => {
    let finalVal = val;
    if (field === "cardNumber") {
      finalVal = formatCardNumber(val).slice(0, 19);
      const brand = getCardBrand(finalVal.replace(/\s/g, ""));
      onChange({ ...value, [field]: finalVal, brand });
    } else if (field === "expiry") {
      finalVal = formatExpiry(val).slice(0, 5);
      onChange({ ...value, [field]: finalVal });
    } else if (field === "cvv") {
      finalVal = val.replace(/\D/g, "").slice(0, 4);
      onChange({ ...value, [field]: finalVal });
    } else if (field === "amount") {
      finalVal = val.replace(/[^\d.]/g, "");
      onChange({ ...value, [field]: finalVal });
    } else {
      onChange({ ...value, [field]: finalVal });
    }
  };

  const isValid =
    value.cardNumber.replace(/\s/g, "").length >= 12 &&
    value.cardholderName.length >= 2 &&
    value.expiry.length === 5 &&
    value.cvv.length >= 3 &&
    parseFloat(value.amount) > 0;

  const inputClasses = (isFocused: boolean) => `
    w-full bg-input border-2 px-4 py-3.5 rounded-xl text-foreground font-semibold outline-none transition-all duration-300
    ${
      isFocused
        ? "border-primary ring-4 ring-primary/15 scale-[1.01] shadow-lg dark:shadow-primary/10"
        : "border-border/60 hover:border-border/90 shadow-sm dark:shadow-3d-dark"
    }
    placeholder:text-muted-foreground/30
  `;

  const labelClasses =
    "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-1.5 block ml-1";

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 preserve-3d"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-5">
        <div className="relative group">
          <label className={labelClasses}>Transaction Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-primary">
              ₹
            </span>
            <input
              type="text"
              placeholder="0.00"
              value={value.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              onFocus={() => setFocusedField("amount")}
              onBlur={() => setFocusedField(null)}
              className={`${inputClasses(focusedField === "amount")} pl-11 text-xl font-black tracking-tight`}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="relative">
            <label className={labelClasses}>Cardholder Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={value.cardholderName}
              onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses(focusedField === "name")}
              disabled={disabled}
            />
          </div>

          <div className="relative">
            <label className={labelClasses}>Card Number</label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                placeholder="0000 0000 0000 0000"
                value={value.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                onFocus={() => setFocusedField("number")}
                onBlur={() => setFocusedField(null)}
                className={`${inputClasses(focusedField === "number")} font-mono tracking-wider`}
                disabled={disabled}
              />
              <AnimatePresence>
                {value.brand !== "unknown" && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary bg-primary/15 px-2 py-1 rounded-lg border border-primary/30 shadow-sm"
                  >
                    {value.brand}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <label className={labelClasses}>Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={value.expiry}
              onChange={(e) => handleInputChange("expiry", e.target.value)}
              onFocus={() => setFocusedField("expiry")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses(focusedField === "expiry")}
              disabled={disabled}
            />
          </div>

          <div className="relative">
            <label className={labelClasses}>CVV / CVC</label>
            <div className="relative">
              <input
                type={showCVV ? "text" : "password"}
                placeholder="•••"
                value={value.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                onFocus={() => setFocusedField("cvv")}
                onBlur={() => setFocusedField(null)}
                className={inputClasses(focusedField === "cvv")}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowCVV(!showCVV)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!isValid || disabled}
        whileHover={isValid && !disabled ? { scale: 1.01 } : {}}
        whileTap={isValid && !disabled ? { scale: 0.99 } : {}}
        className={`
          w-full relative overflow-hidden py-5 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-500
          ${
            isValid && !disabled
              ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:brightness-110"
              : "bg-muted text-muted-foreground/20 cursor-not-allowed border border-border/10"
          }
        `}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {disabled ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Securely Processing...
            </>
          ) : (
            <>
              Pay <span className="font-mono">₹{value.amount || "0.00"}</span>
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      </motion.button>
    </motion.form>
  );
}
