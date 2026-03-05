import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const LinkRedirect = () => {
  const { "*": wildcard } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = wildcard ?? "";

    if (!path || path.trim() === "") {
      navigate("/", { replace: true });
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
          setLoading(false);
          return;
        }

        // 302-style redirect
        window.location.replace(json.destination);
      } catch {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    track();
  }, [wildcard]);

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Redirecting…</p>
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

  return null;
};

export default LinkRedirect;
