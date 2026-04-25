import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronRight, ChevronLeft, ArrowLeft, X, Check, Lock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

// ── Bible data ──────────────────────────────────────────────────────────────

interface BibleVersion {
  id: string;
  name: string;
  full: string;
  source: "free" | "premium";
}

export const FREE_VERSIONS: BibleVersion[] = [
  { id: "kjv",   name: "KJV",   full: "King James Version",          source: "free" },
  { id: "web",   name: "WEB",   full: "World English Bible",          source: "free" },
  { id: "asv",   name: "ASV",   full: "American Standard Version",    source: "free" },
  { id: "ylt",   name: "YLT",   full: "Young's Literal Translation",  source: "free" },
  { id: "darby", name: "DARBY", full: "Darby Translation",            source: "free" },
  { id: "bbe",   name: "BBE",   full: "Basic English Bible",          source: "free" },
];

export const PREMIUM_VERSION_ABBREVS = ["NKJV", "MSG", "AMP", "TPT"] as const;
export const PREMIUM_VERSION_LABELS: Record<string, string> = {
  NKJV: "New King James Version",
  MSG:  "The Message",
  AMP:  "Amplified Bible",
  TPT:  "The Passion Translation",
};

interface BibleBook {
  name: string;
  chapters: number;
  apiName: string;   // bible-api.com key
  usfmId: string;   // api.bible USFM book ID
}

const OT_BOOKS: BibleBook[] = [
  { name: "Genesis",          chapters: 50,  apiName: "genesis",          usfmId: "GEN" },
  { name: "Exodus",           chapters: 40,  apiName: "exodus",           usfmId: "EXO" },
  { name: "Leviticus",        chapters: 27,  apiName: "leviticus",        usfmId: "LEV" },
  { name: "Numbers",          chapters: 36,  apiName: "numbers",          usfmId: "NUM" },
  { name: "Deuteronomy",      chapters: 34,  apiName: "deuteronomy",      usfmId: "DEU" },
  { name: "Joshua",           chapters: 24,  apiName: "joshua",           usfmId: "JOS" },
  { name: "Judges",           chapters: 21,  apiName: "judges",           usfmId: "JDG" },
  { name: "Ruth",             chapters: 4,   apiName: "ruth",             usfmId: "RUT" },
  { name: "1 Samuel",         chapters: 31,  apiName: "1+samuel",         usfmId: "1SA" },
  { name: "2 Samuel",         chapters: 24,  apiName: "2+samuel",         usfmId: "2SA" },
  { name: "1 Kings",          chapters: 22,  apiName: "1+kings",          usfmId: "1KI" },
  { name: "2 Kings",          chapters: 25,  apiName: "2+kings",          usfmId: "2KI" },
  { name: "1 Chronicles",     chapters: 29,  apiName: "1+chronicles",     usfmId: "1CH" },
  { name: "2 Chronicles",     chapters: 36,  apiName: "2+chronicles",     usfmId: "2CH" },
  { name: "Ezra",             chapters: 10,  apiName: "ezra",             usfmId: "EZR" },
  { name: "Nehemiah",         chapters: 13,  apiName: "nehemiah",         usfmId: "NEH" },
  { name: "Esther",           chapters: 10,  apiName: "esther",           usfmId: "EST" },
  { name: "Job",              chapters: 42,  apiName: "job",              usfmId: "JOB" },
  { name: "Psalms",           chapters: 150, apiName: "psalm",            usfmId: "PSA" },
  { name: "Proverbs",         chapters: 31,  apiName: "proverbs",         usfmId: "PRO" },
  { name: "Ecclesiastes",     chapters: 12,  apiName: "ecclesiastes",     usfmId: "ECC" },
  { name: "Song of Solomon",  chapters: 8,   apiName: "song+of+solomon",  usfmId: "SNG" },
  { name: "Isaiah",           chapters: 66,  apiName: "isaiah",           usfmId: "ISA" },
  { name: "Jeremiah",         chapters: 52,  apiName: "jeremiah",         usfmId: "JER" },
  { name: "Lamentations",     chapters: 5,   apiName: "lamentations",     usfmId: "LAM" },
  { name: "Ezekiel",          chapters: 48,  apiName: "ezekiel",          usfmId: "EZK" },
  { name: "Daniel",           chapters: 12,  apiName: "daniel",           usfmId: "DAN" },
  { name: "Hosea",            chapters: 14,  apiName: "hosea",            usfmId: "HOS" },
  { name: "Joel",             chapters: 3,   apiName: "joel",             usfmId: "JOL" },
  { name: "Amos",             chapters: 9,   apiName: "amos",             usfmId: "AMO" },
  { name: "Obadiah",          chapters: 1,   apiName: "obadiah",          usfmId: "OBA" },
  { name: "Jonah",            chapters: 4,   apiName: "jonah",            usfmId: "JON" },
  { name: "Micah",            chapters: 7,   apiName: "micah",            usfmId: "MIC" },
  { name: "Nahum",            chapters: 3,   apiName: "nahum",            usfmId: "NAM" },
  { name: "Habakkuk",         chapters: 3,   apiName: "habakkuk",         usfmId: "HAB" },
  { name: "Zephaniah",        chapters: 3,   apiName: "zephaniah",        usfmId: "ZEP" },
  { name: "Haggai",           chapters: 2,   apiName: "haggai",           usfmId: "HAG" },
  { name: "Zechariah",        chapters: 14,  apiName: "zechariah",        usfmId: "ZEC" },
  { name: "Malachi",          chapters: 4,   apiName: "malachi",          usfmId: "MAL" },
];

