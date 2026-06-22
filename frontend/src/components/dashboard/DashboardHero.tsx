import { ArrowRight, BarChart3, Code, Database, GitBranch, Radar, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardSummaryRaw } from "../../types/contracts";
import { AndroidAuditIllustration } from "./AndroidAuditIllustration";
import { mockTaskStats, mockVulnerabilityStats } from "./mockData";

export function DashboardHero({ summary }: { summary: DashboardSummaryRaw | null }): JSX.Element {
  const hasRealSummary = Boolean(summary && summary.task_stats.total_tasks > 0);
  const completedApks = hasRealSummary ? summary!.task_stats.completed_tasks : mockTaskStats.completedTasks;
  const highRisk = hasRealSummary ? summary!.vulnerability_stats.high : mockVulnerabilityStats.high;
  const recoveredFunctions = hasRealSummary ? summary!.library_stats.target_class_count : 386;
  const semanticMatches = hasRealSummary ? summary!.engine_stats.semantic_matches : 214;

  return (
    <section className="relative overflow-hidden rounded-[12px] border border-[rgba(126,146,178,0.22)] bg-[#F4F8FF] shadow-[0_20px_42px_rgba(49,88,153,0.09)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_43%,rgba(155,185,255,0.26),transparent_34rem),radial-gradient(circle_at_92%_8%,rgba(101,183,212,0.12),transparent_24rem),linear-gradient(112deg,#FFFFFF_0%,#F8FBFF_42%,#EDF4FF_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[72%] bg-[linear-gradient(90deg,rgba(248,251,255,0)_0%,rgba(237,244,255,0.32)_36%,rgba(221,234,255,0.42)_100%)]" />

      <div className="relative grid min-h-[560px] gap-0 xl:grid-cols-[minmax(460px,0.88fr)_minmax(560px,1.12fr)]">
        <div className="z-10 flex flex-col justify-center px-8 py-10 lg:px-14 xl:pr-6">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-[6px] border border-[rgba(59,105,224,0.22)] bg-white/76 px-3 py-1 text-xs font-semibold text-[#2454C7]">
            <Shield className="h-3.5 w-3.5" />
            Android 自动验证工作台
          </div>
          <div className="max-w-[720px]">
            <h1 className="text-[38px] font-extrabold leading-[1.14] tracking-normal text-[#15233B] sm:text-[48px]">
              <span className="text-[48px] text-[#2454C7] sm:text-[62px]">透猎:</span>
              <span> Android应用供应链安全审计平台</span>
            </h1>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 w-36 overflow-hidden rounded-full bg-[#D6E4FF]">
                <div className="h-full w-24 bg-[#2454C7]" />
              </div>
              <span className="h-1.5 w-8 rounded-full bg-[#65B7D4]" />
            </div>
          </div>
          <p className="mt-5 max-w-[560px] text-[15px] font-medium leading-7 text-[#516173]">
            面向移动应用安全审计的自动化验证控制台，聚合任务、漏洞、组件识别与补丁证据，优先呈现可操作的安全信号。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/task/new" className="app-button-primary group inline-flex items-center gap-2 rounded-[7px] px-5 py-3 text-sm font-semibold transition-colors">
              <Zap className="h-4 w-4" />
              开始新任务
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/global-dashboard" className="app-button-secondary inline-flex items-center gap-2 rounded-[7px] px-5 py-3 text-sm font-semibold transition-colors">
              <Radar className="h-4 w-4" />
              全局态势感知
            </Link>
            <div className="inline-flex items-center gap-2 rounded-[7px] border border-[rgba(129,151,181,0.25)] bg-white/70 px-4 py-3 text-sm text-[#516173]">
              <BarChart3 className="h-4 w-4 text-[#3E6FEF]" />
              实时威胁监控
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-0 py-8 pr-6 xl:-ml-8 xl:pr-8">
          <AndroidAuditIllustration compact framed={false} />
          <span className="absolute right-8 top-8 rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-white/78 px-3 py-1 text-xs font-medium text-[#516173]">
            {hasRealSummary ? "真实数据" : "示例数据"}
          </span>
        </div>
      </div>

      <div className="relative border-t border-[rgba(129,151,181,0.18)] bg-white/48 px-8 py-4 lg:px-12">
        <div className="grid gap-3 md:grid-cols-4">
          <HeroStat icon={<Database className="h-4 w-4 text-[#3B69E0]" />} label="检测 APK" value={completedApks} />
          <HeroStat icon={<Shield className="h-4 w-4 text-rose-500" />} label="高危记录" value={highRisk} />
          <HeroStat icon={<Code className="h-4 w-4 text-[#3B69E0]" />} label="函数找回" value={recoveredFunctions} />
          <HeroStat icon={<GitBranch className="h-4 w-4 text-[#3B69E0]" />} label="语义匹配" value={semanticMatches} />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon, label, value }: { icon: JSX.Element; label: string; value: number }): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[rgba(129,151,181,0.22)] bg-white/70 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-[#516173]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-mono text-xl font-semibold leading-none text-[#0F172A]">{value.toLocaleString()}</div>
    </div>
  );
}
