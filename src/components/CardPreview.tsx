import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardType } from "@/types";

interface Props {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  brand: CardType;
  onClick?: () => void;
}

export const CardPreview = memo(function CardPreview({
  cardNumber,
  cardholderName,
  expiry,
  brand,
  onClick,
}: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent default to avoid jumping
    e.preventDefault();
    setIsFlipped(!isFlipped);
    onClick?.();
  };

  return (
    <div
      className="relative w-full max-w-[440px] aspect-[1.6/1] perspective-2000 cursor-pointer group select-none will-change-transform"
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
        }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/20">
          <img src="/card-bg.png" className="absolute inset-0 w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 p-5 sm:p-8 h-full flex flex-col justify-between text-white">
            <header className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <span className="text-[8px] sm:text-[10px] font-black italic">P</span>
                </div>
                <span className="text-xs sm:text-sm font-black tracking-tight opacity-90 uppercase truncate">
                  PayDeck Preferred
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-black tracking-widest opacity-60 uppercase">
                INFINITE
              </div>
            </header>

            <div className="mt-2 sm:mt-4 flex justify-between items-center">
              <div className="w-10 h-7 sm:w-12 sm:h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md border border-white/20 shadow-inner" />
              <div className="flex flex-col items-center opacity-70">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 rotate-90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-lg sm:text-2xl font-bold font-mono tracking-[0.1em] sm:tracking-[0.15em] mb-2 sm:mb-4 whitespace-nowrap overflow-hidden text-shadow-lg uppercase">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[7px] sm:text-[8px] uppercase tracking-widest opacity-50 font-black">
                    Cardholder Name
                  </p>
                  <p className="text-xs sm:text-sm font-bold tracking-wide uppercase truncate max-w-[140px] sm:max-w-[200px]">
                    {cardholderName || "YOUR NAME HERE"}
                  </p>
                </div>
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-[6px] sm:text-[7px] uppercase tracking-tighter opacity-40 leading-none">
                      VALID
                      <br />
                      THRU
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold tracking-widest mt-0.5">
                      {expiry || "MM/YY"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black italic tracking-tighter uppercase opacity-90">
                      {brand !== "unknown" ? (brand === "visa" ? "VISA" : "Mastercard") : "VISA"}
                    </span>
                    <p className="text-[6px] sm:text-[7px] font-bold opacity-60 -mt-1">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/20 rotate-y-180 bg-[#121212] flex flex-col">
          <div className="mt-6 sm:mt-8 h-10 sm:h-12 w-full bg-black/90" />
          <div className="mt-4 sm:mt-6 px-5 sm:px-8">
            <div className="h-8 sm:h-10 w-full bg-white/95 flex items-center justify-end px-3 sm:px-4">
              <div className="h-5 sm:h-6 w-10 sm:w-12 bg-white flex items-center justify-center italic text-black font-black text-[10px] sm:text-xs tracking-widest border-l-2 border-black/10">
                •••
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-[6px] sm:text-[8px] text-white/30 uppercase tracking-widest leading-relaxed font-bold">
              This card is issued by PayDeck. Use of this card is subject to the terms and
              conditions. If found please return to the nearest PayDeck office.
            </p>
          </div>
          <div className="mt-auto p-5 sm:p-8 flex justify-between items-end">
            <div className="flex items-center gap-2 opacity-30">
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-white/50" />
              <span className="text-[7px] sm:text-[8px] font-bold uppercase">PayDeck</span>
            </div>
            <div className="text-[7px] sm:text-[8px] font-bold opacity-30 uppercase tracking-widest">
              Care: 1800 100 0000
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
