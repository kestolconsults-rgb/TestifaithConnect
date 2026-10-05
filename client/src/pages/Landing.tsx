import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Feather, Heart, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { CATEGORIES } from "@/lib/constants";
import CategoryPill from "@/components/CategoryPill";
import VideoHero from "@/components/VideoHero";
import TestimonyCard from "@/components/TestimonyCard";
import { useQuery } from "@tanstack/react-query";
import type { TestimonyWithUser, FaithDeclaration } from "@shared/schema";

const JOURNEY_STEPS = [
  {
    icon: Feather,
    title: "Keep the moments",
    description: "Write down the prayers, quiet breakthroughs, and everyday mercies you don’t want to forget.",
  },
  {
    icon: ShieldCheck,
    title: "Make it your own",
    description: "Your journal is a personal place to remember. Keep an entry private or choose to share it.",
  },
  {
    icon: Heart,
    title: "Pass on the hope",
    description: "When you’re ready, your testimony can help someone else keep going through their own waiting.",
  },
];

export default function Landing() {
  const { data: featuredTestimony, isLoading: featuredLoading } = useQuery<TestimonyWithUser>({
    queryKey: ["/api/testimonies/featured"],
    queryFn: async () => {
      const today = new Date().toLocaleDateString("en-CA");
      const res = await fetch(`/api/testimonies/featured?date=${today}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: faithDeclaration, isLoading: declarationLoading } = useQuery<FaithDeclaration | null>({
    queryKey: ["/api/faith-declaration/active"],
    queryFn: async () => {
      const today = new Date().toLocaleDateString("en-CA");
      const res = await fetch(`/api/faith-declaration/active?date=${today}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <VideoHero />

      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">A simple rhythm of remembrance</p>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Hold on to what God has done.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Some moments are easy to forget when life gets hard. Give them a place to live—and let your story become encouragement for someone else.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {JOURNEY_STEPS.map(({ icon: Icon, title, description }, index) => (
              <Card key={title} className="relative overflow-hidden rounded-2xl border-border/80 bg-card/80">
                <CardContent className="p-6 sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-serif text-4xl text-muted-foreground/20">0{index + 1}</span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {!featuredLoading && featuredTestimony && (
        <section className="bg-muted/30 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">A story from the community</p>
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                You never know who needs to hear it.
              </h2>
              <p className="mt-3 text-muted-foreground">Read a reminder of hope from someone who has been there.</p>
            </div>
            <TestimonyCard testimony={featuredTestimony} featured />
          </div>
        </section>
      )}

      {featuredLoading && (
        <section className="px-4 py-12" aria-label="Loading featured testimony">
          <div className="mx-auto max-w-4xl"><Skeleton className="h-64 w-full rounded-2xl" /></div>
        </section>
      )}

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">A word to carry with you</p>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Let hope meet you here.</h2>
          </div>
          {declarationLoading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : faithDeclaration ? (
            <Card className="rounded-2xl border border-primary/15 bg-card">
              <CardContent className="space-y-5 p-6 text-center sm:p-10">
                <blockquote className="whitespace-pre-line font-['Space_Grotesk'] text-lg leading-relaxed text-foreground sm:text-xl" data-testid="text-faith-declaration">
                  {faithDeclaration.declaration}
                </blockquote>
                <div className="border-t border-border pt-4">
                  <p className="font-serif text-lg italic text-muted-foreground" data-testid="text-faith-verse">{faithDeclaration.bibleVerse}</p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">— {faithDeclaration.bibleReference}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-sm text-muted-foreground">A daily declaration will appear here soon.</p>
          )}
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-9 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Stories across every season</p>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What are you walking through?</h2>
            <p className="mt-3 text-muted-foreground">Find testimonies of faith, healing, provision, and new beginnings.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((category) => <CategoryPill key={category} category={category} />)}
          </div>
          <div className="mt-8 text-center">
            <Link href="/testimonies" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Explore all testimonies <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-rose-500/[0.04] to-transparent" />
        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Someone out there needs your reminder.
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            Start by keeping your own record of God’s faithfulness. Share a story when the time feels right.
          </p>
          <Link
            href="/create-account"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            data-testid="button-cta-share"
          >
            Start my faith journal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
