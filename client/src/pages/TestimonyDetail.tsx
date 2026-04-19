import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Sparkles, ArrowLeft, Clock } from "lucide-react";
import { ShareTestimony } from "@/components/ShareTestimony";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import CommentSection from "@/components/CommentSection";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function TestimonyDetail() {
  const [, params] = useRoute("/testimony/:id");
  const testimonyId = params?.id || '';
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: testimony, isLoading } = useQuery<TestimonyWithUser>({
    queryKey: [`/api/testimonies/${testimonyId}`],
  });

  const amenMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/amen`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}`] });
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
        description: "Failed to record Amen",
        variant: "destructive",
      });
    },
  });

  const encourageMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/encourage`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/${testimonyId}`] });
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
        description: "Failed to record encouragement",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testimony) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-muted-foreground">Testimony not found</p>
              <Link href="/testimonies">
                <a>
                  <Button className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Testimonies
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = testimony.isAnonymous
    ? 'Anonymous'
    : testimony.user
      ? `${testimony.user.firstName || ''} ${testimony.user.lastName || ''}`.trim() || 'Anonymous'
      : 'Anonymous';

  const getInitials = (name: string) => {
    if (name === 'Anonymous') return 'A';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Link href="/testimonies">
              <a>
                <Button variant="ghost" className="mb-6" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Testimonies
                </Button>
              </a>
            </Link>

            <Card className="rounded-2xl">
              <CardHeader className="space-y-4">
                <Badge
                  className={`${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS]} text-xs uppercase tracking-wide w-fit border`}
                  data-testid="badge-category"
                >
                  {testimony.category}
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }} data-testid="text-title">
                  {testimony.title}
                </h1>

                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {!testimony.isAnonymous && testimony.user?.profileImageUrl && (
                      <AvatarImage src={testimony.user.profileImageUrl} alt={displayName} className="object-cover" />
                    )}
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium" data-testid="text-author">{displayName}</span>
                    <span className="text-sm text-muted-foreground" data-testid="text-date">
                      {testimony.createdAt && formatDistanceToNow(new Date(testimony.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {testimony.videoUrl && (
                  <div className="mb-6">
                    <VideoPlayer 
                      videoUrl={testimony.videoUrl} 
                      thumbnailUrl={testimony.thumbnailUrl}
                      duration={testimony.videoDuration}
                    />
                    {testimony.moderationStatus === 'pending' && (
                      <div className="mt-2 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-500">This video is pending moderation</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap" data-testid="text-story">
                    {testimony.story}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t flex-wrap">
                  <Button
                    variant="default"
                    onClick={() => amenMutation.mutate()}
                    disabled={!isAuthenticated || amenMutation.isPending}
                    className={testimony.userHasAmen ? 'bg-chart-3 hover:bg-chart-3/90' : ''}
                    data-testid="button-amen"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${testimony.userHasAmen ? 'fill-current' : ''}`} />
                    Amen
                    {testimony.amenCount > 0 && (
                      <span className="ml-2" data-testid="count-amen">
                        ({testimony.amenCount})
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => encourageMutation.mutate()}
                    disabled={!isAuthenticated || encourageMutation.isPending}
                    className={testimony.userHasEncourage ? 'bg-chart-4 hover:bg-chart-4/90' : ''}
                    data-testid="button-encourage"
                  >
                    <Sparkles className={`h-4 w-4 mr-2 ${testimony.userHasEncourage ? 'fill-current' : ''}`} />
                    Encourage
                    {testimony.encourageCount > 0 && (
                      <span className="ml-2" data-testid="count-encourage">
                        ({testimony.encourageCount})
                      </span>
                    )}
                  </Button>

                  <ShareTestimony 
                    testimonyId={testimonyId}
                    title={testimony.title}
                    category={testimony.category}
                  />
                </div>

                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground">
                    <a href="/signin" className="text-primary hover:underline">
                      Sign in
                    </a>{' '}
                    to give Amen or Encourage this testimony
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="mt-8">
              <CommentSection testimonyId={testimonyId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
