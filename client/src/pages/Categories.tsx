import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, CATEGORY_META, CATEGORY_ACCENT_COLORS } from "@/lib/constants";
import type { Category } from "@/lib/constants";

export default function Categories() {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Compact header */}
      <div className="px-5 pt-6 pb-5">
        <h1
          className="text-2xl font-bold text-foreground mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          data-testid="text-page-title"
        >
          Browse by Category
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore testimonies across different areas of faith and life
        </p>
      </div>

      {/* Category grid */}
      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((category, index) => {
          const meta = CATEGORY_META[category as Category];
          const accent = CATEGORY_ACCENT_COLORS[category as Category];
          const Icon = meta.icon;

          const isLastOdd = index === CATEGORIES.length - 1 && CATEGORIES.length % 2 === 1;
          return (
            <Link key={category} href={`/category/${category.toLowerCase()}`} className={isLastOdd ? "sm:col-span-2 sm:max-w-[calc(50%-6px)] sm:mx-auto sm:w-full" : ""}>
              <div
                className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover-elevate active-elevate-2 cursor-pointer transition-all"
                data-testid={`card-category-${category.toLowerCase()}`}
              >
                {/* Icon bubble */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18` }}
                >
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-foreground text-sm mb-0.5"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {category}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-50" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
