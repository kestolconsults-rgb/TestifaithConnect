import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TestimonyCard from "@/components/TestimonyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Plus } from "lucide-react";
import healingImage from "@assets/generated_images/Healing_category_banner_image_9998ecef.png";
import marriageImage from "@assets/generated_images/Marriage_category_banner_image_ead101b5.png";
import financeImage from "@assets/generated_images/Finance_category_banner_image_382d4804.png";
import breakthroughImage from "@assets/generated_images/Breakthrough_category_banner_image_5e7462c5.png";

const CATEGORY_IMAGES: Record<string, string> = {
  healing: healingImage,
  marriage: marriageImage,
  finance: financeImage,
  breakthrough: breakthroughImage,
};

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category || '';
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const categoryName = CATEGORIES.find(
    c => c.toLowerCase() === category.toLowerCase()
  ) || 'Others';

  const { data: testimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: [`/api/testimonies/category/${category}`],
  });

  const amenMutation = useMutation({
    mutationFn: async (testimonyId: string) => {
      return await apiRequest("POST", `/api/testimonies/${testimonyId}/amen`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/category/${category}`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/testimonies/category/${category}`] });
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

  const categoryImage = CATEGORY_IMAGES[category.toLowerCase()];

  const getCategoryEmptyMessage = (cat: string) => {
    const messages: Record<string, string> = {
      healing: "Your healing testimony could bring hope to someone facing health challenges today. Share how God restored you.",
      marriage: "Every marriage has a story of God's grace. Share your journey to inspire other couples.",
      fruitfulness: "Testimonies of God's blessing can encourage those waiting for breakthrough. Share your story of abundance.",
      finance: "Financial miracles remind us that God is our provider. Share how He met your needs.",
      breakthrough: "Your breakthrough story could be the faith boost someone needs. Share how God made a way.",
      deliverance: "Stories of freedom inspire others to trust God. Share how He delivered you.",
      others: "Every testimony of God's goodness matters. Share your unique story with the community."
    };
    return messages[cat.toLowerCase()] || messages.others;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Category Banner */}
        {categoryImage ? (
          <section
            className="relative h-[30vh] flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url(${categoryImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="text-center">
              <Badge
                className={`${CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS]} text-lg px-6 py-2 mb-4 border`}
                data-testid="badge-category"
              >
                {categoryName}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }} data-testid="text-page-title">
                {categoryName} Testimonies
              </h1>
            </div>
          </section>
        ) : (
          <section className="bg-primary/5 py-16">
            <div className="container mx-auto px-4 text-center">
              <Badge
                className={`${CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS]} text-lg px-6 py-2 mb-4 border`}
                data-testid="badge-category"
              >
                {categoryName}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }} data-testid="text-page-title">
                {categoryName} Testimonies
              </h1>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {[1, 2, 3].map((i) => (
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
                  <h3 className="text-2xl font-bold">No {categoryName} Testimonies Yet</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                    {getCategoryEmptyMessage(category)}
                  </p>
                  {isAuthenticated ? (
                    <Link href="/post">
                      <a>
                        <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-share-category">
                          <Plus className="h-5 w-5 mr-2" />
                          Share {categoryName} Testimony
                        </Button>
                      </a>
                    </Link>
                  ) : (
                    <a href="/signin">
                      <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-login-share-category">
                        <Heart className="h-5 w-5 mr-2" />
                        Sign In to Share
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
