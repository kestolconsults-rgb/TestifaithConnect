import { Card, CardContent } from "@/components/ui/card";
import type { EncouragementVerse } from "@shared/schema";

interface EncouragementCardProps {
  verse: EncouragementVerse;
}

export default function EncouragementCard({ verse }: EncouragementCardProps) {
  return (
    <Card className="bg-secondary/10 border-l-4 border-l-secondary" data-testid="card-encouragement">
      <CardContent className="pt-6">
        <blockquote className="font-serif italic text-lg leading-relaxed text-foreground/90" data-testid="text-verse">
          "{verse.verse}"
        </blockquote>
        <p className="text-sm text-muted-foreground mt-4 font-medium" data-testid="text-reference">
          — {verse.reference}
        </p>
      </CardContent>
    </Card>
  );
}
