import { DollarSign } from "lucide-react";

interface SenebLogoProps {
  withIconBubble?: boolean;
  className?: string;
}

export function SenebLogo({ withIconBubble = false, className = "" }: SenebLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {withIconBubble ? (
        <div className="bg-white/10 p-2 rounded-full">
          <DollarSign className="w-5 h-5" />
        </div>
      ) : (
        <DollarSign className="w-5 h-5" />
      )}
      <span className="font-serif font-bold text-xl tracking-wide">
        Seneb<span className="text-[#F23E02]">.</span>
      </span>
    </div>
  );
}
