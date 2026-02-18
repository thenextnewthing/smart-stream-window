import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const LinkRedirect = () => {
  const { "*": wildcard } = useParams();
  const [destination, setDestination] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = wildcard ?? "";

    // Block obviously external attempts before even calling the function
    if (/^(https?:)?\/\//i.test(path) || path.includes("..")) {
      setError("External URLs are not allowed.");
      setLoading(false);
      return;
    }

    const track = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/track-redirect`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ path }),
          }
        );

        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error ?? "This link is unavailable.");
          return;
        }

        const dest: string = json.destination;

        // Final client-side safety check: destination must be an internal path
        // Only allow destinations on the approved domain
        const ALLOWED_ORIGIN = "https://your-doc-quest.lovable.app";
        if (!dest.startsWith(ALLOWED_ORIGIN)) {
          setError("This link points to a destination that is not permitted.");
          return;
        }

        setDestination(dest);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    track();
  }, [wildcard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center space-y-3 max-w-sm px-6">
          <p className="text-lg font-semibold">Link Unavailable</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!destination) return null;

  return (
    <iframe
      src={destination}
      className="w-full h-screen border-0"
      title="Redirected page"
      allow="clipboard-write"
    />
  );
};

export default LinkRedirect;
