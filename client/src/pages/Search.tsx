import { useState } from "react";
import { usePodcasts } from "@/hooks/use-podcasts";
import { PodcastCard } from "@/components/PodcastCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Needs implementation or simple logic below

export default function Search() {
  const [query, setQuery] = useState("");
  // Simple debounce logic replacement
  // For production, create a proper hook, but here just pass query directly for responsiveness
  // or use simple timeout effect.
  
  const { data: podcasts, isLoading } = usePodcasts({ search: query });

  return (
    <div className="pb-24 pt-4 md:pt-24 space-y-6 container mx-auto px-4 md:px-6 max-w-7xl">
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input 
          className="pl-12 h-14 rounded-2xl text-lg bg-card shadow-sm border-2 focus-visible:ring-primary/20" 
          placeholder="Search for podcasts, audiobooks..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold font-display mb-6">
          {query ? "Search Results" : "Browse All"}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {podcasts.map(podcast => (
              <div key={podcast.id} className="w-full">
                {/* Reusing PodcastCard in vertical layout mode by wrapping or modifying it, 
                    but PodcastCard handles styling well enough. 
                    We might want to adjust the card component to be responsive width here.
                */}
                <div className="w-full">
                  <PodcastCard podcast={podcast} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No podcasts found matching "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
