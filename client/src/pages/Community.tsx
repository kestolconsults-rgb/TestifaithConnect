import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Play, Heart, MessageCircle, Globe } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

function getInitials(firstName?: string | null, lastName?: string | null) {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "?";
}

function VideoCard({ testimony }: { testimony: TestimonyWithUser }) {
  const displayName = testimony.isAnonymous ? "Anonymous" : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous ? "A" : getInitials(testimony.user?.firstName, testimony.user?.lastName);

  return (
    <Link href={`/testimony/${testimony.id}`}>
      <div className="rounded-2xl overflow-hidden border bg-card hover-elevate cursor-pointer" data-testid={`video-card-${testimony.id}`}>
        <div className="relative h-44 bg-muted flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center z-10">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
          <div className="absolute bottom-3 left-3 z-10">
            <Badge className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS] || ""}`}>
              {testimony.category}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3 z-10 text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded">
            Video
          </div>
        </div>
        <div className="p-3">
          <p className="font-['League_Spartan'] text-sm font-bold text-foreground mb-2 line-clamp-1">{testimony.title || "Video Testimony"}</p>
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

function TestimonyRow({ testimony }: { testimony: TestimonyWithUser }) {
  const displayName = testimony.isAnonymous ? "Anonymous" : `${testimony.user?.firstName || ""} ${testimony.user?.lastName || ""}`.trim() || "Anonymous";
  const initials = testimony.isAnonymous ? "A" : getInitials(testimony.user?.firstName, testimony.user?.lastName);
  const { user } = useAuth();

  const amenMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/testimonies/${testimony.id}/amen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/recent"] });
    },
  });

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
              {formatDistanceToNow(new Date(testimony.createdAt ?? Date.now()), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS] || ""}`}>
          {testimony.category}
        </Badge>
      </div>
      {testimony.title && (
        <p className="font-['League_Spartan'] text-sm font-bold text-foreground mb-1.5">{testimony.title}</p>
      )}
      <Link href={`/testimony/${testimony.id}`}>
        <p className="text-xs leading-relaxed text-card-foreground mb-3 line-clamp-3 cursor-pointer">
          {testimony.story}
        </p>
      </Link>
      <div className="flex gap-4 pt-2.5 border-t border-border">
        <button
          onClick={() => user && amenMutation.mutate()}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          data-testid={`button-amen-${testimony.id}`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-xs">{testimony.amenCount || 0}</span>
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

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const testimonies = (debouncedQuery || activeCategory !== "All") ? (searchResults || []) : (allTestimonies || []);
  const loading = (debouncedQuery || activeCategory !== "All") ? searchLoading : isLoading;

  const videoTestimonies = testimonies.filter((t) => t.videoUrl && t.moderationStatus === "approved");
  const textTestimonies = testimonies.filter((t) => !t.videoUrl);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="font-['League_Spartan'] text-2xl font-bold text-foreground">Community</h1>
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
            <button onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }} className="text-muted-foreground">
              <Filter className="w-4 h-4" />
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

      {/* Video Testimonies */}
      {!debouncedQuery && activeCategory === "All" && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-['League_Spartan'] text-base font-semibold text-foreground">Video Testimonies</h2>
            <Link href="/testimonies">
              <button className="text-xs font-medium text-primary" data-testid="link-see-all-videos">See all</button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3">
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : videoTestimonies.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {videoTestimonies.slice(0, 2).map((t) => <VideoCard key={t.id} testimony={t} />)}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <Play className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No video testimonies yet</p>
            </div>
          )}
        </section>
      )}

      {/* Text Testimonies */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['League_Spartan'] text-base font-semibold text-foreground">
            {debouncedQuery || activeCategory !== "All" ? "Results" : "Read Testimonies"}
          </h2>
          {!debouncedQuery && activeCategory === "All" && (
            <Link href="/testimonies">
              <button className="text-xs font-medium text-primary" data-testid="link-see-all-text">See all</button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : textTestimonies.length > 0 ? (
          <div className="space-y-3">
            {textTestimonies.slice(0, 10).map((t) => <TestimonyRow key={t.id} testimony={t} />)}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {debouncedQuery ? `No testimonies found for "${debouncedQuery}"` : "No testimonies yet"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
