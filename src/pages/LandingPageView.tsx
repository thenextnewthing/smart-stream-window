import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NewsletterForm } from "@/components/NewsletterForm";

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
}

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        setNotFound(true);
      } else {
        setPage(data as LandingPage);
        // Increment view count (fire & forget)
        supabase
          .from("landing_pages")
          .update({ view_count: (data.view_count ?? 0) + 1 })
          .eq("id", data.id)
          .then(() => {});
      }
      setLoading(false);
    };

    load();
  }, [slug, navigate]);

  if (loading) {
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
      {/* SEO */}
      <title>{page.seo_title ?? page.title}</title>
      {page.seo_description && (
        <meta name="description" content={page.seo_description} />
      )}

      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full mx-auto space-y-8 text-center">
          {/* Hero image */}
          {page.hero_image_url && (
            <img
              src={page.hero_image_url}
              alt="Hero"
              className="w-full rounded-2xl object-cover max-h-72 mx-auto"
            />
          )}

          {page.headline && (
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              {page.headline}
            </h1>
          )}
          {page.subheadline && (
            <p className="text-lg sm:text-xl text-muted-foreground">
              {page.subheadline}
            </p>
          )}
          {page.description && (
            <p className="text-base text-muted-foreground whitespace-pre-line">
              {page.description}
            </p>
          )}

          {/* Lead capture */}
          <div className="flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPageView;
