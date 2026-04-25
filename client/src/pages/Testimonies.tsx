import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TestimonyCard from "@/components/TestimonyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TestimonyWithUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Testimonies() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: testimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies"],
  });

  const amenMutation = useMutation({
    mutationFn: async (testimonyId: string) => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/amen`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
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
    mutationFn: async (testimonyId: string) => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/encourage`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-6 pb-12">
          <div className="max-w-4xl mx-auto mb-6">
            <h1
              className="text-2xl font-bold text-foreground mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              data-testid="text-page-title"
            >
              Community Stones
            </h1>
            <p className="text-sm text-muted-foreground">
              Shared testimonies from believers around the world
            </p>
          </div>

          {isLoading ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : testimonies && testimonies.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {testimonies.map((testimony) => (
                <TestimonyCard 
                  key={testimony.id} 
                  testimony={testimony}
                  onAmen={isAuthenticated ? (id) => amenMutation.mutate(id) : undefined}
                  onEncourage={isAuthenticated ? (id) => encourageMutation.mutate(id) : undefined}
                  isLoading={amenMutation.isPending || encourageMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card className="rounded-2xl border-2">
                <CardContent className="p-16 text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-4">
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Nothing written yet</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                    Every stone of remembrance starts with someone writing it down. Be the first to record what God has done.
                  </p>
                  {isAuthenticated ? (
                    <Link href="/post">
                      <a>
                        <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-share-first">
                          <Heart className="h-5 w-5 mr-2" />
                          Write the First Entry
                        </Button>
                      </a>
                    </Link>
                  ) : (
                    <a href="/signin">
                      <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-login-share">
                        <Heart className="h-5 w-5 mr-2" />
                        Sign In to Begin Your Journal
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
