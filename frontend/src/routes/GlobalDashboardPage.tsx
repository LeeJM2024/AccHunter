import { Activity, ArrowLeft, Globe, Layers3, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { CveTopList } from "../components/dashboard/CveTopList";
import { LibrarySourceChart } from "../components/dashboard/LibrarySourceChart";
import { mockTaskStats, mockTotalLibraries, mockVulnerabilityStats } from "../components/dashboard/mockData";
import { TaskTrendChart } from "../components/dashboard/TaskTrendChart";
import { fetchDashboardSummary, fetchEcosystemSummary } from "../services/api";
import type { DashboardSummaryRaw, EcosystemSummaryRaw } from "../types/contracts";

type IntelMode = "local" | "ecosystem";

export function GlobalDashboardPage(): JSX.Element {
  const [summary, setSummary] = useState<DashboardSummaryRaw | null>(null);
  const [ecosystemSummary, setEcosystemSummary] = useState<EcosystemSummaryRaw | null>(null);
  const [intelMode, setIntelMode] = useState<IntelMode>("local");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    void fetchDashboardSummary()
      .then((payload) => {
        if (!stopped) setSummary(payload);
      })
      .catch((err) => {
        if (!stopped) setError(err instanceof Error ? err.message : "大盘数据加载失败");
      });
    return () => {
      stopped = true;
    };
  }, []);

  useEffect(() => {
    let stopped = false;
    void fetchEcosystemSummary()
      .then((payload) => {
        if (!stopped) setEcosystemSummary(payload);
      })
      .catch(() => {
        if (!stopped) setEcosystemSummary(null);
      });
    return () => {
      stopped = true;
    };
  }, []);

  const hasRealSummary = Boolean(summary && summary.task_stats.total_tasks > 0);
  const taskStats = summary?.task_stats;
  const vulnerabilityStats = summary?.vulnerability_stats;
  const libraryStats = summary?.library_stats;

  const totalTasks = hasRealSummary ? taskStats!.total_tasks : mockTaskStats.totalTasks;
  const completedTasks = hasRealSummary ? taskStats!.completed_tasks : mockTaskStats.completedTasks;
  const failedTasks = hasRealSummary ? taskStats!.failed_tasks : mockTaskStats.failedTasks;
  const totalVulns = hasRealSummary ? vulnerabilityStats!.total : mockVulnerabilityStats.total;
  const criticalVulns = hasRealSummary ? vulnerabilityStats!.critical : mockVulnerabilityStats.critical;
  const totalLibraries = hasRealSummary ? libraryStats!.total_libraries : mockTotalLibraries;
  const uniqueLibraries = hasRealSummary ? libraryStats!.unique_libraries : 505;

  return (
    <div className="min-h-screen p-8">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(62,111,239,0.34)] bg-white px-4 py-2 text-sm text-[#2557D6] transition-colors hover:bg-[#EAF2FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回操作台
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#3E6FEF]" />
            <h1 className="text-xl font-semibold text-[#0F172A]">全局态势感知大盘</h1>
            <span className="ml-2 rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-[#F8FBFF] px-2 py-0.5 text-xs font-medium text-[#516173]">
              {intelMode === "ecosystem" ? "生态参考" : hasRealSummary ? "真实聚合" : "示例数据"}
            </span>
          </div>
        </div>
        <div className="text-xs text-[#8493A8]">
          最后更新：{summary?.generated_at ? new Date(summary.generated_at).toLocaleString("zh-CN") : error || "等待后端连接"}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <TopCard icon={<Activity className="h-5 w-5 text-[#3E6FEF]" />} label="总任务数" value={totalTasks} badge={`+${taskStats?.daily_avg ?? mockTaskStats.dailyAvg}/天`}>
          完成 {completedTasks.toLocaleString()}，失败 {failedTasks}
        </TopCard>
        <TopCard icon={<Shield className="h-5 w-5 text-rose-500" />} label="总漏洞数" value={totalVulns} badge={`${criticalVulns} 严重`}>
          高危 {vulnerabilityStats?.high ?? mockVulnerabilityStats.high}，中危 {vulnerabilityStats?.medium ?? mockVulnerabilityStats.medium}，低危 {vulnerabilityStats?.low ?? mockVulnerabilityStats.low}
        </TopCard>
        <TopCard icon={<Layers3 className="h-5 w-5 text-[#3E6FEF]" />} label="总组件数" value={totalLibraries} badge={`${uniqueLibraries} 唯一组件`}>
          组件识别与来源统计当前显示示例数据，真实数据可逐步覆盖。
        </TopCard>
      </div>

      <div className="mb-8 rounded-[8px] border border-[rgba(129,151,181,0.28)] bg-white p-6 shadow-[0_8px_18px_rgba(49,88,153,0.06)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(62,111,239,0.24)] bg-[#EAF2FF]">
              <Activity className="h-4 w-4 text-[#3E6FEF]" />
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A]">任务状态趋势图</h2>
          </div>
          <div className="text-sm text-[#516173]">最近 7 天，成功率 {taskStats?.success_rate ?? 96}%</div>
        </div>
        <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-[#F8FBFF] p-4">
          <TaskTrendChart summary={summary} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PanelFrame
          icon={<Shield className="h-4 w-4 text-rose-500" />}
          title="高风险 CVE TOP 榜"
          right={intelMode === "ecosystem" ? "生态参考情报" : hasRealSummary ? "真实报告聚合" : "示例数据"}
          controls={<IntelModeSwitch value={intelMode} onChange={setIntelMode} />}
        >
          <CveTopList summary={summary} ecosystemSummary={ecosystemSummary} mode={intelMode} />
        </PanelFrame>
        <PanelFrame
          icon={<Layers3 className="h-4 w-4 text-[#3E6FEF]" />}
          title={intelMode === "ecosystem" ? "生态 TPL 使用热度" : "第三方组件使用次数排行"}
          right={intelMode === "ecosystem" ? `${ecosystemSummary?.tpl_top.length ?? 0} 情报项` : `${totalLibraries} 组件记录`}
          controls={<IntelModeSwitch value={intelMode} onChange={setIntelMode} />}
        >
          <LibrarySourceChart summary={summary} ecosystemSummary={ecosystemSummary} mode={intelMode} />
        </PanelFrame>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-white px-4 py-2 text-xs text-[#516173]">
          <Zap className="h-3 w-3 text-[#3E6FEF]" />
          <span>
            {intelMode === "ecosystem"
              ? "生态参考不代表当前 APK 命中；实际风险请以本地扫描聚合为准"
              : "真实数据优先；缺失字段显示示例数据，等待中间件层补齐"}
          </span>
        </div>
      </div>
    </div>
  );
}

