export function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-chat-border">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xl">
          🧨
        </div>
        <div>
          <h1 className="font-serif text-lg font-medium text-foreground">The Next New Thing</h1>
          <p className="text-xs text-muted-foreground">The Podcast for AI Creator's by the Ultra-Pushy Interviewer Andrew Warner</p>
        </div>
      </div>
    </header>
  );
}
