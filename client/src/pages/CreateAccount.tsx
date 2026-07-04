import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUpSchema, type SignUp } from "@shared/schema";
import { Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import Logo from "@/components/Logo";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function CreateAccount() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "", turnstileToken: "" },
  });

  const password = form.watch("password");
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUp) => apiRequest("POST", "/api/auth/signup", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Account created!", description: "Welcome to Testifaith. Let's set up your profile." });
      setLocation("/onboarding");
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Sign up failed", description: error.message || "Please try again." });
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

          <div className="space-y-6 max-w-xs">
            <h2 className="font-['Space_Grotesk'] text-[2.4rem] font-bold text-white leading-[1.18]">
              Join a community<br />built on faith<br />and testimony.
            </h2>
            <div className="space-y-2">
              <p className="text-white/65 text-[1.1rem] leading-relaxed font-['Crimson_Pro'] italic">
                "And they overcame him by the blood of the Lamb, and by the word of their testimony."
              </p>
              <p className="text-[#ef4444] text-sm font-semibold tracking-wide">— Revelation 12:11</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Share", desc: "Your story of God's faithfulness" },
              { label: "Encourage", desc: "Say Amen and lift others up" },
              { label: "Grow", desc: "Track your faith expectations" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-[#ef4444] text-[10px]">✦</span>
                <span className="text-white/70 text-sm">
                  <strong className="text-white/90">{f.label}</strong> — {f.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background min-h-screen">
        <div className="w-full max-w-[420px]">

          <Link href="/">
            <button
              className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 hover-elevate rounded-lg p-1 -ml-1"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>

          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="font-['Space_Grotesk'] text-[1.9rem] font-bold text-foreground leading-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-2">Join the Testifaith community today</p>
          </div>

          {/* Google button */}
          <button
            onClick={() => { window.location.href = "/api/auth/google"; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold hover-elevate mb-6"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
            data-testid="button-google-signup"
          >
            <SiGoogle className="w-4 h-4" style={{ color: "#4285F4" }} />
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => signUpMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" autoComplete="given-name" className="h-12 rounded-xl" data-testid="input-first-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" autoComplete="family-name" className="h-12 rounded-xl" data-testid="input-last-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" className="h-12 rounded-xl" data-testid="input-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
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
                    { ok: hasMinLength, label: "8+ characters" },
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
                    <FormLabel className="text-sm font-medium">Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="h-12 rounded-xl pr-12"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover-elevate rounded p-0.5"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="turnstileToken"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TurnstileWidget onVerify={(token) => field.onChange(token)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl font-semibold"
                disabled={signUpMutation.isPending}
                data-testid="button-signup"
              >
                {signUpMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/signin">
              <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-signin">Sign in</span>
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-8 leading-relaxed opacity-60">
            By creating an account you agree to share testimonies that honour God and encourage others.
          </p>
        </div>
      </div>
    </div>
  );
}
