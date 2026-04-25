import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronRight, ChevronLeft, ArrowLeft, X, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ── Bible data ──────────────────────────────────────────────────────────────

export const VERSIONS = [
  { id: "kjv", name: "KJV", full: "King James Version" },
  { id: "web", name: "WEB", full: "World English Bible" },
  { id: "asv", name: "ASV", full: "Am. Standard Version" },
  { id: "ylt", name: "YLT", full: "Young's Literal Translation" },
  { id: "darby", name: "DARBY", full: "Darby Translation" },
  { id: "bbe", name: "BBE", full: "Basic English Bible" },
];

interface BibleBook {
  name: string;
  chapters: number;
  apiName: string; // name used in bible-api.com URL
}

const OT_BOOKS: BibleBook[] = [
  { name: "Genesis", chapters: 50, apiName: "genesis" },
  { name: "Exodus", chapters: 40, apiName: "exodus" },
  { name: "Leviticus", chapters: 27, apiName: "leviticus" },
  { name: "Numbers", chapters: 36, apiName: "numbers" },
  { name: "Deuteronomy", chapters: 34, apiName: "deuteronomy" },
  { name: "Joshua", chapters: 24, apiName: "joshua" },
  { name: "Judges", chapters: 21, apiName: "judges" },
  { name: "Ruth", chapters: 4, apiName: "ruth" },
  { name: "1 Samuel", chapters: 31, apiName: "1+samuel" },
  { name: "2 Samuel", chapters: 24, apiName: "2+samuel" },
  { name: "1 Kings", chapters: 22, apiName: "1+kings" },
  { name: "2 Kings", chapters: 25, apiName: "2+kings" },
  { name: "1 Chronicles", chapters: 29, apiName: "1+chronicles" },
  { name: "2 Chronicles", chapters: 36, apiName: "2+chronicles" },
  { name: "Ezra", chapters: 10, apiName: "ezra" },
  { name: "Nehemiah", chapters: 13, apiName: "nehemiah" },
  { name: "Esther", chapters: 10, apiName: "esther" },
  { name: "Job", chapters: 42, apiName: "job" },
  { name: "Psalms", chapters: 150, apiName: "psalm" },
  { name: "Proverbs", chapters: 31, apiName: "proverbs" },
  { name: "Ecclesiastes", chapters: 12, apiName: "ecclesiastes" },
  { name: "Song of Solomon", chapters: 8, apiName: "song+of+solomon" },
  { name: "Isaiah", chapters: 66, apiName: "isaiah" },
  { name: "Jeremiah", chapters: 52, apiName: "jeremiah" },
  { name: "Lamentations", chapters: 5, apiName: "lamentations" },
  { name: "Ezekiel", chapters: 48, apiName: "ezekiel" },
  { name: "Daniel", chapters: 12, apiName: "daniel" },
  { name: "Hosea", chapters: 14, apiName: "hosea" },
  { name: "Joel", chapters: 3, apiName: "joel" },
  { name: "Amos", chapters: 9, apiName: "amos" },
  { name: "Obadiah", chapters: 1, apiName: "obadiah" },
  { name: "Jonah", chapters: 4, apiName: "jonah" },
  { name: "Micah", chapters: 7, apiName: "micah" },
  { name: "Nahum", chapters: 3, apiName: "nahum" },
  { name: "Habakkuk", chapters: 3, apiName: "habakkuk" },
  { name: "Zephaniah", chapters: 3, apiName: "zephaniah" },
  { name: "Haggai", chapters: 2, apiName: "haggai" },
  { name: "Zechariah", chapters: 14, apiName: "zechariah" },
  { name: "Malachi", chapters: 4, apiName: "malachi" },
];

