import { AlertTriangle, Loader2 } from "lucide-react";

export function LoadingView({ text }: { text: string }): JSX.Element {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[8px] border border-[rgba(129,151,181,0.28)] bg-white text-[#405064] shadow-[0_8px_18px_rgba(49,88,153,0.06)]">
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-[#3E6FEF]" />
        {text}
      </span>
    </div>
  );
}

export function ErrorView({ text }: { text: string }): JSX.Element {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[8px] border border-rose-200 bg-rose-50 text-rose-700">
      <span className="inline-flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4" />
        {text}
      </span>
    </div>
  );
}
