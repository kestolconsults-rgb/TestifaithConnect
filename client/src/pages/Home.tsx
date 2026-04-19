import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import TestimonyCard from "@/components/TestimonyCard";
import EncouragementCard from "@/components/EncouragementCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TestimonyWithUser, EncouragementVerse, FaithDeclaration } from "@shared/schema";
import { CATEGORIES } from "@/lib/constants";
import CategoryPill from "@/components/CategoryPill";
import { Sparkles, TrendingUp, Plus, Heart, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const { data: featuredTestimony, isLoading: featuredLoading } = useQuery<TestimonyWithUser>({
    queryKey: ["/api/testimonies/featured"],
  });

  const { data: recentTestimonies, isLoading: recentLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies/recent"],
  });

  const hasInterests = user?.faithInterests && user.faithInterests.length > 0;
  const { data: personalizedTestimonies, isLoading: personalizedLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: ["/api/testimonies/personalized"],
    enabled: !!hasInterests,
    retry: false,
  });

  const { data: dailyVerse, isLoading: verseLoading } = useQuery<EncouragementVerse>({
    queryKey: ["/api/encouragement/daily"],
  });

  const { data: faithDeclaration, isLoading: declarationLoading } = useQuery<FaithDeclaration | null>({
    queryKey: ["/api/faith-declaration/active"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight" data-testid="text-welcome-title" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.firstName || 'Friend'}!</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Share your story of faith and be encouraged by testimonies from believers worldwide
          </p>
          <Link href="/post">
            <Button size="lg" className="rounded-full font-bold text-lg px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all" data-testid="button-share-testimony">
              <Plus className="h-5 w-5 mr-2" />
              Share Your Testimony
            </Button>
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* Daily Encouragement */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Daily Encouragement
            </h2>
            <p className="text-lg text-muted-foreground">
              Start your day with God's Word
            </p>
          </div>
          {verseLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : dailyVerse ? (
            <EncouragementCard verse={dailyVerse} />
          ) : (
            <Card className="rounded-2xl">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No verse available today</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Faith Declaration of the Day */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Faith Declaration
            </h2>
            <p className="text-lg text-muted-foreground">
              Speak God's truth over your life today
            </p>
          </div>
          {declarationLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : faithDeclaration ? (
            <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8 md:p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <blockquote className="text-xl md:text-2xl font-medium leading-relaxed" data-testid="text-faith-declaration">
                  "{faithDeclaration.declaration}"
                </blockquote>
                <p className="text-muted-foreground text-lg" data-testid="text-faith-verse">
                  "{faithDeclaration.bibleVerse}" — {faithDeclaration.bibleReference}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/30">
              <CardContent className="p-8 md:p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No faith declaration has been set for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Testimony of the Day */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Testimony of the Day
            </h2>
            <p className="text-lg text-muted-foreground">
              The most impactful story from our community
            </p>
          </div>
          {featuredLoading ? (
            <Skeleton className="h-80 w-full rounded-2xl" />
          ) : featuredTestimony ? (
            <TestimonyCard testimony={featuredTestimony} featured />
          ) : (
            <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/30">
              <CardContent className="p-8 md:p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No featured testimony has been selected for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Browse Categories */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover testimonies across different areas of faith
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {CATEGORIES.map((category) => (
              <CategoryPill key={category} category={category} />
            ))}
          </div>
        </section>

        {/* For You - Personalized Section */}
        {hasInterests && (
          <section>
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                For You
              </h2>
              <p className="text-lg text-muted-foreground">
                Testimonies based on your faith interests
              </p>
            </div>
            
            {personalizedLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                ))}
              </div>
            ) : personalizedTestimonies && personalizedTestimonies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedTestimonies.map((testimony) => (
                  <TestimonyCard key={testimony.id} testimony={testimony} />
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <CardContent className="p-8 md:p-12 text-center space-y-4">
                  <p className="text-muted-foreground text-lg">
                    No testimonies found in your areas of interest yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Recent Testimonies */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Recent Testimonies
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Fresh stories from believers around the world
            </p>
            <Link href="/testimonies">
              <Button variant="outline" className="rounded-full font-semibold px-8" data-testid="button-view-all">
                View All Testimonies
              </Button>
            </Link>
          </div>
          
          {recentLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : recentTestimonies && recentTestimonies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTestimonies.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-2">
              <CardContent className="p-16 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-2">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">No Testimonies Yet</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                  Every great story starts somewhere. Be the first to share how God has worked in your life and inspire others on their faith journey.
                </p>
                <Link href="/post">
                  <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-be-first">
                    <Plus className="h-5 w-5 mr-2" />
                    Share the First Testimony
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
