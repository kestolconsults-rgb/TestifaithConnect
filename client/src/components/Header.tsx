import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Search, Plus, User, Settings, Target } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-transparent backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home" className="group">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href={isAuthenticated ? "/home" : "/"} data-testid="link-nav-home">
              <Button variant="ghost" className="font-medium rounded-xl">
                Home
              </Button>
            </Link>
            <Link href="/testimonies" data-testid="link-nav-testimonies">
              <Button variant="ghost" className="font-medium rounded-xl">
                Testimonies
              </Button>
            </Link>
            <Link href="/categories" data-testid="link-nav-categories">
              <Button variant="ghost" className="font-medium rounded-xl">
                Categories
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/my-testimonies" data-testid="link-nav-my-testimonies">
                  <Button variant="ghost" className="font-medium rounded-xl">
                    My Testimonies
                  </Button>
                </Link>
                <Link href="/expectations" data-testid="link-nav-expectations">
                  <Button variant="ghost" className="font-medium rounded-xl">
                    Faith Expectations
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {!isLoading && (
              <>
                {/* Search Button */}
                <Link href="/search" data-testid="link-nav-search" className="hidden md:block">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Search className="h-5 w-5" />
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    {/* Share Testimony Button */}
                    <Link href="/post" className="hidden md:block">
                      <Button 
                        className="rounded-xl font-semibold shadow-md hover:shadow-lg transition-all" 
                        data-testid="button-post-testimony"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </Link>

                    {/* User Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:ring-2 hover:ring-primary/20 transition-all" data-testid="button-user-menu">
                          <Avatar className="h-9 w-9 border-2 border-primary/10">
                            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                              {getInitials(user?.firstName, user?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-xl border-border/50">
                        <DropdownMenuLabel className="pb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary/10">
                              <AvatarImage src={user?.profileImageUrl || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-lg">
                                {getInitials(user?.firstName, user?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-semibold leading-tight">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground leading-tight mt-1">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profile">
                          <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-profile">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">My Profile</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/my-testimonies">
                          <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-my-testimonies">
                            <span className="font-medium">My Testimonies</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/expectations">
                          <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-expectations">
                            <Target className="h-4 w-4 mr-2" />
                            <span className="font-medium">Faith Expectations</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/post">
                          <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-post-testimony">
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="font-medium">Share Testimony</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href="/settings">
                          <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-settings">
                            <Settings className="h-4 w-4 mr-2" />
                            <span className="font-medium">Settings</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a href="/api/logout" className="rounded-lg cursor-pointer text-destructive focus:text-destructive" data-testid="button-logout">
                            <span className="font-medium">Log Out</span>
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Link href="/signin">
                    <Button className="rounded-xl font-semibold shadow-md hover:shadow-lg transition-all" data-testid="button-login">
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-6 border-t">
            <div className="flex flex-col gap-2">
              <Link href={isAuthenticated ? "/home" : "/"} onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-home">
                <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                  Home
                </Button>
              </Link>
              <Link href="/testimonies" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-testimonies">
                <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                  Testimonies
                </Button>
              </Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-categories">
                <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                  Categories
                </Button>
              </Link>
              <Link href="/search" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-search">
                <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                  <Search className="h-4 w-4 mr-3" />
                  Search
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-profile">
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </Button>
                  </Link>
                  <Link href="/my-testimonies" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-my-testimonies">
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                      My Testimonies
                    </Button>
                  </Link>
                  <Link href="/expectations" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-expectations">
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                      <Target className="h-4 w-4 mr-3" />
                      Faith Expectations
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-settings">
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-base">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                  </Link>
                  <div className="pt-4">
                    <Link href="/post" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-xl font-semibold shadow-md" data-testid="mobile-button-post-testimony">
                        <Plus className="h-4 w-4 mr-2" />
                        Share Testimony
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
