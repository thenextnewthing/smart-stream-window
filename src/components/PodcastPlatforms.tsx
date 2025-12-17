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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {platforms.map((platform, index) => (
        <a
          key={platform.name}
          href={platform.url}
          className="flex-shrink-0 flex items-center justify-center p-2 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 group animate-slide-up opacity-0"
          style={{ animationDelay: `${index * 80 + 200}ms` }}
        >
          <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 group-hover:scale-110 transform">
            <img
              src={platform.logo}
              alt={platform.name}
              className="w-8 h-8 object-contain"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
