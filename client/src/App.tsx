import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import PodcastDetail from "@/pages/PodcastDetail";
import Subscription from "@/pages/Subscription";
import Search from "@/pages/Search";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/podcast/:id" component={PodcastDetail} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/search" component={Search} />
      {/* For demo, profile redirects to home or login logic handled in nav */}
      <Route path="/profile" component={Home} /> 
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground font-body selection:bg-primary/20 selection:text-primary">
          <Navigation />
          <main>
            <Router />
          </main>
          <AudioPlayer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
