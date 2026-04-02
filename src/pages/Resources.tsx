import { useState } from "react";
import { ArrowRight, Loader2, Lock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

import resourceLarry from "@/assets/resource-larry-agent.jpg";
import resourceVideoSop from "@/assets/resource-video-sop.jpg";
import resourcePaperclip from "@/assets/resource-paperclip.jpg";
import resourceAgentCompanies from "@/assets/resource-agent-companies.jpg";

interface Resource {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  links: { label: string; url: string }[];
}

const resources: Resource[] = [
  {
    id: "larry-agent",
    title: "The Larry Agent",
    description:
      "The TikTok AI agent that got 2.3M+ views. Get the bot and the video walkthrough.",
    image: resourceLarry,
    tag: "AI Agent",
    links: [
      { label: "Video Walkthrough", url: "https://www.youtube.com/watch?v=O7ft9o-zbps" },
      { label: "Larry Bot on ClawHub", url: "https://clawhub.ai/OllieWazza/larry" },
    ],
  },
  {
    id: "video-sop",
    title: "Eric's Video Creation SOP",
    description:
      "The exact standard operating procedure for creating high-performing video content.",
    image: resourceVideoSop,
    tag: "SOP",
    links: [
      {
        label: "Open SOP Document",
        url: "https://docs.google.com/document/d/1t41ddoUGIeCCMbM5pMXCu7OT9O7DgttxmseMStQHGts/edit?tab=t.0",
      },
    ],
  },
  {
    id: "paperclip",
    title: "Paperclip AI Setup Guide",
    description:
      "Everything you need to get started with Paperclip — install guide, tips, and Cathryn's pro tricks.",
    image: resourcePaperclip,
    tag: "Dev Tool",
    links: [
      { label: "Paperclip Website", url: "https://paperclip.ing" },
      { label: "Helpful Article", url: "https://x.com/NickSpisak_/status/2033518072724705437" },
      { label: "What You Can Build", url: "https://x.com/NickSpisak_/status/2034635430700679445" },
      { label: "Follow Cathryn on X", url: "https://x.com/cathrynlavery" },
    ],
  },
  {
    id: "agent-companies",
    title: "How Agent Companies Are Built",
    description:
      "Research on YC W26 vs FeltSense clones, plus a deep dive into agent-built companies.",
    image: resourceAgentCompanies,
    tag: "Research",
    links: [
      { label: "YC W26 vs FeltSense Clones", url: "https://n.thenextnewthing.ai/yc-w26-vs-feltsense" },
      {
        label: "Agent-built Companies",
        url: "https://n.thenextnewthing.ai/Agent-Built-Companies-Featured-on-The-Next-New-Thing-335940d92a1f80de82e1f7ae2acc12cd",
      },
    ],
  },
];

export default function Resources() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "unlocked">("idle");

  const triggerConfetti = () => {
    const end = Date.now() + 2500;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const { error } = await supabase.functions.invoke("subscribe-beehiiv", {
        body: { email, utm_medium: "resource-center" },
      });
      if (error) throw error;
      setStatus("unlocked");
      triggerConfetti();
    } catch {
      setStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const unlocked = status === "unlocked";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-4 animate-fade-in">
            The Next New Thing
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Resource Vault
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Every playbook, SOP, tool, and research piece we've ever given away — all in one place.
          </p>

          {!unlocked && (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto animate-slide-up"
            >
              <p className="text-sm text-muted-foreground mb-3">
                Enter your email to unlock all resources instantly.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={status === "loading"}
                  className="flex-1 px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Unlock
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {unlocked && (
            <p className="text-primary font-semibold text-lg animate-fade-in">
              🎉 You're in! All resources are unlocked below.
            </p>
          )}
        </div>
      </header>

      {/* Resource Grid */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          {resources.map((r, i) => (
            <ResourceCard
              key={r.id}
              resource={r}
              unlocked={unlocked}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      {!unlocked && (
        <section className="border-t border-border py-16 text-center px-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Ready to unlock everything?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            One email. Instant access to every resource above — plus future drops.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
          >
            Enter your email ↑
          </button>
        </section>
      )}
    </div>
  );
}

function ResourceCard({
  resource,
  unlocked,
  index,
}: {
  resource: Resource;
  unlocked: boolean;
  index: number;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden">
        <img
          src={resource.image}
          alt={resource.title}
          loading="lazy"
          width={640}
          height={512}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            !unlocked ? "blur-[2px] brightness-75" : ""
          }`}
        />
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-primary-foreground bg-foreground/60 px-4 py-2 rounded-full text-sm font-medium">
              <Lock className="w-4 h-4" />
              Locked
            </div>
          </div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground">
          {resource.tag}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-xl font-semibold text-foreground mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {resource.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

        {unlocked ? (
          <div className="flex flex-wrap gap-2">
            {resource.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              >
                {link.label}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Enter your email above to access
          </p>
        )}
      </div>
    </div>
  );
}
