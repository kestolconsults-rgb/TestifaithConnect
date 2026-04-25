import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Admin route — completely separate, no mobile chrome
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return <Admin />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
