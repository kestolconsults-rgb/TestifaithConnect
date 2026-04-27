import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Lock, Heart, Star, Plus, Feather, LogIn, ChevronDown, ChevronUp, Flame, Clock, Users, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow, format, subDays, parseISO } from "date-fns";
import type { TestimonyWithUser, EncouragementVerse, FaithDeclaration } from "@shared/schema";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import EncouragementCard from "@/components/EncouragementCard";

function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "?";
}

function calculateStreak(testimonies: TestimonyWithUser[]): number {
  if (!testimonies.length) return 0;
  const dates = [...new Set(
    testimonies.map(t => format(new Date(t.createdAt ?? Date.now()), "yyyy-MM-dd"))
  )].sort().reverse();
  if (!dates.length) return 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  let current = dates[0];
  for (let i = 1; i < dates.length; i++) {
    const prev = format(subDays(parseISO(current), 1), "yyyy-MM-dd");
    if (dates[i] === prev) { streak++; current = dates[i]; } else break;
  }
  return streak;
}

export default function Home() {
  const { user } = useAuth();
  const [declarationExpanded, setDeclarationExpanded] = useState(false);
  const TODAY_DECLARE_KEY = `testifaith_declared_${format(new Date(), "yyyy-MM-dd")}`;
  const [declared, setDeclared] = useState(() => {
    try { return localStorage.getItem(TODAY_DECLARE_KEY) === "1"; } catch { return false; }
  });

  const handleDeclare = () => {
    setDeclared(true);
    try { localStorage.setItem(TODAY_DECLARE_KEY, "1"); } catch { /* noop */ }
  };

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
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
      const res = await fetch(`/api/faith-declaration/active?date=${today}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: myTestimonies, isLoading: myLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies/my"],
    enabled: !!user,
  });

  const { data: encouragementVerse } = useQuery<EncouragementVerse | null>({
    queryKey: ["/api/encouragement-verse"],
  });

  const privateTestimonies = myTestimonies?.filter((t) => t.privacy === "private") ?? [];
  const streak = calculateStreak(myTestimonies ?? []);

  const today = new Date();
  const onThisDayEntries = (myTestimonies ?? []).filter(t => {
    const d = new Date(t.createdAt ?? Date.now());
    return (
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate() &&
      d.getFullYear() < today.getFullYear()
    );
  });

  const displayName = featuredTestimony?.isAnonymous
    ? "Anonymous"
    : featuredTestimony?.user
    ? `${featuredTestimony.user.firstName || ""} ${featuredTestimony.user.lastName || ""}`.trim() || "Anonymous"
    : "Anonymous";

  const featuredInitials = featuredTestimony?.isAnonymous
    ? "A"
    : getInitials(featuredTestimony?.user?.firstName, featuredTestimony?.user?.lastName);

  const declarationText = faithDeclaration?.declaration ?? "";
  const declarationLong = declarationText.length > 160;
  const declarationVisible = declarationExpanded || !declarationLong
    ? declarationText
    : declarationText.slice(0, 160).trimEnd() + "…";

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* Daily Declaration */}
      <div className="px-5 pt-4 mb-5">
        {declarationLoading ? (
          <Skeleton className="h-36 rounded-2xl" />
        ) : faithDeclaration ? (
          <div
            className="rounded-2xl p-5 relative overflow-hidden border"
            style={{
              background: "color-mix(in srgb, hsl(var(--primary)) 8%, hsl(var(--background)))",
              borderColor: "color-mix(in srgb, hsl(var(--primary)) 20%, transparent)",
            }}
            data-testid="card-daily-declaration"
          >
            <div className="absolute top-0 right-0 p-5 opacity-[0.07]">
              <BookOpen size={64} className="text-primary" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">
                Declare it today
              </p>
              <p className="font-['Crimson_Pro'] italic text-primary/60 text-[12px] leading-snug mb-3">
                "The tongue has the power of life and death." — Prov. 18:21
              </p>
              <p
                className="font-['Space_Grotesk'] text-base leading-snug mb-2 font-semibold text-foreground"
                data-testid="text-faith-declaration"
              >
                "{declarationVisible}"
              </p>
              {declarationLong && (
                <button
                  onClick={() => setDeclarationExpanded(v => !v)}
                  className="flex items-center gap-1 text-xs text-primary font-medium mt-1 mb-1"
                  data-testid="button-declaration-expand"
                >
                  {declarationExpanded ? (
                    <><ChevronUp className="w-3 h-3" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Read full declaration</>
                  )}
                </button>
              )}
              <p className="text-xs font-medium text-primary" data-testid="text-faith-verse">
                {faithDeclaration.bibleReference && `— ${faithDeclaration.bibleReference}`}
              </p>
              <div className="mt-3">
                {declared ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80" data-testid="text-declared">
                    <CheckCircle2 className="w-4 h-4" />
                    Declared today
                  </div>
                ) : (
                  <button
                    onClick={handleDeclare}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all active:scale-95"
                    style={{ background: "color-mix(in srgb, hsl(var(--primary)) 18%, transparent)", color: "hsl(var(--primary))" }}
                    data-testid="button-declare-it"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Declare it!
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 border bg-card">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No declaration set for today</p>
            </div>
          </div>
        )}
      </div>

      {/* Stone of the Day */}
      <section className="px-5 mb-6">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 shrink-0" />
            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground" data-testid="section-testimony-of-day">
              Stone of the Day
            </h2>
          </div>
          <p className="font-['Crimson_Pro'] italic text-muted-foreground text-[13px] leading-snug mt-0.5 pl-6">
            "Then Samuel took a stone and set it up… and called it Ebenezer, saying, 'Thus far the <span className="uppercase tracking-wider text-[11px] not-italic">Lord</span> has helped us.'" — 1 Sam. 7:12
          </p>
        </div>
        {featuredLoading ? (
          <Skeleton className="h-52 rounded-2xl" />
        ) : featuredTestimony ? (
          <Link href={`/testimony/${featuredTestimony.id}`}>
            <div
              className="rounded-2xl p-5 border relative overflow-hidden cursor-pointer hover-elevate"
              style={{
                background: "color-mix(in srgb, hsl(var(--card)) 92%, #f59e0b 8%)",
                borderColor: "color-mix(in srgb, hsl(var(--border)) 60%, #f59e0b 40%)",
              }}
              data-testid="card-testimony-of-day"
            >
              <div
                className="absolute top-0 left-0 w-full h-0.5"
                style={{ background: "linear-gradient(90deg, transparent, #f59e0b 30%, #ef4444 70%, transparent)" }}
              />
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[featuredTestimony.category as keyof typeof CATEGORY_COLORS] || ""}`}
                  >
                    {featuredTestimony.category}
                  </Badge>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm text-black"
                    style={{ background: "#f59e0b" }}
                  >
                    Featured
                  </span>
                </div>
                <span className="text-xs text-muted-foreground" title={format(new Date(featuredTestimony.createdAt ?? Date.now()), "MMM d, yyyy")}>
                  {formatDistanceToNow(new Date(featuredTestimony.createdAt ?? Date.now()), { addSuffix: true })}
                </span>
              </div>
              {featuredTestimony.title && (
                <p className="font-['Space_Grotesk'] text-base font-bold text-foreground mb-2">{featuredTestimony.title}</p>
              )}
              <p className="text-sm leading-relaxed italic text-card-foreground mb-4 line-clamp-3 font-['Crimson_Pro']">
                "{featuredTestimony.story}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={featuredTestimony.user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">{featuredInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-card-foreground">{displayName}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
                  <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span className="text-xs font-semibold text-primary">{featuredTestimony.amenCount || 0} Amen</span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-8 text-center">
              <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No stone selected for today</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Daily Encouragement Verse */}
      {encouragementVerse && (
        <section className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Word for Today</h2>
          </div>
          <EncouragementCard verse={encouragementVerse} />
        </section>
      )}

      {/* Stone of Remembrance — Private Journal */}
      <section className="px-5 mb-6">
        {!user ? (
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Your Faith Journal</h2>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">
                Stone of Remembrance
              </h2>
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {streak}-day streak
                  </span>
                </div>
              )}
            </div>
            <Link href="/my-testimonies">
              <button className="text-xs font-medium text-blue-500 dark:text-blue-400" data-testid="link-see-all-private">
                See all
              </button>
            </Link>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-1">
          {user ? "Your private faith journal — only visible to you" : "A private place to record what God has done — only you can see it"}
        </p>
        <p className="font-['Crimson_Pro'] italic text-muted-foreground text-[13px] leading-snug mb-3">
          "Write the vision; make it plain on tablets, so he may run who reads it." — Hab. 2:2
        </p>

        {!user ? (
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "color-mix(in srgb, hsl(var(--primary)) 5%, hsl(var(--background)))",
              borderColor: "color-mix(in srgb, hsl(var(--primary)) 18%, transparent)",
            }}
            data-testid="guest-signin-cta"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, hsl(var(--primary)) 12%, transparent)" }}
              >
                <Feather className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-1">
                  Keep a private faith journal
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Write down what God has done — healings, answered prayers, breakthroughs — a record only you can see.
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <Link href="/signin">
                    <button
                      className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-full"
                      style={{ background: "#ef4444" }}
                      data-testid="button-signin-cta-home"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </button>
                  </Link>
                  <Link href="/create-account">
                    <button
                      className="text-xs font-semibold px-4 py-2 rounded-full border"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                      data-testid="button-create-account-cta-home"
                    >
                      Create account
                    </button>
                  </Link>
                </div>
                <Link href="/community">
                  <button
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="link-browse-community-home"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Browse community stones first
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : myLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : privateTestimonies.length > 0 ? (
          <div className="space-y-3">
            {privateTestimonies.slice(0, 3).map((t) => (
              <Link key={t.id} href={`/testimony/${t.id}`}>
                <div
                  className="rounded-2xl p-4 border cursor-pointer hover-elevate"
                  style={{
                    background: "color-mix(in srgb, #3b82f6 5%, hsl(var(--background)))",
                    borderColor: "color-mix(in srgb, #3b82f6 20%, transparent)",
                  }}
                  data-testid={`private-entry-${t.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                    >
                      {t.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(t.createdAt ?? Date.now()), "MMM d, yyyy")}
                    </span>
                  </div>
                  {t.title && (
                    <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-1">{t.title}</p>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{t.story}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 border text-center"
            style={{
              background: "color-mix(in srgb, #3b82f6 4%, hsl(var(--background)))",
              borderColor: "color-mix(in srgb, #3b82f6 15%, transparent)",
            }}
            data-testid="empty-private-journal"
          >
            <Lock className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-foreground mb-1">Your faith journal is empty</p>
            <p className="text-xs text-muted-foreground mb-4">
              Tap the + button below and choose "Journal Your Faith" to start recording God's faithfulness privately.
            </p>
            <Link href="/post">
              <button
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-full"
                data-testid="button-start-journal"
              >
                <Plus className="w-3.5 h-3.5" />
                Start journaling
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* On This Day */}
      {user && onThisDayEntries.length > 0 && (
        <section className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-violet-500" />
            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">
              On This Day
            </h2>
            <span className="text-xs text-muted-foreground">
              — {format(today, "MMMM d")} in a previous year
            </span>
          </div>
          <div className="space-y-3">
            {onThisDayEntries.map(t => (
              <Link key={t.id} href={`/testimony/${t.id}`}>
                <div
                  className="rounded-2xl p-4 border cursor-pointer hover-elevate"
                  style={{
                    background: "color-mix(in srgb, #8b5cf6 5%, hsl(var(--background)))",
                    borderColor: "color-mix(in srgb, #8b5cf6 18%, transparent)",
                  }}
                  data-testid={`on-this-day-${t.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30"
                    >
                      {t.category}
                    </Badge>
                    <span className="text-[10px] font-semibold text-violet-500 dark:text-violet-400">
                      {format(new Date(t.createdAt ?? Date.now()), "yyyy")}
                    </span>
                  </div>
                  {t.title && (
                    <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-1">{t.title}</p>
                  )}
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{t.story}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
