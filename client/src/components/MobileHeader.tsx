import { Bell, BellOff, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "wouter";

export default function MobileHeader() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { supported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [, navigate] = useLocation();

  const showBellDot = isAuthenticated && supported && !isSubscribed && permission !== "denied";
  const bellActive = isAuthenticated && isSubscribed;

  const handleBellClick = async () => {
    if (!isAuthenticated || !supported) return;
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 backdrop-blur-xl border-b"
      style={{ background: "hsl(var(--background) / 0.92)", borderColor: "hsl(var(--border))" }}
    >
      <Logo />

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        {isAuthenticated && supported && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
                  bellActive
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card"
                }`}
                style={{ borderColor: bellActive ? undefined : "hsl(var(--border))" }}
                onClick={handleBellClick}
                disabled={isLoading || permission === "denied"}
                data-testid="button-notifications"
                aria-label={isSubscribed ? "Disable notifications" : "Enable notifications"}
              >
                {permission === "denied" ? (
                  <BellOff className="w-4.5 h-4.5 text-muted-foreground" />
                ) : (
                  <Bell className={`w-[18px] h-[18px] ${bellActive ? "text-primary" : "text-muted-foreground"}`} />
                )}
                {showBellDot && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 animate-pulse"
                    style={{ borderColor: "hsl(var(--background))" }}
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-[200px] text-center">
              {permission === "denied"
                ? "Notifications are blocked — enable them in your browser settings"
                : isSubscribed
                ? "Notifications on — tap to turn off"
                : "Turn on notifications to hear when someone Amens or Encourages your testimony"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Non-authenticated bell — tap to sign in */}
        {!isAuthenticated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-full border bg-card hover-elevate"
                style={{ borderColor: "hsl(var(--border))" }}
                onClick={() => navigate("/signin")}
                data-testid="button-notifications"
                aria-label="Sign in to enable notifications"
              >
                <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Sign in to enable notifications
            </TooltipContent>
          </Tooltip>
        )}

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
