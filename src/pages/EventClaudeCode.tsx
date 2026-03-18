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
      <title>Learn to Build with Claude Code — 2-Session Live Training</title>
      <meta
        name="description"
        content="Two live sessions. You'll build real apps on Zoom with Lovable and Claude Code. Only 20 seats. 100% money-back guarantee."
      />
      <meta property="og:title" content="Learn to Build with Claude Code — Guaranteed" />
      <meta property="og:description" content="Two live sessions. Build real apps on Zoom. Only 20 seats. 100% money-back guarantee." />

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
            <p className="inline-block text-sm font-semibold tracking-wide uppercase text-primary mb-4">
              Live Training · March 31 &amp; April 7 · Only 20 Seats
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Stop Watching. Start Building.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Two live sessions on Zoom. You'll walk in curious and walk out a builder — with real apps you made yourself. If you don't,{" "}
              <span className="text-foreground font-medium">you get your money back</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Get Your Seat — $129
              </Button>
              <p className="text-sm text-muted-foreground">Both sessions included · 100% guarantee</p>
            </div>
          </div>
        </section>

        {/* ─── What You'll Build ─── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-4">
            Here's Exactly What Happens
          </h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">
            Each session is one hour on Zoom. You won't just watch — you'll build alongside us, in real time.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session 1 */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Session 1 — Vibe Coding Basics
                </span>
                <h3 className="font-serif text-xl font-semibold">Build an interactive dashboard from a spreadsheet</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Tuesday, March 31, 2025
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 12–2 PM ET
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Live on Zoom
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll use Lovable — it handles everything from building to publishing. No other tools needed. By the end, you'll understand how AI builders think, plan, and ship.
                </p>
              </CardContent>
            </Card>

            {/* Session 2 */}
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Session 2 — Going Deeper
                </span>
                <h3 className="font-serif text-xl font-semibold">Build a Trello-clone you'll actually use</h3>
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
                  You'll graduate to Claude Code via VS Code for full control. We'll walk you through setup, show you the code it creates, and teach you how to guide it. This is where you become self-sufficient.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── What You'll Walk Away With ─── */}
        <section className="bg-muted/40">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-serif text-3xl font-semibold text-center mb-10">
              What You'll Walk Away With
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-primary">
                  After Session 1
                </h3>
                {[
                  "You'll know how to plan and build software from scratch",
                  "You'll have a working app you built yourself",
                  "You'll understand the AI-builder workflow top to bottom",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-primary">
                  After Session 2
                </h3>
                {[
                  "You'll understand the fundamentals of how code works",
                  "You'll know how to guide Claude Code to build anything",
                  "You'll have full control — if you need something, you'll sit down and build it",
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

        {/* ─── Instructors ─── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-10">
            Who's Teaching
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
                The CTO who taught Andrew to build. Adam leads Gateway X's venture studio, where he trains founders, executives, and investors to stop talking about AI and start shipping with it. He's the one who turned Andrew from a non-coder into someone who builds apps on a whim — and he'll do the same for you.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Guarantee + Pricing CTA ─── */}
        <section className="bg-primary/5">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="font-serif text-3xl font-semibold mb-3">
              100% Money-Back Guarantee
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              By the end of Session 2, you'll know how to build and you'll have your first apps done. If you don't — full refund, no questions.
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              2 sessions · Only 20 students · Lifetime replay access
            </p>
            <p className="text-4xl font-serif font-semibold text-foreground mb-6">
              $129
            </p>
            <Button size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg" onClick={handleCheckout} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Get Your Seat
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
                Nope. Andrew had zero coding experience before his first session with Adam. These sessions are designed for people who've never written a line of code.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="class-size">
              <AccordionTrigger className="text-left">
                Why only 20 students?
              </AccordionTrigger>
              <AccordionContent>
                So you actually learn. This isn't a webinar — you're building live on Zoom, and we want to make sure you get the attention you need.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="guarantee">
              <AccordionTrigger className="text-left">
                How does the guarantee work?
              </AccordionTrigger>
              <AccordionContent>
                If by the end of Session 2 you don't feel confident building on your own, you get a full refund. No hoops, no forms.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tools">
              <AccordionTrigger className="text-left">
                What tools do I need?
              </AccordionTrigger>
              <AccordionContent>
                A laptop and a browser. That's it for Session 1. For Session 2, we'll walk you through installing VS Code and Claude Code right on the call.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="replays">
              <AccordionTrigger className="text-left">
                Will there be replays?
              </AccordionTrigger>
              <AccordionContent>
                Yes — lifetime access to recordings of both sessions.
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