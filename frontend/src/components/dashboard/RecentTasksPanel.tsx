import { Clock3, FileScan, Loader2, PlayCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Panel } from "../common/Panel";

export function RecentTasksPanel({ historyTaskIds, onClear }: { historyTaskIds: string[]; onClear: () => Promise<void> }): JSX.Element {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await onClear();
    } finally {
      setIsClearing(false);
    }
  };

  const right = historyTaskIds.length ? (
    <button
      type="button"
      onClick={() => void handleClear()}
      disabled={isClearing}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-white text-[#8493A8] transition-colors hover:border-rose-200 hover:text-rose-600"
      title="清除历史记录"
      aria-label="清除历史记录"
    >
      {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  ) : (
    <Clock3 className="h-4 w-4 text-[#8493A8]" />
  );

  return (
    <Panel title="历史任务" right={right}>
      {historyTaskIds.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[rgba(129,151,181,0.3)] bg-[#F8FBFF] px-4 py-5 text-sm text-[#516173]">
          暂无历史任务
        </div>
      ) : (
        <div className="max-h-[228px] overflow-y-auto pr-1">
          <ul className="space-y-3">
            {historyTaskIds.map((taskId) => (
              <li key={taskId} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[rgba(129,151,181,0.24)] bg-white px-4 py-3">
                <span className="inline-flex max-w-[180px] items-center gap-2 truncate text-sm text-[#0F172A]">
                  <FileScan className="h-4 w-4 flex-shrink-0 text-[#3E6FEF]" />
                  <span className="truncate">{taskId}</span>
                </span>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    to={`/task/${taskId}/execution`}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-[#3E6FEF]/28 px-2.5 py-1 text-xs text-[#2557D6] transition-colors hover:bg-[#EAF2FF]"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    执行页
                  </Link>
                  <Link
                    to={`/report/${taskId}`}
                    className="rounded-[6px] border border-[rgba(129,151,181,0.28)] px-2.5 py-1 text-xs text-[#516173] transition-colors hover:bg-[#F3F7FE]"
                  >
                    报告页
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
