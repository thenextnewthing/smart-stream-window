import { useState } from "react";
import { CheckCircle, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import speakerImg from "@/assets/adam-brakhane.jpg";

const EventClaudeCode = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-event-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <title>Live with Claude Code — 2-Day Training</title>
      <meta
        name="description"
        content="A hands-on 2-day live training series covering Lovable and Claude Code. Learn to build, automate, and ship real projects. April 2–3, 2025."
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
            <p className="inline-block text-sm font-semibold tracking-wide uppercase text-primary mb-4">
              Live Training · April 2–3
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Live with Claude Code
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A hands-on, 2-day live training series that takes you from zero to
              building &amp; automating real projects with{" "}
              <span className="text-foreground font-medium">Lovable</span> and{" "}
              <span className="text-foreground font-medium">Claude Code</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg">
                <a href={STRIPE_URL}>Get Your Seat — $129</a>
              </Button>
              <p className="text-sm text-muted-foreground">Both days included</p>
            </div>
          </div>
        </section>

        {/* ─── Series Overview ─── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-10">
            Series Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Day 1 */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Day 1
                </span>
                <h3 className="font-serif text-xl font-semibold">Lovable</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> April 2, 2025
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 12–1 PM CT
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Live on Zoom
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover what Lovable is, build real projects on screen, and
                  learn tips &amp; best practices to ship faster.
                </p>
              </CardContent>
            </Card>

            {/* Day 2 */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Day 2
                </span>
                <h3 className="font-serif text-xl font-semibold">Claude Code</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> April 3, 2025
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 12–1 PM CT
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Live on Zoom
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn what Claude Code is, set it up, and explore building,
                  automating, and practical workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── What You'll Learn ─── */}
        <section className="bg-muted/40">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-serif text-3xl font-semibold text-center mb-10">
              What You'll Learn
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              {/* Day 1 bullets */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-primary">
                  Day 1 — Lovable
                </h3>
                {[
                  "What Lovable is and why it matters",
                  "Building real projects live, from scratch",
                  "Tips, tricks & best practices for shipping fast",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Day 2 bullets */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-primary">
                  Day 2 — Claude Code
                </h3>
                {[
                  "What Claude Code is and how it works",
                  "Setup walkthrough — get running in minutes",
                  "Building & automating real workflows",
                  "Practical patterns you can use immediately",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Speaker ─── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-10">
            Your Instructor
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-8 max-w-2xl mx-auto">
            <img
              src={speakerImg}
              alt="Adam Brakhane"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shrink-0"
            />
            <div>
              <h3 className="font-serif text-xl font-semibold">Adam Brakhane</h3>
              <p className="text-sm text-primary font-medium mb-2">
                CTO at Gateway X
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Adam builds AI-powered products at Gateway X and has trained
                hundreds of developers on modern tooling. He brings a practical,
                no-fluff approach to every session — focused on what actually
                works in production.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Pricing CTA ─── */}
        <section className="bg-primary/5">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="font-serif text-3xl font-semibold mb-3">
              Reserve Your Spot
            </h2>
            <p className="text-muted-foreground mb-2">
              2 days · 2 hours of live training · lifetime replay access
            </p>
            <p className="text-4xl font-serif font-semibold text-foreground mb-6">
              $129
            </p>
            <Button asChild size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg">
              <a href={STRIPE_URL}>Buy Now</a>
            </Button>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="experience">
              <AccordionTrigger className="text-left">
                Do I need coding experience?
              </AccordionTrigger>
              <AccordionContent>
                No prior coding experience is required. Both Lovable and Claude
                Code are designed to be approachable for beginners while still
                valuable for experienced developers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="covered">
              <AccordionTrigger className="text-left">
                What's covered each day?
              </AccordionTrigger>
              <AccordionContent>
                Day 1 focuses on Lovable — what it is, building real projects,
                and best practices. Day 2 covers Claude Code — setup,
                building &amp; automating, and practical workflows you can use
                right away.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="replays">
              <AccordionTrigger className="text-left">
                Will there be replays?
              </AccordionTrigger>
              <AccordionContent>
                Yes! All sessions are recorded and you'll have lifetime access
                to the replays so you can revisit the material anytime.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="attend">
              <AccordionTrigger className="text-left">
                What do I need to attend?
              </AccordionTrigger>
              <AccordionContent>
                Just a laptop with a web browser and a stable internet
                connection. We'll send you a Zoom link before each session.
                No special software installation is needed beforehand.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>
            🧨 The Next New Thing · © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  );
};

export default EventClaudeCode;
