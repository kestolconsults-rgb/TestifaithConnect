import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Play, Heart, MessageCircle, Globe, RefreshCw } from "lucide-react";
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

function VideoCard({ testimony }: { testimony: TestimonyWithUser }) {
  const displayName = testimony.isAnonymous ? "Anonymous" : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous ? "A" : getInitials(testimony.user?.firstName, testimony.user?.lastName);
  const gradient = CATEGORY_GRADIENTS[testimony.category] || CATEGORY_GRADIENTS.General;

  return (
    <Link href={`/testimony/${testimony.id}`}>
      <div className="rounded-2xl overflow-hidden border bg-card hover-elevate cursor-pointer" data-testid={`video-card-${testimony.id}`}>
        <div className="relative h-44 flex items-center justify-center overflow-hidden" style={{ background: testimony.thumbnailUrl ? undefined : gradient }}>
          {testimony.thumbnailUrl ? (
            <img src={testimony.thumbnailUrl} alt={testimony.title || "Video"} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0px, rgba(255,255,255,.05) 2px, transparent 2px, transparent 12px)" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center z-10">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
          <div className="absolute bottom-3 left-3 z-10">
            <Badge className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS] || ""}`}>
              {testimony.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 z-10 text-white text-[10px] font-semibold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Video
          </div>
        </div>
        <div className="p-3">
          <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-2 line-clamp-1">{testimony.title || "Video Testimony"}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={testimony.user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-[9px] bg-muted">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{displayName}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs">{testimony.amenCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
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
    <div className="rounded-2xl p-4 border bg-card" data-testid={`testimony-row-${testimony.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9">
            <AvatarImage src={testimony.user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold text-foreground">{displayName}</p>
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
        <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-1.5">{testimony.title}</p>
      )}
      <Link href={`/testimony/${testimony.id}`}>
        <p className="text-xs leading-relaxed text-card-foreground mb-3 line-clamp-3 cursor-pointer">
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
    </div>
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

export default function Community() {
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
      if (activeCategory !== "All") params.set("category", activeCategory);
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
      className="min-h-screen bg-background pb-28 overflow-y-auto"
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

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground">Community</h1>
        </div>
        <p className="text-xs text-muted-foreground">Stories from the body of Christ</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search testimonies…"
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            data-testid="input-community-search"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }} className="text-muted-foreground text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-1 mb-5 hide-scrollbar">
        {ALL_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all"
              style={{
                background: active ? "#ef4444" : "hsl(var(--card))",
                borderColor: active ? "#ef4444" : "hsl(var(--border))",
                color: active ? "#fff" : "hsl(var(--muted-foreground))",
              }}
              data-testid={`category-chip-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Video Testimonies — only shown when there are videos */}
      {!debouncedQuery && activeCategory === "All" && (isLoading || videoTestimonies.length > 0) && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Video Testimonies</h2>
            <Link href="/testimonies">
              <button className="text-xs font-medium text-primary" data-testid="link-see-all-videos">See all</button>
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {videoTestimonies.slice(0, 2).map((t) => <VideoCard key={t.id} testimony={t} />)}
            </div>
          )}
        </section>
      )}

      {/* Text Testimonies */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">
            {debouncedQuery || activeCategory !== "All" ? "Results" : "From the Community"}
          </h2>
          {!debouncedQuery && activeCategory === "All" && (
            <Link href="/testimonies">
              <button className="text-xs font-medium text-primary" data-testid="link-see-all-text">See all</button>
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
