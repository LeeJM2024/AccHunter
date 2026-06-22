import type { PatchStatusSemantic } from "../../types/domain";

const colorMap: Record<PatchStatusSemantic["color"], string> = {
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  muted: "border-slate-200 bg-slate-50 text-slate-600",
  unknown: "border-sky-200 bg-sky-50 text-sky-700",
};

export function PatchStatusBadge({ status }: { status: PatchStatusSemantic }): JSX.Element {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colorMap[status.color]}`}>
      {status.label}
    </span>
  );
}