const NT_BOOKS: BibleBook[] = [
  { name: "Matthew",          chapters: 28, apiName: "matthew",          usfmId: "MAT" },
  { name: "Mark",             chapters: 16, apiName: "mark",             usfmId: "MRK" },
  { name: "Luke",             chapters: 24, apiName: "luke",             usfmId: "LUK" },
  { name: "John",             chapters: 21, apiName: "john",             usfmId: "JHN" },
  { name: "Acts",             chapters: 28, apiName: "acts",             usfmId: "ACT" },
  { name: "Romans",           chapters: 16, apiName: "romans",           usfmId: "ROM" },
  { name: "1 Corinthians",    chapters: 16, apiName: "1+corinthians",    usfmId: "1CO" },
  { name: "2 Corinthians",    chapters: 13, apiName: "2+corinthians",    usfmId: "2CO" },
  { name: "Galatians",        chapters: 6,  apiName: "galatians",        usfmId: "GAL" },
  { name: "Ephesians",        chapters: 6,  apiName: "ephesians",        usfmId: "EPH" },
  { name: "Philippians",      chapters: 4,  apiName: "philippians",      usfmId: "PHP" },
  { name: "Colossians",       chapters: 4,  apiName: "colossians",       usfmId: "COL" },
  { name: "1 Thessalonians",  chapters: 5,  apiName: "1+thessalonians",  usfmId: "1TH" },
  { name: "2 Thessalonians",  chapters: 3,  apiName: "2+thessalonians",  usfmId: "2TH" },
  { name: "1 Timothy",        chapters: 6,  apiName: "1+timothy",        usfmId: "1TI" },
  { name: "2 Timothy",        chapters: 4,  apiName: "2+timothy",        usfmId: "2TI" },
  { name: "Titus",            chapters: 3,  apiName: "titus",            usfmId: "TIT" },
  { name: "Philemon",         chapters: 1,  apiName: "philemon",         usfmId: "PHM" },
  { name: "Hebrews",          chapters: 13, apiName: "hebrews",          usfmId: "HEB" },
  { name: "James",            chapters: 5,  apiName: "james",            usfmId: "JAS" },
  { name: "1 Peter",          chapters: 5,  apiName: "1+peter",          usfmId: "1PE" },
  { name: "2 Peter",          chapters: 3,  apiName: "2+peter",          usfmId: "2PE" },
  { name: "1 John",           chapters: 5,  apiName: "1+john",           usfmId: "1JO" },
  { name: "2 John",           chapters: 1,  apiName: "2+john",           usfmId: "2JO" },
  { name: "3 John",           chapters: 1,  apiName: "3+john",           usfmId: "3JO" },
  { name: "Jude",             chapters: 1,  apiName: "jude",             usfmId: "JUD" },
  { name: "Revelation",       chapters: 22, apiName: "revelation",       usfmId: "REV" },
];

