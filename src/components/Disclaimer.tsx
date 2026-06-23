import { AlertTriangle } from "lucide-react";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      <p>
        <span className="font-semibold">⚠️ AVISO LEGAL: </span>
        {LEGAL_DISCLAIMER.replace("AVISO LEGAL: ", "")}
      </p>
    </div>
  );
}
