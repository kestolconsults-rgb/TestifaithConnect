import { Link } from "wouter";

function DoveSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="40" cy="40" r="36" fill="currentColor" fillOpacity="0.06" />
      <path
        d="M52 28c-4-2-10-1-14 3l-8 8c-2 2-2 5 0 7l2 2c2 2 5 2 7 0l2-2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"
      />
      <path
        d="M26 42l-4 4c-1 1-1 3 0 4l2 2c1 1 3 1 4 0l14-14c4-4 10-5 14-3"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"
      />
      <circle cx="44" cy="30" r="2" fill="currentColor" opacity="0.5" />
      <path d="M50 24l4-4M54 28l5-1M52 32l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function JournalSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="40" cy="40" r="36" fill="currentColor" fillOpacity="0.06" />
      <rect x="24" y="22" width="32" height="38" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <rect x="20" y="24" width="6" height="34" rx="3" fill="currentColor" opacity="0.25" />
      <line x1="32" y1="34" x2="48" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="32" y1="40" x2="48" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="32" y1="46" x2="42" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M44 50l3-3 5 5-3 3-5-5z" fill="currentColor" opacity="0.4" />
      <path d="M52 44l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function SearchSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="40" cy="40" r="36" fill="currentColor" fillOpacity="0.06" />
      <circle cx="36" cy="35" r="12" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="44" y1="44" x2="56" y2="56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M32 33a4 4 0 014-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function VideoSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="40" cy="40" r="36" fill="currentColor" fillOpacity="0.06" />
      <rect x="16" y="28" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path d="M52 35l12-8v26l-12-8V35z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.4" />
      <path d="M28 38l10 3-10 3V38z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

interface EmptyStateProps {
  type: "community" | "journal" | "search" | "video";
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ type, title, description, actionLabel, actionHref }: EmptyStateProps) {
  const Icon = {
    community: DoveSVG,
    journal: JournalSVG,
    search: SearchSVG,
    video: VideoSVG,
  }[type];

  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <Icon className="w-20 h-20 text-muted-foreground mb-4" />
      <p className="font-['League_Spartan'] text-sm font-semibold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <button className="mt-4 text-xs font-semibold text-primary border border-primary/30 px-5 py-2 rounded-full">
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
