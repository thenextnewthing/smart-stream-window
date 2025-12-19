import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-beehiiv', {
        body: { email }
      });

      if (error) throw error;

      setStatus("success");
      triggerConfetti();
    } catch (error: any) {
      console.error("Subscription error:", error);
      setStatus("idle");
      toast.error("Subscription failed", {
        description: "Please try again later.",
      });
    }
  };

  if (status === "success") {
    return (
      <div className="mt-4">
        <p className="text-foreground mb-4">
          I like how you think. Where should I send AI builders' playbooks?
        </p>
        <p className="text-foreground font-bold text-lg animate-fade-in">
          Done. We'll start emailing you playbooks based on our interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-foreground mb-4">
        I like how you think. Where should I send AI builders' playbooks?
      </p>
      
      <form onSubmit={handleSubmit} className="animate-slide-up opacity-0" style={{ animationDelay: "200ms" }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading"}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-chat-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Get it
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
