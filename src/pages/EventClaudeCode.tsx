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
      <title>Learn to Build with Claude Code — Guaranteed</title>
      <meta
        name="description"
        content="A hands-on 2-session live training that takes you from zero to building real apps with Lovable and Claude Code. 100% money-back guarantee."
      />
      <meta property="og:title" content="Learn to Build with Claude Code — Guaranteed" />
      <meta property="og:description" content="Go from watching others build to building your own apps. 2 live sessions, 20 students max, 100% money-back guarantee." />

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
            <p className="inline-block text-sm font-semibold tracking-wide uppercase text-primary mb-4">
              Live Training · April 2–3 · Only 20 Seats
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Learn to Build with Claude Code. Guaranteed.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              If you're watching founders build with AI and feeling left out, this is your guaranteed way to start creating. Two live sessions. You'll build real apps on Zoom. Or your money back.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Get Your Seat — $129
              </Button>
              <p className="text-sm text-muted-foreground">Both sessions · 100% money-back guarantee</p>
            </div>
          </div>
        </section>

        {/* ─── Andrew's Story ─── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-semibold text-center mb-8">
            How I Went from Zero to Builder
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Before December 17, I never coded anything. Then I had a 1-hour training call with a CTO, and I learned how to vibe code. I quickly created my ideal productivity app.
            </p>
            <p>
              After a second Zoom meeting with him, I became a Claude Code native. If I needed something, I would sit down and build it.
            </p>
            <p className="font-medium text-foreground">I built:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>My ideal landing page creation tool</li>
              <li>A URL redirection tool for our ads</li>
              <li>A personal health app</li>
              <li>A smart Siri for my son's Apple Watch</li>
            </ul>
            <p>
              Now I want to pass this super-power on to you.
            </p>
          </div>
        </section>

        {/* ─── Series Overview ─── */}
        <section className="bg-muted/40">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-serif text-3xl font-semibold text-center mb-10">
              What You'll Build
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Session 1 */}
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                    Session 1
                  </span>
                  <h3 className="font-serif text-xl font-semibold">Vibe Coding Basics</h3>
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
                  <p className="text-sm font-medium text-foreground mb-1">
                    You'll build: An interactive dashboard from a spreadsheet
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Learn how AI builders work",
                      "Plan & build your first project",
                      "Start creating software right on Zoom",
                      "Use Lovable — it handles building to publishing, no other tools needed",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session 2 */}
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary">
                    Session 2
                  </span>
                  <h3 className="font-serif text-xl font-semibold">Advanced Builds with Claude Code</h3>
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
                  <p className="text-sm font-medium text-foreground mb-1">
                    You'll build: A Trello-clone for your own project management
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Understand the fundamentals of coding",
                      "Learn how to guide Claude Code to build for you",
                      "See all the code that's created for you",
                      "Use Claude Code via VS Code for full control — we'll guide you through setup",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─── Guarantee ─── */}
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">
            100% Money-Back Guarantee
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            By the end of the second session, you'll know how to build and have your first app built — or you get your money back. No questions asked.
          </p>
        </section>

        {/* ─── Speaker ─── */}
        <section className="bg-muted/40">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-serif text-3xl font-semibold text-center mb-10">
              Your Instructors
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
                  The CTO who taught Andrew to build. Adam partners with founders and executives at Gateway X's venture studio, training leadership teams to move past the hype and apply practical AI tools that solve real business problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing CTA ─── */}
        <section className="bg-primary/5">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="font-serif text-3xl font-semibold mb-3">
              Reserve Your Spot
            </h2>
            <p className="text-muted-foreground mb-1">
              2 sessions · Build real apps on Zoom · Only 20 students
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              100% money-back guarantee
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
                Not at all. Andrew had zero coding experience before his first session. Both tools are designed so anyone can start building immediately.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="covered">
              <AccordionTrigger className="text-left">
                What will I actually build?
              </AccordionTrigger>
              <AccordionContent>
                Session 1: an interactive dashboard based on a spreadsheet using Lovable. Session 2: a Trello-clone project management app using Claude Code. You'll build both live on Zoom.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="guarantee">
              <AccordionTrigger className="text-left">
                How does the money-back guarantee work?
              </AccordionTrigger>
              <AccordionContent>
                If by the end of the second session you don't know how to build and haven't built your first app, you get a full refund. No questions asked.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="class-size">
              <AccordionTrigger className="text-left">
                How many students per session?
              </AccordionTrigger>
              <AccordionContent>
                Only 20 students per cohort, so you get the personal attention you need to learn.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="replays">
              <AccordionTrigger className="text-left">
                Will there be replays?
              </AccordionTrigger>
              <AccordionContent>
                Yes! All sessions are recorded and you'll have lifetime access to the replays.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="attend">
              <AccordionTrigger className="text-left">
                What do I need to attend?
              </AccordionTrigger>
              <AccordionContent>
                Just a laptop with a web browser and a stable internet connection. We'll guide you through installing VS Code and Claude Code during Session 2.
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
