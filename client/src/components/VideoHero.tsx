import { ArrowRight, BookOpen, Heart, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface VideoHeroProps {
  headline?: string;
  subheadline?: string;
  height?: string;
}

function FaithJournalIllustration() {
  return (
    <div className="faith-hero-art relative mx-auto flex w-full max-w-[34rem] items-center justify-center" aria-hidden="true">
      <div className="faith-hero-halo absolute inset-[9%] rounded-full" />
      <div className="faith-hero-orbit absolute inset-[4%] rounded-full border border-primary/10" />
      <div className="faith-hero-orbit faith-hero-orbit-slow absolute inset-[-1%] rounded-full border border-dashed border-amber-500/20" />

      <div className="faith-note faith-note-top absolute right-0 top-[9%] z-20 rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-xl shadow-amber-950/10 dark:border-amber-100/10 dark:bg-zinc-900/95">
        <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-400/10">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]">A moment to remember</span>
        </div>
        <p className="max-w-[12rem] font-serif text-lg leading-tight text-zinc-800 dark:text-zinc-100">“I wasn’t alone in the waiting.”</p>
      </div>

      <div className="faith-journal-card relative z-10 w-[82%] max-w-[25rem] rounded-[1.75rem] border border-white/70 bg-[#fffdf8] p-5 shadow-2xl shadow-rose-950/15 dark:border-white/10 dark:bg-zinc-900 sm:p-7">
        <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-primary dark:bg-primary/15">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">My Faith Journal</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">A record of His faithfulness</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold tracking-wider text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">PRIVATE</span>
        </div>

        <div className="relative space-y-5 pl-5">
          <span className="absolute bottom-1 left-[3px] top-1 w-px bg-gradient-to-b from-primary/60 via-amber-400/60 to-transparent" />
          <div className="relative">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-rose-100 dark:ring-rose-400/10" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">The prayer</p>
            <p className="mt-1 font-serif text-lg leading-snug text-zinc-800 dark:text-zinc-100">I kept asking for strength to keep going.</p>
          </div>
          <div className="relative">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-400/10" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">The reminder</p>
            <p className="mt-1 font-serif text-lg leading-snug text-zinc-800 dark:text-zinc-100">God was with me, even here.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-rose-50/80 px-4 py-3 dark:bg-primary/10">
          <p className="font-serif text-sm italic leading-relaxed text-zinc-700 dark:text-zinc-200">“I will remember the deeds of the Lord.”</p>
          <p className="mt-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Psalm 77:11</p>
        </div>
      </div>

      <div className="faith-note faith-note-bottom absolute bottom-[8%] left-0 z-20 max-w-[14rem] rounded-2xl border border-rose-100 bg-white/95 p-4 shadow-xl shadow-rose-950/10 dark:border-white/10 dark:bg-zinc-900/95">
        <div className="flex items-start gap-3">
          <span className="faith-heart flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-primary dark:bg-primary/15">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Hope passed on</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">Your story can remind someone they are not alone.</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[18%] right-[3%] z-0 flex h-12 w-12 items-center justify-center rounded-full bg-amber-300/80 text-amber-950 shadow-lg shadow-amber-900/10 dark:bg-amber-300">
        <LockKeyhole className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function VideoHero({
  headline = "Your story can be the hope someone needs.",
  subheadline = "Remember what God has done. Keep it close in your journal. Share it when you’re ready.",
}: VideoHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-rose-100/80 bg-gradient-to-br from-rose-50 via-background to-amber-50/80 dark:border-white/10 dark:from-zinc-950 dark:via-background dark:to-rose-950/20">
      <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-rose-300/20 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative mx-auto grid min-h-[42rem] max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:py-16 lg:min-h-[40rem] lg:grid-cols-[1fr_1.05fr] lg:gap-2 lg:px-12 xl:px-16">
        <div className="relative z-10 max-w-2xl text-center lg:py-10 lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm dark:bg-white/5">
            <Sparkles className="h-3.5 w-3.5" />
            Keep the reminder. Pass on the hope.
          </div>
          <h1
            className="font-['Space_Grotesk'] text-4xl font-bold leading-[1.08] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[3.65rem] xl:text-6xl"
            data-testid="hero-headline"
          >
            {headline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg lg:mx-0" data-testid="hero-subheadline">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/create-account"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              data-testid="button-start-faith-journal"
            >
              Start my faith journal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/testimonies"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300 bg-white/70 px-6 text-sm font-semibold text-zinc-800 transition-colors hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Read real stories
            </Link>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 lg:justify-start">
            <LockKeyhole className="h-3.5 w-3.5" />
            Your journal is private. Sharing is always your choice.
          </p>
        </div>

        <FaithJournalIllustration />
      </div>
    </section>
  );
}
