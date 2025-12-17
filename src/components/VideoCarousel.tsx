import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "The Future of AI: What's Next?",
    channel: "Lex Fridman",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    duration: "2:34:15",
  },
  {
    id: "2",
    title: "How ChatGPT Actually Works",
    channel: "3Blue1Brown",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop",
    duration: "26:42",
  },
  {
    id: "3",
    title: "AI Won't Replace You, But...",
    channel: "Fireship",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop",
    duration: "8:21",
  },
  {
    id: "4",
    title: "Building AGI: The Path Forward",
    channel: "Two Minute Papers",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=225&fit=crop",
    duration: "12:08",
  },
  {
    id: "5",
    title: "Neural Networks Explained",
    channel: "Andrej Karpathy",
    thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=225&fit=crop",
    duration: "1:45:30",
  },
];

export function VideoCarousel() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
      {videos.map((video, index) => (
        <a
          key={video.id}
          href="#"
          className="flex-shrink-0 w-64 group animate-slide-up opacity-0"
          style={{ animationDelay: `${index * 100 + 200}ms` }}
        >
          <div className="relative overflow-hidden rounded-xl bg-muted">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-xs px-2 py-0.5 rounded font-medium">
              {video.duration}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
