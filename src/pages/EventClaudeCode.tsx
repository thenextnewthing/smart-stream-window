import { useState } from "react";
import { CheckCircle, Calendar, Clock, MapPin, Loader2, Play } from "lucide-react";
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
import andrewImg from "@/assets/andrew-warner.jpg";

const EventClaudeCode = () => {
  const [loading, setLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

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
      <title>Learn to Build with Claude Code — Guaranteed</title>
      <meta
        name="description"
        content="Two live sessions. Build real apps on Zoom. Only 20 seats. 100% money-back guarantee."
      />
      <meta property="og:title" content="Learn to Build with Claude Code — Guaranteed" />
      <meta property="og:description" content="Two live sessions. Build real apps on Zoom. Only 20 seats. Money-back guarantee." />

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-6 sm:pt-20 pb-14 text-center relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary rounded-full px-3 py-1">
                <MapPin className="w-3 h-3" /> Zoom
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary rounded-full px-3 py-1">
                <Calendar className="w-3 h-3" /> March 31 & April 7
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary rounded-full px-3 py-1">
                Only <span className="line-through opacity-60">20</span> 14 seats
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-5">
              Stop Watching.<br />Start Building.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Two sessions. You build real apps. Or your money back.
            </p>
            <div className="flex flex-col items-center justify-center gap-2">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Register Now — $199
              </Button>
            </div>

            {/* Video */}
            <div className="mt-10 w-full max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg border border-border/60 relative">
              {videoPlaying ? (
                <iframe
                  src="https://www.youtube-nocookie.com/embed/0pma_hjoczQ?autoplay=1&rel=0&modestbranding=1&showinfo=0"
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Event promo video"
                />
              ) : (
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="w-full h-full relative group cursor-pointer"
                  aria-label="Play video"
                >
                  <img
                    src="https://img.youtube.com/vi/0pma_hjoczQ/maxresdefault.jpg"
                    alt="Video thumbnail"
                    className="w-full h-full object-cover brightness-[0.3]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[10.5rem] h-[10.5rem] rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 group-active:scale-95 transition-all shadow-xl">
                      <Play className="w-20 h-20 text-primary-foreground ml-2" fill="currentColor" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── Sessions ─── */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Session 1 — Vibe Coding
                </span>
                <h3 className="font-serif text-lg font-semibold">Build a dashboard from a spreadsheet</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Tue, March 31</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 12–2 PM ET</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Zoom</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5 pt-1">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Learn how AI builders think &amp; plan</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Ship a working dashboard using Lovable</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Requirement: a free Lovable account</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6 space-y-3">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                  Session 2 — Going Deeper
                </span>
                <h3 className="font-serif text-lg font-semibold">Build a Trello-clone you'll actually use</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Tue, April 7</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 12–2 PM ET</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Zoom</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5 pt-1">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Understand how code actually works</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Guide Claude Code to build for you</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Full control via VS Code — we'll set it up together</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Requirement: a paid Claude account</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── Instructor ─── */}
        <section className="bg-muted/40">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={speakerImg}
                alt="Adam Brakhane"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shrink-0"
              />
              <div>
                <h3 className="font-serif text-lg font-semibold">Adam Brakhane</h3>
                <p className="text-sm text-primary font-medium mb-1.5">CTO at Gateway X</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The CTO who taught Andrew to build. He trains founders and executives at Gateway X to stop talking about AI and start shipping with it.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-8">
              <img
                src={andrewImg}
                alt="Andrew Warner"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shrink-0"
              />
              <div>
                <h3 className="font-serif text-lg font-semibold">Andrew Warner</h3>
                <p className="text-sm text-primary font-medium mb-1.5">Founder, The Next New Thing</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interviews founders about how they built their businesses, and we'll be guiding this session live to help you get the most out of it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Guarantee ─── */}
        <section className="bg-primary/5">
          <div className="max-w-2xl mx-auto px-6 py-14 text-center">
            <h2 className="font-serif text-3xl font-semibold mb-3">
              100% Money-Back Guarantee
            </h2>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              If you attend both sessions and can't build on your own afterward, you get every penny back. No forms. No hoops. Just email us.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We'd rather refund you than have you feel stuck.
            </p>
            <p className="text-4xl font-serif font-semibold text-foreground mb-6">$199</p>
            <Button size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg" onClick={handleCheckout} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Register Now — $199
            </Button>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="font-serif text-2xl font-semibold text-center mb-8">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="experience">
              <AccordionTrigger className="text-left">Do I need coding experience?</AccordionTrigger>
              <AccordionContent>No. Andrew had zero experience before his first session with Adam.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="class-size">
              <AccordionTrigger className="text-left">Why only 20 students?</AccordionTrigger>
              <AccordionContent>So you get real attention. You're building live, not watching a webinar.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="guarantee">
              <AccordionTrigger className="text-left">How does the guarantee work?</AccordionTrigger>
              <AccordionContent>If you can't build on your own after Session 2, full refund. No hoops.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="tools">
              <AccordionTrigger className="text-left">What do I need?</AccordionTrigger>
              <AccordionContent>A laptop and a browser. We handle the rest on the call.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>🧨 The Next New Thing · © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
};

export default EventClaudeCode;