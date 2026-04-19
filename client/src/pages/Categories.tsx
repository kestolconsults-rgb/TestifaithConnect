import { CATEGORIES } from "@/lib/constants";
import CategoryPill from "@/components/CategoryPill";

export default function Categories() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'League Spartan', sans-serif" }} data-testid="text-page-title">
              Browse by Category
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore testimonies across different areas of faith and life
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex justify-center">
                <CategoryPill category={category} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
