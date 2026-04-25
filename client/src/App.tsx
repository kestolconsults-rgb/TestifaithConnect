import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Community from "@/pages/Community";
import Bible from "@/pages/Bible";
import Testimonies from "@/pages/Testimonies";
import PostTestimony from "@/pages/PostTestimony";
import MyTestimonies from "@/pages/MyTestimonies";
import Categories from "@/pages/Categories";
import CategoryPage from "@/pages/CategoryPage";
import TestimonyDetail from "@/pages/TestimonyDetail";
import SearchResults from "@/pages/SearchResults";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import SignIn from "@/pages/SignIn";
import CreateAccount from "@/pages/CreateAccount";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Expectations from "@/pages/Expectations";
import ExpectationDetail from "@/pages/ExpectationDetail";
import MobileHeader from "@/components/MobileHeader";
import BottomTabBar from "@/components/BottomTabBar";

// Full-screen wrapper for auth flow pages (no nav chrome)
function AuthFlow({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b bg-background/92">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>
      <div className="flex-1 px-5 pt-5 space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 flex items-center justify-around px-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: onboardingStatus } = useQuery<{ needsOnboarding: boolean }>({
    queryKey: ["/api/profile/onboarding-status"],
    enabled: isAuthenticated,
  });

  // Register service worker for push notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Admin — completely separate
  if (location.startsWith("/admin")) return <Admin />;

  if (isLoading) return <AppSkeleton />;

  // Full-screen auth flow pages — no nav chrome
  if (location === "/signin" || location === "/create-account" || location === "/forgot-password" || location.startsWith("/reset-password")) {
    return (
      <AuthFlow>
        <Switch>
          <Route path="/signin" component={SignIn} />
          <Route path="/create-account" component={CreateAccount} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
        </Switch>
      </AuthFlow>
    );
  }

  // Onboarding for new authenticated users — full-screen
  if (isAuthenticated && onboardingStatus?.needsOnboarding) {
    return (
      <AuthFlow>
        <Switch>
          <Route path="/onboarding" component={Onboarding} />
          <Route component={() => <Redirect to="/onboarding" />} />
        </Switch>
      </AuthFlow>
    );
  }

  // Main app — same mobile layout for everyone
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />
      <main className="flex-1">
        <Switch>
          {/* ── Public routes — accessible to everyone ── */}
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/community" component={Community} />
          <Route path="/bible" component={Bible} />
          <Route path="/testimonies" component={Testimonies} />
          <Route path="/categories" component={Categories} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/testimony/:id" component={TestimonyDetail} />
          <Route path="/search" component={SearchResults} />
          <Route path="/profile/:userId" component={Profile} />

          {/* ── Auth-only routes — redirect guests to sign-in ── */}
          <Route path="/post">
            {isAuthenticated ? <PostTestimony /> : <Redirect to="/signin" />}
          </Route>
          <Route path="/my-testimonies">
            {isAuthenticated ? <MyTestimonies /> : <Redirect to="/signin" />}
          </Route>
          <Route path="/profile">
            {isAuthenticated ? <Profile /> : <Redirect to="/signin" />}
          </Route>
          <Route path="/settings">
            {isAuthenticated ? <Settings /> : <Redirect to="/signin" />}
          </Route>
          <Route path="/expectations">
            {isAuthenticated ? <Expectations /> : <Redirect to="/signin" />}
          </Route>
          <Route path="/expectations/:id">
            {isAuthenticated ? <ExpectationDetail /> : <Redirect to="/signin" />}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomTabBar />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
