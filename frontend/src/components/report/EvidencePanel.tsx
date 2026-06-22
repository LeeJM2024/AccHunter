import { GaugeCircle } from "lucide-react";
import type { ReactNode } from "react";

import { PatchStatusBadge } from "../common/PatchStatusBadge";
import type { VulnerabilityModel } from "../../types/domain";
import { clamp01, formatRatio } from "../../utils/format";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function display(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(6);
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function SimilarityBar({ label, value, colorClass }: { label: string; value: number | null; colorClass: string }): JSX.Element {
  const ratio = clamp01(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-[#405064]">
        <span>{label}</span>
        <span className="font-mono text-[#0F172A]">{formatRatio(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-[#E4ECF8]">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

export function EvidencePanel({ vulnerability }: { vulnerability: VulnerabilityModel | null }): JSX.Element {
  if (!vulnerability) {
    return (
      <section className="rounded-[10px] border border-[#D8E3F3] bg-white p-5 text-sm text-[#405064] shadow-[0_8px_18px_rgba(49,88,153,0.08)]">
        选择漏洞后将在此展示补丁证据与验证结论。
      </section>
    );
  }

  const evidence = asRecord(vulnerability.evidence);
  const resources = asRecord(evidence.resources);
  const targetScope = asRecord(evidence.target_scope);
  const verification = asRecord(evidence.verification);
  const execution = asRecord(evidence.execution);
  const classSample = asArray(targetScope.classes_sample).map(String);

  return (
    <section className="rounded-[10px] border border-[#D8E3F3] bg-white p-5 shadow-[0_8px_18px_rgba(49,88,153,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#627188]">Evidence Panel</p>
          <h2 className="mt-1 font-mono text-base font-semibold text-[#0F172A]">{vulnerability.cveId}</h2>
        </div>
        <PatchStatusBadge status={vulnerability.status} />
      </div>

      <div className="mt-4 space-y-3 rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-4">
        <SimilarityBar label="Pre Similarity" value={vulnerability.preSimilarity} colorClass="bg-rose-500" />
        <SimilarityBar label="Post Similarity" value={vulnerability.postSimilarity} colorClass="bg-emerald-500" />
      </div>

      <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
        <EvidenceTile title="补丁资源">
          <EvidenceLine label="Pre" value={display(resources.pre_patch_artifact)} />
          <EvidenceLine label="Post" value={display(resources.post_patch_artifact)} />
          <EvidenceLine label="Diff" value={display(resources.patch_diff_artifact)} />
        </EvidenceTile>
        <EvidenceTile title="验证执行">
          <EvidenceLine label="补丁验证状态" value={display(verification.status)} />
          <EvidenceLine label="Return Code" value={display(verification.returncode)} />
          <EvidenceLine label="重试" value={display(verification.retried)} />
          <EvidenceLine label="补丁相关方法" value={display(verification.patch_related_method_count)} />
        </EvidenceTile>
      </div>

      <div className="mt-4 rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-4 text-xs">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-[#0F172A]">候选分析范围</p>
          <span className="font-mono text-[#405064]">{display(targetScope.class_count, "0")} classes</span>
        </div>
        <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-auto">
          {classSample.length === 0 ? (
            <span className="text-[#627188]">暂无候选类样本</span>
          ) : (
            classSample.slice(0, 20).map((name) => (
              <span key={name} className="rounded border border-[#C8D8F4] bg-white px-1.5 py-0.5 font-mono text-[12px] text-[#2557D6]">
                {name}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 rounded-[8px] border border-[#C8D8F4] bg-[#F3F7FE] p-4 text-xs text-[#334155]">
        <p className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
          <GaugeCircle className="h-4 w-4 text-[#3E6FEF]" />
          一句话结论
        </p>
        <p className="mt-2 leading-6">{vulnerability.status.conclusion}</p>
      </div>

      <div className="mt-4 rounded-[8px] border border-[#E1E8F3] bg-white p-4 text-xs text-[#405064]">
        <p className="font-semibold text-[#334155]">原始字段（调试）</p>
        <p className="mt-2">raw.status: {String(vulnerability.raw.status)}</p>
        <p>raw.pre_similarity: {String(vulnerability.raw.pre_similarity)}</p>
        <p>raw.post_similarity: {String(vulnerability.raw.post_similarity)}</p>
        <p>patch.returncode: {display(verification.returncode)}</p>
        <p>stdout.lines: {display(asRecord(execution.stdout).line_count)}</p>
        <p>stderr.lines: {display(asRecord(execution.stderr).line_count)}</p>
      </div>
    </section>
  );
}

function EvidenceTile({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] p-3">
      <p className="font-semibold text-[#0F172A]">{title}</p>
      <div className="mt-2 space-y-1.5">{children}</div>
    </div>
  );
}

function EvidenceLine({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <p className="flex gap-2 text-[#405064]">
      <span className="shrink-0 text-[#627188]">{label}:</span>
      <span className="min-w-0 break-all text-[#1F2D3D]">{value}</span>
    </p>
  );
}
