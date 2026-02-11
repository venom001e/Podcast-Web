import { usePodcast } from "@/hooks/use-podcasts";
import { useRoute } from "wouter";
import { Loader2, Play, Lock, Share2, Heart, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/player-store";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PodcastDetail() {
  const [, params] = useRoute("/podcast/:id");
  const id = parseInt(params?.id || "0");
  const { data: podcast, isLoading } = usePodcast(id);
  const { play, currentPodcast, isPlaying } = usePlayerStore();
  const { user } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-display font-bold mb-2">Podcast Not Found</h2>
        <Button asChild variant="outline">
          <a href="/">Go Home</a>
        </Button>
      </div>
    );
  }

  const isLocked = podcast.isPremium && !user;
  const isCurrent = currentPodcast?.id === podcast.id;

  const handlePlay = () => {
    if (isLocked) {
      toast({
        title: "Premium Content",
        description: "Please sign in and subscribe to listen to this episode.",
        variant: "destructive",
      });
      return;
    }
    play(podcast);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header with Blurred Background */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${podcast.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Art */}
          <div className="shrink-0 w-48 md:w-72 aspect-square rounded-2xl overflow-hidden shadow-2xl mx-auto md:mx-0 ring-1 ring-border/20">
             <img 
              src={podcast.thumbnail} 
              alt={podcast.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 text-center md:text-left pt-4 md:pt-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 border border-primary/20">
                {podcast.isPremium && <Lock className="w-3 h-3" />}
                {podcast.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
                {podcast.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
               <div className="flex items-center gap-1.5">
                 <Clock className="w-4 h-4" />
                 <span>45 min</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <Calendar className="w-4 h-4" />
                 <span>{podcast.createdAt ? format(new Date(podcast.createdAt), 'MMM d, yyyy') : 'Recently'}</span>
               </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                onClick={handlePlay}
              >
                {isCurrent && isPlaying ? (
                  <>
                    <span className="animate-pulse h-2 w-2 bg-white rounded-full mr-1"/> Playing
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Unlock Episode
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current mr-2" /> Play Episode
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description & Details */}
        <div className="mt-12 md:mt-16 max-w-3xl">
          <h3 className="text-xl font-display font-bold mb-4">About this Episode</h3>
          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed">
            <p>{podcast.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