const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS];

interface BibleVerse {
  verse: number;
  text: string;
}

// ── API helpers ──────────────────────────────────────────────────────────────

async function fetchFreeChapter(apiName: string, chapter: number, version: string): Promise<BibleVerse[]> {
  const url = `https://bible-api.com/${apiName}+${chapter}?translation=${version}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load passage");
  const data = await res.json();
  return (data.verses ?? []).map((v: any) => ({ verse: v.verse, text: v.text?.trim() ?? "" }));
}

async function fetchPremiumChapter(bibleId: string, usfmId: string, chapter: number): Promise<BibleVerse[]> {
  const chapterId = `${usfmId}.${chapter}`;
  const res = await fetch(`/api/bible/premium/chapter?bibleId=${encodeURIComponent(bibleId)}&chapterId=${encodeURIComponent(chapterId)}`);
  if (!res.ok) throw new Error("Could not load passage");
  const data = await res.json();
  return data.verses ?? [];
}

async function fetchFreeSearch(reference: string, version: string) {
  const url = `https://bible-api.com/${encodeURIComponent(reference.trim())}?translation=${version}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reference not found");
  return res.json();
}

// ── Version Picker ───────────────────────────────────────────────────────────

interface PremiumVersionInfo {
  id: string;
  abbreviation: string;
  name: string;
}

