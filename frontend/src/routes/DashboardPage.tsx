import { ArrowRight, BarChart3, FileText, Radar } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Panel } from "../components/common/Panel";
import { DashboardHero } from "../components/dashboard/DashboardHero";
import { mockTaskStats, mockTotalLibraries, mockVulnerabilityStats } from "../components/dashboard/mockData";
import { RecentTasksPanel } from "../components/dashboard/RecentTasksPanel";
import { fetchDashboardSummary } from "../services/api";
import { useTaskStore } from "../store/taskStore";
import type { DashboardSummaryRaw } from "../types/contracts";
import type { ReportModel } from "../types/domain";

export function DashboardPage(): JSX.Element {
  const historyTaskIds = useTaskStore((state) => state.historyTaskIds);
  const reportsByTask = useTaskStore((state) => state.reportsByTask);
  const lastTaskId = useTaskStore((state) => state.lastTaskId);
  const clearTaskHistory = useTaskStore((state) => state.clearTaskHistory);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryRaw | null>(null);

  useEffect(() => {
    let stopped = false;
    void fetchDashboardSummary()
      .then((summary) => {
        if (!stopped) setDashboardSummary(summary);
      })
      .catch(() => {
        if (!stopped) setDashboardSummary(null);
      });
    return () => {
      stopped = true;
    };
  }, []);

  const reports = Object.values(reportsByTask);
  const localVulns = reports.reduce((sum, report) => sum + report.vulnerabilities.length, 0);
  const localLibraries = reports.reduce((sum, report) => sum + report.usedLibraries.length, 0);
  const hasRealSummary = Boolean(dashboardSummary && dashboardSummary.task_stats.total_tasks > 0);

  const totalTasks = hasRealSummary ? dashboardSummary!.task_stats.total_tasks : Math.max(historyTaskIds.length, mockTaskStats.totalTasks);
  const totalVulns = hasRealSummary ? dashboardSummary!.vulnerability_stats.total : Math.max(localVulns, mockVulnerabilityStats.total);
  const totalLibraries = hasRealSummary ? dashboardSummary!.library_stats.total_libraries : Math.max(localLibraries, mockTotalLibraries);
  const reportTaskIds = [...historyTaskIds, ...Object.keys(reportsByTask).filter((taskId) => !historyTaskIds.includes(taskId))];

  return (
    <div className="space-y-8">
      <DashboardHero summary={dashboardSummary} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.64fr)_minmax(360px,0.36fr)]">
        <GlobalDashboardEntry hasRealSummary={hasRealSummary} totalTasks={totalTasks} totalVulns={totalVulns} totalLibraries={totalLibraries} />
        <ReportEntryPanel reportTaskIds={reportTaskIds} reportsByTask={reportsByTask} lastTaskId={lastTaskId} />
      </div>

      <RecentTasksPanel historyTaskIds={historyTaskIds} onClear={clearTaskHistory} />
    </div>
  );
}

