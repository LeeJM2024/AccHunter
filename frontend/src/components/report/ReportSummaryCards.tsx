import type { ReportModel } from "../../types/domain";

const cardTheme = {
  highRisk: "border-rose-200 bg-rose-50 text-rose-700",
  mediumRisk: "border-amber-200 bg-amber-50 text-amber-700",
  safeCount: "border-emerald-200 bg-emerald-50 text-emerald-700",
  unknownCount: "border-sky-200 bg-sky-50 text-sky-700",
  total: "border-[rgba(129,151,181,0.24)] bg-white text-[#0F172A]",
};

export function ReportSummaryCards({ report }: { report: ReportModel }): JSX.Element {
  const cards = [
    { key: "highRisk", label: "高风险", value: report.summary.highRisk },
    { key: "mediumRisk", label: "待复核", value: report.summary.mediumRisk },
    { key: "safeCount", label: "安全 / 已修复", value: report.summary.safeCount },
    { key: "unknownCount", label: "不确定状态", value: report.summary.unknownCount },
    { key: "total", label: "漏洞总数", value: report.summary.total },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.key} className={`rounded-[8px] border px-4 py-3 shadow-[0_8px_18px_rgba(49,88,153,0.05)] ${cardTheme[card.key]}`}>
          <p className="text-[13px] font-medium opacity-90">{card.label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