function VersionPicker({
  selectedId,
  selectedAbbrev,
  onSelectFree,
  onSelectPremium,
  premiumVersions,
  hasKey,
  keyInvalid,
}: {
  selectedId: string;
  selectedAbbrev: string;
  onSelectFree: (id: string) => void;
  onSelectPremium: (v: PremiumVersionInfo) => void;
  premiumVersions: PremiumVersionInfo[];
  hasKey: boolean;
  keyInvalid: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold hover-elevate"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
        data-testid="button-version-picker"
      >
        <BookOpen className="w-3.5 h-3.5 text-primary" />
        {selectedAbbrev}
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-lg overflow-hidden min-w-[240px] max-h-[80vh] overflow-y-auto"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            {/* Free versions */}
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Free versions</p>
            {FREE_VERSIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => { onSelectFree(v.id); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover-elevate border-b last:border-0"
                style={{ borderColor: "hsl(var(--border))" }}
                data-testid={`version-option-${v.id}`}
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.full}</p>
                </div>
                {selectedId === v.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
              </button>
            ))}

            {/* Premium versions */}
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Premium versions {!hasKey && "· API key required"}{keyInvalid && "· Key invalid"}
            </p>
            {PREMIUM_VERSION_ABBREVS.map((abbrev) => {
              const found = premiumVersions.find((v) => v.abbreviation === abbrev);
              const isSelected = selectedAbbrev === abbrev;
              const locked = !hasKey || keyInvalid || !found;
              return (
                <button
                  key={abbrev}
                  onClick={() => {
                    if (!locked && found) { onSelectPremium(found); setOpen(false); }
                    else setOpen(false);
                  }}
                  disabled={locked}
                  className="flex items-center justify-between w-full px-4 py-3 text-left border-b last:border-0 disabled:opacity-50"
                  style={{ borderColor: "hsl(var(--border))" }}
                  data-testid={`version-option-${abbrev.toLowerCase()}`}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {abbrev}
                      {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{PREMIUM_VERSION_LABELS[abbrev]}</p>
                  </div>
                  {isSelected && !locked && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              );
            })}

            {/* Setup link if no key or key invalid */}
            {(!hasKey || keyInvalid) && (
              <div className="px-4 py-3 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                {keyInvalid ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">The API key appears to be invalid or not yet activated. Make sure you've copied the key from your api.bible app dashboard.</p>
                    <a
                      href="https://scripture.api.bible/faq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary"
                      onClick={() => setOpen(false)}
                    >
                      api.bible help <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">Get a free API key at api.bible to unlock these versions.</p>
                    <a
                      href="https://scripture.api.bible/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Get free key <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Verse list renderer (shared) ─────────────────────────────────────────────

function VerseList({ verses, isLoading, isError }: { verses: BibleVerse[]; isLoading: boolean; isError: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <Skeleton key={i} className={`h-5 rounded ${i % 3 === 2 ? "w-3/5" : "w-full"}`} />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Could not load this passage. Please check your connection.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1 pt-2">
      {verses.map((v) => (
        <p key={v.verse} className="text-base leading-8 text-foreground font-serif">
          <sup className="text-[10px] font-bold text-primary mr-1 font-sans not-italic">{v.verse}</sup>
          {v.text}
        </p>
      ))}
    </div>
  );
}

// ── Reading view ─────────────────────────────────────────────────────────────

function ReadingView({
  book,
  chapter,
  versionId,
  versionAbbrev,
  premiumBibleId,
  onBack,
  onChapterChange,
}: {
  book: BibleBook;
  chapter: number;
  versionId: string;
  versionAbbrev: string;
  premiumBibleId: string | null;
  onBack: () => void;
  onChapterChange: (ch: number) => void;
}) {
  const isPremium = !!premiumBibleId;

  const { data: verses = [], isLoading, isError } = useQuery<BibleVerse[]>({
    queryKey: ["bible", book.usfmId, chapter, versionId, premiumBibleId],
    queryFn: () =>
      isPremium
        ? fetchPremiumChapter(premiumBibleId!, book.usfmId, chapter)
        : fetchFreeChapter(book.apiName, chapter, versionId),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky sub-header */}
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
          <span className="text-xs text-muted-foreground font-medium">{versionAbbrev}</span>
          <span className="text-sm font-bold text-foreground">Ch. {chapter}</span>
        </div>
      </div>

      {/* Chapter nav top */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          onClick={() => chapter > 1 && onChapterChange(chapter - 1)}
          disabled={chapter <= 1}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover-elevate p-2 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <div className="text-center">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">{book.name}</h2>
          <p className="text-xs text-muted-foreground">Chapter {chapter}</p>
        </div>
        <button
          onClick={() => chapter < book.chapters && onChapterChange(chapter + 1)}
          disabled={chapter >= book.chapters}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground disabled:opacity-30 hover-elevate p-2 rounded-lg"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pb-6">
        <VerseList verses={verses} isLoading={isLoading} isError={isError} />
      </div>

      {/* Floating chapter nav pill */}
      {!isLoading && !isError && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-5 z-20 pointer-events-none">
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

// ── Search view ──────────────────────────────────────────────────────────────

function SearchView({
  versionId,
  versionAbbrev,
  onBack,
  onSelectPassage,
}: {
  versionId: string;
  versionAbbrev: string;
  onBack: () => void;
  onSelectPassage: (book: BibleBook, chapter: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bible-search", submitted, versionId],
    queryFn: () => fetchFreeSearch(submitted, versionId),
    enabled: submitted.length > 2,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const handleSearch = () => { if (query.trim().length > 2) setSubmitted(query.trim()); };

  const handleNavigate = () => {
    if (!data?.verses?.length) return;
    const bookName = data.verses[0].book_name;
    const chapter = data.verses[0].chapter;
    const book = ALL_BOOKS.find((b) => b.name.toLowerCase() === bookName.toLowerCase());
    if (book) onSelectPassage(book, chapter);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div
        className="sticky top-[57px] z-20 px-5 py-3 border-b backdrop-blur-xl"
        style={{ background: "hsl(var(--background) / 0.95)", borderColor: "hsl(var(--border))" }}
      >
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3 hover-elevate p-1 -ml-1 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Bible
        </button>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card" style={{ borderColor: "hsl(var(--border))" }}>
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
        <p className="text-xs text-muted-foreground mt-2">Searching in {versionAbbrev}</p>
      </div>

      <div className="px-5 pt-5">
        {!submitted && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground mb-2">Popular references</p>
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
            <p className="text-xs text-muted-foreground">Try "John 3:16", "Psalm 23", or "Romans 8:28"</p>
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
              {(data.verses ?? []).map((v: any) => (
                <p key={v.verse} className="text-base leading-8 text-foreground font-serif">
                  <sup className="text-[10px] font-bold text-primary mr-1 font-sans not-italic">{v.verse}</sup>
                  {v.text?.trim()}
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

type View = "home" | "chapters" | "reading" | "search";
type Testament = "OT" | "NT";

export default function Bible() {
  // Version state: track by id (for free) and abbrev + optional premiumBibleId
  const [versionId, setVersionId] = useState("kjv");           // free version id or abbrev
  const [versionAbbrev, setVersionAbbrev] = useState("KJV");   // display label
  const [premiumBibleId, setPremiumBibleId] = useState<string | null>(null);

  const [testament, setTestament] = useState<Testament>("OT");
  const [view, setView] = useState<View>("home");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if API.Bible key is configured
  const { data: premiumStatus } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/bible/premium/status"],
    staleTime: 5 * 60 * 1000,
  });
  const hasKey = premiumStatus?.configured ?? false;

  // Fetch premium version IDs (only if key configured)
  const { data: premiumVersionsData, isError: premiumVersionsError } = useQuery<{ versions: PremiumVersionInfo[] }>({
    queryKey: ["/api/bible/premium/versions"],
    enabled: hasKey,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  const premiumVersions = premiumVersionsData?.versions ?? [];
  const premiumKeyInvalid = hasKey && premiumVersionsError;

  const books = testament === "OT" ? OT_BOOKS : NT_BOOKS;
  const filteredBooks = useMemo(
    () => (!searchQuery ? books : books.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))),
    [books, searchQuery]
  );

  const handleSelectFreeVersion = (id: string) => {
    const v = FREE_VERSIONS.find((v) => v.id === id)!;
    setVersionId(id);
    setVersionAbbrev(v.name);
    setPremiumBibleId(null);
  };

  const handleSelectPremiumVersion = (v: PremiumVersionInfo) => {
    setVersionId(v.abbreviation.toLowerCase());
    setVersionAbbrev(v.abbreviation);
    setPremiumBibleId(v.id);
  };

  const openChapters = (book: BibleBook) => { setSelectedBook(book); setView("chapters"); window.scrollTo(0, 0); };
  const openReading = (ch: number) => { setSelectedChapter(ch); setView("reading"); window.scrollTo(0, 0); };
  const openPassage = (book: BibleBook, ch: number) => {
    setSelectedBook(book); setSelectedChapter(ch); setView("reading"); window.scrollTo(0, 0);
  };

  const pickerProps = {
    selectedId: versionId,
    selectedAbbrev: versionAbbrev,
    onSelectFree: handleSelectFreeVersion,
    onSelectPremium: handleSelectPremiumVersion,
    premiumVersions,
    hasKey,
    keyInvalid: !!premiumKeyInvalid,
  };

  // ── Reading view ──
  if (view === "reading" && selectedBook) {
    return (
      <ReadingView
        book={selectedBook}
        chapter={selectedChapter}
        versionId={versionId}
        versionAbbrev={versionAbbrev}
        premiumBibleId={premiumBibleId}
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
            <ArrowLeft className="w-4 h-4" /> Books
          </button>
          <VersionPicker {...pickerProps} />
        </div>

        <div className="px-5 pt-5 pb-3">
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground">{selectedBook.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{selectedBook.chapters} chapters · {versionAbbrev}</p>
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
        versionId={versionId}
        versionAbbrev={versionAbbrev}
        onBack={() => setView("home")}
        onSelectPassage={openPassage}
      />
    );
  }

  // ── Home view ──
  return (
    <div className="min-h-screen bg-background pb-28">
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
        <VersionPicker {...pickerProps} />
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
        <div className="px-5 mb-3">
          <h2 className="font-['Space_Grotesk'] text-base font-semibold text-foreground">Quick Access</h2>
        </div>
        <div className="px-5 grid grid-cols-2 gap-2">
          {[
            { book: NT_BOOKS.find((b) => b.name === "John")!,        ch: 1,  label: "John 1",        sub: "The Word became flesh" },
            { book: OT_BOOKS.find((b) => b.name === "Psalms")!,      ch: 23, label: "Psalm 23",      sub: "The Lord is my shepherd" },
            { book: NT_BOOKS.find((b) => b.name === "Romans")!,      ch: 8,  label: "Romans 8",      sub: "No condemnation in Christ" },
            { book: NT_BOOKS.find((b) => b.name === "Philippians")!, ch: 4,  label: "Philippians 4", sub: "I can do all things" },
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

      {/* Testament tabs + book list */}
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

        {/* Filter input */}
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
