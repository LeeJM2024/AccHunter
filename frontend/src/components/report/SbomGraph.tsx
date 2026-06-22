import * as echarts from "echarts";
import { useEffect, useMemo, useRef } from "react";

import type { UsedLibraryModel } from "../../types/domain";

interface SbomGraphProps {
  apkName: string;
  libraries: UsedLibraryModel[];
  selectedLibraryId: string | null;
  onSelectLibrary: (libraryId: string) => void;
}

export function SbomGraph({ apkName, libraries, selectedLibraryId, onSelectLibrary }: SbomGraphProps): JSX.Element {
  const holderRef = useRef<HTMLDivElement | null>(null);

  const graphData = useMemo(() => {
    const centerId = "apk-center";
    const nodes = [
      {
        id: centerId,
        name: apkName,
        symbolSize: 72,
        category: 0,
        value: 0,
        itemStyle: {
          color: "#EAF2FF",
          borderColor: "#3E6FEF",
          borderWidth: 2,
        },
        label: {
          color: "#0F172A",
          fontWeight: 700,
          fontSize: 13,
          backgroundColor: "#FFFFFF",
          borderColor: "#C8D8F4",
          borderWidth: 1,
          padding: [4, 8],
          borderRadius: 4,
        },
      },
      ...libraries.map((lib) => {
        const risk = lib.vulnerabilityCount > 0;
        const isSelected = selectedLibraryId === lib.id;
        const color = isSelected ? "#EAF2FF" : risk ? "#FFF7ED" : "#ECFDF5";
        const borderColor = isSelected ? "#3E6FEF" : risk ? "#F97316" : "#10B981";

        return {
          id: lib.id,
          name: `${lib.artifact}\nv${lib.version}`,
          category: risk ? 1 : 2,
          symbolSize: Math.max(28, 28 + lib.vulnerabilityCount * 5),
          value: lib.vulnerabilityCount,
          itemStyle: {
            color,
            borderColor,
            borderWidth: isSelected ? 3 : 2,
          },
          label: {
            color: risk ? "#9A3412" : "#047857",
            fontWeight: risk ? 600 : 500,
            fontSize: 11,
            backgroundColor: "#FFFFFF",
            borderColor,
            borderWidth: 1,
            padding: [3, 6],
            borderRadius: 3,
          },
        };
      }),
    ];

    const links = libraries.map((lib) => {
      const risk = lib.vulnerabilityCount > 0;
      return {
        source: centerId,
        target: lib.id,
        lineStyle: {
          color: risk ? "rgba(249,115,22,0.42)" : "rgba(16,185,129,0.34)",
          width: risk ? 1.5 : 1,
          opacity: 0.85,
          type: risk ? "solid" : "dashed",
          curveness: 0.2,
        },
        label: {
          show: true,
          formatter: risk ? `${lib.vulnerabilityCount} vuln` : "safe",
          color: risk ? "#C2410C" : "#047857",
          fontSize: 10,
          backgroundColor: "#FFFFFF",
          padding: [2, 4],
          borderRadius: 2,
        },
      };
    });

    return { nodes, links };
  }, [apkName, libraries, selectedLibraryId]);

  useEffect(() => {
    if (!holderRef.current) return;

    const chart = echarts.init(holderRef.current);
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#FFFFFF",
        borderColor: "#C8D8F4",
        borderWidth: 1,
        extraCssText: "box-shadow:0 8px 18px rgba(49,88,153,0.12);border-radius:8px;",
        textStyle: {
          color: "#0F172A",
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (params.dataType === "node") {
            const data = params.data;
            if (data.id === "apk-center") {
              return `<div style="font-weight:700;color:#2557D6">${data.name}</div>`;
            }
            return `
              <div style="font-weight:700;color:#0F172A">${data.name}</div>
              <div style="margin-top:4px;color:#516173">漏洞数量: ${data.value}</div>
              <div style="margin-top:2px;color:#516173">状态: ${data.category === 1 ? "风险组件" : "安全组件"}</div>
            `;
          }
          return "";
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          data: graphData.nodes,
          links: graphData.links,
          categories: [
            { name: "APK" },
            { name: "Risk" },
            { name: "Safe" },
          ],
          label: {
            show: true,
            position: "right",
            color: "#334155",
            fontSize: 11,
            formatter: (params: any) => params.data.name,
          },
          lineStyle: {
            opacity: 0.75,
            curveness: 0.2,
          },
          force: {
            repulsion: 280,
            gravity: 0.05,
            edgeLength: [90, 160],
            friction: 0.8,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 3,
              opacity: 0.95,
            },
            itemStyle: {
              borderWidth: 3,
            },
          },
          animation: true,
          animationDuration: 650,
          animationEasing: "cubicOut",
        },
      ],
    });

    chart.on("click", (params) => {
      const id = params.data && typeof params.data === "object" ? String((params.data as { id?: string }).id || "") : "";
      if (id && id !== "apk-center") {
        onSelectLibrary(id);
      }
    });

    const resizeHandler = () => chart.resize();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      chart.dispose();
    };
  }, [graphData, onSelectLibrary]);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[8px] border border-[#D8E3F3] bg-[#F8FBFF]">
      <div ref={holderRef} className="absolute inset-0" />

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
        <LegendDot color="bg-[#3E6FEF]" label="APK" />
        <LegendDot color="bg-emerald-500" label="安全组件" />
        <LegendDot color="bg-amber-500" label="风险组件" />
      </div>

      <div className="absolute right-3 top-3 z-10 rounded-[6px] border border-[#D8E3F3] bg-white px-2.5 py-1.5 text-xs text-[#405064]">
        拖拽 · 缩放 · 点击
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 rounded-[6px] border border-[#D8E3F3] bg-white px-2.5 py-1.5 text-xs">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`}></div>
      <span className="text-[#405064]">{label}</span>
    </div>
  );
}
