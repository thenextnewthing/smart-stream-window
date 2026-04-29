import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a page view in `public.page_views` whenever the route changes.
 * Skips admin/auth routes to keep analytics clean.
 */
export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    // Don't track admin/auth pages
    if (
      path.startsWith("/admin") ||
      path === "/login" ||
      path === "/forgot-password" ||
      path === "/reset-password"
    ) {
      return;
    }
    // Fire-and-forget
    supabase.from("page_views").insert({ page_path: path }).then(() => {});
  }, [location.pathname]);

  return null;
}
