import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Palette, User, LogOut, Home, Brush, ImageIcon } from "lucide-react";
import { useState } from "react";
import AuthForm from "./auth-form";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Palette className="text-primary-foreground text-lg" />
              </div>
              <span className="font-heading text-xl text-primary">Draw & Play</span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" data-testid="nav-home">
                <span className={`flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors ${location === "/" ? "text-foreground" : ""}`}>
                  <Home size={16} />
                  <span>Home</span>
                </span>
              </Link>
              <Link href="/create" data-testid="nav-create">
                <span className={`flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors ${location === "/create" ? "text-foreground" : ""}`}>
                  <Brush size={16} />
                  <span>Create</span>
                </span>
              </Link>
              <Link href="/gallery" data-testid="nav-gallery">
                <span className={`flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors ${location === "/gallery" ? "text-foreground" : ""}`}>
                  <ImageIcon size={16} />
                  <span>Gallery</span>
                </span>
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                      data-testid="profile-image"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline" data-testid="user-name">
                    {user?.firstName || 'Creator'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut size={16} />
                  <span className="ml-2 hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowAuth(true)}
                  data-testid="button-signin"
                >
                  <User size={16} />
                  <span className="ml-2 hidden sm:inline">Sign In</span>
                </Button>
                <Button
                  className="btn-coral"
                  onClick={() => setShowAuth(true)}
                  data-testid="button-start-creating"
                >
                  Start Creating
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Auth Modal */}
    {showAuth && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 z-10"
            onClick={() => setShowAuth(false)}
          >
            ✕
          </Button>
          <AuthForm />
        </div>
      </div>
    )}
    </>
  );
}
