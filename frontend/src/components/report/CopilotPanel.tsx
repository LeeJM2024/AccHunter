import { Bot, Sparkles } from "lucide-react";

import type { ReportModel, VulnerabilityModel } from "../../types/domain";
import { useCopilotStream } from "../../hooks/useCopilotStream";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function copilotSourceLabel(report: ReportModel | null): string {
  const intelligence = asRecord(report?.analysisArtifacts?.intelligence);
  if (!Object.keys(intelligence).length) return "Evidence Stream";
  const fallback = asRecord(intelligence.fallback);
  if (fallback.used) return "Local Fallback";
  return `AI: ${String(intelligence.provider || "Agent")}`;
}

export function CopilotPanel({
  vulnerability,
  report,
}: {
  vulnerability: VulnerabilityModel | null;
  report: ReportModel | null;
}): JSX.Element {
  const streamText = useCopilotStream(vulnerability, report);

  return (
    <section className="h-full rounded-[10px] border border-[#C8D8F4] bg-white p-5 shadow-[0_8px_18px_rgba(49,88,153,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C8D8F4] bg-[#F3F7FE] text-[#3E6FEF]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">AI Analysis Copilot</h2>
            <p className="mt-0.5 text-xs leading-5 text-[#405064]">基于当前漏洞、组件与补丁证据生成可复核说明</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#D8E3F3] bg-[#F8FBFF] px-2.5 py-1 text-xs font-medium text-[#405064]">
          <Sparkles className="h-3.5 w-3.5 text-[#3E6FEF]" />
          {copilotSourceLabel(report)}
        </span>
      </div>

      <pre className="mt-4 min-h-[260px] whitespace-pre-wrap rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-4 font-mono text-xs leading-6 text-[#213047]">
        {streamText || "请选择一条漏洞记录后查看自动化分析结论。"}
      </pre>
    </section>
  );
}