function TopCard({ icon, label, value, badge, children }: { icon: JSX.Element; label: string; value: number; badge: string; children: ReactNode }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[rgba(129,151,181,0.28)] bg-white p-6 shadow-[0_8px_18px_rgba(49,88,153,0.06)] transition-colors hover:border-[#3E6FEF]/35">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[rgba(62,111,239,0.24)] bg-[#EAF2FF]">{icon}</div>
          <div>
            <div className="text-sm text-[#516173]">{label}</div>
            <div className="font-mono text-3xl font-semibold text-[#0F172A]">{value.toLocaleString()}</div>
          </div>
        </div>
        <div className="rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-[#F8FBFF] px-2 py-1 text-xs text-[#516173]">{badge}</div>
      </div>
      <div className="text-xs leading-5 text-[#8493A8]">{children}</div>
    </div>
  );
}

function IntelModeSwitch({ value, onChange }: { value: IntelMode; onChange: (mode: IntelMode) => void }): JSX.Element {
  return (
    <div className="inline-flex rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-[#F8FBFF] p-1">
      {[
        { key: "local" as const, label: "本地扫描聚合" },
        { key: "ecosystem" as const, label: "生态参考情报" },
      ].map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-[4px] px-3 py-1.5 text-xs font-medium transition-colors ${
            value === item.key ? "border border-[#3E6FEF]/35 bg-white text-[#2557D6]" : "text-[#516173] hover:text-[#0F172A]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PanelFrame({ icon, title, right, controls, children }: { icon: JSX.Element; title: string; right: string; controls?: ReactNode; children: ReactNode }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[rgba(129,151,181,0.28)] bg-white p-6 shadow-[0_8px_18px_rgba(49,88,153,0.06)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(62,111,239,0.24)] bg-[#EAF2FF]">{icon}</div>
          <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {controls}
          <div className="text-sm text-[#516173]">{right}</div>
        </div>
      </div>
      <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-[#F8FBFF] p-4">{children}</div>
    </div>
  );
}
