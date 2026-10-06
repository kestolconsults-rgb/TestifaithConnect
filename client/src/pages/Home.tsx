import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Play, Heart, MessageCircle, RefreshCw, Flame, Sparkles, BookOpen, ArrowRight, Feather, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/constants";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";

const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "?";
}

// Category gradient map for video thumbnails
const CATEGORY_GRADIENTS: Record<string, string> = {
  Healing:       "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  Marriage:      "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  Fruitfulness:  "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
  Finance:       "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
  Breakthrough:  "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  Deliverance:   "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  General:       "linear-gradient(135deg, #6b7280 0%, #374151 100%)",
};

function formatVideoDuration(duration?: number | null) {
  if (!duration || !Number.isFinite(duration)) return null;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.round(duration % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function VideoCard({ testimony, featured = false }: { testimony: TestimonyWithUser; featured?: boolean }) {
  const displayName = testimony.isAnonymous ? "Anonymous" : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous ? "A" : getInitials(testimony.user?.firstName, testimony.user?.lastName);
  const gradient = CATEGORY_GRADIENTS[testimony.category] || CATEGORY_GRADIENTS.General;
  const duration = formatVideoDuration(testimony.videoDuration);
  const title = testimony.title || "A story of God’s faithfulness";

  return (
    <Link href={`/testimony/${testimony.id}`} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      <article className="h-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-focus-visible:shadow-xl" data-testid={`video-card-${testimony.id}`}>
        <div className="relative aspect-video overflow-hidden" style={{ background: testimony.thumbnailUrl ? undefined : gradient }}>
          {testimony.thumbnailUrl ? (
            <img
              src={testimony.thumbnailUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/20" />
              <div className="absolute -right-1 top-0 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-12 -left-5 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
              <div className="absolute inset-0 opacity-20" style={{ background: "repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0px, rgba(255,255,255,.12) 1px, transparent 1px, transparent 14px)" }} />
              <span className="absolute bottom-[-3.5rem] right-3 font-serif text-[13rem] font-bold leading-none text-white/15">{testimony.category.slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

          <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
            <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {testimony.category}
            </span>
            {duration && (
              <span className="rounded-md bg-black/55 px-2 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-md">
                {duration}
              </span>
            )}
          </div>

          <span className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/25 text-white shadow-lg backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-primary group-focus-visible:bg-white group-focus-visible:text-primary sm:h-16 sm:w-16">
            <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" aria-hidden="true" />
            <span className="sr-only">Play video testimony</span>
          </span>

          <div className="absolute inset-x-4 bottom-4 z-10 text-white sm:inset-x-5 sm:bottom-5">
            {featured && <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Featured story</p>}
            <h3 className={`font-['Space_Grotesk'] font-bold leading-tight ${featured ? "text-xl sm:text-2xl" : "text-lg"} line-clamp-2`}>{title}</h3>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
              <AvatarImage src={testimony.user?.profileImageUrl || undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">Shared a story of faith</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            Watch <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function TestimonyRow({ testimony, currentUser }: { testimony: TestimonyWithUser; currentUser?: { id: string } }) {
  const displayName = testimony.isAnonymous ? "Anonymous" : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous ? "A" : getInitials(testimony.user?.firstName, testimony.user?.lastName);
  const [amenAnimating, setAmenAnimating] = useState(false);
  const [localAmen, setLocalAmen] = useState(testimony.userHasAmen);
  const [localCount, setLocalCount] = useState(testimony.amenCount || 0);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const amenMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/testimonies/${testimony.id}/amen`),
    onSuccess: (_, __, ___) => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/recent"] });
    },
  });

  const handleAmen = () => {
    if (!currentUser) {
      toast({
        title: "Sign in to say Amen",
        description: "Join the community to encourage your brothers and sisters in faith.",
        action: (
          <ToastAction altText="Sign in" onClick={() => navigate("/signin")}>
            Sign in
          </ToastAction>
        ),
      });
      return;
    }
    const next = !localAmen;
    setLocalAmen(next);
    setLocalCount((c) => next ? c + 1 : Math.max(0, c - 1));
    if (next) {
      setAmenAnimating(false);
      requestAnimationFrame(() => setAmenAnimating(true));
      setTimeout(() => setAmenAnimating(false), 500);
    }
    amenMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="community-card-enter rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
      data-testid={`testimony-row-${testimony.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-10 h-10">
            <AvatarImage src={testimony.user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(testimony.createdAt ?? Date.now()), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS] || ""}`}>
          {testimony.category}
        </Badge>
      </div>
      {testimony.title && (
        <p className="font-['Space_Grotesk'] text-base font-bold text-foreground mb-2">{testimony.title}</p>
      )}
      <Link href={`/testimony/${testimony.id}`}>
        <p className="text-sm leading-relaxed text-card-foreground mb-4 line-clamp-4 cursor-pointer">
          {testimony.story}
        </p>
      </Link>
      <div className="flex gap-4 pt-2.5 border-t border-border">
        <button
          onClick={handleAmen}
          className="relative flex items-center gap-1.5 transition-colors"
          style={{ color: localAmen ? "#ef4444" : undefined }}
          data-testid={`button-amen-${testimony.id}`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${amenAnimating ? "amen-burst" : ""}`}
            fill={localAmen ? "#ef4444" : "none"}
            color={localAmen ? "#ef4444" : "currentColor"}
          />
          <span className="text-xs text-muted-foreground">{localCount}</span>
        </button>
        <Link href={`/testimony/${testimony.id}`}>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-comment-${testimony.id}`}>
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Read</span>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

function CommunitySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-4 border bg-card">
          <div className="flex items-center gap-2.5 mb-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-5/6 mb-1" />
          <Skeleton className="h-3 w-4/5 mb-4" />
          <div className="flex gap-4 pt-2.5 border-t border-border">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { user } = useAuth();

  const { data: allTestimonies, isLoading, refetch } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies"],
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies/search", debouncedQuery, activeCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (activeCategory !== "All") params.set("categories", activeCategory);
      const res = await fetch(`/api/testimonies/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!debouncedQuery || activeCategory !== "All",
  });

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
  }, [refetch]);

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const testimonies = (debouncedQuery || activeCategory !== "All") ? (searchResults || []) : (allTestimonies || []);
  const loading = (debouncedQuery || activeCategory !== "All") ? searchLoading : isLoading;

  const videoTestimonies = testimonies.filter((t) => t.videoUrl && t.moderationStatus === "approved");
  const textTestimonies = testimonies.filter((t) => !t.videoUrl);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-5xl min-h-screen bg-background pb-28 overflow-y-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: isRefreshing ? 48 : pullDistance > 0 ? Math.min(pullDistance, 48) : 0, opacity: isRefreshing || pullDistance > 20 ? 1 : 0 }}
      >
        <RefreshCw
          className={`w-5 h-5 text-primary ${isRefreshing ? "ptr-spinner" : ""}`}
          style={{ transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)` }}
        />
      </div>

      {/* A personal welcome that connects the community feed to the user's own faith story. */}
      <section className="px-4 pt-4 pb-5 sm:px-6 sm:pt-6">
        <div className="community-welcome relative isolate overflow-hidden rounded-[1.75rem] border border-rose-200/60 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-sm dark:border-white/10 dark:from-zinc-900 dark:via-zinc-900 dark:to-rose-950/50 sm:p-7 lg:p-8">
          <div className="community-welcome-glow pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-rose-300/30 blur-3xl dark:bg-primary/15" />
          <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-2">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Your faith community</p>
              <h1 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                Keep a record of what God has done in your life—and find encouragement in the stories others have lived.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/post"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  data-testid="button-home-write-journal"
                >
                  <Feather className="h-4 w-4" /> Write in my journal
                </Link>
                <Link
                  href="/my-faith"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/70 px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  My faith journal <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <LockKeyhole className="h-3.5 w-3.5" /> Your entries can stay private or be shared when you choose.
              </p>
            </div>
            <div className="community-journal-float relative mx-auto hidden h-36 w-36 items-center justify-center sm:flex lg:mr-4 lg:h-44 lg:w-44" aria-hidden="true">
              <div className="absolute inset-0 rounded-full border border-primary/15" />
              <div className="absolute inset-3 rounded-full border border-dashed border-amber-500/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] border border-white bg-white/90 text-primary shadow-xl shadow-rose-950/10 dark:border-white/10 dark:bg-zinc-800 lg:h-28 lg:w-28">
                <BookOpen className="h-11 w-11 lg:h-12 lg:w-12" strokeWidth={1.4} />
                <span className="absolute -bottom-2 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-md">
                  <Heart className="h-4 w-4 fill-current" />
                </span>
              </div>
              <span className="absolute -left-2 top-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-primary shadow-sm dark:bg-zinc-800">Remember</span>
              <span className="absolute -bottom-1 right-0 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-amber-700 shadow-sm dark:bg-zinc-800 dark:text-amber-300">Encourage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary/40">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            aria-label="Search community testimonies"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search testimonies…"
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            data-testid="input-community-search"
          />
          {searchQuery && (
            <button type="button" aria-label="Clear community search" onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }} className="text-muted-foreground text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-1 mb-5 hide-scrollbar" role="group" aria-label="Filter community testimonies">
        {ALL_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
              aria-pressed={active}
              data-testid={`category-chip-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Most Encouraged */}
      {!debouncedQuery && activeCategory === "All" && !isLoading && allTestimonies && allTestimonies.length > 0 && (() => {
        const trending = [...allTestimonies]
          .filter(t => !t.videoUrl)
          .sort((a, b) => (b.encourageCount || 0) - (a.encourageCount || 0))
          .slice(0, 5);
        if (!trending.length || trending[0].encourageCount === 0) return null;
        return (
          <section className="mb-5">
            <div className="flex items-center gap-2 px-5 mb-3">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Most Encouraged</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-1 hide-scrollbar">
              {trending.map((t) => {
                const name = t.isAnonymous ? "Anonymous" : `${t.user?.firstName || ""} ${t.user?.lastName || ""}`.trim() || "Anonymous";
                return (
                  <Link key={t.id} href={`/testimony/${t.id}`}>
                    <div className="flex-shrink-0 w-56 rounded-2xl border bg-card p-4 hover-elevate cursor-pointer" data-testid={`trending-card-${t.id}`}>
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase mb-2 ${CATEGORY_COLORS[t.category as keyof typeof CATEGORY_COLORS] || ""}`}>
                        {t.category}
                      </Badge>
                      <p className="font-['Space_Grotesk'] text-xs font-bold text-foreground mb-1.5 line-clamp-2">
                        {t.title || "Untitled"}
                      </p>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-chart-3" />
                          <span className="text-[10px]">{t.amenCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-chart-4" />
                          <span className="text-[10px]">{t.encourageCount || 0}</span>
                        </div>
                        <span className="text-[10px] ml-auto truncate">{name}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Video Testimonies — only shown when there are videos */}
      {!debouncedQuery && activeCategory === "All" && (isLoading || videoTestimonies.length > 0) && (
        <section className="mb-8 px-5" aria-labelledby="video-testimonies-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Real voices. Real hope.</p>
              <h2 id="video-testimonies-heading" className="font-['Space_Grotesk'] text-2xl md:text-3xl font-semibold text-foreground">Video testimonies</h2>
              <p className="mt-1 max-w-xl text-base leading-relaxed text-muted-foreground">Hear how God has met people in the middle of their story.</p>
            </div>
            <Link href="/testimonies?type=video" className="mb-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80" data-testid="link-see-all-videos">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-[1.2fr_1fr]">
              {videoTestimonies.slice(0, 2).map((t, index) => (
                <div className="w-[86%] shrink-0 snap-start md:w-auto" key={t.id}>
                  <VideoCard testimony={t} featured={index === 0} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Text Testimonies */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-semibold text-foreground">
            {debouncedQuery || activeCategory !== "All" ? "Results" : "From the Community"}
          </h2>
          {!debouncedQuery && activeCategory === "All" && (
            <Link href="/testimonies">
              <Link href="/testimonies" className="text-xs font-medium text-primary hover:text-primary/80" data-testid="link-see-all-text">See all</Link>
            </Link>
          )}
        </div>

        {loading ? (
          <CommunitySkeleton />
        ) : textTestimonies.length > 0 ? (
          <div className="space-y-3">
            {textTestimonies.slice(0, 10).map((t) => <TestimonyRow key={t.id} testimony={t} currentUser={user} />)}
          </div>
        ) : (
          <EmptyState
            type={debouncedQuery ? "search" : "community"}
            title={debouncedQuery ? `No results for "${debouncedQuery}"` : "No testimonies yet"}
            description={
              debouncedQuery
                ? "Try a different keyword or browse all testimonies"
                : "Be the first to record what God has done in this community"
            }
            actionLabel={debouncedQuery ? undefined : "Write a new entry"}
            actionHref={debouncedQuery ? undefined : "/post"}
          />
        )}
      </section>
    </div>
  );
}
