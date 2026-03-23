import { useState } from "react";
import { ArrowRight, Loader2, ExternalLink, Terminal, Copy, Check } from "lucide-react";
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

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx paperclipai onboard --yes");
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "success") {
    return (
      <div className="mt-4 animate-fade-in">
        <p className="text-foreground font-bold text-lg mb-5">
          Here are your resources 🎉
        </p>

        <div className="space-y-3">
          {/* Link 1 */}
          <a
            href="https://paperclip.ing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-chat-border hover:border-primary/50 hover:bg-muted transition-all duration-200 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">1</span>
            <span className="text-foreground group-hover:text-primary transition-colors">Go to Paperclip's website</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
          </a>

          {/* Link 2 - Terminal command */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-chat-border">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">2</span>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm mb-1.5">Paste this into your terminal to install Paperclip:</p>
              <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-chat-border font-mono text-sm">
                <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
                <code className="text-foreground truncate">npx paperclipai onboard --yes</code>
                <button onClick={handleCopy} className="ml-auto shrink-0 p-1 rounded hover:bg-muted transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />}
                </button>
              </div>
            </div>
          </div>

          {/* Link 3 */}
          <a
            href="https://x.com/NickSpisak_/status/2033518072724705437"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-chat-border hover:border-primary/50 hover:bg-muted transition-all duration-200 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">3</span>
            <span className="text-foreground group-hover:text-primary transition-colors">Helpful article on Paperclip</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
          </a>

          {/* Link 4 */}
          <a
            href="https://x.com/NickSpisak_/status/2034635430700679445"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-chat-border hover:border-primary/50 hover:bg-muted transition-all duration-200 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">4</span>
            <span className="text-foreground group-hover:text-primary transition-colors">Suggestions for what you can do with Paperclip</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
          </a>

          {/* Link 5 */}
          <a
            href="https://x.com/cathrynlavery"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-chat-border hover:border-primary/50 hover:bg-muted transition-all duration-200 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">5</span>
            <span className="text-foreground group-hover:text-primary transition-colors">Follow Cathryn on X for more AI agent tool tips</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-foreground mb-4">
        Where should I send the resources?
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
