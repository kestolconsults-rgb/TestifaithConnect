import { Link, useLocation } from "wouter";
import { Home, Users, Plus, BookOpen, User, Feather, Sparkles, HelpCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const TABS = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Community", icon: Users, href: "/community" },
  { label: "fab", icon: Plus, href: "" },
  { label: "Bible", icon: BookOpen, href: "/bible" },
  { label: "Profile", icon: User, href: "/profile" },
] as const;

const AUTH_FAB_ACTIONS = [
  {
    icon: Feather,
    label: "Journal Your Faith",
    sublabel: "Log what God has done — privately",
    color: "#ef4444",
    href: "/post",
  },
  {
    icon: Sparkles,
    label: "Get Encouraged",
    sublabel: "Receive a word for today",
    color: "#f59e0b",
    href: "/bible",
  },
  {
    icon: HelpCircle,
    label: "Ask a Question",
    sublabel: "Search the community for answers",
    color: "#8b5cf6",
    href: "/community",
  },
] as const;

const GUEST_FAB_ACTIONS = [
  {
    icon: Feather,
    label: "Start Your Faith Journal",
    sublabel: "Sign in to record what God has done",
    color: "#ef4444",
    href: "/signin",
  },
  {
    icon: Sparkles,
    label: "Get Encouraged",
    sublabel: "Receive a word for today",
    color: "#f59e0b",
    href: "/bible",
  },
  {
    icon: LogIn,
    label: "Sign In or Create Account",
    sublabel: "Unlock your full faith community",
    color: "#3b82f6",
    href: "/signin",
  },
] as const;

export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const [fabOpen, setFabOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const FAB_ACTIONS = isAuthenticated ? AUTH_FAB_ACTIONS : GUEST_FAB_ACTIONS;

  const isActive = (href: string) => {
    if (href === "/home") return location === "/" || location === "/home";
    return location.startsWith(href);
  };

  const handleTabClick = (href: string) => {
    setFabOpen(false);
    // Profile tab for guests → sign in
    if (href === "/profile" && !isAuthenticated) {
      navigate("/signin");
      return;
    }
    navigate(href);
  };

  return (
    <>
      {/* Scrim behind FAB actions */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* FAB Action Cards */}
      {fabOpen && (
        <div className="fixed bottom-28 left-0 right-0 z-50 flex flex-col gap-3 px-5 max-w-lg mx-auto">
          {FAB_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => { setFabOpen(false); navigate(action.href); }}
                className="flex items-center gap-4 rounded-2xl p-4 border text-left w-full hover-elevate"
                style={{
                  background: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                }}
                data-testid={`fab-action-${action.label.toLowerCase().replace(/ /g, "-")}`}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: action.color + "1a", color: action.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl"
        style={{ background: "hsl(var(--background) / 0.92)", borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto px-2" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          {TABS.map((tab) => {
            if (tab.label === "fab") {
              return (
                <div key="fab" className="relative -top-5 flex-shrink-0">
                  <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white border-4 transition-transform duration-200"
                    style={{
                      background: fabOpen ? "#dc2626" : "#ef4444",
                      borderColor: "hsl(var(--background))",
                      boxShadow: "0 8px 24px -4px rgba(239,68,68,0.5)",
                      transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                    data-testid="button-fab"
                    aria-label="Quick actions"
                  >
                    <Plus className="w-7 h-7" />
                  </button>
                </div>
              );
            }

            const Icon = tab.icon;
            const active = tab.href === "/profile"
              ? (isAuthenticated && isActive(tab.href))
              : isActive(tab.href);

            // Profile tab for non-auth shows sign-in indicator
            const isProfileGuest = tab.href === "/profile" && !isAuthenticated;

            return (
              <button
                key={tab.label}
                className="flex flex-col items-center gap-1 py-3 px-3 min-w-[56px] transition-colors relative"
                style={{ color: active ? "#ef4444" : "hsl(var(--muted-foreground))" }}
                onClick={() => handleTabClick(tab.href)}
                data-testid={`tab-${tab.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">
                  {isProfileGuest ? "Sign In" : tab.label}
                </span>
                {/* Dot indicator for guest profile tab */}
                {isProfileGuest && (
                  <span
                    className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
