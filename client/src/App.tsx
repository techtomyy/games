import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Create from "./pages/create";
import Gallery from "./pages/gallery";
import GamePage from "./pages/game";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('Router state:', { isAuthenticated, isLoading });

  if (isLoading) {
    // Show loading state while checking auth
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (!isAuthenticated) {
    // Unauthenticated users see landing page
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated users - show all routes
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/home" />
      </Route>
      <Route path="/home" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/game/:id" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
