import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { queryClient } from "@/lib/queryClient";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing a token.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "This verification link is invalid or has expired.");
          return;
        }
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      })
      .catch(() => {
        setStatus("error");
        setMessage("An error occurred. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-muted-foreground" data-testid="icon-verifying" />
            <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Verifying your email…</h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" data-testid="icon-verified" />
            <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground mb-2">Email verified!</h1>
            <p className="text-muted-foreground text-sm mb-6">Your email has been confirmed. You're all set to share testimonies and encourage others.</p>
            <Link href="/home">
              <Button className="w-full h-12 rounded-xl font-semibold" data-testid="button-go-home">
                Continue to Testifaith
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" data-testid="icon-error" />
            <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground mb-2">Verification failed</h1>
            <p className="text-muted-foreground text-sm mb-6" data-testid="text-verify-error">{message}</p>
            <Link href="/settings">
              <Button variant="outline" className="w-full h-12 rounded-xl font-semibold" data-testid="button-go-settings">
                Go to Settings
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
