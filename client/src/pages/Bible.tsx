import { BookOpen, Search, Bookmark, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const POPULAR_BOOKS = [
  { name: "Psalms", chapters: 150, testament: "OT" },
  { name: "Proverbs", chapters: 31, testament: "OT" },
  { name: "John", chapters: 21, testament: "NT" },
  { name: "Romans", chapters: 16, testament: "NT" },
  { name: "Isaiah", chapters: 66, testament: "OT" },
  { name: "Philippians", chapters: 4, testament: "NT" },
];

const FAITH_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
];

export default function Bible() {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground leading-tight">Bible</h1>
            <p className="text-xs text-muted-foreground">Read and study God's Word</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">Search scripture…</span>
        </div>
      </div>

      {/* Today's Verse */}
      <section className="px-5 mb-6">
        <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground mb-3">Verse for Today</h2>
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Bookmark className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm leading-relaxed italic text-foreground mb-2 font-serif">
                  "{FAITH_VERSES[0].text}"
                </p>
                <p className="text-xs font-semibold text-primary">{FAITH_VERSES[0].ref}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Popular Books */}
      <section className="px-5 mb-6">
        <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground mb-3">Popular Books</h2>
        <div className="grid grid-cols-2 gap-3">
          {POPULAR_BOOKS.map((book) => (
            <button
              key={book.name}
              className="flex items-center justify-between p-4 rounded-xl border bg-card text-left hover-elevate"
              data-testid={`book-${book.name.toLowerCase()}`}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{book.name}</p>
                <p className="text-xs text-muted-foreground">{book.chapters} chapters · {book.testament}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Faith Verses */}
      <section className="px-5">
        <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground mb-3">Faith & Promises</h2>
        <div className="space-y-3">
          {FAITH_VERSES.map((verse) => (
            <Card key={verse.ref} className="rounded-2xl">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-card-foreground italic mb-2 font-serif">"{verse.text}"</p>
                <p className="text-xs font-semibold text-primary">{verse.ref}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="px-5 py-8 text-center">
        <p className="text-xs text-muted-foreground">Full Bible reader coming soon</p>
      </div>
    </div>
  );
}
