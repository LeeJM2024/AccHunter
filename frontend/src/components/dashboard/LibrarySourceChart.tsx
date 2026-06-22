import { Layers, PieChart, Shield, Zap } from "lucide-react";

import { mockComponentRiskData, mockLibrarySourceData, mockTotalLibraries } from "./mockData";
import type { DashboardSummaryRaw, EcosystemSummaryRaw } from "../../types/contracts";

const ECOSYSTEM_DISPLAY_LIMIT = 15;
const SOURCE_TONES = [
  { dot: "bg-[#3E6FEF]", text: "text-[#2557D6]", surface: "bg-[#EFF5FF]", border: "border-[#BFD0FF]" },
  { dot: "bg-indigo-500", text: "text-indigo-700", surface: "bg-indigo-50", border: "border-indigo-200" },
  { dot: "bg-emerald-500", text: "text-emerald-700", surface: "bg-emerald-50", border: "border-emerald-200" },
  { dot: "bg-amber-500", text: "text-amber-700", surface: "bg-amber-50", border: "border-amber-200" },
  { dot: "bg-slate-500", text: "text-slate-600", surface: "bg-slate-50", border: "border-slate-200" },
];

export function LibrarySourceChart({ summary, ecosystemSummary, mode }: { summary: DashboardSummaryRaw | null; ecosystemSummary?: EcosystemSummaryRaw | null; mode?: "local" | "ecosystem" }): JSX.Element {
  if (mode === "ecosystem") {
    return <EcosystemLibraryChart ecosystemSummary={ecosystemSummary} />;
  }

  const hasRealLibraries = Boolean(summary && summary.library_stats.top_libraries.length > 0);

  if (!hasRealLibraries) {
    return <MockLibrarySourceChart />;
  }

  const topLibraries = summary!.library_stats.top_libraries;
  const totalLibraries = summary!.library_stats.total_libraries;
  const maxCount = Math.max(...topLibraries.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      <Header mode="真实聚合" total={totalLibraries} title="识别组件分布" />

      <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-white p-4">
        <div className="grid grid-cols-3 gap-3">
          <Metric label="唯一组件" value={summary!.library_stats.unique_libraries} className="text-[#2557D6]" />
          <Metric label="候选类证据" value={summary!.library_stats.target_class_count} className="text-indigo-700" />
          <Metric label="补丁证据链" value={summary!.engine_stats.patch_evidence_count} className="text-emerald-700" />
        </div>
      </div>

      <div className="space-y-3">
        {topLibraries.map((lib, index) => {
          const ratio = Math.max((lib.count / maxCount) * 100, 4);
          const risky = lib.vulnerability_count > 0;
          const tone = SOURCE_TONES[index % SOURCE_TONES.length];
          return (
            <div key={lib.name} className={`rounded-[8px] border p-3 transition-colors hover:border-[#3E6FEF]/35 ${risky ? "border-rose-200 bg-rose-50" : `${tone.border} ${tone.surface}`}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#0F172A]">{lib.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#516173]">
                    <Shield className={`h-3 w-3 ${risky ? "text-rose-600" : "text-emerald-600"}`} />
                    <span>漏洞关联 {lib.vulnerability_count}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-[#0F172A]">{lib.count}</div>
                  <div className="text-xs text-[#8493A8]">命中</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div className={`h-full ${risky ? "bg-rose-500" : tone.dot}`} style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-[#8493A8]">来源：后端报告中的 used_libraries、target_classes 与漏洞关联结果</div>
    </div>
  );
}

function EcosystemLibraryChart({ ecosystemSummary }: { ecosystemSummary?: EcosystemSummaryRaw | null }): JSX.Element {
  const displayLimit = ecosystemSummary?.display_limit ?? ECOSYSTEM_DISPLAY_LIMIT;
  const libraries = (ecosystemSummary?.tpl_top || []).slice(0, displayLimit);
  const maxScore = Math.max(...libraries.map((item) => item.rank_score), 1);

  return (
    <div className="space-y-4">
      <Header mode="生态参考" total={ecosystemSummary?.total_library_count ?? libraries.length} title="生态 TPL 热度" />

      <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
        生态参考情报，不代表当前 APK 已命中。后端基于 data/cve_kb.json 全量计算，当前仅展示排序后的 Top {displayLimit}。
      </div>

      <div className="space-y-3">
        {libraries.map((lib) => {
          const ratio = Math.max((lib.rank_score / maxScore) * 100, 5);
          return (
            <div key={lib.name} className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-white p-3 transition-colors hover:border-[#3E6FEF]/35">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-[#0F172A]">{lib.display_name || lib.name}</div>
                    <span className="rounded-[5px] border border-[#BFD0FF] bg-[#EFF5FF] px-1.5 py-0.5 text-[10px] font-medium text-[#2557D6]">{lib.ecosystem}</span>
                    <span className="rounded-[5px] border border-[rgba(129,151,181,0.24)] bg-[#F8FBFF] px-1.5 py-0.5 text-[10px] text-[#516173]">CVE {lib.cve_count}</span>
                    <span className="rounded-[5px] border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">高危 {lib.high_risk_cve_count}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#516173]">{lib.description}</p>
                  <p className="mt-1 text-xs text-[#8493A8]">常见用途：{lib.common_usage}</p>
                  {lib.security_focus && <p className="mt-1 text-xs text-[#8493A8]">安全关注：{lib.security_focus}</p>}
                  {lib.notable_cves.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {lib.notable_cves.map((cve) => (
                        <span key={cve} className="rounded-[5px] border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] text-rose-600">
                          {cve}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-amber-700">{lib.rank_score}</div>
                  <div className="text-xs text-[#8493A8]">评分</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E6EDF8]">
                <div className="h-full bg-amber-400" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-[#8493A8]">来源：{ecosystemSummary?.methodology || "生态参考情报"}</div>
    </div>
  );
}

function MockLibrarySourceChart(): JSX.Element {
  return (
    <div className="space-y-4">
      <Header mode="示例数据" total={mockTotalLibraries} title="组件来源占比图" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="relative mx-auto h-36 w-36 shrink-0 rounded-full bg-[conic-gradient(#3E6FEF_0_49%,#6366F1_49%_69%,#10B981_69%_86%,#F59E0B_86%_96%,#64748B_96%_100%)] shadow-[0_10px_22px_rgba(49,88,153,0.12)] md:mx-0">
          <div className="absolute inset-5 rounded-full border border-[rgba(129,151,181,0.18)] bg-white" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-[#0F172A]">{mockTotalLibraries}</span>
            <span className="text-xs text-[#516173]">组件</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          {mockLibrarySourceData.map((source, index) => {
            const tone = SOURCE_TONES[index % SOURCE_TONES.length];
            return (
              <div key={source.name} className={`rounded-[8px] border p-3 ${tone.border} ${tone.surface}`}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                    <span className="truncate text-sm font-semibold text-[#0F172A]">{source.name}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${tone.text}`}>{source.percentage}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white">
                  <div className={`h-full ${tone.dot}`} style={{ width: `${source.percentage}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-[#516173]">{source.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-[#0F172A]">高风险组件分布</div>
          <div className="text-xs text-[#516173]">TOP 8</div>
        </div>
        <div className="space-y-2">
          {mockComponentRiskData.map((component) => (
            <div key={component.name} className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${riskColor(component.riskLevel)}`} />
                <span className="truncate text-xs text-[#516173]">{component.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E6EDF8]">
                  <div className={`h-full ${riskColor(component.riskLevel)}`} style={{ width: `${Math.min((component.count / 60) * 100, 100)}%` }} />
                </div>
                <span className="w-6 text-right font-mono text-xs font-medium text-[#516173]">{component.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-white p-4">
        <div className="mb-3 grid grid-cols-2 gap-3 border-b border-[rgba(129,151,181,0.22)] pb-3">
          <div className="rounded-[6px] bg-emerald-50 p-3 text-center">
            <div className="font-mono text-lg font-bold text-emerald-700">59%</div>
            <div className="text-xs text-emerald-800">官方源占比</div>
          </div>
          <div className="rounded-[6px] bg-rose-50 p-3 text-center">
            <div className="font-mono text-lg font-bold text-rose-600">9%</div>
            <div className="text-xs text-rose-700">风险组件</div>
          </div>
        </div>
        <div className="text-xs leading-5 text-[#516173]">
          建议：优先使用 Maven Central 和私有仓库，减少遗留仓库依赖，定期更新高风险组件。
        </div>
      </div>

      <div className="text-center text-xs text-[#8493A8]">来源：示例数据；后续可由中间产物记录组件仓库、包名解析与来源证据。</div>
    </div>
  );
}

function Header({ title, mode, total }: { title: string; mode: string; total: number }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4 text-[#3E6FEF]" />
        <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Zap className="h-3 w-3 text-amber-500" />
        <span className="font-medium text-amber-700">{mode}</span>
        <Layers className="h-3 w-3 text-[#8493A8]" />
        <span className="font-mono font-medium text-[#0F172A]">{total}</span>
        <span className="text-[#516173]">组件记录</span>
      </div>
    </div>
  );
}

function riskColor(riskLevel: "critical" | "high" | "medium" | "low"): string {
  return {
    critical: "bg-rose-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  }[riskLevel];
}

function Metric({ label, value, className }: { label: string; value: number; className: string }): JSX.Element {
  return (
    <div className="text-center">
      <div className={`font-mono text-xl font-bold ${className}`}>{value}</div>
      <div className="text-xs text-[#8493A8]">{label}</div>
    </div>
  );
}
