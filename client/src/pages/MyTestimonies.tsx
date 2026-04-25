import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TestimonyCard from "@/components/TestimonyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { TestimonyWithUser } from "@shared/schema";
import { PlusCircle, Search, X } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

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
    if (dates[i] === prev) {
      streak++;
      current = dates[i];
    } else break;
  }
  return streak;
}

export default function MyTestimonies() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/signin";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: testimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies/my"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (testimonyId: string) => {
      return await apiRequest("DELETE", `/api/testimonies/${testimonyId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      toast({
        title: "Deleted",
        description: "Entry removed from your journal.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/signin";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const streak = calculateStreak(testimonies ?? []);

  const filtered = (testimonies ?? []).filter(t => {
    const matchesFilter =
      filter === "all" ||
      (filter === "private" && t.privacy === "private") ||
      (filter === "public" && t.privacy === "public");
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      t.title?.toLowerCase().includes(query) ||
      t.story?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  data-testid="text-page-title"
                >
                  My Journal
                </h1>
                <p className="text-muted-foreground">
                  A record of His faithfulness
                </p>
              </div>
              <div className="flex items-center gap-3">
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {streak}-day streak
                    </span>
                  </div>
                )}
                <Link href="/post">
                  <a>
                    <Button data-testid="button-new-testimony">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  </a>
                </Link>
              </div>
            </div>

            {/* Stats row */}
            {testimonies && testimonies.length > 0 && (
              <div className="flex gap-4 mb-6 text-sm text-muted-foreground flex-wrap">
                <span>
                  <strong className="text-foreground">{testimonies.length}</strong>{" "}
                  {testimonies.length === 1 ? "entry" : "entries"}
                </span>
                <span>
                  <strong className="text-foreground">
                    {testimonies.filter(t => t.privacy === "private").length}
                  </strong>{" "}
                  private
                </span>
                <span>
                  <strong className="text-foreground">
                    {testimonies.filter(t => t.privacy === "public").length}
                  </strong>{" "}
                  shared with community
                </span>
              </div>
            )}

            {/* Search + filter */}
            {testimonies && testimonies.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search your journal…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-9"
                    data-testid="input-search-journal"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="button-clear-search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted shrink-0">
                  {(["all", "private", "public"] as const).map(f => (
                    <Button
                      key={f}
                      type="button"
                      variant={filter === f ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      data-testid={`filter-${f}`}
                    >
                      {f === "all" ? "All" : f === "private" ? "Private" : "Shared"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-6">
                {filtered.map((testimony) => (
                  <div key={testimony.id} className="relative">
                    <TestimonyCard testimony={testimony} />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(testimony.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${testimony.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : testimonies && testimonies.length > 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No entries match your search</p>
                <button
                  onClick={() => { setSearch(""); setFilter("all"); }}
                  className="text-sm text-primary mt-2 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-2">
                    <PlusCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Your journal is empty</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Start recording what God has done. Every stone of remembrance begins with writing it down — even if only you ever read it.
                  </p>
                  <Link href="/post">
                    <a>
                      <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-first-testimony">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Write Your First Entry
                      </Button>
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
