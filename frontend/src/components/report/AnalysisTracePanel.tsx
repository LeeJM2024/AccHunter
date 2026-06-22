import { Activity, CheckCircle2, Clock, FileSearch, Shield } from "lucide-react";

import type { AnalysisArtifactsRaw, AnalysisStageRaw } from "../../types/contracts";

function stageIcon(key: string | undefined): JSX.Element {
  if (key === "libhunter") return <FileSearch className="h-4 w-4 text-[#3E6FEF]" />;
  if (key === "phunter") return <Shield className="h-4 w-4 text-emerald-600" />;
  if (key === "report") return <CheckCircle2 className="h-4 w-4 text-[#2557D6]" />;
  return <Activity className="h-4 w-4 text-[#627188]" />;
}

function durationSeconds(stage: AnalysisStageRaw): string {
  if (!stage.started_at || !stage.finished_at) return "-";
  const started = Date.parse(stage.started_at);
  const finished = Date.parse(stage.finished_at);
  if (!Number.isFinite(started) || !Number.isFinite(finished)) return "-";
  return `${Math.max(Math.round((finished - started) / 1000), 0)}s`;
}

function statusColor(status: string | undefined): string {
  if (status === "completed") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "running") return "text-[#2557D6] bg-[#EEF5FF] border-[#C8D8F4]";
  if (status === "partial") return "text-amber-700 bg-amber-50 border-amber-200";
  if (status === "failed" || status === "hung") return "text-rose-700 bg-rose-50 border-rose-200";
  return "text-[#405064] bg-[#F8FBFF] border-[#D8E3F3]";
}

function displayStageLabel(stage: AnalysisStageRaw): string {
  if (stage.key === "libhunter") return "库版本识别";
  if (stage.key === "phunter") return "补丁验证";
  if (stage.key === "report") return "报告生成";
  const label = stage.label || stage.key || "未知阶段";
  return label
    .replace(/LibHunter\s*/gi, "")
    .replace(/PHunter\s*/gi, "")
    .replace("第三方库识别", "库版本识别")
    .replace("漏洞补丁验证", "补丁验证")
    .trim() || "未知阶段";
}

export function AnalysisTracePanel({ artifacts }: { artifacts: AnalysisArtifactsRaw | null }): JSX.Element {
  const visibleStages = (artifacts?.execution_trace?.stages || []).filter((stage) => stage.key !== "init" && stage.label !== "初始化分析任务");
  const stages = visibleStages.slice(0, 4);
  const hiddenStageCount = Math.max(visibleStages.length - stages.length, 0);
  const summary = artifacts?.summary || {};

  return (
    <section className="h-full rounded-[10px] border border-[#D8E3F3] bg-white p-5 shadow-[0_8px_18px_rgba(49,88,153,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#627188]">Analysis Artifacts</p>
          <h2 className="mt-1 text-base font-semibold text-[#0F172A]">中间产物与执行链路</h2>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-[#D8E3F3] bg-[#F8FBFF] px-2.5 py-1 text-xs text-[#405064]">
          <Clock className="h-3.5 w-3.5" />
          {artifacts?.generated_at ? new Date(artifacts.generated_at).toLocaleString("zh-CN") : "未生成"}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3 xl:grid-cols-1">
        <SummaryTile label="补丁证据链" value={summary.patch_evidence_count ?? 0} tone="text-emerald-700" />
        <SummaryTile label="候选类证据" value={summary.target_class_count ?? 0} tone="text-[#2557D6]" />
        <SummaryTile label="漏洞记录" value={summary.vulnerability_count ?? 0} tone="text-rose-700" />
      </div>

      <div className="mt-4 space-y-2">
        {stages.length === 0 && <p className="rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-3 text-xs text-[#405064]">当前报告暂无结构化执行轨迹。</p>}
        {stages.map((stage) => (
          <div key={stage.key || stage.label} className="flex items-start gap-3 rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C8D8F4] bg-white">{stageIcon(stage.key)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-[#0F172A]">{displayStageLabel(stage)}</p>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[12px] ${statusColor(stage.status)}`}>
                  {stage.status || "unknown"} · {durationSeconds(stage)}
                </span>
              </div>
              {stage.summary && <p className="mt-1 truncate text-xs text-[#405064]">{stage.summary}</p>}
            </div>
          </div>
        ))}
        {hiddenStageCount > 0 && <p className="text-xs text-[#627188]">其余 {hiddenStageCount} 个阶段已折叠。</p>}
      </div>
    </section>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: unknown; tone: string }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-3">
      <p className="text-[#405064]">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold tabular-nums ${tone}`}>{String(value)}</p>
    </div>
  );
}
