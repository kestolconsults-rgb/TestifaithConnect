import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";

export default function SearchBar() {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);

  // Initialize state from URL params on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q') || '';
    const categories = params.get('categories');
    const start = params.get('startDate');
    const end = params.get('endDate');

    setQuery(q);
    setSelectedCategories(categories ? categories.split(',') : []);
    setStartDate(start ? new Date(start) : undefined);
    setEndDate(end ? new Date(end) : undefined);
  }, [location]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const buildParams = (q: string, cats: string[], start?: Date, end?: Date) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cats.length > 0) params.set("categories", cats.join(","));
    if (start) params.set("startDate", start.toISOString());
    if (end) params.set("endDate", end.toISOString());
    return params;
  };

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) return;
    setLocation(`/search?${buildParams(query, selectedCategories, startDate, endDate).toString()}`);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setLocation(`/search?${buildParams(value, selectedCategories, startDate, endDate).toString()}`);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimerRef.current);
      handleSearch();
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasFilters = selectedCategories.length > 0 || startDate || endDate;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search-query"
            type="text"
            placeholder="Search testimonies..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              data-testid="button-toggle-filters"
              variant="outline"
              size="icon"
              className={hasFilters ? "border-primary" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasFilters && (
                  <Button
                    data-testid="button-clear-filters"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Categories</h5>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        data-testid={`checkbox-category-${category.toLowerCase()}`}
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Date Range</h5>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="button-select-start-date"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        data-testid="button-select-end-date"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button data-testid="button-search" onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}
