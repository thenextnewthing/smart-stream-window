import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LandingPageChatLayout } from "@/components/LandingPageChatLayout";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  headline: string | null;
  subheadline: string | null;
  description: string | null;
  cta_label: string | null;
  lead_magnet_type: string | null;
  lead_magnet_value: string | null;
  hero_image_url: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  utm_medium: string | null;
}

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!slug) { navigate("/", { replace: true }); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        // No landing page found — try redirect lookup
        setRedirecting(true);
        try {
          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/track-redirect`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ path: slug }),
            }
          );
          const json = await res.json();
          if (res.ok && json.destination) {
            window.location.replace(json.destination);
            return;
          }
        } catch {
          // redirect lookup failed, show not found
        }
        setRedirecting(false);
        setNotFound(true);
      } else {
        setPage(data as LandingPage);
        supabase
          .rpc("increment_view_count", { page_id: data.id })
          .then(() => {});
      }
      setLoading(false);
    };

    load();
  }, [slug, navigate]);

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-6 gap-4">
        <p className="text-2xl font-semibold">Page not found</p>
        <p className="text-muted-foreground">This landing page doesn't exist or isn't published yet.</p>
      </div>
    );
  }

  return (
    <>
      <title>{page.seo_title ?? page.title}</title>
      {page.seo_description && (
        <meta name="description" content={page.seo_description} />
      )}

      <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
        <LandingPageChatLayout
          slug={page.slug}
          headline={page.headline}
          subheadline={page.subheadline}
          description={page.description}
          cta_label={page.cta_label}
          hero_image_url={page.hero_image_url}
          lead_magnet_type={page.lead_magnet_type}
          lead_magnet_value={page.lead_magnet_value}
          utm_medium={page.utm_medium}
        />
      </main>
    </>
  );
};

export default LandingPageView;