const NT_BOOKS: BibleBook[] = [
  { name: "Matthew", chapters: 28, apiName: "matthew" },
  { name: "Mark", chapters: 16, apiName: "mark" },
  { name: "Luke", chapters: 24, apiName: "luke" },
  { name: "John", chapters: 21, apiName: "john" },
  { name: "Acts", chapters: 28, apiName: "acts" },
  { name: "Romans", chapters: 16, apiName: "romans" },
  { name: "1 Corinthians", chapters: 16, apiName: "1+corinthians" },
  { name: "2 Corinthians", chapters: 13, apiName: "2+corinthians" },
  { name: "Galatians", chapters: 6, apiName: "galatians" },
  { name: "Ephesians", chapters: 6, apiName: "ephesians" },
  { name: "Philippians", chapters: 4, apiName: "philippians" },
  { name: "Colossians", chapters: 4, apiName: "colossians" },
  { name: "1 Thessalonians", chapters: 5, apiName: "1+thessalonians" },
  { name: "2 Thessalonians", chapters: 3, apiName: "2+thessalonians" },
  { name: "1 Timothy", chapters: 6, apiName: "1+timothy" },
  { name: "2 Timothy", chapters: 4, apiName: "2+timothy" },
  { name: "Titus", chapters: 3, apiName: "titus" },
  { name: "Philemon", chapters: 1, apiName: "philemon" },
  { name: "Hebrews", chapters: 13, apiName: "hebrews" },
  { name: "James", chapters: 5, apiName: "james" },
  { name: "1 Peter", chapters: 5, apiName: "1+peter" },
  { name: "2 Peter", chapters: 3, apiName: "2+peter" },
  { name: "1 John", chapters: 5, apiName: "1+john" },
  { name: "2 John", chapters: 1, apiName: "2+john" },
  { name: "3 John", chapters: 1, apiName: "3+john" },
  { name: "Jude", chapters: 1, apiName: "jude" },
  { name: "Revelation", chapters: 22, apiName: "revelation" },
];

const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS];

interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BiblePassageResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
}

async function fetchPassage(apiName: string, chapter: number, version: string): Promise<BiblePassageResponse> {
  const url = `https://bible-api.com/${apiName}+${chapter}?translation=${version}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load passage");
  return res.json();
}

async function fetchSearch(reference: string, version: string): Promise<BiblePassageResponse> {
  const encoded = encodeURIComponent(reference.trim());
  const url = `https://bible-api.com/${encoded}?translation=${version}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reference not found");
  return res.json();
}

// ── Types ────────────────────────────────────────────────────────────────────

type View = "home" | "chapters" | "reading" | "search";
type Testament = "OT" | "NT";

// ── Sub-components ───────────────────────────────────────────────────────────

