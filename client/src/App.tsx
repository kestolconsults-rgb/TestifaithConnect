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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  const { data: onboardingStatus } = useQuery<{ needsOnboarding: boolean }>({
    queryKey: ["/api/profile/onboarding-status"],
    enabled: isAuthenticated,
  });

  const needsOnboarding = isAuthenticated && onboardingStatus?.needsOnboarding;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/signin" component={SignIn} />
              <Route path="/create-account" component={CreateAccount} />
            </>
          ) : needsOnboarding ? (
            <>
              <Route path="/" component={Onboarding} />
              <Route path="/onboarding" component={Onboarding} />
              <Route path="/home" component={Home} />
              <Redirect to="/onboarding" />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/my-testimonies" component={MyTestimonies} />
              <Route path="/expectations" component={Expectations} />
              <Route path="/expectations/:id" component={ExpectationDetail} />
              <Route path="/profile" component={Profile} />
              <Route path="/profile/:userId" component={Profile} />
              <Route path="/settings" component={Settings} />
            </>
          )}
          <Route path="/post" component={PostTestimony} />
          <Route path="/testimonies" component={Testimonies} />
          <Route path="/categories" component={Categories} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/testimony/:id" component={TestimonyDetail} />
          <Route path="/search" component={SearchResults} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
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
