import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import CategoryPill from "@/components/CategoryPill";
import VideoHero from "@/components/VideoHero";
import TestimonyCard from "@/components/TestimonyCard";
import videoSrc from "@assets/246856_tiny_1763479354943.mp4";
import { useQuery } from "@tanstack/react-query";
import type { TestimonyWithUser, FaithDeclaration } from "@shared/schema";

export default function Landing() {
  const { data: featuredTestimony, isLoading: featuredLoading } = useQuery<TestimonyWithUser>({
    queryKey: ["/api/testimonies/featured"],
  });

  const { data: faithDeclaration, isLoading: declarationLoading } = useQuery<FaithDeclaration | null>({
    queryKey: ["/api/faith-declaration/active"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Video Hero Section */}
      <VideoHero videoSrc={videoSrc} />

      {/* Faith Declaration of the Day */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Today's Faith Declaration
            </h2>
            <p className="text-muted-foreground">
              Speak God's truth over your life
            </p>
          </div>
          {declarationLoading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : faithDeclaration ? (
            <Card className="rounded-2xl border border-primary/20 bg-card">
              <CardContent className="p-6 md:p-10 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <blockquote className="text-lg md:text-xl leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-faith-declaration">
                  {faithDeclaration.declaration}
                </blockquote>
                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground italic" data-testid="text-faith-verse">
                    {faithDeclaration.bibleVerse}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    — {faithDeclaration.bibleReference}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-8 md:p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No faith declaration has been set for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Testimony of the Day */}
      <section className="px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Testimony of the Day
            </h2>
            <p className="text-muted-foreground">
              Be encouraged by this story of faith
            </p>
          </div>
          {featuredLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : featuredTestimony ? (
            <TestimonyCard testimony={featuredTestimony} featured />
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-8 md:p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted">
                  <Star className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No featured testimony has been selected for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Explore by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover testimonies of God's faithfulness across different areas of life
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((category) => (
              <CategoryPill key={category} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Share Your Story?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your testimony could be the encouragement someone needs today. Join our community and share how God has worked in your life.
          </p>
          <a href="/signin">
            <Button 
              size="lg" 
              className="rounded-full font-bold px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
              data-testid="button-cta-share"
            >
              Start Sharing Now
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
