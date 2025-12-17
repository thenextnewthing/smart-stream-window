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
    id: "r70l1TBkI_k",
    title: "The Next New Thing AI",
    channel: "The Next New Thing AI",
    thumbnail: "https://img.youtube.com/vi/r70l1TBkI_k/hqdefault.jpg",
    duration: "",
  },
  {
    id: "Y9ja7Oj1Qcs",
    title: "The Next New Thing AI",
    channel: "The Next New Thing AI",
    thumbnail: "https://img.youtube.com/vi/Y9ja7Oj1Qcs/hqdefault.jpg",
    duration: "",
  },
  {
    id: "rkgK_zEe5EI",
    title: "The Next New Thing AI",
    channel: "The Next New Thing AI",
    thumbnail: "https://img.youtube.com/vi/rkgK_zEe5EI/hqdefault.jpg",
    duration: "",
  },
  {
    id: "2CmZ_6ji5Jk",
    title: "The Next New Thing AI",
    channel: "The Next New Thing AI",
    thumbnail: "https://img.youtube.com/vi/2CmZ_6ji5Jk/hqdefault.jpg",
    duration: "",
  },
  {
    id: "5H-B_tlYJps",
    title: "The Next New Thing AI",
    channel: "The Next New Thing AI",
    thumbnail: "https://img.youtube.com/vi/5H-B_tlYJps/hqdefault.jpg",
    duration: "",
  },
];

export function VideoCarousel() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
      {videos.map((video, index) => (
        <a
          key={video.id}
          href="https://youtube.com/@TheNextNewThingAI?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
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
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transition-transform duration-300 shadow-lg group-hover:scale-110">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
