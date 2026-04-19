import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TestimonyCard from "@/components/TestimonyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { TestimonyWithUser } from "@shared/schema";
import { PlusCircle } from "lucide-react";

export default function MyTestimonies() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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
        title: "Success",
        description: "Testimony deleted successfully",
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
        description: "Failed to delete testimony",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2" data-testid="text-page-title">
                  My Testimonies
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your shared testimonies
                </p>
              </div>
              <Link href="/post">
                <a>
                  <Button data-testid="button-new-testimony">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Testimony
                  </Button>
                </a>
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : testimonies && testimonies.length > 0 ? (
              <div className="space-y-6">
                {testimonies.map((testimony) => (
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
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-2">
                    <PlusCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">No Testimonies Yet</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Share your first testimony and encourage others with your story of faith. Your journey could be exactly what someone needs to hear today.
                  </p>
                  <Link href="/post">
                    <a>
                      <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-first-testimony">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Share Your First Testimony
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
