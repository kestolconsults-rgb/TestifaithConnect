import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";

export default function PushNotificationPrompt() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { supported, hasVapidKey, permission, isSubscribed, isLoading, isReady, error, subscribe } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !user) {
      const previousUserId = sessionStorage.getItem("testifaith-push-prompt-user");
      if (previousUserId) {
        sessionStorage.removeItem(`testifaith-push-prompted:${previousUserId}`);
        sessionStorage.removeItem("testifaith-push-prompt-user");
      }
      setIsVisible(false);
      return;
    }

    if (!isReady || !supported || isSubscribed) {
      setIsVisible(false);
      return;
    }

    const promptKey = `testifaith-push-prompted:${user.id}`;
    sessionStorage.setItem("testifaith-push-prompt-user", String(user.id));
    if (sessionStorage.getItem(promptKey)) return;

    sessionStorage.setItem(promptKey, "1");
    setIsVisible(true);
  }, [isAuthLoading, isAuthenticated, user, isReady, supported, isSubscribed]);

  if (!isVisible || !isAuthenticated || isSubscribed) return null;

  const dismiss = () => setIsVisible(false);
  const permissionDenied = permission === "denied";

  return (
    <section
      aria-label="Notification settings"
      className="fixed inset-x-3 top-3 z-[70] mx-auto max-w-xl rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[min(32rem,calc(100vw-3rem))] sm:p-5"
      role="dialog"
      aria-live="polite"
    >
      <button
        aria-label="Dismiss notification prompt"
        className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        onClick={dismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-7">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {isSubscribed ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {permissionDenied ? "Turn notifications back on" : "Keep the encouragement close"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {permissionDenied
              ? "Notifications are blocked for this site in your browser. Allow them in your browser’s site settings to receive updates."
              : "Get a gentle nudge when someone encourages you or shares a reminder of God’s faithfulness."}
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive" role="status">{error}</p>}

      {!permissionDenied && !hasVapidKey && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          Notifications are temporarily unavailable. Please try again later.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button onClick={dismiss} variant="ghost" size="sm">
          Not now
        </Button>
        {!permissionDenied && hasVapidKey && (
          <Button disabled={isLoading} onClick={() => void subscribe()} size="sm">
            <Bell className="h-4 w-4" />
            {isLoading ? "Enabling…" : "Enable notifications"}
          </Button>
        )}
      </div>
    </section>
  );
}
