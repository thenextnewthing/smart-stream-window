import { useState, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Temporary redirect to Riverside interview
  useEffect(() => {
    window.location.href = "https://riverside.com/studio/mixergy-interview?t=6f87e76c2d632e39a11b&redirect_num=1";
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll when playbook message appears
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 5100); // When "I want the playbooks..." message appears (delay 5000)
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (userMessages.some(msg => msg.showResponse)) {
      scrollToBottom();
    }
  }, [userMessages]);

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
                {(() => {
                  const responses = [
                    <p className="text-foreground">Dude, I'm not a real AI. I'm a landing page with a playful AI-like design. Couldn't you tell that? You need to brush up on how AI works.{" "}<a href="https://youtube.com/@TheNextNewThingAI?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Go here to learn from the best.</a></p>,
                    <p className="text-foreground">Hmm, you're still trying to talk with me? Scroll up. The action is up there.</p>,
                    <p className="text-foreground">Again, I'm not a real AI. My whole job is to get you to subscribe so Andrew's subscriber count goes up and he'll feel good about himself. Have you tried{" "}<a href="https://youtube.com/@TheNextNewThingAI?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">his YouTube link</a>? He's almost at 5 subscribers.</p>,
                    <p className="text-foreground">You're still typing here?</p>,
                    <p className="text-foreground">Hmmmm. You know nothing happens here, right? This is a landing page designed to get you to subscribe and move on?</p>,
                    <p className="text-foreground">✋ You're talking with the wrong bot, my friend.</p>,
                    <p className="text-foreground">I'm running out of things to say to you.</p>,
                  ];
                  return responses[index % responses.length];
                })()}
              </ChatMessage>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <ChatInput onSubmit={handleUserSubmit} />
    </div>
  );
};

export default Index;