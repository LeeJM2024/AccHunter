import type { PropsWithChildren, ReactNode } from "react";

interface PanelProps extends PropsWithChildren {
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function Panel({ title, right, className = "", children }: PanelProps): JSX.Element {
  return (
    <section className={`rounded-[8px] border border-[rgba(126,146,178,0.26)] bg-white p-6 shadow-[0_8px_16px_rgba(49,88,153,0.06)] hover-lift ${className}`}>
      {(title || right) && (
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-[rgba(129,151,181,0.22)] pb-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#3B69E0]"></div>
            <div className="text-base font-semibold tracking-normal text-[#0F172A]">{title}</div>
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
