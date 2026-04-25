import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TestimonyCard from "@/components/TestimonyCard";
import { useAuth } from "@/hooks/useAuth";
import type { User, TestimonyWithUser } from "@shared/schema";
import { MapPin, Link as LinkIcon, Calendar, Settings, Heart, Sparkles, BookOpen, Edit } from "lucide-react";
import { format } from "date-fns";

type ProfileWithStats = User & {
  stats: {
    testimoniesCount: number;
    amenReceived: number;
    encourageReceived: number;
  };
  testimonies?: TestimonyWithUser[];
};

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: profile, isLoading } = useQuery<ProfileWithStats>({
    queryKey: isOwnProfile ? ["/api/profile"] : [`/api/profile/${userId}`],
    enabled: isOwnProfile ? !!currentUser : !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20">
            <AvatarImage src={profile.profileImageUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-2xl md:text-3xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-profile-name">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {profile.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                    </span>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <Link href="/settings">
                  <Button variant="outline" size="sm" data-testid="button-edit-profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-profile-bio">
                {profile.bio}
              </p>
            )}
            
            {profile.faithInterests && profile.faithInterests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.faithInterests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="rounded-full">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-testimonies-count">
                {profile.stats.testimoniesCount}
              </p>
              <p className="text-sm text-muted-foreground">Testimonies</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-3">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-amen-count">
                {profile.stats.amenReceived}
              </p>
              <p className="text-sm text-muted-foreground">Amens Received</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-testid="text-encourage-count">
                {profile.stats.encourageReceived}
              </p>
              <p className="text-sm text-muted-foreground">Encouragements</p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonies Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isOwnProfile ? "My Testimonies" : `${profile.firstName}'s Testimonies`}
            </h2>
            {isOwnProfile && (
              <Link href="/post">
                <Button data-testid="button-new-testimony">
                  Share New Testimony
                </Button>
              </Link>
            )}
          </div>
          
          {profile.testimonies && profile.testimonies.length > 0 ? (
            <div className="space-y-6">
              {profile.testimonies.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </div>
          ) : (
            <Card className="rounded-xl border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {isOwnProfile 
                    ? "You haven't shared any testimonies yet" 
                    : "No public testimonies to display"}
                </p>
                {isOwnProfile && (
                  <Link href="/post">
                    <Button data-testid="button-share-first-testimony">
                      Share Your First Testimony
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
