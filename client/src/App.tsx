import { Switch, Route, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
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
import Expectations from "@/pages/Expectations";
import ExpectationDetail from "@/pages/ExpectationDetail";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileHeader from "@/components/MobileHeader";
import BottomTabBar from "@/components/BottomTabBar";

function AuthenticatedApp() {
  const { data: onboardingStatus } = useQuery<{ needsOnboarding: boolean }>({
    queryKey: ["/api/profile/onboarding-status"],
  });

  const needsOnboarding = onboardingStatus?.needsOnboarding;

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/onboarding" component={Onboarding} />
          <Route component={() => <Redirect to="/onboarding" />} />
        </Switch>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/community" component={Community} />
          <Route path="/bible" component={Bible} />
          <Route path="/testimonies" component={Testimonies} />
          <Route path="/categories" component={Categories} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/testimony/:id" component={TestimonyDetail} />
          <Route path="/search" component={SearchResults} />
          <Route path="/post" component={PostTestimony} />
          <Route path="/my-testimonies" component={MyTestimonies} />
          <Route path="/expectations" component={Expectations} />
          <Route path="/expectations/:id" component={ExpectationDetail} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/:userId" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomTabBar />
    </div>
  );
}

function UnauthenticatedApp() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signin" component={SignIn} />
          <Route path="/create-account" component={CreateAccount} />
          <Route path="/testimony/:id" component={TestimonyDetail} />
          <Route path="/testimonies" component={Testimonies} />
          <Route path="/categories" component={Categories} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/search" component={SearchResults} />
          <Route component={() => <Redirect to="/" />} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b bg-background/92">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>
      {/* Content skeleton */}
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
      {/* Bottom tab skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 flex items-center justify-around px-6">
        {[1,2,3,4,5].map((i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Register service worker for push notifications
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failure is non-critical
      });
    }
  }, []);

  // Admin route — completely separate, no mobile chrome
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return <Admin />;
  }

  if (isLoading) {
    return <AppSkeleton />;
  }

  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
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
