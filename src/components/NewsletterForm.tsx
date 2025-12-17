import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    // Simulate subscription
    setTimeout(() => {
      setStatus("success");
      toast.success("You're subscribed!", {
        description: "Check your inbox for a confirmation email.",
      });
    }, 1500);
  };

  return (
    <div className="mt-4">
      <p className="text-foreground mb-4">
        Of course! Enter your email below to get weekly AI insights, curated resources, and exclusive content delivered straight to your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="animate-slide-up opacity-0" style={{ animationDelay: "200ms" }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "success"}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-chat-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={status !== "idle" || !email}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === "success" ? (
              <>
                <Check className="w-5 h-5" />
                Subscribed
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
      
      {status === "success" && (
        <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
          🎉 Welcome to the community! You'll receive your first newsletter soon.
        </p>
      )}
    </div>
  );
}
