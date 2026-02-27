import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LandingPageChatLayout } from "@/components/LandingPageChatLayout";

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
      <title>{page.seo_title ?? page.title}</title>
      {page.seo_description && (
        <meta name="description" content={page.seo_description} />
      )}

      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <LandingPageChatLayout
          slug={page.slug}
          headline={page.headline}
          subheadline={page.subheadline}
          description={page.description}
          cta_label={page.cta_label}
          hero_image_url={page.hero_image_url}
          lead_magnet_type={page.lead_magnet_type}
          lead_magnet_value={page.lead_magnet_value}
        />
      </main>
    </>
  );
};

export default LandingPageView;
