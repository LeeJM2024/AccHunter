import type { TaskStage } from "../../types/domain";

const STAGE_THEME: Record<TaskStage, { label: string; className: string; dot: string }> = {
  IDLE: {
    label: "待机",
    className: "border-slate-300 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
  UPLOADING: {
    label: "上传中",
    className: "border-[#3E6FEF]/35 bg-[#EAF2FF] text-[#2557D6]",
    dot: "bg-[#3E6FEF]",
  },
  QUEUED: {
    label: "已排队",
    className: "border-amber-300 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  SCANNING: {
    label: "扫描中",
    className: "border-[#3E6FEF]/35 bg-[#EAF2FF] text-[#2557D6]",
    dot: "bg-[#3E6FEF]",
  },
  REPORT_READY: {
    label: "报告就绪",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  FAILED: {
    label: "失败",
    className: "border-rose-300 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export function StageBadge({ stage }: { stage: TaskStage }): JSX.Element {
  const theme = STAGE_THEME[stage];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[6px] border px-3.5 py-1.5 text-[13px] font-semibold ${theme.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
      {theme.label}
    </span>
  );
}
