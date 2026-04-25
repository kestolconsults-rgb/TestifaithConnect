import { Bell, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

export default function MobileHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 backdrop-blur-xl border-b"
      style={{ background: "hsl(var(--background) / 0.92)", borderColor: "hsl(var(--border))" }}
    >
      <Logo />

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-full border bg-card"
          style={{ borderColor: "hsl(var(--border))" }}
          data-testid="button-notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2"
            style={{ borderColor: "hsl(var(--background))" }}
          />
        </button>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="w-9 h-9 rounded-full"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </Button>
      </div>
    </header>
  );
}
