import { useState } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const EventClaudeCodeWaitlist = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goals, setGoals] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("event_waitlist").insert({
        name: name.trim(),
        email: email.trim(),
        goals: goals.trim() || null,
        event_slug: "claude-code",
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the waitlist!");
    } catch (err) {
      console.error("Waitlist error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/events/claude-code")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to event
        </button>

        {submitted ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-semibold mb-2">You're on the list!</h1>
            <p className="text-muted-foreground">We'll reach out when spots open up.</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-semibold mb-2">Join the Waitlist</h1>
            <p className="text-muted-foreground mb-8">
              This round sold out fast. Leave your details and we'll let you know as soon as new spots open up.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Textarea
                  placeholder="What are you hoping to get out of this course?"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
              </div>
              <Button type="submit" size="lg" className="w-full text-base py-6 rounded-xl shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Join the Waitlist
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EventClaudeCodeWaitlist;
