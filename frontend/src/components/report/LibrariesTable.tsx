import { ArrowDownWideNarrow } from "lucide-react";

import type { UsedLibraryModel } from "../../types/domain";

interface LibrariesTableProps {
  libraries: UsedLibraryModel[];
  selectedLibraryId: string | null;
  onSelect: (libraryId: string) => void;
}

function riskColor(vulnCount: number): string {
  if (vulnCount >= 2) return "text-rose-700 bg-rose-50 border-rose-200";
  if (vulnCount === 1) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-emerald-700 bg-emerald-50 border-emerald-200";
}

export function LibrariesTable({ libraries, selectedLibraryId, onSelect }: LibrariesTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#D8E3F3] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8E3F3] bg-[#F8FBFF] px-4 py-3">
        <p className="text-sm font-semibold text-[#0F172A]">Used Libraries（SBOM）</p>
        <span className="inline-flex items-center gap-1 text-xs text-[#405064]">
          <ArrowDownWideNarrow className="h-3.5 w-3.5" />
          按漏洞数量与置信度排序
        </span>
      </div>

      <div className="max-h-[320px] overflow-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 z-10 border-b border-[#D8E3F3] bg-[#F3F7FE] text-[#405064]">
            <tr>
              <th className="px-3 py-2 font-semibold">Group</th>
              <th className="px-3 py-2 font-semibold">Artifact</th>
              <th className="px-3 py-2 font-semibold">Version</th>
              <th className="px-3 py-2 font-semibold">Confidence</th>
              <th className="px-3 py-2 font-semibold">漏洞数</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((lib) => {
              const selected = selectedLibraryId === lib.id;
              return (
                <tr
                  key={lib.id}
                  className={`cursor-pointer border-t border-[#E6EEF8] transition ${
                    selected ? "bg-[#EAF2FF]" : "bg-white hover:bg-[#F8FBFF]"
                  }`}
                  onClick={() => onSelect(lib.id)}
                >
                  <td className="px-3 py-2 text-[#334155]">{lib.group}</td>
                  <td className="px-3 py-2 font-medium text-[#0F172A]">{lib.artifact}</td>
                  <td className="px-3 py-2 text-[#405064]">{lib.version}</td>
                  <td className="px-3 py-2 font-mono text-[13px] text-[#405064]">{(lib.confidence * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex min-w-7 justify-center rounded-full border px-2 py-0.5 font-semibold ${riskColor(lib.vulnerabilityCount)}`}>
                      {lib.vulnerabilityCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