function ReportEntryPanel({ reportTaskIds, reportsByTask, lastTaskId }: { reportTaskIds: string[]; reportsByTask: Record<string, ReportModel>; lastTaskId: string | null }): JSX.Element {
  return (
    <Panel title="报告入口" right={<BarChart3 className="h-4 w-4 text-[#3B69E0]" />} className="flex h-[500px] flex-col overflow-hidden p-5">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <p className="text-sm leading-6 text-[#516173]">查看历次 APK 自动验证报告与证据链，按最近任务优先展示。</p>

        {reportTaskIds.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between rounded-[8px] border border-dashed border-[rgba(129,151,181,0.3)] bg-[#F8FBFF] p-4">
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">暂无历史报告</div>
              <p className="mt-2 text-sm leading-6 text-[#516173]">完成一次扫描后，这里会展示可进入的报告记录。</p>
            </div>
            <Link to="/task/new" className="app-button-secondary mt-5 inline-flex w-fit items-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-semibold transition-colors">
              新建扫描任务
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ul className="space-y-3">
              {reportTaskIds.map((taskId) => (
                <ReportEntryItem key={taskId} taskId={taskId} report={reportsByTask[taskId] ?? null} isLatest={taskId === lastTaskId} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ReportEntryItem({ taskId, report, isLatest }: { taskId: string; report: ReportModel | null; isLatest: boolean }): JSX.Element {
  const title = report?.apkInfo.name || taskId;
  const vulnerabilityCount = report?.vulnerabilities.length ?? 0;
  const libraryCount = report?.usedLibraries.length ?? 0;

  return (
    <li>
      <Link
        to={`/report/${taskId}`}
        className="group/report block rounded-[8px] border border-[rgba(126,146,178,0.24)] bg-[#F7FAFF] px-4 py-3 transition-colors hover:border-[#3B69E0]/38 hover:bg-[#F4F8FF]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#C7D7FF]/70 bg-white text-[#2454C7]">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[#0F172A]">{title}</span>
                {isLatest && <span className="shrink-0 rounded-[6px] bg-[#EDF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#2454C7]">最近</span>}
              </div>
              <div className="mt-1 truncate font-mono text-xs text-[#627188]">{taskId}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#516173]">
                <span>{vulnerabilityCount} 漏洞</span>
                <span>{libraryCount} 组件</span>
                {!report && <span>报告待加载</span>}
              </div>
            </div>
          </div>
          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[#9BB9FF] transition-transform group-hover/report:translate-x-0.5 group-hover/report:text-[#2454C7]" />
        </div>
      </Link>
    </li>
  );
}

function GlobalDashboardEntry({ hasRealSummary, totalTasks, totalVulns, totalLibraries }: { hasRealSummary: boolean; totalTasks: number; totalVulns: number; totalLibraries: number }): JSX.Element {
  return (
    <Link
      to="/global-dashboard"
      className="group relative block h-[500px] overflow-hidden rounded-[8px] border border-[#3B69E0]/24 bg-[#F4F8FF] p-6 shadow-[0_12px_24px_rgba(49,88,153,0.08)] transition-colors hover:border-[#3B69E0]/46"
    >
      <div className="absolute inset-y-0 right-0 hidden w-[52%] bg-[linear-gradient(90deg,rgba(244,248,255,0)_0%,rgba(235,243,255,0.7)_52%,rgba(221,234,255,0.82)_100%)] md:block" />
      <div className="pointer-events-none absolute inset-x-6 bottom-6 hidden h-px bg-[linear-gradient(90deg,rgba(59,105,224,0),rgba(59,105,224,0.18),rgba(59,105,224,0))] md:block" />
      <DashboardEntryPattern />
      <div className="relative z-10 flex h-full min-h-[452px] flex-col justify-between gap-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-[6px] border border-[#C7D7FF] bg-white/78 px-3 py-1.5 text-xs font-semibold text-[#2454C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            {hasRealSummary ? "真实聚合已接入" : "示例数据预览"}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-3xl font-semibold leading-tight tracking-normal text-[#0F172A]">全局态势感知大盘</h3>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#C7D7FF] bg-white shadow-[0_4px_8px_rgba(49,88,153,0.06)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 4.2v3.1M12 16.7v3.1M4.2 12h3.1M16.7 12h3.1" stroke="#9BB9FF" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7.7 16.3L10.5 11l3.5 2.8 2.3-5.6" stroke="#2454C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10.5" cy="11" r="2.3" fill="#FFFFFF" stroke="#2454C7" strokeWidth="1.7" />
                <circle cx="16.3" cy="8.2" r="2" fill="#65B7D4" stroke="#FFFFFF" strokeWidth="1" />
              </svg>
            </span>
          </div>
          <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#516173]">聚合任务、漏洞、组件与来源证据，进入全局视角快速判断供应链风险态势。</p>
        </div>

        <div className="space-y-4">
          <div className="grid max-w-[620px] gap-3 sm:grid-cols-3">
            <DashboardEntryStat label="任务" value={totalTasks} hint="已纳入验证流" />
            <DashboardEntryStat label="漏洞" value={totalVulns} hint="风险信号汇总" tone="rose" />
            <DashboardEntryStat label="组件" value={totalLibraries} hint="供应链资产面" />
          </div>

          <div className="flex flex-col gap-3 rounded-[8px] border border-[#C7D7FF]/80 bg-[linear-gradient(90deg,rgba(237,244,255,0.9)_0%,rgba(247,250,255,0.82)_58%,rgba(233,242,255,0.9)_100%)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#C7D7FF]/70 bg-white/72 text-[#2454C7]">
                <Radar className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0F172A]">全域审计链路持续聚合</div>
                <div className="mt-0.5 text-xs text-[#516173]">任务执行、漏洞命中、组件来源在同一视角中联动呈现</div>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] border border-[#3B69E0]/30 bg-white/78 px-4 py-2.5 text-sm font-semibold text-[#2454C7] transition-colors group-hover:bg-white">
              进入大盘
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DashboardEntryPattern(): JSX.Element {
  return (
    <svg className="pointer-events-none absolute right-6 top-6 hidden h-[194px] w-[286px] opacity-95 lg:block" viewBox="0 0 258 176" fill="none" aria-hidden="true">
      <path d="M28 136C54 101 86 82 124 78C161 74 191 54 230 24" stroke="#D6E4FF" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 128C91 105 112 98 138 100C166 102 184 88 210 62" stroke="#9BB9FF" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
      <rect x="152" y="18" width="76" height="34" rx="8" fill="#FFFFFF" fillOpacity="0.78" stroke="#C7D7FF" />
      <rect x="30" y="116" width="68" height="30" rx="8" fill="#FFFFFF" fillOpacity="0.74" stroke="#D6E4FF" />
      <rect x="68" y="32" width="58" height="28" rx="8" fill="#FFFFFF" fillOpacity="0.68" stroke="#D6E4FF" />
      <path d="M188 52V76M98 60V82M64 116V96" stroke="#D6E4FF" strokeWidth="2" strokeLinecap="round" />

      <circle cx="164" cy="96" r="54" fill="#FFFFFF" fillOpacity="0.44" stroke="#C7D7FF" strokeWidth="2" />
      <circle cx="164" cy="96" r="34" stroke="#D6E4FF" strokeWidth="2" />
      <path d="M164 54V138M122 96H206" stroke="#9BB9FF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M140 120L164 96L198 80" stroke="#3B69E0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="164" cy="96" r="7" fill="#FFFFFF" stroke="#2454C7" strokeWidth="3" />

      <path d="M64 96L98 82L132 100L164 96L188 76" stroke="#3B69E0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="64" cy="96" r="7" fill="#2454C7" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="98" cy="82" r="7" fill="#FFFFFF" stroke="#65B7D4" strokeWidth="3" />
      <circle cx="132" cy="100" r="6" fill="#FFFFFF" stroke="#9BB9FF" strokeWidth="3" />
      <circle cx="188" cy="76" r="8" fill="#65B7D4" stroke="#FFFFFF" strokeWidth="3" />

      <path d="M52 38H76M52 48H94M166 32H204M44 128H76" stroke="#E4EDFF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="230" cy="24" r="4" fill="#9BB9FF" />
      <circle cx="28" cy="136" r="4" fill="#65B7D4" />
    </svg>
  );
}

function DashboardEntryStat({ label, value, hint, tone = "blue" }: { label: string; value: number; hint: string; tone?: "blue" | "rose" }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[rgba(129,151,181,0.22)] bg-white/78 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-[#627188]">{label}</div>
        <span className={`h-1.5 w-1.5 rounded-full ${tone === "rose" ? "bg-rose-500" : "bg-[#3B69E0]"}`} />
      </div>
      <div className="mt-1 font-mono text-xl font-semibold leading-none text-[#0F172A]">{value.toLocaleString()}</div>
      <div className="mt-2 truncate text-xs text-[#627188]">{hint}</div>
    </div>
  );
}
