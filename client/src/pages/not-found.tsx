import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="max-w-2xl mx-4">
        <Card className="rounded-2xl border-2">
          <CardContent className="p-16 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 mb-4">
              <AlertCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              404 - Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              The page you're looking for doesn't exist. It may have been moved or deleted.
            </p>
            <Link href="/">
              <a>
                <Button size="lg" className="rounded-full font-bold text-lg px-10 py-6 h-auto shadow-lg mt-4" data-testid="button-home">
                  <Home className="h-5 w-5 mr-2" />
                  Return Home
                </Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
