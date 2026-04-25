import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TestimonyCard from "@/components/TestimonyCard";
import { useAuth } from "@/hooks/useAuth";
import type { User, TestimonyWithUser } from "@shared/schema";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Settings,
  Heart,
  Sparkles,
  BookOpen,
  Edit,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";

type ProfileWithStats = User & {
  stats: {
    testimoniesCount: number;
    amenReceived: number;
    encourageReceived: number;
  };
  testimonies?: TestimonyWithUser[];
};

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Banner */}
      <div className="h-32 bg-muted" />
      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar */}
        <div className="flex justify-center -mt-14 mb-4">
          <Skeleton className="w-28 h-28 rounded-full ring-4 ring-background" />
        </div>
        <div className="flex flex-col items-center gap-3 mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Stats */}
        <div className="flex justify-center gap-8 py-4 border-y border-border mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const { data: profile, isLoading } = useQuery<ProfileWithStats>({
    queryKey: isOwnProfile ? ["/api/profile"] : [`/api/profile/${userId}`],
    enabled: isOwnProfile ? !!currentUser : !!userId,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Profile not found</p>
          <p className="text-sm text-muted-foreground">This user doesn't exist or their profile is private.</p>
        </div>
      </div>
    );
  }

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initials = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover banner */}
      <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/80 via-primary/60 to-rose-700/50" />

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar — overlaps the banner */}
        <div className="flex justify-center -mt-14 sm:-mt-16 mb-4 relative z-10">
          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 ring-4 ring-background shadow-lg">
            <AvatarImage src={profile.profileImageUrl || undefined} alt={displayName} />
            <AvatarFallback
              className="text-3xl font-bold bg-primary/15 text-primary"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name + meta */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-3">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            data-testid="text-profile-name"
          >
            {displayName}
          </h1>

          {profile.bio && (
            <p
              className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md mt-1"
              data-testid="text-profile-bio"
            >
              {profile.bio}
            </p>
          )}

          {/* Location / website / joined */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
                data-testid="link-profile-website"
              >
                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                Website
              </a>
            )}
            {profile.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                Joined {format(new Date(profile.createdAt), "MMM yyyy")}
              </span>
            )}
          </div>

          {/* Faith interest tags */}
          {profile.faithInterests && profile.faithInterests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {profile.faithInterests.map((interest) => (
                <Link key={interest} href={`/category/${interest}`}>
                  <Badge variant="secondary" className="rounded-full text-xs px-2.5 py-0.5 cursor-pointer hover-elevate">
                    {interest}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Edit profile + settings buttons — own profile only */}
        {isOwnProfile && (
          <div className="flex justify-center items-center gap-2 mb-5">
            <Link href="/edit-profile">
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-edit-profile">
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-center divide-x divide-border border-y border-border py-4 mb-7">
          <div className="flex flex-col items-center px-6 sm:px-10 gap-0.5">
            <span
              className="text-xl sm:text-2xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              data-testid="text-testimonies-count"
            >
              {profile.stats.testimoniesCount}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Testimonies
            </span>
          </div>

          <div className="flex flex-col items-center px-6 sm:px-10 gap-0.5">
            <span
              className="text-xl sm:text-2xl font-bold text-red-500"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              data-testid="text-amen-count"
            >
              {profile.stats.amenReceived}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              Amens
            </span>
          </div>

          <div className="flex flex-col items-center px-6 sm:px-10 gap-0.5">
            <span
              className="text-xl sm:text-2xl font-bold text-amber-500"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              data-testid="text-encourage-count"
            >
              {profile.stats.encourageReceived}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Encouraged
            </span>
          </div>
        </div>

        {/* Testimonies section */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2
              className="text-lg sm:text-xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isOwnProfile ? "My Journal" : `${profile.firstName ?? "Their"}'s Journal`}
            </h2>
            {isOwnProfile && (
              <Link href="/post">
                <Button size="sm" className="gap-1.5 shrink-0" data-testid="button-new-testimony">
                  <Pencil className="h-3.5 w-3.5" />
                  New Entry
                </Button>
              </Link>
            )}
          </div>

          {profile.testimonies && profile.testimonies.length > 0 ? (
            <div className="space-y-4">
              {profile.testimonies.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">
                {isOwnProfile ? "Your journal is empty" : "No public entries yet"}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mb-5">
                {isOwnProfile
                  ? "Start by writing down what God has done — every testimony builds your faith."
                  : "This person hasn't shared any public testimonies yet."}
              </p>
              {isOwnProfile && (
                <Link href="/post">
                  <Button size="sm" data-testid="button-share-first-testimony">
                    Write Your First Entry
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
