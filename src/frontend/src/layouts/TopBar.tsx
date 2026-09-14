export default function TopBar() {
  return (
    <header className="fixed top-0 left-[230px] right-0 h-14 bg-bg-app border-b border-border-subtle z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          alt="SupplyShield AI Logo"
          className="h-8 w-auto object-contain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvEGrDxLyZoNTS3I0NP9GfmGWdnTT9-HFwaJj1Yt9ViiQzf988VfL2sa4aqjhnxhdipltHpHbs38XhipMwS9B_p4Tw39oSFP2JQPzxGc1UYYBVtlh5Q2kH7Mk_jx4o3QAMbCWe_E37kGKSLnla9-NRawEZHA-wuyyEQmP-nSc9W3uWJB8dRIqI6qvtPPWjt8Ry2luS-qa6LOgdMTAFCkIA4X7jeVXQG1A6Jaj4SiJ2WqIksL_GYMeyIA"
        />
        <div className="flex flex-col">
          <span className="font-card-title text-card-title text-text-primary leading-tight font-semibold">
            SupplyShield AI
          </span>
          <span className="font-caption text-caption text-text-muted leading-tight">
            Global Operations Intelligence Engine
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-risk-low/10 border border-risk-low/30 font-badge-label text-badge-label text-risk-low">
          <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span>
          <span>Live</span>
        </div>
        <button
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-surface-container-lowest border border-border-subtle hover:border-border-strong hover:bg-bg-surface text-text-muted hover:text-text-primary transition-colors text-xs"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span>Quick search</span>
          <kbd className="font-caption text-caption text-text-disabled border border-border-subtle px-1 py-0.5 rounded bg-bg-surface">
            ⌘K
          </kbd>
        </button>
        <button
          aria-label="Notifications"
          className="relative p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-risk-high"></span>
        </button>
        <button
          aria-label="Settings"
          className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <div className="pl-2 border-l border-border-subtle">
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLPOMCOxF6SyH-u8HYYxWSeFF2z1RVaK_dJAC4httBxASNGbFlQeRGjUuzEc8ohUNHXWqRvSo7cLeoZa_G4Lo-NJiddvX2oFJZuJLm6yt7jCBy7JaZPz0JEeFSpJpZZk0am0cApuer18G7iI9Xbnq4O8iLenbLb5asC9C7pM1qmNxRx805kGBdLbSM051NSgTbspXCWKcQh4odniSh20FOtIEmEP7VD5lWqNTdUBsQ_BRcv-PcM53JJw"
          />
        </div>
      </div>
    </header>
  );
}
