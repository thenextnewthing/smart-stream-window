import { useState, useEffect } from "react";
import { ArrowUp, Loader2, Lock, ExternalLink, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChatMessage } from "@/components/ChatMessage";

interface ResourceLink {
  label: string;
  url: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  thumbnail_url: string | null;
  links: ResourceLink[];
  display_order: number;
}

export default function Resources() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "unlocked">("idle");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [intentOpen, setIntentOpen] = useState(false);
  const [intentText, setIntentText] = useState("");
  const [intentSaving, setIntentSaving] = useState(false);
  const [convStep, setConvStep] = useState<"asking" | "guessing" | "wrong" | "done">("asking");
  const [userQuery, setUserQuery] = useState("");
  const [guess, setGuess] = useState<ResourceItem | null>(null);

  const saveIntent = async (
    response: string,
    matchedTitle: string | null,
    confirmed: boolean | null,
  ) => {
    const params = new URLSearchParams(window.location.search);
    await supabase.from("resource_intents").insert({
      email: email || null,
      response: response
        ? `${response}${matchedTitle ? ` | matched: ${matchedTitle}${confirmed === null ? "" : confirmed ? " ✓" : " ✗"}` : ""}`
        : null,
      page_path: window.location.pathname,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      referrer: document.referrer || null,
    });
  };

  const findBestMatch = (query: string): ResourceItem | null => {
    const q = query.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    if (q.length === 0) return null;
    let best: { item: ResourceItem; score: number } | null = null;
    for (const r of resources) {
      const haystack = `${r.title} ${r.description ?? ""} ${r.tag ?? ""}`.toLowerCase();
      let score = 0;
      for (const word of q) if (haystack.includes(word)) score += 1;
      if (!best || score > best.score) best = { item: r, score };
    }
    return best && best.score > 0 ? best.item : null;
  };

  const handleIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentText.trim()) return;
    setIntentSaving(true);
    const q = intentText.trim();
    setUserQuery(q);
    const match = findBestMatch(q);
    setGuess(match);
    try {
      await saveIntent(q, match?.title ?? null, null);
    } catch {}
    setIntentSaving(false);
    setIntentText("");
    setConvStep(match ? "guessing" : "wrong");
  };

  const confirmGuess = async () => {
    try {
      await saveIntent(userQuery, guess?.title ?? null, true);
    } catch {}
    setConvStep("done");
  };

  const rejectGuess = async () => {
    try {
      await saveIntent(userQuery, guess?.title ?? null, false);
    } catch {}
    setConvStep("wrong");
  };

  const handleIntentSkip = () => {
    setIntentOpen(false);
    setTimeout(() => {
      setConvStep("asking");
      setUserQuery("");
      setGuess(null);
    }, 300);
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("resource_center_items")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });
      if (data) {
        setResources(
          data.map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            tag: d.tag,
            thumbnail_url: d.thumbnail_url,
            links: (d.links as ResourceLink[]) || [],
            display_order: d.display_order,
          }))
        );
      }
      setLoadingResources(false);
    };
    load();
  }, []);

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
      setTimeout(() => setIntentOpen(true), 600);
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
            <form onSubmit={handleSubmit} className="max-w-md mx-auto animate-slide-up">
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
        {loadingResources ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {resources.map((r, i) => (
              <ResourceCard key={r.id} resource={r} unlocked={unlocked} index={i} />
            ))}
          </div>
        )}
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

      <Dialog open={intentOpen} onOpenChange={(o) => !o && handleIntentSkip()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-chat-border">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-chat-border bg-card">
            <span className="text-xl">🧨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">The Next New Thing</p>
              <p className="text-xs text-muted-foreground leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                online
              </p>
            </div>
          </div>

          <div className="px-4 py-5 space-y-1 max-h-[55vh] overflow-y-auto">
            <ChatMessage role="assistant" delay={0}>
              <p className="text-foreground">🎉 You're in. Vault unlocked.</p>
            </ChatMessage>
            <ChatMessage role="assistant" delay={900}>
              <p className="text-foreground">Tell me what you're looking for and I'll take you straight to it.</p>
            </ChatMessage>
            <ChatMessage role="assistant" delay={1800}>
              <p className="text-foreground">Which video, playbook, or resource do you want?</p>
            </ChatMessage>

            {userQuery && (
              <ChatMessage role="user" delay={0}>
                <p className="text-foreground">{userQuery}</p>
              </ChatMessage>
            )}

            {convStep === "guessing" && guess && (
              <>
                <ChatMessage role="assistant" delay={0}>
                  <p className="text-foreground">Got it. Are you talking about this one?</p>
                </ChatMessage>
                <ChatMessage role="assistant" delay={400}>
                  <div className="flex gap-3 items-center">
                    {guess.thumbnail_url && (
                      <img src={guess.thumbnail_url} alt={guess.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{guess.title}</p>
                      {guess.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{guess.description}</p>
                      )}
                    </div>
                  </div>
                </ChatMessage>
                <ChatMessage role="assistant" delay={800}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={confirmGuess}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      Yes, that's it
                    </button>
                    <button
                      onClick={rejectGuess}
                      className="px-3 py-1.5 rounded-lg bg-card border border-chat-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
                    >
                      Nope, not it
                    </button>
                  </div>
                </ChatMessage>
              </>
            )}

            {convStep === "done" && guess && (
              <>
                <ChatMessage role="assistant" delay={0}>
                  <p className="text-foreground">🎯 Boom. Here you go:</p>
                </ChatMessage>
                <ChatMessage role="assistant" delay={400}>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground text-sm">{guess.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {guess.links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          {l.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </ChatMessage>
                <ChatMessage role="assistant" delay={900}>
                  <button
                    onClick={handleIntentSkip}
                    className="text-xs text-primary hover:underline"
                  >
                    Close & browse the rest →
                  </button>
                </ChatMessage>
              </>
            )}

            {convStep === "wrong" && (
              <>
                <ChatMessage role="assistant" delay={0}>
                  <p className="text-foreground">Ah, my bad — couldn't pin that one down.</p>
                </ChatMessage>
                <ChatMessage role="assistant" delay={500}>
                  <p className="text-foreground">No worries, the full vault is right behind me. Have a browse 👇</p>
                </ChatMessage>
                <ChatMessage role="assistant" delay={1000}>
                  <button
                    onClick={handleIntentSkip}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                  >
                    Browse the vault
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </ChatMessage>
              </>
            )}
          </div>

          {convStep === "asking" && (
            <form onSubmit={handleIntentSubmit} className="px-4 pb-4 pt-2 border-t border-chat-border bg-gradient-to-t from-card to-background">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={intentText}
                  onChange={(e) => setIntentText(e.target.value)}
                  placeholder="e.g. Liam Lawson interview, MCP tools…"
                  disabled={intentSaving}
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-card border border-chat-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={intentSaving || !intentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {intentSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleIntentSkip}
                className="mt-3 mx-auto block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip — just let me browse the vault →
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResourceCard({
  resource,
  unlocked,
  index,
}: {
  resource: ResourceItem;
  unlocked: boolean;
  index: number;
}) {
  const imgSrc = resource.thumbnail_url || "";

  return (
    <div
      className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <img
          src={imgSrc}
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
          {resource.tag || "Resource"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-serif)" }}>
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
          <p className="text-sm text-muted-foreground italic">Enter your email above to access</p>
        )}
      </div>
    </div>
  );
}
