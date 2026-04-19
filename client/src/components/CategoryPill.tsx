import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Category } from "@/lib/constants";

interface CategoryPillProps {
  category: Category;
  count?: number;
}

export default function CategoryPill({ category, count }: CategoryPillProps) {
  return (
    <Link href={`/category/${category.toLowerCase()}`}>
      <Badge 
        className={`${CATEGORY_COLORS[category]} px-4 py-2 text-sm hover-elevate active-elevate-2 cursor-pointer border`}
        data-testid={`pill-category-${category.toLowerCase()}`}
      >
        {category}
        {count !== undefined && count > 0 && (
          <span className="ml-1 opacity-70">({count})</span>
        )}
      </Badge>
    </Link>
  );
}
