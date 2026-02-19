import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, Smile, Paperclip, Mic, Search, MoreVertical } from "lucide-react";
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

const getNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
    timers.push(setTimeout(() => setPhase(3), 2800));
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
    <div className="flex flex-col h-screen" style={{ background: "#c6d8e3" }}>
      {/* Telegram-style header */}
      <header
        className="flex items-center justify-between px-4 py-2 z-10"
        style={{ background: "#517da2", color: "#fff", minHeight: 56 }}
      >
        <div className="flex items-center gap-3">
          <img src={lobsterAvatar} alt="OpenClaw" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold">OpenClaw</h1>
            <p className="text-[13px] opacity-70">bot</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Search className="w-[22px] h-[22px] opacity-70 cursor-pointer" />
          <MoreVertical className="w-[22px] h-[22px] opacity-70 cursor-pointer" />
        </div>
      </header>

      {/* Chat area — Telegram doodle wallpaper */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          background: "#c6d8e3",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23c6d8e3'/%3E%3Ccircle cx='25' cy='25' r='3' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Cpath d='M70 15 l6 10 l-12 0z' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Crect x='120' y='18' width='8' height='8' rx='1' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Ccircle cx='175' cy='30' r='4' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Cpath d='M20 75 l8 0 l-4-7z' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Ccircle cx='80' cy='80' r='2.5' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Crect x='130' y='72' width='6' height='9' rx='1' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Cpath d='M180 70 q5 10 10 0' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Ccircle cx='35' cy='130' r='3.5' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Cpath d='M90 125 l5 8 l-10 0z' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Crect x='145' y='125' width='7' height='7' rx='1' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Ccircle cx='190' cy='135' r='2' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Cpath d='M50 175 q4 8 8 0' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Ccircle cx='110' cy='180' r='3' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3Crect x='160' y='172' width='8' height='6' rx='1' fill='none' stroke='%23b6c8d4' stroke-width='0.8'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      >
        <div className="max-w-2xl mx-auto px-3 py-4 space-y-1">
          {messages.map((msg) => {
            const isBot = msg.role === "bot";
            return (
              <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"} animate-message-in mb-1`}>
                {isBot && (
                  <img src={lobsterAvatar} alt="" className="w-[34px] h-[34px] rounded-full mr-1.5 mt-0.5 flex-shrink-0 object-cover" />
                )}
                <div
                  className="relative max-w-[70%] px-[9px] py-[6px] text-[14px] leading-[19px]"
                  style={{
                    ...(isBot
                      ? { background: "#fff", color: "#000", borderRadius: "4px 12px 12px 12px", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }
                      : { background: "#eeffde", color: "#000", borderRadius: "12px 4px 12px 12px", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }
                    ),
                  }}
                >
                  <span>{msg.content}</span>
                  <span
                    className="inline-flex items-center float-right ml-2 mt-[3px] text-[11px] leading-none whitespace-nowrap"
                    style={{ color: isBot ? "#a0adb6" : "#6eb969" }}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Inline email input */}
          {phase === 3 && emailStatus !== "success" && (
            <div className="animate-message-in pl-[42px]">
              <form onSubmit={handleEmailSubmit} className="flex gap-2 mt-1 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={emailStatus === "loading"}
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg text-[14px] outline-none"
                  style={{ background: "#fff", color: "#000", border: "1px solid #d4dbe0" }}
                />
                <button
                  type="submit"
                  disabled={emailStatus === "loading" || !email}
                  className="px-3 py-2 rounded-lg text-[14px] flex items-center transition-all disabled:opacity-40 text-white"
                  style={{ background: "#517da2" }}
                >
                  {emailStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-[12px] mt-1.5" style={{ color: "#8a9aa5" }}>
                You'll get access to this site and join my AI newsletter.
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input — always visible like real Telegram */}
      <div
        className="flex items-center gap-1 px-2 py-1.5"
        style={{ background: "#f0f2f5", borderTop: "1px solid #d6dce1" }}
      >
        <button type="button" className="p-2" style={{ color: "#8a9aa5" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <button type="button" className="p-2" style={{ color: "#8a9aa5" }}>
          <Smile className="w-[26px] h-[26px]" />
        </button>
        <form onSubmit={handleChatSubmit} className="flex-1 flex items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message"
            disabled={phase < 5}
            className="w-full px-3 py-2 text-[15px] outline-none bg-transparent"
            style={{ color: "#000" }}
          />
        </form>
        <button type="button" className="p-2" style={{ color: "#8a9aa5" }}>
          <Paperclip className="w-[24px] h-[24px] rotate-45" />
        </button>
        {chatInput.trim() ? (
          <button onClick={handleChatSubmit} className="w-[48px] h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#517da2", color: "#fff" }}>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button type="button" className="w-[48px] h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#517da2", color: "#fff" }}>
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OpenClawWeb;
