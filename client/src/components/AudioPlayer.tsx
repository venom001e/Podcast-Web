import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, X, 
  Maximize2, Minimize2, Volume2, VolumeX, ListMusic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AudioPlayer() {
  const { 
    currentPodcast, isPlaying, isExpanded, volume,
    pause, resume, toggleExpand, close, setVolume 
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => pause());
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentPodcast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentPodcast) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentPodcast.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => pause()}
      />

      <AnimatePresence>
        {isExpanded ? (
          // Full Screen Player
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-6 md:p-12"
          >
            <div className="flex justify-between items-center mb-8">
              <Button variant="ghost" size="icon" onClick={toggleExpand}>
                <Minimize2 className="h-6 w-6" />
              </Button>
              <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Now Playing</span>
              <Button variant="ghost" size="icon" onClick={close}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8">
              <motion.div 
                className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-primary/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <img 
                  src={currentPodcast.thumbnail} 
                  alt={currentPodcast.title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <div className="w-full text-center space-y-2">
                <h2 className="text-3xl font-bold font-display">{currentPodcast.title}</h2>
                <p className="text-lg text-muted-foreground">{currentPodcast.category}</p>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between text-sm font-medium text-muted-foreground tabular-nums">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-center gap-8">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }}>
                  <SkipBack className="h-8 w-8" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10 fill-current" />
                  ) : (
                    <Play className="h-10 w-10 fill-current ml-1" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10; }}>
                  <SkipForward className="h-8 w-8" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Mini Player
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-3 md:p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <div 
                className="relative h-12 w-12 md:h-14 md:w-14 rounded-lg overflow-hidden shrink-0 cursor-pointer group"
                onClick={toggleExpand}
              >
                <img 
                  src={currentPodcast.thumbnail} 
                  alt={currentPodcast.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Maximize2 className="text-white w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={toggleExpand}>
                <h4 className="font-semibold truncate leading-tight">{currentPodcast.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentPodcast.category}</p>
              </div>

              <div className="hidden md:flex flex-col w-1/3 max-w-xs gap-2">
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="h-1.5"
                />
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full text-muted-foreground hover:text-foreground hidden sm:flex"
                  onClick={close}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Mobile Progress Bar at absolute bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted md:hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
