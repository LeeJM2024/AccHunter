import { Loader2, PlayCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Panel } from "../components/common/Panel";
import { UploadDropzone } from "../components/upload/UploadDropzone";
import { useTaskStore } from "../store/taskStore";
import { formatBytes } from "../utils/format";

export function NewTaskPage(): JSX.Element {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadAndAnalyze = useTaskStore((state) => state.uploadAndAnalyze);
  const uploadState = useTaskStore((state) => state.uploadState);
  const uploadContext = useTaskStore((state) => state.uploadContext);
  const errorMessage = useTaskStore((state) => state.errorMessage);

  const canStart = useMemo(() => {
    return Boolean(selectedFile) && uploadState !== "PENDING";
  }, [selectedFile, uploadState]);

  const startTask = async () => {
    if (!selectedFile) return;
    const taskId = await uploadAndAnalyze(selectedFile);
    navigate(`/task/${taskId}/execution`);
  };

  return (
    <div className="space-y-8">
      <Panel title="新建扫描任务">
        <UploadDropzone file={selectedFile} onFileSelect={setSelectedFile} disabled={uploadState === "PENDING"} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canStart}
            onClick={() => void startTask()}
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#3E6FEF] bg-[#3E6FEF] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#2557D6] disabled:cursor-not-allowed disabled:border-[rgba(129,151,181,0.32)] disabled:bg-[#EEF2F7] disabled:text-[#627188]"
          >
            {uploadState === "PENDING" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            上传并开始扫描
          </button>

          {selectedFile && (
            <span className="text-sm font-medium text-[#405064]">
              {selectedFile.name} / {formatBytes(selectedFile.size)}
            </span>
          )}
        </div>

        {uploadContext && (
          <div className="mt-4 rounded-[8px] border border-[rgba(129,151,181,0.32)] bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-[#405064]">
            已上传：{uploadContext.fileName}，{formatBytes(uploadContext.size)}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}
      </Panel>
    </div>
  );
}
