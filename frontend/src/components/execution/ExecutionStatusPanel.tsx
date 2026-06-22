import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";

import type { TaskStage, WsConnectionState } from "../../types/domain";
import { StageBadge } from "../common/StageBadge";

interface ExecutionStatusPanelProps {
  taskId: string;
  stage: TaskStage;
  wsState: WsConnectionState;
  isPollingFallback: boolean;
  errorMessage: string | null;
  onReconnect: () => void;
}

function wsLabel(wsState: WsConnectionState): { label: string; className: string; dot: string } {
  switch (wsState) {
    case "CONNECTED":
      return { label: "WS 已连接", className: "text-[#2557D6]", dot: "bg-[#3E6FEF]" };
    case "CONNECTING":
      return { label: "WS 连接中", className: "text-amber-700", dot: "bg-amber-500" };
    case "RECONNECTING":
      return { label: "WS 重连中", className: "text-amber-700", dot: "bg-amber-500" };
    case "DEGRADED":
      return { label: "降级轮询", className: "text-amber-700", dot: "bg-amber-500" };
    case "FAILED":
      return { label: "连接失败", className: "text-rose-700", dot: "bg-rose-500" };
    default:
      return { label: "未连接", className: "text-[#405064]", dot: "bg-[#627188]" };
  }
}

export function ExecutionStatusPanel({
  taskId,
  stage,
  wsState,
  isPollingFallback,
  errorMessage,
  onReconnect,
}: ExecutionStatusPanelProps): JSX.Element {
  const ws = wsLabel(wsState);

  return (
    <section className="space-y-5 rounded-[10px] border border-[rgba(129,151,181,0.28)] bg-white p-6 shadow-[0_8px_18px_rgba(49,88,153,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-[#627188]">当前任务</p>
          <p className="inline-block rounded-[6px] border border-[rgba(129,151,181,0.24)] bg-[#F8FBFF] px-2 py-1 font-mono text-[13px] text-[#0F172A]">{taskId}</p>
        </div>
        <StageBadge stage={stage} />
      </div>

      <div className="rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-[#F8FBFF] px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${ws.dot}`} />
          <p className={`font-medium ${ws.className}`}>{ws.label}</p>
        </div>
        {isPollingFallback && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs leading-5 text-[#405064]">
            <WifiOff className="h-4 w-4" />
            WebSocket 不可用，已切换为短轮询拉取报告状态。
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {errorMessage}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onReconnect}
        className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(62,111,239,0.34)] bg-white px-5 py-3 text-sm font-medium text-[#2557D6] transition-colors hover:bg-[#EAF2FF] focus:outline-none focus:ring-2 focus:ring-[#8DB7FF]"
      >
        <RotateCcw className="h-4 w-4" />
        手动重连执行通道
      </button>
    </section>
  );
}
