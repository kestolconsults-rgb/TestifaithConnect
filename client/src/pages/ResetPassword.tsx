import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, KeyRound, CheckCircle2, Loader2, Check } from "lucide-react";
import Logo from "@/components/Logo";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const password = form.watch("password");
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const mutation = useMutation({
    mutationFn: async (data: ResetPassword) => apiRequest("POST", "/api/auth/reset-password", data),
    onSuccess: () => {
      setDone(true);
      setTimeout(() => setLocation("/signin"), 3000);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Reset failed", description: error.message || "This link may have expired. Please request a new one." });
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Invalid reset link</h1>
          <p className="text-muted-foreground text-sm">This link is missing or invalid. Please request a new password reset.</p>
          <Link href="/forgot-password">
            <Button className="w-full h-12 rounded-xl" data-testid="button-request-new-link">Request new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel — desktop only ── */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #1a0606 55%, #0d0a0a 100%)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="relative" style={{ opacity: 0.055 }}>
            <div style={{ width: 480, height: 52, background: "white", borderRadius: 99 }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 52, height: 480, background: "white", borderRadius: 99 }} />
          </div>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-14 h-full">
          <Logo />
          <div className="space-y-5 max-w-xs">
            <h2 className="font-['Space_Grotesk'] text-[2.4rem] font-bold text-white leading-[1.18]">
              A fresh start is<br />always possible.
            </h2>
            <p className="text-white/65 text-base leading-relaxed">
              Set a strong new password and you'll be back sharing testimonies in no time.
            </p>
          </div>
          <div className="text-white/40 text-sm">
            Your faith community is waiting for you.
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background min-h-screen">
        <div className="w-full max-w-[420px]">

          <Link href="/signin">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 hover-elevate rounded-lg p-1 -ml-1" data-testid="link-back-signin">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign in
            </button>
          </Link>

          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          {done ? (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">Password updated!</h1>
                <p className="text-muted-foreground text-sm">Your password has been changed. Redirecting you to sign in…</p>
              </div>
              <Link href="/signin">
                <Button className="w-full h-12 rounded-xl" data-testid="button-go-to-signin">Sign in now</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <h1 className="font-['Space_Grotesk'] text-[1.9rem] font-bold text-foreground leading-tight">Set new password</h1>
                <p className="text-muted-foreground text-sm mt-2">Choose a strong password for your account.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
                  <input type="hidden" {...form.register("token")} />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">New password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a new password"
                              autoComplete="new-password"
                              className="h-12 rounded-xl pr-12"
                              data-testid="input-password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover-elevate rounded p-0.5"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {password.length > 0 && (
                    <div className="flex gap-4 text-xs">
                      {[
                        { ok: hasMinLength, label: "8+ chars" },
                        { ok: hasLetter, label: "Letter" },
                        { ok: hasNumber, label: "Number" },
                      ].map((r) => (
                        <div key={r.label} className={`flex items-center gap-1 ${r.ok ? "text-emerald-500" : "text-muted-foreground"}`}>
                          <Check className={`w-3 h-3 ${r.ok ? "opacity-100" : "opacity-30"}`} />
                          {r.label}
                        </div>
                      ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Confirm new password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Confirm your password"
                              autoComplete="new-password"
                              className="h-12 rounded-xl pr-12"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover-elevate rounded p-0.5"
                              onClick={() => setShowConfirm(!showConfirm)}
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl font-semibold"
                    disabled={mutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating password...</>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
