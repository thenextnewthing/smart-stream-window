import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { VideoCarousel } from "@/components/VideoCarousel";
import { PodcastPlatforms } from "@/components/PodcastPlatforms";
import { NewsletterForm } from "@/components/NewsletterForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-3">
        {/* Welcome message */}
        <ChatMessage role="assistant" delay={0}>
          <p className="text-foreground">How can I blow your mind?</p>
        </ChatMessage>

        {/* Question 1: Videos */}
        <ChatMessage role="user" delay={300}>
          <p className="text-foreground">I want to see what the big thinkers in AI are building.</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={600}>
          <VideoCarousel />
        </ChatMessage>

        {/* Question 2: Podcast */}
        <ChatMessage role="user" delay={1200}>
          <p className="text-foreground">I prefer audio. I want podcast links</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={1500}>
          <PodcastPlatforms />
        </ChatMessage>

        {/* Question 3: Newsletter */}
        <ChatMessage role="user" delay={2100}>
          <p className="text-foreground">I want the playbooks these founders use to build.</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={2400}>
          <NewsletterForm />
        </ChatMessage>
      </main>

      <ChatInput />
    </div>
  );
};

export default Index;