function VersionPicker({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = VERSIONS.find((v) => v.id === selected)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold hover-elevate"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
        data-testid="button-version-picker"
      >
        <BookOpen className="w-3.5 h-3.5 text-primary" />
        {current.name}
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-lg overflow-hidden min-w-[220px]"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            {VERSIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => { onSelect(v.id); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover-elevate border-b last:border-0"
                style={{ borderColor: "hsl(var(--border))" }}
                data-testid={`version-option-${v.id}`}
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.full}</p>
                </div>
                {v.id === selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ReadingView({
  book,
  chapter,
  version,
  onBack,
  onChapterChange,
}: {
  book: BibleBook;
  chapter: number;
  version: string;
  onBack: () => void;
  onChapterChange: (ch: number) => void;
}) {
  const { data, isLoading, isError } = useQuery<BiblePassageResponse>({
    queryKey: ["bible", book.apiName, chapter, version],
    queryFn: () => fetchPassage(book.apiName, chapter, version),
    staleTime: 10 * 60 * 1000,
  });

  const versionLabel = VERSIONS.find((v) => v.id === version)?.name ?? version.toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div
        className="sticky top-[57px] z-20 flex items-center justify-between px-5 py-3 border-b backdrop-blur-xl"
        style={{ background: "hsl(var(--background) / 0.95)", borderColor: "hsl(var(--border))" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover-elevate p-1 -ml-1 rounded-lg"
          data-testid="button-back-chapters"
        >
          <ArrowLeft className="w-4 h-4" />
          {book.name}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">{versionLabel}</span>
          <span className="text-sm font-bold text-foreground">Ch. {chapter}</span>
        </div>
      </div>

      {/* Chapter navigation */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={() => chapter > 1 && onChapterChange(chapter - 1)}
          disabled={chapter <= 1}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover-elevate p-2 rounded-lg"
          data-testid="button-prev-chapter"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <div className="text-center">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">{book.name}</h2>
          <p className="text-xs text-muted-foreground">Chapter {chapter}</p>
        </div>
        <button
          onClick={() => chapter < book.chapters && onChapterChange(chapter + 1)}
          disabled={chapter >= book.chapters}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover-elevate p-2 rounded-lg"
          data-testid="button-next-chapter"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Verses */}
      <div className="px-5 pt-2 pb-6">
        {isLoading ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className={`h-5 rounded ${i % 3 === 2 ? "w-3/5" : "w-full"}`} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Could not load this passage. Please check your connection.</p>
          </div>
        ) : (
          <div className="space-y-1 pt-2">
            {data?.verses.map((v) => (
              <p key={v.verse} className="text-base leading-8 text-foreground font-serif">
                <sup className="text-[10px] font-bold text-primary mr-1 font-sans not-italic">{v.verse}</sup>
                {v.text.trim()}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom chapter nav */}
      {!isLoading && !isError && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none px-5 z-20">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-full border pointer-events-auto shadow-md"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <button
              onClick={() => chapter > 1 && onChapterChange(chapter - 1)}
              disabled={chapter <= 1}
              className="flex items-center gap-1 text-sm font-semibold text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-xs text-muted-foreground px-2 border-x" style={{ borderColor: "hsl(var(--border))" }}>
              {chapter} / {book.chapters}
            </span>
            <button
              onClick={() => chapter < book.chapters && onChapterChange(chapter + 1)}
              disabled={chapter >= book.chapters}
              className="flex items-center gap-1 text-sm font-semibold text-foreground disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchView({
  version,
  onBack,
  onSelectPassage,
}: {
  version: string;
  onBack: () => void;
  onSelectPassage: (book: BibleBook, chapter: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError } = useQuery<BiblePassageResponse>({
    queryKey: ["bible-search", submitted, version],
    queryFn: () => fetchSearch(submitted, version),
    enabled: submitted.length > 2,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const handleSearch = () => {
    if (query.trim().length > 2) setSubmitted(query.trim());
  };

  const handleNavigate = () => {
    if (!data?.verses?.length) return;
    const bookName = data.verses[0].book_name;
    const chapter = data.verses[0].chapter;
    const book = ALL_BOOKS.find((b) => b.name.toLowerCase() === bookName.toLowerCase());
    if (book) onSelectPassage(book, chapter);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-[57px] z-20 px-5 py-3 border-b backdrop-blur-xl" style={{ background: "hsl(var(--background) / 0.95)", borderColor: "hsl(var(--border))" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 hover-elevate p-1 -ml-1 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Bible
        </button>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. John 3:16 or Romans 8:28"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              data-testid="input-bible-search"
            />
            {query && <button onClick={() => { setQuery(""); setSubmitted(""); }}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#ef4444" }}
            data-testid="button-bible-search-submit"
          >
            Go
          </button>
        </div>
      </div>

      <div className="px-5 pt-5">
        {!submitted && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground mb-1">Try these references</p>
            {["John 3:16", "Psalms 23:1-6", "Romans 8:28-39", "Philippians 4:13", "Jeremiah 29:11"].map((ref) => (
              <button
                key={ref}
                onClick={() => { setQuery(ref); setSubmitted(ref); }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl border bg-card text-left hover-elevate"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                <span className="text-sm text-foreground">{ref}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {submitted && isLoading && (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`h-5 rounded ${i % 3 === 2 ? "w-3/5" : "w-full"}`} />
            ))}
          </div>
        )}

        {submitted && isError && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Reference not found</p>
            <p className="text-xs text-muted-foreground">Try a format like "John 3:16" or "Psalm 23"</p>
          </div>
        )}

        {submitted && data && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{data.reference}</p>
              <button onClick={handleNavigate} className="text-xs font-medium text-primary hover-elevate px-2 py-1 rounded-lg">
                Open chapter →
              </button>
            </div>
            <div className="space-y-1">
              {data.verses.map((v) => (
                <p key={v.verse} className="text-base leading-8 text-foreground font-serif">
                  <sup className="text-[10px] font-bold text-primary mr-1 font-sans not-italic">{v.verse}</sup>
                  {v.text.trim()}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Bible Component ──────────────────────────────────────────────────────

export default function Bible() {
  const [version, setVersion] = useState("kjv");
  const [testament, setTestament] = useState<Testament>("OT");
  const [view, setView] = useState<View>("home");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const books = testament === "OT" ? OT_BOOKS : NT_BOOKS;

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    return books.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [books, searchQuery]);

  const openChapters = (book: BibleBook) => {
    setSelectedBook(book);
    setView("chapters");
    window.scrollTo(0, 0);
  };

  const openReading = (chapter: number) => {
    setSelectedChapter(chapter);
    setView("reading");
    window.scrollTo(0, 0);
  };

  const openPassage = (book: BibleBook, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setView("reading");
    window.scrollTo(0, 0);
  };

  // ── Reading view ──
  if (view === "reading" && selectedBook) {
    return (
      <ReadingView
        book={selectedBook}
        chapter={selectedChapter}
        version={version}
        onBack={() => { setView("chapters"); window.scrollTo(0, 0); }}
        onChapterChange={(ch) => { setSelectedChapter(ch); window.scrollTo(0, 0); }}
      />
    );
  }

  // ── Chapter selector ──
  if (view === "chapters" && selectedBook) {
    const chapterNums = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    return (
      <div className="min-h-screen bg-background pb-32">
        <div
          className="sticky top-[57px] z-20 flex items-center justify-between px-5 py-3 border-b backdrop-blur-xl"
          style={{ background: "hsl(var(--background) / 0.95)", borderColor: "hsl(var(--border))" }}
        >
          <button
            onClick={() => { setView("home"); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover-elevate p-1 -ml-1 rounded-lg"
            data-testid="button-back-books"
          >
            <ArrowLeft className="w-4 h-4" />
            Books
          </button>
          <VersionPicker selected={version} onSelect={setVersion} />
        </div>

        <div className="px-5 pt-5 pb-3">
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground">{selectedBook.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedBook.chapters} chapters</p>
        </div>

        <div className="px-5">
          <div className="grid grid-cols-5 gap-2">
            {chapterNums.map((ch) => (
              <button
                key={ch}
                onClick={() => openReading(ch)}
                className="aspect-square flex items-center justify-center rounded-xl text-sm font-semibold border hover-elevate"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                data-testid={`chapter-${ch}`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Search view ──
  if (view === "search") {
    return (
      <SearchView
        version={version}
        onBack={() => setView("home")}
        onSelectPassage={openPassage}
      />
    );
  }

  // ── Home view ──
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground leading-tight">Bible</h1>
            <p className="text-xs text-muted-foreground">Read God's Word</p>
          </div>
        </div>
        <VersionPicker selected={version} onSelect={setVersion} />
      </div>

      {/* Search bar */}
      <div className="px-5 mb-5">
        <button
          onClick={() => setView("search")}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border bg-card text-left hover-elevate"
          style={{ borderColor: "hsl(var(--border))" }}
          data-testid="button-open-search"
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">Search scripture — e.g. John 3:16</span>
        </button>
      </div>

      {/* Quick access */}
      <section className="mb-5">
        <div className="px-5 mb-3 flex items-center justify-between">
          <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Quick Access</h2>
        </div>
        <div className="px-5 grid grid-cols-2 gap-2">
          {[
            { book: NT_BOOKS.find((b) => b.name === "John")!, ch: 1, label: "John 1", sub: "The Word became flesh" },
            { book: OT_BOOKS.find((b) => b.name === "Psalms")!, ch: 23, label: "Psalm 23", sub: "The Lord is my shepherd" },
            { book: NT_BOOKS.find((b) => b.name === "Romans")!, ch: 8, label: "Romans 8", sub: "No condemnation in Christ" },
            { book: NT_BOOKS.find((b) => b.name === "Philippians")!, ch: 4, label: "Philippians 4", sub: "I can do all things" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => openPassage(item.book, item.ch)}
              className="flex flex-col items-start p-4 rounded-xl border bg-card text-left hover-elevate"
              style={{ borderColor: "hsl(var(--border))" }}
              data-testid={`quick-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <span className="text-sm font-bold text-foreground mb-0.5">{item.label}</span>
              <span className="text-[11px] text-muted-foreground leading-snug">{item.sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Testament tabs */}
      <section className="px-5 mb-4">
        <div className="flex items-center gap-1 p-1 rounded-xl border bg-card mb-4" style={{ borderColor: "hsl(var(--border))" }}>
          {(["OT", "NT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: testament === t ? "hsl(var(--primary))" : "transparent",
                color: testament === t ? "#fff" : "hsl(var(--muted-foreground))",
              }}
              data-testid={`tab-${t.toLowerCase()}`}
            >
              {t === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>

        {/* Book search within testament */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card mb-4" style={{ borderColor: "hsl(var(--border))" }}>
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${testament === "OT" ? "OT" : "NT"} books…`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            data-testid="input-filter-books"
          />
          {searchQuery && <button onClick={() => setSearchQuery("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>

        {/* Book list */}
        <div className="space-y-1">
          {filteredBooks.map((book) => (
            <button
              key={book.name}
              onClick={() => openChapters(book)}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border bg-card text-left hover-elevate"
              style={{ borderColor: "hsl(var(--border))" }}
              data-testid={`book-${book.name.toLowerCase().replace(/ /g, "-")}`}
            >
              <div>
                <span className="text-sm font-semibold text-foreground">{book.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{book.chapters} ch.</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
          {filteredBooks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No books found</p>
          )}
        </div>
      </section>
    </div>
  );
}
