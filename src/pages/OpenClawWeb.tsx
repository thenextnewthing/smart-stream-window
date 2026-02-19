import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import lobsterAvatar from "@/assets/openclaw-lobster.png";

interface Message {
  id: number;
  role: "bot" | "user";
  content: string;
  type?: "text" | "email-input" | "chat-input";
}

const OpenClawWeb = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");
  const [chatInput, setChatInput] = useState("");
  const [phase, setPhase] = useState(0); // 0=typing, 1=msg1, 2=email-prompt, 3=email-input, 4=submitted, 5=chat
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // Scripted message flow
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setMessages([{
        id: 1,
        role: "bot",
        content: "Your friends are using OpenClaw and you're missing out? I got you. With this web version, there's no Mac Mini to buy and nothing to install."
      }]);
      setPhase(1);
    }, 800));

    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 2,
        role: "bot",
        content: "Enter your email to begin 👇"
      }]);
      setPhase(2);
    }, 2200));

    timers.push(setTimeout(() => {
      setPhase(3);
    }, 2800));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailStatus("loading");

    // Show user's email as a message
    setMessages(prev => [...prev, { id: 10, role: "user", content: email }]);

    try {
      await supabase.functions.invoke("subscribe-beehiiv", { body: { email } });

      setEmailStatus("success");
      setPhase(4);

      // Confetti
      const end = Date.now() + 2000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      // Follow-up message
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 20,
          role: "bot",
          content: "What would you like me to do?"
        }]);
        setPhase(5);
      }, 1200);
    } catch {
      setEmailStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: chatInput }]);
    setChatInput("");
    // Future: handle user prompts
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "bot",
        content: "Got it! I'm working on that for you. 🦞"
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#17212b" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1e2c3a", background: "#1e2c3a" }}>
        <img src={lobsterAvatar} alt="OpenClaw" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#e1e3e6" }}>OpenClaw</h1>
          <p className="text-xs" style={{ color: "#6c7883" }}>online</p>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-message-in`}>
            {msg.role === "bot" && (
              <img src={lobsterAvatar} alt="" className="w-8 h-8 rounded-full mr-2 mt-1 flex-shrink-0 object-cover" />
            )}
            <div
              className="max-w-[75%] px-3.5 py-2 rounded-xl text-sm leading-relaxed"
              style={msg.role === "bot"
                ? { background: "#182533", color: "#e1e3e6", borderTopLeftRadius: "4px" }
                : { background: "#2b5278", color: "#e1e3e6", borderTopRightRadius: "4px" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Email input phase */}
        {phase === 3 && emailStatus !== "success" && (
          <div className="animate-message-in">
            <form onSubmit={handleEmailSubmit} className="flex gap-2 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={emailStatus === "loading"}
                autoFocus
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#242f3d", color: "#e1e3e6", border: "1px solid #3a4a5c" }}
              />
              <button
                type="submit"
                disabled={emailStatus === "loading" || !email}
                className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                style={{ background: "#2b5278", color: "#e1e3e6" }}
              >
                {emailStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-xs mt-2 ml-1" style={{ color: "#6c7883" }}>
              You'll get access to this site and join my AI newsletter.
            </p>
          </div>
        )}

        {/* Chat input after email */}
        {phase === 5 && (
          <div className="animate-message-in" />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input bar */}
      {phase >= 5 && (
        <form
          onSubmit={handleChatSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t"
          style={{ borderColor: "#1e2c3a", background: "#17212b" }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message OpenClaw..."
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#242f3d", color: "#e1e3e6", border: "1px solid #3a4a5c" }}
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2.5 rounded-full transition-all disabled:opacity-30"
            style={{ background: "#2b5278", color: "#e1e3e6" }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default OpenClawWeb;
