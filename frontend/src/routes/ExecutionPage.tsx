import { ArrowRightCircle, FileText } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Panel } from "../components/common/Panel";
import { StageBadge } from "../components/common/StageBadge";
import { ExecutionStatusPanel } from "../components/execution/ExecutionStatusPanel";
import { ScanProgress } from "../components/execution/ScanProgress";
import { useTaskBootstrap } from "../hooks/useTaskBootstrap";
import { useTaskStore } from "../store/taskStore";

export function ExecutionPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const taskId = params.taskId;

  useTaskBootstrap(taskId);

  const logs = useTaskStore((state) => state.logs);
  const uploadContext = useTaskStore((state) => state.uploadContext);
  const taskStage = useTaskStore((state) => state.taskStage);
  const wsState = useTaskStore((state) => state.wsState);
  const isPollingFallback = useTaskStore((state) => state.isPollingFallback);
  const errorMessage = useTaskStore((state) => state.errorMessage);
  const connectExecution = useTaskStore((state) => state.connectExecution);

  useEffect(() => {
    if (taskStage !== "REPORT_READY" || !taskId) return;
    const key = "pierhunter:auto-report-opened:first-success";
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
    const timer = window.setTimeout(() => {
      navigate(`/report/${taskId}`);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [taskStage, taskId, navigate]);

  if (!taskId) {
    return (
      <Panel title="执行监控">
        <p className="text-sm text-[#405064]">任务 ID 缺失，请先前往新建任务页面。</p>
        <Link
          to="/task/new"
          className="mt-6 inline-flex items-center gap-2 rounded-[6px] border border-[#3E6FEF] bg-[#3E6FEF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2557D6]"
        >
          去新建任务
        </Link>
      </Panel>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.28fr_0.72fr]">
      <div className="space-y-6">
        <ExecutionStatusPanel
          taskId={taskId}
          stage={taskStage}
          wsState={wsState}
          isPollingFallback={isPollingFallback}
          errorMessage={errorMessage}
          onReconnect={() => {
            void connectExecution(taskId);
          }}
        />

        <Panel title="流程状态">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#405064]">任务阶段</span>
              <StageBadge stage={taskStage} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#405064]">日志条数</span>
              <span className="font-mono text-[#0F172A]">{logs.length}</span>
            </div>
          </div>
        </Panel>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/report/${taskId}`}
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#3E6FEF] bg-[#3E6FEF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2557D6]"
          >
            <FileText className="h-4 w-4" />
            立即查看报告
          </Link>
          <button
            type="button"
            onClick={() => {
              void connectExecution(taskId);
            }}
            className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(62,111,239,0.34)] bg-white px-5 py-3 text-sm font-semibold text-[#2557D6] transition-colors hover:bg-[#EAF2FF]"
          >
            <ArrowRightCircle className="h-4 w-4" />
            重建监控连接
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <Panel title="扫描进度">
          <ScanProgress
            logs={logs}
            taskStage={taskStage}
            wsState={wsState}
            isPollingFallback={isPollingFallback}
            errorMessage={errorMessage}
            uploadSize={uploadContext?.size ?? null}
            scanEstimate={uploadContext?.scanEstimate ?? null}
          />
        </Panel>
      </div>
    </div>
  );
}
