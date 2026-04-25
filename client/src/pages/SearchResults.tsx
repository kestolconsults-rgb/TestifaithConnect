import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Sparkles, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CATEGORY_COLORS } from "@/lib/constants";
import SearchBar from "@/components/SearchBar";
import type { TestimonyWithUser } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  const query = params.get('q') || '';
  const categories = params.get('categories') || '';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';

  const searchParams = new URLSearchParams();
  if (query) searchParams.set('q', query);
  if (categories) searchParams.set('categories', categories);
  if (startDate) searchParams.set('startDate', startDate);
  if (endDate) searchParams.set('endDate', endDate);

  const { data: testimonies, isLoading } = useQuery<TestimonyWithUser[]>({
    queryKey: [`/api/testimonies/search?${searchParams.toString()}`],
  });

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const escapedQuery = escapeRegex(searchQuery);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                {testimonies?.length || 0} {testimonies?.length === 1 ? 'result' : 'results'} found
              </>
            )}
          </h2>
          {query && (
            <p className="text-muted-foreground mt-1">
              Searching for "{query}"
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonies && testimonies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {testimonies.map((testimony) => (
              <Link key={testimony.id} href={`/testimony/${testimony.id}`}>
                <Card
                  data-testid={`card-testimony-${testimony.id}`}
                  className="rounded-2xl hover-elevate active-elevate-2 cursor-pointer h-full"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        data-testid={`text-title-${testimony.id}`}
                        className="text-lg font-semibold text-foreground line-clamp-2"
                      >
                        {highlightText(testimony.title, query)}
                      </h3>
                      <Badge
                        data-testid={`badge-category-${testimony.id}`}
                        className={`${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS]} shrink-0`}
                      >
                        {testimony.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={testimony.user?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {testimony.user?.firstName?.[0]}{testimony.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {testimony.user?.firstName} {testimony.user?.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {testimony.createdAt && formatDistanceToNow(new Date(testimony.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      data-testid={`text-content-${testimony.id}`}
                      className="text-muted-foreground line-clamp-3"
                    >
                      {testimony.story && highlightText(testimony.story, query)}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{testimony.amenCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span>{testimony.encourageCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl border-2">
              <CardContent className="p-16 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-4">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">No Results Found</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                  We couldn't find any testimonies matching "{query}". Try different keywords or explore testimonies by category.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Link href="/testimonies">
                    <a>
                      <Button size="lg" variant="outline" className="rounded-full font-bold px-8 py-6 h-auto" data-testid="button-all-testimonies">
                        View All Testimonies
                      </Button>
                    </a>
                  </Link>
                  <Link href="/categories">
                    <a>
                      <Button size="lg" className="rounded-full font-bold px-8 py-6 h-auto shadow-lg" data-testid="button-browse-categories">
                        Browse Categories
                      </Button>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
