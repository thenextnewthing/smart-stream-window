import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Loader2, Mic, Search, MoreVertical, Menu, Smile, Paperclip, Pencil, Clock, Send, BellOff, Gift, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import lobsterAvatar from "@/assets/openclaw-lobster.png";
import andrewAvatar from "@/assets/andrew-warner.jpg";

interface Message {
  id: number;
  role: "bot" | "user";
  content: string;
  time: string;
}

interface SidebarChat {
  name: string;
  avatar: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  active?: boolean;
}

const getNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const getTenMinAgo = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - 10);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const sidebarChatsData: SidebarChat[] = [
  { name: "OpenClaw", avatar: "lobster", initials: "🦞", color: "#7bc862", lastMessage: "Enter your email to begin 👇", time: "now" },
  { name: "Andrew Warner", avatar: "andrew", initials: "AW", color: "#3390ec", lastMessage: "Hey! Check out OpenClaw 🦞", time: "ago" },
];

const OpenClawWeb = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");
  const [chatInput, setChatInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChat, setActiveChat] = useState("OpenClaw");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [phase, setPhase] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const time = getNow();
    timers.push(setTimeout(() => {
      setMessages([{ id: 1, role: "bot", content: "Your friends are using OpenClaw and you feel left out?\n\nI got you.\n\nWith this web version, there's no Mac Mini to buy and nothing to install.", time }]);
      setPhase(1);
    }, 800));
    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, { id: 2, role: "bot", content: "How can I help?", time }]);
      setPhase(1.5);
    }, 1800));
    timers.push(setTimeout(() => {
      setMessages(prev => [...prev, { id: 3, role: "bot", content: "Enter your email to begin 👇", time }]);
      setPhase(2);
    }, 3000));
    timers.push(setTimeout(() => setPhase(3), 3600));
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
    <div className="flex h-screen" style={{ background: "#e6ebee" }}>
      {/* ===== LEFT SIDEBAR (hidden on mobile) ===== */}
      <div className="hidden md:flex flex-col w-[300px] border-r" style={{ background: "#fff", borderColor: "#dadce0" }}>
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-4 py-2" style={{ minHeight: 56 }}>
          <button className="p-2 rounded-full hover:bg-black/5">
            <Menu className="w-[22px] h-[22px]" style={{ color: "#707579" }} />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: "#a2acb4" }} />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-[7px] rounded-full text-[14px] outline-none"
              style={{ background: "#f0f2f5", color: "#000" }}
              readOnly
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {sidebarChatsData.map((chat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-[9px] cursor-pointer"
              style={{
                background: chat.name === activeChat ? "#3390ec" : "transparent",
              }}
              onClick={() => setActiveChat(chat.name)}
            >
              {/* Avatar */}
              <div
                className="w-[54px] h-[54px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[18px] font-medium overflow-hidden"
                style={{ background: chat.avatar === "lobster" ? "#7bc862" : chat.color }}
              >
                {chat.avatar === "lobster" ? (
                  <img src={lobsterAvatar} alt="" className="w-full h-full object-cover" />
                ) : chat.avatar === "andrew" ? (
                  <img src={andrewAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{chat.initials}</span>
                )}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[15px] font-semibold truncate"
                    style={{ color: chat.name === activeChat ? "#fff" : "#000" }}
                  >
                    {chat.name}
                  </span>
                  <span
                    className="text-[12px] flex-shrink-0 ml-2"
                    style={{ color: chat.name === activeChat ? "rgba(255,255,255,0.7)" : "#8a9aa5" }}
                  >
                    {chat.time === "now" ? getNow() : chat.time === "ago" ? getTenMinAgo() : chat.time}
                  </span>
                </div>
                <p
                  className="text-[14px] truncate mt-[1px]"
                  style={{ color: chat.name === activeChat ? "rgba(255,255,255,0.8)" : "#707579" }}
                >
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <div className="relative">
          <button
            className="absolute bottom-5 right-5 w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "#3390ec", color: "#fff" }}
          >
            <Pencil className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ===== RIGHT CHAT PANEL ===== */}
      <div className="flex flex-col flex-1">
        {/* Chat header */}
        {/* Desktop header */}
        <header
          className="hidden md:flex items-center justify-between px-4 py-2"
          style={{ background: "#fff", borderBottom: "1px solid #dadce0", minHeight: 56 }}
        >
          <div className="flex items-center gap-3">
            <img src={activeChat === "OpenClaw" ? lobsterAvatar : andrewAvatar} alt={activeChat} className="w-[42px] h-[42px] rounded-full object-cover" />
            <div className="leading-tight">
              <h1 className="text-[16px] font-semibold" style={{ color: "#000" }}>{activeChat}</h1>
              <p className="text-[13px]" style={{ color: "#707579" }}>bot</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <MoreVertical
                className="w-[22px] h-[22px] cursor-pointer"
                style={{ color: "#707579" }}
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-8 z-30 py-2 rounded-xl shadow-lg"
                    style={{ background: "#fff", minWidth: 200 }}
                  >
                    {[
                      { icon: BellOff, label: "Mute", color: "#000" },
                      { icon: Gift, label: "Send a Gift", color: "#000" },
                      { icon: Lock, label: "Block user", color: "#000" },
                      { icon: Trash2, label: "Delete Chat", color: "#e53935" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="flex items-center gap-4 w-full px-4 py-[10px] text-[15px] hover:bg-black/5 text-left"
                        style={{ color: item.color }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <item.icon className="w-[20px] h-[20px]" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile header — Telegram mobile style */}
        <header
          className="flex md:hidden items-center justify-between px-2 py-2"
          style={{ background: "#fff", borderBottom: "1px solid #dadce0", minHeight: 56 }}
        >
          <button className="p-2 rounded-full hover:bg-black/5">
            <ArrowLeft className="w-[24px] h-[24px]" style={{ color: "#707579" }} />
          </button>
          <div className="flex-1 flex flex-col items-center leading-tight">
            <h1 className="text-[17px] font-semibold" style={{ color: "#000" }}>{activeChat}</h1>
            <p className="text-[13px]" style={{ color: "#707579" }}>bot</p>
          </div>
          <img src={activeChat === "OpenClaw" ? lobsterAvatar : andrewAvatar} alt={activeChat} className="w-[40px] h-[40px] rounded-full object-cover mr-1" />
        </header>

        {/* Messages area — green Telegram wallpaper */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{
            background: "#b5d1a4",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' opacity='0.3'%3E%3Crect width='400' height='400' fill='%23b5d1a4'/%3E%3Cg fill='none' stroke='%23849e74' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- paper plane --%3E%3Cpath d='M30 25 l18-8 -6 12 -3-2z M42 17 l-9 10'/%3E%3C!-- heart --%3E%3Cpath d='M110 20 c0-6 8-10 12-4 4-6 12-2 12 4 0 8-12 16-12 16s-12-8-12-16z'/%3E%3C!-- star --%3E%3Cpath d='M210 30 l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'/%3E%3C!-- envelope --%3E%3Crect x='290' y='18' width='20' height='14' rx='2'/%3E%3Cpath d='M290 18 l10 8 10-8'/%3E%3C!-- cat face --%3E%3Ccircle cx='55' cy='90' r='9'/%3E%3Cpath d='M46 85 l3-8 5 5 M64 85 l-3-8-5 5'/%3E%3Ccircle cx='52' cy='89' r='1.2'/%3E%3Ccircle cx='58' cy='89' r='1.2'/%3E%3C!-- music note --%3E%3Cpath d='M140 75 v20'/%3E%3Ccircle cx='137' cy='95' r='4'/%3E%3Cpath d='M140 75 q10-4 8 6'/%3E%3C!-- cloud --%3E%3Cpath d='M230 90 a8 8 0 0 1 7-8 10 10 0 0 1 18 2 7 7 0 0 1 4 12z'/%3E%3C!-- camera --%3E%3Crect x='310' y='82' width='22' height='16' rx='3'/%3E%3Ccircle cx='321' cy='90' r='5'/%3E%3Crect x='317' y='79' width='8' height='3' rx='1'/%3E%3C!-- thumb up --%3E%3Cpath d='M35 160 v14 h10v-14z M45 164 h5 a3 3 0 0 0 0-6h-2 l1-4a2 2 0 0 0-2-2l-4 8v4'/%3E%3C!-- lightning --%3E%3Cpath d='M130 150 l-4 12h8l-4 12 10-15h-7l4-9z'/%3E%3C!-- phone --%3E%3Crect x='220' y='148' width='14' height='24' rx='3'/%3E%3Cline x1='225' y1='168' x2='230' y2='168'/%3E%3C!-- gift --%3E%3Crect x='305' y='158' width='20' height='14' rx='1'/%3E%3Crect x='305' y='153' width='20' height='6' rx='1'/%3E%3Cline x1='315' y1='153' x2='315' y2='172'/%3E%3Cpath d='M315 153 c-3-5-10-5-8 0 M315 153 c3-5 10-5 8 0'/%3E%3C!-- paper plane 2 --%3E%3Cpath d='M50 240 l18-8-6 12-3-2z M68 232 l-9 10'/%3E%3C!-- lock --%3E%3Crect x='135' y='235' width='14' height='12' rx='2'/%3E%3Cpath d='M138 235 v-5a4.5 4.5 0 0 1 9 0v5'/%3E%3C!-- globe --%3E%3Ccircle cx='235' cy='240' r='10'/%3E%3Cellipse cx='235' cy='240' rx='5' ry='10'/%3E%3Cline x1='225' y1='240' x2='245' y2='240'/%3E%3C!-- bell --%3E%3Cpath d='M320 248 a8 8 0 0 1 16 0v6h-16z'/%3E%3Cline x1='328' y1='254' x2='328' y2='258'/%3E%3Cpath d='M325 258 a3 3 0 0 0 6 0'/%3E%3C!-- sun --%3E%3Ccircle cx='60' cy='330' r='6'/%3E%3Cg stroke-width='1'%3E%3Cline x1='60' y1='320' x2='60' y2='323'/%3E%3Cline x1='60' y1='337' x2='60' y2='340'/%3E%3Cline x1='50' y1='330' x2='53' y2='330'/%3E%3Cline x1='67' y1='330' x2='70' y2='330'/%3E%3Cline x1='53' y1='323' x2='55' y2='325'/%3E%3Cline x1='65' y1='335' x2='67' y2='337'/%3E%3Cline x1='53' y1='337' x2='55' y2='335'/%3E%3Cline x1='65' y1='325' x2='67' y2='323'/%3E%3C/g%3E%3C!-- diamond --%3E%3Cpath d='M148 315 l8-6 8 6-8 14z'/%3E%3Cline x1='148' y1='315' x2='164' y2='315'/%3E%3C!-- cup --%3E%3Cpath d='M230 310 v18 M222 328 h16'/%3E%3Cpath d='M222 310 h16 l-2 14h-12z'/%3E%3Cpath d='M238 313 a5 5 0 0 1 0 8'/%3E%3C!-- flower --%3E%3Ccircle cx='325' cy='325' r='3'/%3E%3Ccircle cx='325' cy='318' r='3.5'/%3E%3Ccircle cx='331' cy='322' r='3.5'/%3E%3Ccircle cx='329' cy='329' r='3.5'/%3E%3Ccircle cx='321' cy='329' r='3.5'/%3E%3Ccircle cx='319' cy='322' r='3.5'/%3E%3Cline x1='325' y1='328' x2='325' y2='340'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "400px 400px",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-4 pb-20 space-y-1">
            {messages.map((msg) => {
              const isBot = msg.role === "bot";
              return (
                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"} mb-1`}>
                  <div
                    className="relative max-w-[65%] px-[10px] py-[6px] text-[15px] leading-[21px]"
                    style={{
                      ...(isBot
                        ? { background: "#fff", color: "#000", borderRadius: "4px 12px 12px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }
                        : { background: "#eeffde", color: "#000", borderRadius: "12px 4px 12px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }
                      ),
                    }}
                  >
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                    <span
                      className="inline-flex items-center float-right ml-2 mt-[4px] text-[11px] leading-none whitespace-nowrap"
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
              <div className="flex justify-start mb-1">
                <div
                  className="max-w-[65%] px-[10px] py-[6px]"
                  style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                >
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={emailStatus === "loading"}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-lg text-[14px] outline-none"
                      style={{ background: "#f0f2f5", color: "#000", border: "1px solid #d4dbe0" }}
                    />
                    <button
                      type="submit"
                      disabled={emailStatus === "loading" || !email}
                      className="px-3 py-2 rounded-lg text-[14px] flex items-center transition-all disabled:opacity-40 text-white"
                      style={{ background: "#3390ec" }}
                    >
                      {emailStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                  <p className="text-[12px] mt-1.5" style={{ color: "#8a9aa5" }}>
                    You'll get access to this site and join my AI newsletter.
                  </p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Desktop bottom input bar — floating over wallpaper */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 absolute bottom-0 left-0 right-0"
          >
          <div
            className="flex-1 flex items-center rounded-xl px-2"
            style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.12)", minHeight: 48 }}
          >
            <div className="relative">
              <button type="button" className="p-2 rounded-full hover:bg-black/5 flex-shrink-0" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
                <Smile className="w-[24px] h-[24px]" style={{ color: "#707579" }} />
              </button>
              {emojiPickerOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setEmojiPickerOpen(false)} />
                  <div
                    className="absolute bottom-12 left-0 z-30 rounded-xl shadow-lg p-3 grid grid-cols-8 gap-1"
                    style={{ background: "#fff", minWidth: 280 }}
                  >
                    {["😀","😂","🥰","😎","🤔","👍","❤️","🔥","🎉","✅","👀","🦞","💪","🙏","😢","🤯","💡","⭐","🚀","😅","🤝","💯","🎯","👋"].map((emoji) => (
                      <button
                        key={emoji}
                        className="w-9 h-9 flex items-center justify-center text-[22px] rounded-lg hover:bg-black/5"
                        onClick={() => {
                          setChatInput(prev => prev + emoji);
                          setEmojiPickerOpen(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message"
                disabled={phase < 5}
                className="w-full px-2 py-2 text-[15px] outline-none bg-transparent"
                style={{ color: "#000" }}
              />
            </form>
          </div>
          {chatInput.trim() ? (
            <button onClick={handleChatSubmit} className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3390ec", color: "#fff" }}>
              <Send className="w-5 h-5" style={{ transform: "rotate(-1deg)" }} />
            </button>
          ) : (
            <button type="button" className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3390ec", color: "#fff" }}>
              <Mic className="w-5 h-5" />
            </button>
          )}
          </div>
        </div>

        {/* Mobile bottom input bar — matches Telegram iOS style */}
        <div
          className="flex md:hidden items-center gap-1 px-2 py-2"
          style={{ background: "#f6f6f6", borderTop: "1px solid #dadce0" }}
        >
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[15px] font-medium text-white"
            style={{ background: "#3390ec" }}
          >
            <Menu className="w-[18px] h-[18px]" />
            Menu
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-black/5">
            <Paperclip className="w-[24px] h-[24px] rotate-[-45deg]" style={{ color: "#707579" }} />
          </button>
          <form onSubmit={handleChatSubmit} className="flex-1 flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message"
              disabled={phase < 5}
              className="w-full px-3 py-2 text-[15px] outline-none rounded-full"
              style={{ color: "#000", background: "#fff", border: "1px solid #dadce0" }}
            />
          </form>
          <button type="button" className="p-2 rounded-full hover:bg-black/5">
            <Clock className="w-[24px] h-[24px]" style={{ color: "#707579" }} />
          </button>
          {chatInput.trim() ? (
            <button onClick={handleChatSubmit} className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3390ec", color: "#fff" }}>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ color: "#3390ec" }}>
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenClawWeb;
