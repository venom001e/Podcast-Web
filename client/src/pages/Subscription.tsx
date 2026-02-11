import { useSubscribe } from "@/hooks/use-podcasts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Subscription() {
  const { mutate: subscribe, isPending } = useSubscribe();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubscribe = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }
    
    subscribe(undefined, {
      onSuccess: () => {
        toast({
          title: "Welcome to Premium!",
          description: "You have successfully subscribed.",
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Subscription Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-wider text-sm uppercase">Kuku FM Premium</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            Unlock Unlimited Audio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience audiobooks and premium podcasts without limits. Ad-free listening, offline downloads, and exclusive content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-3xl border border-border bg-card/50">
            <h3 className="text-2xl font-bold font-display mb-2">Free</h3>
            <div className="text-3xl font-bold mb-6">$0 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                   <Check className="w-3 h-3" />
                </div>
                <span>Access to free podcasts</span>
              </li>
              <li className="flex items-center gap-3">
                 <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                   <Check className="w-3 h-3" />
                </div>
                <span>Standard audio quality</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                 <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                   <XIcon />
                </div>
                <span>Ad-free experience</span>
              </li>
            </ul>
            
            <Button variant="outline" className="w-full rounded-xl h-12" disabled>Current Plan</Button>
          </div>

          {/* Premium Plan */}
          <div className="relative p-8 rounded-3xl border-2 border-primary bg-card shadow-2xl shadow-primary/10 scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              Recommended
            </div>
            
            <h3 className="text-2xl font-bold font-display mb-2">Premium</h3>
            <div className="text-3xl font-bold mb-6">$9.99 <span className="text-base font-normal text-muted-foreground">/ month</span></div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                   <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="font-medium">All Premium Content</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                   <Shield className="w-3 h-3 fill-current" />
                </div>
                <span className="font-medium">Ad-free Experience</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                   <Zap className="w-3 h-3 fill-current" />
                </div>
                <span className="font-medium">High Definition Audio</span>
              </li>
            </ul>
            
            <Button 
              className="w-full rounded-xl h-12 text-lg font-bold shadow-lg shadow-primary/25" 
              onClick={handleSubscribe}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
              {user ? "Upgrade Now" : "Sign in to Upgrade"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">Cancel anytime. 7-day money-back guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className="w-3 h-3"
    >
      <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
    </svg>
  )
}
