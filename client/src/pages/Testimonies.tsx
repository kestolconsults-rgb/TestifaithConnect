import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonyWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/constants";
import { format } from "date-fns";
import { Heart, MessageCircle, Search, ArrowLeft, BookOpen, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { EmptyState } from "@/components/EmptyState";

const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

type SortOption = "recent" | "amened" | "encouraged";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Most Recent",
  amened: "Most Amened",
  encouraged: "Most Encouraged",
};

function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "?";
}

function TestimonyRow({
  testimony,
  currentUser,
}: {
  testimony: TestimonyWithUser;
  currentUser?: { id: string };
}) {
  const displayName = testimony.isAnonymous
    ? "Anonymous"
    : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous
    ? "A"
    : getInitials(testimony.user?.firstName, testimony.user?.lastName);
  const [amenAnimating, setAmenAnimating] = useState(false);
  const [localAmen, setLocalAmen] = useState(testimony.userHasAmen);
  const [localCount, setLocalCount] = useState(testimony.amenCount || 0);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const amenMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/testimonies/${testimony.id}/amen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
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
    setLocalCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
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
          <Link href={`/profile/${testimony.user?.id}`}>
            <Avatar className="w-9 h-9 cursor-pointer">
              <AvatarImage src={testimony.user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p className="text-xs font-semibold text-foreground">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(testimony.createdAt ?? Date.now()), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS] || ""}`}
        >
          {testimony.category}
        </Badge>
      </div>

      {testimony.title && (
        <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground mb-1.5">
          {testimony.title}
        </p>
      )}

      <Link href={`/testimony/${testimony.id}`}>
        <p className="text-xs leading-relaxed text-card-foreground mb-3 line-clamp-3 cursor-pointer">
          {testimony.story}
        </p>
      </Link>

      <div className="flex items-center gap-4 pt-2.5 border-t border-border">
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
        <Link href={`/testimony/${testimony.id}#comments`}>
          <button
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`button-comment-${testimony.id}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{testimony.commentCount ?? 0}</span>
          </button>
        </Link>
        <Link href={`/testimony/${testimony.id}`} className="ml-auto">
          <span className="text-xs font-medium text-primary">Read</span>
        </Link>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="rounded-2xl p-4 border bg-card">
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
  );
}

export default function Testimonies() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: allTestimonies, isLoading } = useQuery<TestimonyWithUser[]>({
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
    clearTimeout((window as any)._testTimerSearch);
    (window as any)._testTimerSearch = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const isFiltered = !!debouncedQuery || activeCategory !== "All";
  const rawList = isFiltered ? (searchResults || []) : (allTestimonies || []);
  const loading = isFiltered ? searchLoading : isLoading;

  const sorted = [...rawList].sort((a, b) => {
    if (sortBy === "amened") return (b.amenCount || 0) - (a.amenCount || 0);
    if (sortBy === "encouraged") return (b.encourageCount || 0) - (a.encourageCount || 0);
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
  });

  return (
    <div className="min-h-screen bg-background pb-36 overflow-y-auto">
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-20 px-4 pt-3 pb-3 border-b"
        style={{ background: "hsl(var(--background) / 0.94)", backdropFilter: "blur(12px)" }}
      >
        {/* Title row */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = "/home"))}
            className="w-9 h-9 rounded-full flex items-center justify-center border bg-card hover-elevate flex-shrink-0"
            data-testid="button-back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1
              className="font-['Space_Grotesk'] text-lg font-bold text-foreground leading-tight"
              data-testid="text-page-title"
            >
              Community Stones
            </h1>
            {!loading && (
              <p className="text-[11px] text-muted-foreground">
                {sorted.length} {sorted.length === 1 ? "testimony" : "testimonies"}
              </p>
            )}
          </div>
          {/* Sort button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center border bg-card hover-elevate flex-shrink-0"
              data-testid="button-sort"
              aria-label="Sort options"
            >
              <SlidersHorizontal className="w-4 h-4 text-foreground" />
            </button>
            {showSortMenu && (
              <div
                className="absolute right-0 top-11 z-30 rounded-xl border bg-card shadow-md py-1 min-w-[160px]"
                onMouseLeave={() => setShowSortMenu(false)}
              >
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover-elevate transition-colors"
                    style={{ color: sortBy === key ? "#ef4444" : "hsl(var(--foreground))" }}
                    data-testid={`sort-option-${key}`}
                  >
                    {label}
                    {sortBy === key && <span className="float-right text-primary">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card mb-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search testimonies…"
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            data-testid="input-testimonies-search"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }}
              className="text-muted-foreground text-xs hover:text-foreground transition-colors"
              data-testid="button-clear-search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
          {ALL_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all"
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
      </div>

      {/* Active sort label */}
      {sortBy !== "recent" && (
        <div className="px-5 pt-3 pb-0">
          <p className="text-[11px] text-muted-foreground">
            Sorted by <span className="font-semibold text-foreground">{SORT_LABELS[sortBy]}</span>
          </p>
        </div>
      )}

      {/* List */}
      <div className="px-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)}
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((t) => (
              <TestimonyRow key={t.id} testimony={t} currentUser={user} />
            ))}
          </div>
        ) : (
          <EmptyState
            type={debouncedQuery ? "search" : "community"}
            title={debouncedQuery ? `No results for "${debouncedQuery}"` : "Nothing here yet"}
            description={
              debouncedQuery
                ? "Try a different keyword or browse a different category"
                : "Be the first to record what God has done"
            }
            actionLabel={debouncedQuery ? undefined : "Share your testimony"}
            actionHref={debouncedQuery ? undefined : "/post"}
          />
        )}
      </div>

      {/* Footer link to Home */}
      {sorted.length > 0 && (
        <div className="flex justify-center mt-8 mb-4">
          <Link href="/home">
            <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-to-community">
              <BookOpen className="w-3.5 h-3.5" />
              Back to Home
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
