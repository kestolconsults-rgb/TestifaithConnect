import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Share2, MessageCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import type { TestimonyWithUser } from "@shared/schema";
import { CATEGORY_COLORS, CATEGORY_ACCENT_COLORS } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiFacebook, SiX, SiWhatsapp } from "react-icons/si";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TestimonyCardProps {
  testimony: TestimonyWithUser;
  onAmen?: (id: string) => void;
  onEncourage?: (id: string) => void;
  isLoading?: boolean;
  featured?: boolean;
}

export default function TestimonyCard({ 
  testimony, 
  onAmen, 
  onEncourage, 
  isLoading = false,
  featured = false 
}: TestimonyCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const excerpt = testimony.story.length > 120 
    ? testimony.story.slice(0, 120) + '...' 
    : testimony.story;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/testimony/${testimony.id}`;
  const shareText = `Read this inspiring ${testimony.category} testimony: "${testimony.title}" on Testifaith`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this testimony with others.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const accentColor = CATEGORY_ACCENT_COLORS[testimony.category as Category] ?? '#64748b';

  return (
    <Card 
      className={`hover-elevate transition-all ${featured ? 'shadow-lg' : ''}`}
      style={{
        boxShadow: `inset 4px 0 0 ${accentColor}${featured ? ', 0 4px 24px rgba(0,0,0,0.15)' : ''}`,
      }}
      data-testid={`card-testimony-${testimony.id}`}
    >
      {featured && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-secondary text-secondary-foreground border-secondary-border" data-testid="badge-featured">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <Badge 
            className={`${CATEGORY_COLORS[testimony.category as keyof typeof CATEGORY_COLORS]} text-xs uppercase tracking-wide border`}
            data-testid={`badge-category-${testimony.category}`}
          >
            {testimony.category}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`date-${testimony.id}`} title={testimony.createdAt ? formatDistanceToNow(new Date(testimony.createdAt), { addSuffix: true }) : ""}>
            {testimony.createdAt && format(new Date(testimony.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        
        <Link href={`/testimony/${testimony.id}`} className="block">
          <h3 className="text-2xl font-bold mt-4 mb-3 hover:text-primary transition-colors leading-tight" data-testid={`title-testimony-${testimony.id}`}>
            {testimony.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-base leading-relaxed text-muted-foreground" data-testid={`excerpt-${testimony.id}`}>
          {excerpt}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAmen?.(testimony.id)}
            disabled={isLoading}
            className={testimony.userHasAmen ? 'text-chart-3 ring-2 ring-chart-3/20' : ''}
            data-testid={`button-amen-${testimony.id}`}
          >
            <Heart className={`h-4 w-4 mr-1 ${testimony.userHasAmen ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Amen</span>
            {testimony.amenCount > 0 && (
              <span className="ml-1" data-testid={`count-amen-${testimony.id}`}>
                {testimony.amenCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEncourage?.(testimony.id)}
            disabled={isLoading}
            className={testimony.userHasEncourage ? 'text-chart-4 ring-2 ring-chart-4/20' : ''}
            data-testid={`button-encourage-${testimony.id}`}
          >
            <Sparkles className={`h-4 w-4 mr-1 ${testimony.userHasEncourage ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Encourage</span>
            {testimony.encourageCount > 0 && (
              <span className="ml-1" data-testid={`count-encourage-${testimony.id}`}>
                {testimony.encourageCount}
              </span>
            )}
          </Button>

          <Link href={`/testimony/${testimony.id}`}>
            <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid={`button-comments-${testimony.id}`}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {testimony.commentCount != null && testimony.commentCount > 0 ? testimony.commentCount : ""}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`button-share-${testimony.id}`}>
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
                <SiFacebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
                <SiX className="h-4 w-4 mr-2" />
                X (Twitter)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
                <SiWhatsapp className="h-4 w-4 mr-2 text-green-500" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/testimony/${testimony.id}`}>
          <Button variant="outline" size="sm" data-testid={`button-read-more-${testimony.id}`}>
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
