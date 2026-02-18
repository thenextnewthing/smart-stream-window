import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Redirect {
  id: string;
  path: string;
  destination: string;
  visit_count: number;
  created_at: string;
  last_visited_at: string | null;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Admin = () => {
  const navigate = useNavigate();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-redirects`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error ?? "Failed to load redirects.");
          return;
        }

        setRedirects(json.data ?? []);
      } catch {
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Redirect Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All tracked links sorted by visit count
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        ) : redirects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">
              No redirects yet. Share a link like{" "}
              <code className="bg-muted px-1 rounded text-xs">
                {window.location.origin}/l/youtube
              </code>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link path</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead>Last visited</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">
                      /l/{r.path}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {r.destination}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {r.visit_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.last_visited_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
