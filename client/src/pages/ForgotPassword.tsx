import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { forgotPasswordSchema, type ForgotPassword } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPassword) => apiRequest("POST", "/api/auth/forgot-password", data),
    onSuccess: (_, variables) => {
      setSentEmail(variables.email);
      setSent(true);
    },
  });

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
          <Logo onDark />
          <div className="space-y-5 max-w-xs">
            <h2 className="font-['Space_Grotesk'] text-[2.4rem] font-bold text-white leading-[1.18]">
              It happens to<br />the best of us.
            </h2>
            <p className="text-white/65 text-base leading-relaxed">
              We'll send a secure link to your email so you can set a new password and get back to your faith community.
            </p>
          </div>
          <div className="text-white/40 text-sm">
            Remember your password?{" "}
            <Link href="/signin">
              <span className="text-[#ef4444] font-medium hover:underline cursor-pointer">Sign in</span>
            </Link>
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

          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-foreground mb-2">Check your inbox</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If an account exists for <strong className="text-foreground">{sentEmail}</strong>, we've sent a password reset link. It expires in 1 hour.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => { setSent(false); form.reset(); }}
                  data-testid="button-try-again"
                >
                  try again
                </button>
                .
              </p>
              <Link href="/signin">
                <Button variant="outline" className="w-full h-12 rounded-xl mt-2" data-testid="button-back-to-signin">
                  Back to Sign in
                </Button>
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h1 className="font-['Space_Grotesk'] text-[1.9rem] font-bold text-foreground leading-tight">Forgot password?</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-12 rounded-xl"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl font-semibold"
                    disabled={mutation.isPending}
                    data-testid="button-send-reset"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <Link href="/signin">
                  <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-signin">Sign in</span>
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
