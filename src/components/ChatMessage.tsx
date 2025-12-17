import { ReactNode } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  children: ReactNode;
  delay?: number;
}

export function ChatMessage({ role, children, delay = 0 }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className="animate-message-in opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
      >
        <div
          className={`max-w-2xl px-5 py-4 rounded-2xl ${
            isUser
              ? "bg-chat-user text-foreground"
              : "bg-chat-assistant border border-chat-border text-foreground"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
