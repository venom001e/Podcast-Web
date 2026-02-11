import type { Podcast } from "@shared/schema";
import { Link } from "wouter";
import { Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/lib/player-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface PodcastCardProps {
  podcast: Podcast;
  featured?: boolean;
}

export function PodcastCard({ podcast, featured = false }: PodcastCardProps) {
  const { play, currentPodcast, isPlaying } = usePlayerStore();
  const { user } = useAuth();
  
  // Logic: Premium content requires authentication + subscription logic (mocked here)
  // For demo: User needs to be authenticated to determine subscription status
  // Assuming a field 'isSubscribed' would exist on User, but currently using a mock check
  const isLocked = podcast.isPremium && !user; 
  
  const isCurrent = currentPodcast?.id === podcast.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLocked) return;
    play(podcast);
  };

  if (featured) {
    return (
      <Link href={`/podcast/${podcast.id}`} className="group relative block w-full h-full aspect-[4/3] sm:aspect-[2/1] overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gray-900">
           {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img 
            src={podcast.thumbnail} 
            alt={podcast.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 flex items-end justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold mb-3 uppercase tracking-wider">
              {podcast.isPremium && <Lock className="w-3 h-3" />}
              {podcast.category}
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-white font-display mb-2 leading-tight">
              {podcast.title}
            </h3>
            <p className="text-gray-200 line-clamp-2 md:text-lg max-w-xl">
              {podcast.description}
            </p>
          </div>
          
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-110 hover:bg-primary transition-all duration-300 hidden sm:flex items-center justify-center"
            onClick={handlePlay}
            disabled={isLocked}
          >
            {isCurrent && isPlaying ? (
              <span className="animate-pulse h-4 w-4 bg-white rounded-sm" /> 
            ) : isLocked ? (
              <Lock className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/podcast/${podcast.id}`} className="group flex flex-col gap-3 w-[160px] md:w-[220px] flex-none snap-start">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all">
        <img 
          src={podcast.thumbnail} 
          alt={podcast.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Play Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          (isCurrent || isLocked) && "opacity-100 bg-black/20"
        )}>
          <button
            onClick={handlePlay}
            disabled={isLocked}
            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all"
          >
            {isCurrent && isPlaying ? (
               <div className="flex gap-1 h-4 items-end">
                 <div className="w-1 bg-white animate-[bounce_1s_infinite]" />
                 <div className="w-1 bg-white animate-[bounce_1s_infinite_0.1s]" />
                 <div className="w-1 bg-white animate-[bounce_1s_infinite_0.2s]" />
               </div>
            ) : isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>
        </div>

        {podcast.isPremium && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div>
        <h4 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {podcast.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {podcast.category}
        </p>
      </div>
    </Link>
  );
}
