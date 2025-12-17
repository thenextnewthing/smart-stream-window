import { useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { VideoCarousel } from "@/components/VideoCarousel";
import { PodcastPlatforms } from "@/components/PodcastPlatforms";
import { NewsletterForm } from "@/components/NewsletterForm";

interface UserMessage {
  content: string;
  showResponse: boolean;
}

const Index = () => {
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);

  const handleUserSubmit = (message: string) => {
    setUserMessages((prev) => [...prev, { content: message, showResponse: false }]);
    // Show response after a brief delay
    setTimeout(() => {
      setUserMessages((prev) => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, showResponse: true } : msg
        )
      );
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-3">
        {/* Welcome message */}
        <ChatMessage role="assistant" delay={0}>
          <p className="text-foreground">How can I blow your mind?</p>
        </ChatMessage>

        {/* Question 1: Videos */}
        <ChatMessage role="user" delay={1000}>
          <p className="text-foreground">I want to see what the big thinkers in AI are building.</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={2000}>
          <VideoCarousel />
        </ChatMessage>

        {/* Question 2: Podcast */}
        <ChatMessage role="user" delay={3000}>
          <p className="text-foreground">I prefer audio. I want podcast links</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={4000}>
          <PodcastPlatforms />
        </ChatMessage>

        {/* Question 3: Newsletter */}
        <ChatMessage role="user" delay={5000}>
          <p className="text-foreground">I want the playbooks these founders use to build.</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={6000}>
          <NewsletterForm />
        </ChatMessage>

        {/* Dynamic user messages */}
        {userMessages.map((msg, index) => (
          <div key={index}>
            <ChatMessage role="user" delay={0}>
              <p className="text-foreground">{msg.content}</p>
            </ChatMessage>
            {msg.showResponse && (
              <ChatMessage role="assistant" delay={0}>
                <p className="text-foreground">
                  Dude, I'm not a real AI. I'm a landing page with a playful AI-like design. Could you tell that? You need to brush up on how AI works.{" "}
                  <a 
                    href="https://youtube.com/@TheNextNewThingAI?sub_confirmation=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Go here.
                  </a>
                </p>
              </ChatMessage>
            )}
          </div>
        ))}
      </main>

      <ChatInput onSubmit={handleUserSubmit} />
    </div>
  );
};

export default Index;