import { FileArchive, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { formatBytes } from "../../utils/format";

interface UploadDropzoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ file, onFileSelect, disabled = false }: UploadDropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const chooseFile = (selected: File | null | undefined) => {
    if (!selected || disabled) return;
    onFileSelect(selected);
  };

  return (
    <div
      className={`relative rounded-[8px] border border-dashed p-8 transition-colors ${
        dragging
          ? "border-[#3E6FEF]/60 bg-[#EAF2FF]"
          : "border-[rgba(89,110,138,0.5)] bg-[#F8FBFF] hover:border-[#3E6FEF]/50"
      } ${disabled ? "opacity-70" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        chooseFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".apk"
        className="hidden"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />

      <button
        type="button"
        disabled={disabled}
        className="absolute inset-0"
        onClick={() => inputRef.current?.click()}
        aria-label="选择 APK 文件"
      />

      <div className="pointer-events-none text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[8px] border border-[#3E6FEF]/25 bg-white">
          <UploadCloud className="h-8 w-8 text-[#3E6FEF]" />
        </div>
        <p className="mt-4 text-base font-semibold text-[#0F172A]">拖拽 APK 或点击选择文件</p>
        <p className="mt-1.5 text-sm leading-6 text-[#405064]">支持 .apk 格式，单个文件上传</p>

        {file && (
          <div className="mx-auto mt-6 max-w-md rounded-[8px] border border-[rgba(62,111,239,0.24)] bg-white px-4 py-3 text-left">
            <p className="inline-flex items-center gap-2 text-sm text-[#0F172A]">
              <FileArchive className="h-4 w-4 text-[#3E6FEF]" />
              {file.name}
            </p>
            <p className="mt-1 font-mono text-[13px] text-[#405064]">{formatBytes(file.size)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
