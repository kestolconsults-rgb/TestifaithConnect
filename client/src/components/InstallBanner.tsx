import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session or already installed
    if (sessionStorage.getItem("install-banner-dismissed")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the app has time to load first
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("install-banner-dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80"
      data-testid="install-banner"
    >
      <div
        className="rounded-2xl p-4 shadow-2xl border"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="flex items-start gap-3">
          {/* App icon */}
          <img
            src="/favicon.png"
            alt="Testifaith"
            className="w-12 h-12 rounded-xl flex-shrink-0 object-cover"
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">Add Testifaith to your home screen</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get quick access and a better experience
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover-elevate rounded-lg p-0.5 flex-shrink-0"
            data-testid="button-dismiss-install"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 gap-1.5 rounded-xl"
            data-testid="button-install-app"
          >
            <Download className="w-3.5 h-3.5" />
            Install app
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="rounded-xl"
            data-testid="button-not-now"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
