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
import { signInSchema, type SignIn } from "@shared/schema";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import Logo from "@/components/Logo";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignIn) => apiRequest("POST", "/api/auth/signin", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/home");
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Sign in failed", description: error.message || "Please check your email and password." });
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel — desktop only ── */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #1a0606 55%, #0d0a0a 100%)" }}
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ background: "radial-gradient(ellipse 70% 50% at 30% 60%, rgba(239,68,68,0.07) 0%, transparent 70%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 h-full">
          <Logo />

          <div className="space-y-6 max-w-xs">
            <h2 className="font-['Space_Grotesk'] text-[2.4rem] font-bold text-white leading-[1.18]">
              Record what God<br />has done —<br />privately or<br />with the world.
            </h2>
            <div className="space-y-2">
              <p className="text-white/65 text-[1.1rem] leading-relaxed font-['Crimson_Pro'] italic">
                "They triumphed over him by the blood of the Lamb and by the word of their testimony."
              </p>
              <p className="text-[#ef4444] text-sm font-semibold tracking-wide">— Revelation 12:11</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Healing", desc: "Miraculous stories of restoration" },
              { label: "Breakthrough", desc: "The impossible made possible" },
              { label: "Finance", desc: "God's provision and debt freedom" },
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

          {/* Back link */}
          <Link href="/">
            <button
              className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 hover-elevate rounded-lg p-1 -ml-1"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>

          {/* Logo — mobile only */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="font-['Space_Grotesk'] text-[1.9rem] font-bold text-foreground leading-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to your Testifaith account</p>
          </div>

          {/* Google button */}
          <button
            onClick={() => { window.location.href = "/api/auth/google"; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold hover-elevate mb-6"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
            data-testid="button-google-signin"
          >
            <SiGoogle className="w-4 h-4" style={{ color: "#4285F4" }} />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => signInMutation.mutate(data))} className="space-y-5">
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-1.5">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <Link href="/forgot-password">
                        <span
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                          data-testid="link-forgot-password"
                        >
                          Forgot password?
                        </span>
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
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

              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl font-semibold"
                disabled={signInMutation.isPending}
                data-testid="button-signin"
              >
                {signInMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/create-account">
              <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-create-account">
                Create one
              </span>
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-8 leading-relaxed opacity-60">
            Your private entries are only ever visible to you. Public entries encourage the community.
          </p>
        </div>
      </div>
    </div>
  );
}
