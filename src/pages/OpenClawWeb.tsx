import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, Smile, Paperclip, Mic, Search, MoreVertical, Menu } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import lobsterAvatar from "@/assets/openclaw-lobster.png";

interface Message {
  id: number;
  role: "bot" | "user";
  content: string;
  time: string;
}

const getNow = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const OpenClawWeb = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");
  const [chatInput, setChatInput] = useState("");
  const [phase, setPhase] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const time = getNow();

    timers.push(setTimeout(() => {
      setMessages([{ id: 1, role: "bot", content: "Your friends are using OpenClaw and you're missing out? I got you. With this web version, there's no Mac Mini to buy and nothing to install.", time }]);
      setPhase(1);
    }, 800));

    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, { id: 2, role: "bot", content: "Enter your email to begin 👇", time }]);
      setPhase(2);
    }, 2200));

    timers.push(setTimeout(() => { setPhase(3); }, 2800));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailStatus("loading");
    const time = getNow();
    setMessages(prev => [...prev, { id: 10, role: "user", content: email, time }]);

    try {
      await supabase.functions.invoke("subscribe-beehiiv", { body: { email } });
      setEmailStatus("success");
      setPhase(4);

      const end = Date.now() + 2000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      setTimeout(() => {
        setMessages(prev => [...prev, { id: 20, role: "bot", content: "What would you like me to do?", time: getNow() }]);
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
    const time = getNow();
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: chatInput, time }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", content: "Got it! I'm working on that for you. 🦞", time: getNow() }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#e6ebee" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 shadow-sm" style={{ background: "#517da2", color: "#fff" }}>
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5 opacity-80 cursor-pointer md:hidden" />
          <img src={lobsterAvatar} alt="OpenClaw" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">OpenClaw</h1>
            <p className="text-xs opacity-70">bot</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 opacity-80 cursor-pointer" />
          <MoreVertical className="w-5 h-5 opacity-80 cursor-pointer" />
        </div>
      </header>

      {/* Chat area with Telegram-style wallpaper */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23c1d1db' opacity='0.4'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%23c1d1db' opacity='0.3'/%3E%3Ccircle cx='25' cy='8' r='0.8' fill='%23c1d1db' opacity='0.25'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='%23ccd9e1'/%3E%3Crect width='200' height='200' fill='url(%23p)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      >
        <div className="max-w-2xl mx-auto space-y-2">
          {messages.map((msg) => {
            const isBot = msg.role === "bot";
            return (
              <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"} animate-message-in`}>
                {isBot && (
                  <img src={lobsterAvatar} alt="" className="w-8 h-8 rounded-full mr-2 mt-1 flex-shrink-0 object-cover" />
                )}
                <div
                  className="relative max-w-[75%] px-3 py-1.5 text-sm leading-relaxed shadow-sm"
                  style={isBot
                    ? { background: "#fff", color: "#000", borderRadius: "4px 12px 12px 12px" }
                    : { background: "#effdde", color: "#000", borderRadius: "12px 4px 12px 12px" }
                  }
                >
                  <span>{msg.content}</span>
                  <span className="text-[10px] ml-2 float-right mt-2" style={{ color: isBot ? "#a0a0a0" : "#6fb26a" }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Email input phase */}
          {phase === 3 && emailStatus !== "success" && (
            <div className="animate-message-in">
              <form onSubmit={handleEmailSubmit} className="flex gap-2 mt-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={emailStatus === "loading"}
                  autoFocus
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border shadow-sm"
                  style={{ background: "#fff", color: "#000", borderColor: "#d4dbe0" }}
                />
                <button
                  type="submit"
                  disabled={emailStatus === "loading" || !email}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 text-white"
                  style={{ background: "#517da2" }}
                >
                  {emailStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-xs mt-2 ml-1" style={{ color: "#8a9aa5" }}>
                You'll get access to this site and join my AI newsletter.
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input bar */}
      {phase >= 5 && (
        <form
          onSubmit={handleChatSubmit}
          className="flex items-center gap-2 px-3 py-2 border-t"
          style={{ borderColor: "#d4dbe0", background: "#f0f2f5" }}
        >
          <button type="button" className="p-2 rounded-full" style={{ color: "#8a9aa5" }}>
            <Smile className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message"
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: "#fff", color: "#000", borderColor: "#d4dbe0" }}
          />
          <button type="button" className="p-2 rounded-full" style={{ color: "#8a9aa5" }}>
            <Paperclip className="w-5 h-5" />
          </button>
          {chatInput.trim() ? (
            <button type="submit" className="p-2.5 rounded-full text-white" style={{ background: "#517da2" }}>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" className="p-2.5 rounded-full text-white" style={{ background: "#517da2" }}>
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default OpenClawWeb;
