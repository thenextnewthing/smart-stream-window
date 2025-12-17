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
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Welcome message */}
        <ChatMessage role="assistant" delay={0}>
          <p className="text-foreground">How can I blow your mind?</p>
        </ChatMessage>

        {/* Question 1: Videos */}
        <ChatMessage role="user" delay={300}>
          <p className="text-foreground">How can I blow your mind?</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={600}>
          <VideoCarousel />
        </ChatMessage>

        {/* Question 2: Podcast */}
        <ChatMessage role="user" delay={1200}>
          <p className="text-foreground">How can I subscribe to the podcast?</p>
        </ChatMessage>

        <ChatMessage role="assistant" delay={1500}>
          <PodcastPlatforms />
        </ChatMessage>

        {/* Question 3: Newsletter */}
        <ChatMessage role="user" delay={2100}>
          <p className="text-foreground">Can I subscribe to the newsletter?</p>
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
