import androidAuditHeroBackground from "../../assets/android-audit-hero-background.svg";

export function AndroidAuditIllustration({ compact = false, framed = true }: { compact?: boolean; framed?: boolean }): JSX.Element {
  const image = (
    <img
      src={androidAuditHeroBackground}
      alt="Android vulnerability validation workflow illustration"
      className={`w-full object-contain ${compact ? "max-h-[390px] sm:max-h-[440px] xl:max-h-[480px] xl:min-w-[700px] xl:max-w-none" : "max-h-[540px]"}`}
    />
  );

  if (!framed) {
    return <div className="flex min-h-[440px] w-full items-center justify-center overflow-visible">{image}</div>;
  }

  return (
    <div className="overflow-hidden rounded-[10px] app-panel bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#8493A8]">Theme Illustration</div>
          <div className="text-sm font-semibold text-[#0F172A]">Android Vulnerability Validation</div>
        </div>
        <div className="rounded-[6px] border border-[#3E6FEF]/25 bg-[#EAF2FF] px-2 py-1 text-[10px] text-[#2557D6]">APK / Scan / Report</div>
      </div>
      {image}
    </div>
  );
}
