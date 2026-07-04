import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Sparkles,
  ArrowLeft,
  Clock,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { SiFacebook, SiX, SiWhatsapp } from "react-icons/si";
import { formatDistanceToNow, format } from "date-fns";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORY_COLORS, CATEGORY_ACCENT_COLORS } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import CommentSection from "@/components/CommentSection";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl"
        style={{ background: "hsl(var(--background) / 0.92)" }}>
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="px-5 pt-6 pb-4 space-y-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <div className="px-5 space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonyDetail() {
  const [, params] = useRoute("/testimony/:id");
  const testimonyId = params?.id || "";
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);
  const [amenAnimating, setAmenAnimating] = useState(false);

  const { data: testimony, isLoading } = useQuery<TestimonyWithUser>({
    queryKey: [`/api/testimonies/${testimonyId}`],
  });

  const amenMutation = useMutation({
    mutationFn: async () =>
      await apiRequest("POST", `/api/testimonies/${testimonyId}/amen`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}`] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/signin";
        return;
      }
      toast({ title: "Couldn't record Amen", variant: "destructive" });
    },
  });

  const encourageMutation = useMutation({
    mutationFn: async () =>
      await apiRequest("POST", `/api/testimonies/${testimonyId}/encourage`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}`] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/signin";
        return;
      }
      toast({ title: "Couldn't record Encouragement", variant: "destructive" });
    },
  });

  const handleAmen = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to say Amen", description: "Join the community to respond to testimonies." });
      return;
    }
    setAmenAnimating(false);
    requestAnimationFrame(() => setAmenAnimating(true));
    setTimeout(() => setAmenAnimating(false), 600);
    amenMutation.mutate();
  };

  const handleEncourage = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to Encourage", description: "Join the community to respond to testimonies." });
      return;
    }
    encourageMutation.mutate();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (!testimony) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center pb-28">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-['Space_Grotesk'] text-lg font-bold text-foreground">Testimony not found</p>
        <p className="text-sm text-muted-foreground">It may have been removed or is no longer available.</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary"
          data-testid="button-back-not-found"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  const displayName = testimony.isAnonymous
    ? "Anonymous"
    : testimony.user
    ? `${testimony.user.firstName || ""} ${testimony.user.lastName || ""}`.trim() || "Anonymous"
    : "Anonymous";

  const initials =
    displayName === "Anonymous"
      ? "A"
      : displayName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

  const accentColor =
    CATEGORY_ACCENT_COLORS[testimony.category as Category] ?? "#64748b";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/testimony/${testimonyId}`;
  const shareText = `"${testimony.title}" — a ${testimony.category} testimony on Testifaith`;
  const enc = encodeURIComponent;

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "hsl(var(--background) / 0.94)", backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : navigate("/home")}
          className="w-9 h-9 rounded-full flex items-center justify-center border bg-card hover-elevate"
          style={{ borderColor: "hsl(var(--border))" }}
          data-testid="button-back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center border bg-card hover-elevate"
              style={{ borderColor: "hsl(var(--border))" }}
              data-testid="button-share"
              aria-label="Share testimony"
            >
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}&quote=${enc(shareText)}`, "_blank", "width=600,height=400")}
              className="cursor-pointer" data-testid="share-facebook"
            >
              <SiFacebook className="h-4 w-4 mr-2 text-blue-600" /> Facebook
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareText)}`, "_blank", "width=600,height=400")}
              className="cursor-pointer" data-testid="share-twitter"
            >
              <SiX className="h-4 w-4 mr-2" /> X (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`https://wa.me/?text=${enc(shareText + " " + shareUrl)}`, "_blank")}
              className="cursor-pointer" data-testid="share-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 mr-2 text-green-500" /> WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer" data-testid="share-copy-link">
              {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category accent bar */}
      <div className="h-1 w-full" style={{ background: accentColor }} />

      {/* Header section */}
      <div className="px-5 pt-5 pb-5">
        <Badge
          className={`${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS]} text-[10px] uppercase tracking-widest font-bold mb-4 border`}
          data-testid="badge-category"
        >
          {testimony.category}
        </Badge>

        <h1
          className="font-['Space_Grotesk'] text-2xl font-bold text-foreground leading-snug mb-5"
          data-testid="text-title"
        >
          {testimony.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3">
          {!testimony.isAnonymous && testimony.user ? (
            <Link href={`/profile/${testimony.user.id}`}>
              <Avatar className="w-10 h-10 cursor-pointer">
                <AvatarImage src={testimony.user.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-xs font-bold bg-muted">A</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none mb-0.5" data-testid="text-author">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-date">
              {testimony.createdAt
                ? `${formatDistanceToNow(new Date(testimony.createdAt), { addSuffix: true })} · ${format(new Date(testimony.createdAt), "MMM d, yyyy")}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t" />

      {/* Video player */}
      {testimony.videoUrl && (
        <div className="px-5 pt-5">
          <VideoPlayer
            videoUrl={testimony.videoUrl}
            thumbnailUrl={testimony.thumbnailUrl}
            duration={testimony.videoDuration}
          />
          {testimony.moderationStatus === "pending" && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm text-amber-600 dark:text-amber-400">This video is pending review</span>
            </div>
          )}
        </div>
      )}

      {/* Story body */}
      <div className="px-5 pt-5 pb-2">
        <p
          className="font-['Crimson_Pro'] text-[19px] leading-[1.75] text-foreground whitespace-pre-wrap"
          data-testid="text-story"
        >
          {testimony.story}
        </p>
      </div>

      {/* Engagement counts */}
      {(testimony.amenCount > 0 || testimony.encourageCount > 0 || (testimony.commentCount ?? 0) > 0) && (
        <div className="mx-5 mt-5 pt-3 border-t flex items-center gap-4 text-sm text-muted-foreground">
          {testimony.amenCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-chart-3 text-chart-3" />
              <span>{testimony.amenCount} {testimony.amenCount === 1 ? "Amen" : "Amens"}</span>
            </span>
          )}
          {testimony.encourageCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-chart-4" />
              <span>{testimony.encourageCount} {testimony.encourageCount === 1 ? "Encouragement" : "Encouragements"}</span>
            </span>
          )}
          {(testimony.commentCount ?? 0) > 0 && (
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{testimony.commentCount} {testimony.commentCount === 1 ? "Comment" : "Comments"}</span>
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleAmen}
          disabled={amenMutation.isPending}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 border ${
            testimony.userHasAmen
              ? "border-chart-3/40 text-chart-3"
              : "border-border text-foreground"
          }`}
          style={{
            background: testimony.userHasAmen
              ? "color-mix(in srgb, hsl(var(--chart-3)) 12%, hsl(var(--card)))"
              : "hsl(var(--card))",
          }}
          data-testid="button-amen"
        >
          <Heart
            className={`w-5 h-5 transition-transform ${amenAnimating ? "amen-burst" : ""} ${testimony.userHasAmen ? "fill-current text-chart-3" : ""}`}
          />
          Amen{testimony.amenCount > 0 ? ` · ${testimony.amenCount}` : ""}
        </button>

        <button
          onClick={handleEncourage}
          disabled={encourageMutation.isPending}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 border ${
            testimony.userHasEncourage
              ? "border-chart-4/40 text-chart-4"
              : "border-border text-foreground"
          }`}
          style={{
            background: testimony.userHasEncourage
              ? "color-mix(in srgb, hsl(var(--chart-4)) 12%, hsl(var(--card)))"
              : "hsl(var(--card))",
          }}
          data-testid="button-encourage"
        >
          <Sparkles className={`w-5 h-5 ${testimony.userHasEncourage ? "fill-current text-chart-4" : ""}`} />
          Encourage{testimony.encourageCount > 0 ? ` · ${testimony.encourageCount}` : ""}
        </button>
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-center text-muted-foreground mt-3 px-5">
          <Link href="/signin" className="text-primary font-medium">Sign in</Link>
          {" "}to say Amen or Encourage this testimony
        </p>
      )}

      {/* Comments section */}
      <div className="mt-8 px-5 pb-4" id="comments">
        <CommentSection testimonyId={testimonyId} />
      </div>
    </div>
  );
}
