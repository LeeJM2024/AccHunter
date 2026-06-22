import { Download, FileWarning, FlaskConical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Panel } from "../components/common/Panel";
import { ErrorView, LoadingView } from "../components/common/StateView";
import { AnalysisTracePanel } from "../components/report/AnalysisTracePanel";
import { CopilotPanel } from "../components/report/CopilotPanel";
import { CveVersionTimeline } from "../components/report/CveVersionTimeline";
import { EvidencePanel } from "../components/report/EvidencePanel";
import { LibrariesTable } from "../components/report/LibrariesTable";
import { ReportSummaryCards } from "../components/report/ReportSummaryCards";
import { SbomGraph } from "../components/report/SbomGraph";
import { VulnerabilityTable } from "../components/report/VulnerabilityTable";
import { useTaskStore } from "../store/taskStore";
import { formatBytes, shortHash } from "../utils/format";
import { downloadDetectionReport } from "../utils/reportDownload";

export function ReportPage(): JSX.Element {
  const params = useParams();
  const taskId = params.taskId;

  const ensureReport = useTaskStore((state) => state.ensureReport);
  const reportsByTask = useTaskStore((state) => state.reportsByTask);
  const errorMessage = useTaskStore((state) => state.errorMessage);
  const activeVulnerabilityId = useTaskStore((state) => state.activeVulnerabilityId);
  const selectedLibraryId = useTaskStore((state) => state.selectedLibraryId);
  const setActiveVulnerability = useTaskStore((state) => state.setActiveVulnerability);
  const setSelectedLibrary = useTaskStore((state) => state.setSelectedLibrary);
  const [isDownloading, setIsDownloading] = useState(false);

  const report = taskId ? reportsByTask[taskId] || null : null;

  useEffect(() => {
    if (!taskId) return;
    if (reportsByTask[taskId]) return;
    void ensureReport(taskId, false);
  }, [taskId, reportsByTask, ensureReport]);

  useEffect(() => {
    if (!report) return;
    if (!activeVulnerabilityId && report.vulnerabilities[0]) {
      setActiveVulnerability(report.vulnerabilities[0].id);
    }
    if (!selectedLibraryId && report.usedLibraries[0]) {
      setSelectedLibrary(report.usedLibraries[0].id);
    }
  }, [report, activeVulnerabilityId, selectedLibraryId, setActiveVulnerability, setSelectedLibrary]);

  const selectedLibrary = useMemo(() => {
    if (!report || !selectedLibraryId) return null;
    return report.usedLibraries.find((lib) => lib.id === selectedLibraryId) || null;
  }, [report, selectedLibraryId]);

  const visibleVulnerabilities = useMemo(() => {
    if (!report) return [];
    if (!selectedLibrary) return report.vulnerabilities;
    return report.vulnerabilities.filter((vuln) => vuln.library === selectedLibrary.libraryName);
  }, [report, selectedLibrary]);

  const activeVulnerability = useMemo(() => {
    if (!report || !activeVulnerabilityId) return null;
    return report.vulnerabilities.find((v) => v.id === activeVulnerabilityId) || null;
  }, [report, activeVulnerabilityId]);

  if (!taskId) {
    return <ErrorView text="缺少 taskId，请从执行页或首页进入报告。" />;
  }

  if (!report && !errorMessage) {
    return <LoadingView text="正在加载报告数据..." />;
  }

  if (!report && errorMessage) {
    return (
      <div className="space-y-4">
        <ErrorView text={errorMessage} />
        <Link
          to={`/task/${taskId}/execution`}
          className="inline-flex rounded-lg border border-[#3E6FEF] bg-white px-3 py-2 text-xs font-medium text-[#2557D6] transition hover:bg-[#EAF2FF]"
        >
          返回执行页重试
        </Link>
      </div>
    );
  }

  if (!report) return <LoadingView text="报告加载中..." />;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDetectionReport(report);
    } catch (error) {
      console.error(error);
      window.alert("PDF 报告生成失败，请刷新页面后重试。");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[12px] border border-[#C8D8F4] bg-[linear-gradient(135deg,#FFFFFF_0%,#F3F7FE_100%)] p-6 shadow-[0_10px_24px_rgba(49,88,153,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#3E6FEF]">Security Report</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-[#0F172A]">检测报告</h1>
            <p className="mt-2 text-sm leading-6 text-[#405064]">集中查看 APK 基础信息、组件识别、漏洞明细、补丁验证证据与自动化分析结论。</p>
          </div>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#2F67EA] bg-[#3E6FEF] px-4 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(62,111,239,0.18)] transition hover:bg-[#2557D6] focus:outline-none focus:ring-2 focus:ring-[#8DB7FF] disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "正在生成报告..." : "下载检测报告"}
          </button>
        </div>
      </section>

      <ReportSummaryCards report={report} />

      <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <AnalysisTracePanel artifacts={report.analysisArtifacts} />
        <CopilotPanel vulnerability={activeVulnerability} report={report} />
      </div>

      <Panel title="APK 基础信息" right={<FlaskConical className="h-4 w-4 text-[#3E6FEF]" />}>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <InfoTile label="名称" value={report.apkInfo.name} />
          <InfoTile label="SHA256" value={shortHash(report.apkInfo.sha256)} mono />
          <InfoTile label="大小" value={formatBytes(report.apkInfo.size)} />
        </div>
      </Panel>

      <Panel title="CVE 影响版本演进时间轴">
        <CveVersionTimeline timelines={report.cveVersionTimeline} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
        <Panel title="SBOM 拓扑图（可交互）">
          <SbomGraph
            apkName={report.apkInfo.name}
            libraries={report.usedLibraries}
            selectedLibraryId={selectedLibraryId}
            onSelectLibrary={(id) => setSelectedLibrary(id)}
          />
          <p className="mt-3 text-xs leading-5 text-[#405064]">
            中心节点为 APK，外圈节点为第三方库。点击组件节点会联动下方漏洞列表与右侧证据区。
          </p>
        </Panel>

        <Panel title="组件清单 / used_libraries" right={<FileWarning className="h-4 w-4 text-amber-600" />}>
          <LibrariesTable
            libraries={report.usedLibraries}
            selectedLibraryId={selectedLibraryId}
            onSelect={(id) => {
              setSelectedLibrary(id);
              const first = report.vulnerabilities.find((v) => {
                const lib = report.usedLibraries.find((item) => item.id === id);
                return lib ? v.library === lib.libraryName : false;
              });
              if (first) setActiveVulnerability(first.id);
            }}
          />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
        <Panel title="漏洞明细 / vulnerabilities">
          <VulnerabilityTable
            vulnerabilities={visibleVulnerabilities}
            activeId={activeVulnerabilityId}
            onSelect={(id) => setActiveVulnerability(id)}
          />
        </Panel>

        <EvidencePanel vulnerability={activeVulnerability} />
      </div>
    </div>
  );
}

function InfoTile({ label, value, mono = false }: { label: string; value: string; mono?: boolean }): JSX.Element {
  return (
    <div className="rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF] px-4 py-3">
      <p className="text-xs font-medium text-[#627188]">{label}</p>
      <p className={`mt-1 break-all text-sm font-semibold text-[#0F172A] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
