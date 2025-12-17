const platforms = [
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg",
    color: "#1DB954",
    url: "#",
  },
  {
    name: "Apple Podcasts",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Podcasts_%28iOS%29.svg",
    color: "#9933FF",
    url: "#",
  },
  {
    name: "YouTube",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    color: "#FF0000",
    url: "#",
  },
  {
    name: "Google Podcasts",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/25/Google_Podcasts_icon.svg",
    color: "#4285F4",
    url: "#",
  },
  {
    name: "Overcast",
    logo: "https://overcast.fm/img/logo.svg?3",
    color: "#FC7E0F",
    url: "#",
  },
];

export function PodcastPlatforms() {
  return (
    <div className="mt-4">
      <p className="text-foreground mb-4">
        You can subscribe to the podcast on any of these platforms:
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {platforms.map((platform, index) => (
          <a
            key={platform.name}
            href={platform.url}
            className="flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 group animate-slide-up opacity-0 min-w-[100px]"
            style={{ animationDelay: `${index * 80 + 200}ms` }}
          >
            <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 group-hover:scale-110 transform">
              <img
                src={platform.logo}
                alt={platform.name}
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
              {platform.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
