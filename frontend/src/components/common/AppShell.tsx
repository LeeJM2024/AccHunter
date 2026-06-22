import { Activity, Cpu, FileBadge2, LayoutDashboard, UploadCloud } from "lucide-react";
import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import pierHunterWordmark from "../../assets/pierhunter-wordmark.svg";
import { useTaskStore } from "../../store/taskStore";

function NavItem({ to, label, icon }: { to: string; label: string; icon: JSX.Element }): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-[6px] border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "border-[#3B69E0]/48 bg-[#EDF4FF] text-[#2454C7]"
            : "border-transparent text-[#405064] hover:border-[rgba(62,111,239,0.24)] hover:bg-[#F3F7FE] hover:text-[#0F172A]"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const currentTaskId = useTaskStore((state) => state.currentTaskId);

  return (
    <div className="relative min-h-screen text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-[rgba(129,151,181,0.24)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-8 py-4">
          <PierHunterBrand />

          <nav className="flex flex-wrap items-center gap-2">
            <NavItem to="/" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
            <NavItem to="/task/new" label="新建任务" icon={<UploadCloud className="h-4 w-4" />} />
            {currentTaskId && (
              <>
                <NavItem to={`/task/${currentTaskId}/execution`} label="执行监控" icon={<Activity className="h-4 w-4" />} />
                <NavItem to={`/report/${currentTaskId}`} label="报告" icon={<FileBadge2 className="h-4 w-4" />} />
              </>
            )}
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(129,151,181,0.28)] bg-[#F8FBFF] px-3 py-1.5 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              <Cpu className="h-3 w-3 text-[#3B69E0]" />
              <span className="font-mono text-[#405064]">SYSTEM ACTIVE</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-8 py-10">{children}</main>
    </div>
  );
}

function PierHunterBrand(): JSX.Element {
  return (
    <div className="flex items-center">
      <img src={pierHunterWordmark} alt="PierHunter" className="h-[58px] w-[286px] shrink-0" />
    </div>
  );
}
