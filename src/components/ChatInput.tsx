import { ArrowUp } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSubmit?: (message: string) => void;
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && onSubmit) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about AI..."
            className="w-full px-5 py-4 pr-14 rounded-2xl bg-card border border-chat-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground shadow-lg"
          />
          <button 
            onClick={handleSubmit}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          This is a demo interface. Messages shown are pre-defined.
        </p>
      </div>
    </div>
  );
}