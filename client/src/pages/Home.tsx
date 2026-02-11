import { usePodcasts } from "@/hooks/use-podcasts";
import { PodcastCard } from "@/components/PodcastCard";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: podcasts, isLoading, error } = usePodcasts();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">Failed to load podcasts. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Group podcasts by category/type for the UI
  const featured = podcasts?.slice(0, 1) || [];
  const trending = podcasts?.slice(1, 6) || [];
  const premium = podcasts?.filter(p => p.isPremium).slice(0, 5) || [];
  const learn = podcasts?.filter(p => p.category === "Education").slice(0, 5) || [];

  return (
    <div className="pb-24 pt-4 md:pt-24 space-y-10 container mx-auto px-4 md:px-6 max-w-7xl">
      
      {/* Featured Section */}
      <section>
        {featured.map(podcast => (
          <PodcastCard key={podcast.id} podcast={podcast} featured />
        ))}
      </section>

      {/* Categories / Sections */}
      <Section title="Trending Now" podcasts={trending} />
      <Section title="Premium Audiobooks" podcasts={premium} />
      <Section title="Learn Something New" podcasts={learn} />
      
      {/* CTA for unauthenticated users */}
      {!user && (
        <section className="mt-12 p-8 md:p-12 rounded-3xl bg-primary/10 border border-primary/20 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Unlock the Full Experience</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Sign in to access premium audiobooks, save your progress, and download episodes for offline listening.
          </p>
          <Button size="lg" className="rounded-full px-8 text-lg font-semibold shadow-lg shadow-primary/20" asChild>
            <a href="/api/login">Get Started Free</a>
          </Button>
        </section>
      )}
    </div>
  );
}

function Section({ title, podcasts }: { title: string, podcasts: any[] }) {
  if (!podcasts.length) return null;
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-display font-bold">{title}</h2>
        <Button variant="link" className="text-primary font-semibold">View All</Button>
      </div>
      
      <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-4 snap-x snap-mandatory no-scrollbar">
        {podcasts.map(podcast => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </div>
    </section>
  );
}
