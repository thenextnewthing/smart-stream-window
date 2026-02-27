import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  Trash2,
  Plus,
  ChevronRight,
  Globe,
  Eye,
  EyeOff,
  Pencil,
  KeyRound,
  Wand2,
  Send,
  Loader2,
  Check,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Redirect {
  id: string;
  path: string;
  destination: string;
  visit_count: number;
  created_at: string;
  last_visited_at: string | null;
}

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
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  view_count: number;
  submission_count: number;
  cloned_from: string | null;
  created_at: string;
  updated_at: string;
}

interface StaticPage {
  path: string;
  label: string;
  description: string;
  children?: StaticPage[];
  external?: boolean;
}

// ─── Static site map ─────────────────────────────────────────────────────────

const LOVABLE_PROJECT_ID = "1fb725f6-59d2-4adc-9d02-122eab9f8a4d";

const lovableEditUrl = (path: string) =>
  `https://lovable.dev/projects/${LOVABLE_PROJECT_ID}/chat?message=${encodeURIComponent(`Edit the ${path} page`)}`;

const SITE_MAP: StaticPage[] = [
  {
    path: "/",
    label: "Home",
    description: "Main chat-style landing page",
    children: [],
  },
  {
    path: "/studio",
    label: "Studio",
    description: "Riverside recording studio redirect",
  },
  {
    path: "/youtube",
    label: "YouTube",
    description: "YouTube channel subscription page",
  },
  {
    path: "/caleb-interview",
    label: "Caleb Interview",
    description: "Iframe-cloaked interview page",
  },
  {
    path: "/admin",
    label: "Admin",
    description: "This dashboard (authenticated only)",
    children: [
      {
        path: "/login",
        label: "Login",
        description: "Admin login form",
      },
    ],
  },
  {
    path: "/l/*",
    label: "Link Redirects",
    description: "Dynamic tracked link cloaking (auto-created)",
    external: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const formatShortDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StaticPageRow({ page, depth = 0 }: { page: StaticPage; depth?: number }) {
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
            <span className="font-mono text-sm">{page.path}</span>
          </div>
        </TableCell>
        <TableCell className="font-medium text-sm">{page.label}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{page.description}</TableCell>
        <TableCell>
          {page.external ? (
            <Badge variant="secondary" className="text-xs">Dynamic</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Static</Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            {page.path !== "/l/*" && (
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Visit page"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {!page.external && (
              <a
                href={lovableEditUrl(page.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-70 transition-opacity"
                title="Edit in Lovable"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit</span>
              </a>
            )}
          </div>
        </TableCell>
      </TableRow>
      {page.children?.map((child) => (
        <StaticPageRow key={child.path} page={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Admin = () => {
  const navigate = useNavigate();

  // Redirects state
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectsError, setRedirectsError] = useState<string | null>(null);
  const [redirectSearch, setRedirectSearch] = useState("");

  // Landing pages state
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [lpLoading, setLpLoading] = useState(true);
  const [lpSearch, setLpSearch] = useState("");

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) return;
    setResetSending(true);
    setResetStatus("idle");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSending(false);
    setResetStatus(error ? "error" : "sent");
  };

  // ── AI Editor ──────────────────────────────────────────────────────────────
  const [editPage, setEditPage] = useState<LandingPage | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<LandingPage> | null>(null);
  const [editSummary, setEditSummary] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const SUPABASE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const handleAIEdit = async () => {
    if (!editPage || !editInstruction.trim() || editLoading) return;
    setEditLoading(true);
    setEditDraft(null);
    setEditSummary(null);
    setEditSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/edit-landing-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ instruction: editInstruction.trim(), currentPage: editPage }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        alert(json.error ?? "AI edit failed. Try again.");
        return;
      }
      const { summary, ...fields } = json.updates;
      setEditDraft({ ...editPage, ...fields });
      setEditSummary(summary ?? null);
      setEditInstruction("");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleApplyDraft = async () => {
    if (!editDraft || !editPage) return;
    setEditSaving(true);
    const { id, created_at, updated_at, view_count, submission_count, cloned_from, ...fields } = editDraft as LandingPage;
    const { error } = await supabase
      .from("landing_pages")
      .update(fields)
      .eq("id", editPage.id);
    setEditSaving(false);
    if (!error) {
      setLandingPages((prev) =>
        prev.map((p) => p.id === editPage.id ? { ...p, ...fields } : p)
      );
      setEditPage((prev) => prev ? { ...prev, ...fields } : prev);
      setEditDraft(null);
      setEditSummary(null);
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
    }
  };

  // New / clone dialog
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageSaving, setNewPageSaving] = useState(false);
  const [cloneSource, setCloneSource] = useState<LandingPage | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      // Load redirects
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-redirects`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          setRedirectsError(json.error ?? "Failed to load redirects.");
        } else {
          setRedirects(json.data ?? []);
        }
      } catch {
        setRedirectsError("Failed to connect to the server.");
      } finally {
        setRedirectsLoading(false);
      }

      // Load landing pages
      const { data: pages, error: pagesErr } = await supabase
        .from("landing_pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!pagesErr && pages) setLandingPages(pages as LandingPage[]);
      setLpLoading(false);
    };

    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ── Redirect filtering ──────────────────────────────────────────────────────
  const filteredRedirects = useMemo(() => {
    const q = redirectSearch.toLowerCase().trim();
    if (!q) return redirects;
    return redirects.filter(
      (r) =>
        r.path.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
    );
  }, [redirects, redirectSearch]);

  // ── Landing page filtering ──────────────────────────────────────────────────
  const filteredLandingPages = useMemo(() => {
    const q = lpSearch.toLowerCase().trim();
    if (!q) return landingPages;
    return landingPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [landingPages, lpSearch]);

  // ── Create / Clone landing page ─────────────────────────────────────────────
  const openNewPage = () => {
    setCloneSource(null);
    setNewPageTitle("");
    setNewPageSlug("");
    setNewPageOpen(true);
  };

  const openClonePage = (page: LandingPage) => {
    setCloneSource(page);
    setNewPageTitle(`${page.title} (copy)`);
    setNewPageSlug(`${page.slug}-copy`);
    setNewPageOpen(true);
  };

  const handleSaveNewPage = async () => {
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;
    setNewPageSaving(true);

    const payload: Partial<LandingPage> = cloneSource
      ? {
          ...cloneSource,
          id: undefined as unknown as string,
          title: newPageTitle.trim(),
          slug: newPageSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          cloned_from: cloneSource.id,
          is_published: false,
          view_count: 0,
          submission_count: 0,
          created_at: undefined as unknown as string,
          updated_at: undefined as unknown as string,
        }
      : {
          title: newPageTitle.trim(),
          slug: newPageSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          headline: "You asked for this video",
          description: "It'll show you how my friends are saving money on OpenClaw usage.",
          cta_label: "See the video",
          subheadline: "Of course you'll also join my newsletter, but I'll never spam you.",
        };

    // Remove undefined keys
    Object.keys(payload).forEach((k) => {
      if ((payload as Record<string, unknown>)[k] === undefined) delete (payload as Record<string, unknown>)[k];
    });

    const { data, error } = await supabase
      .from("landing_pages")
      .insert(payload as LandingPage)
      .select()
      .single();

    setNewPageSaving(false);

    if (!error && data) {
      setLandingPages((prev) => [data as LandingPage, ...prev]);
      setNewPageOpen(false);
      // Navigate to the new creator page for vibe coding
      if (!cloneSource) {
        navigate(`/admin/create/${data.id}`);
      }
    }
  };

  // ── Toggle publish ──────────────────────────────────────────────────────────
  const handleTogglePublish = async (page: LandingPage) => {
    const { error } = await supabase
      .from("landing_pages")
      .update({ is_published: !page.is_published })
      .eq("id", page.id);

    if (!error) {
      setLandingPages((prev) =>
        prev.map((p) => p.id === page.id ? { ...p, is_published: !p.is_published } : p)
      );
    }
  };

  // ── Delete landing page ─────────────────────────────────────────────────────
  const handleDeletePage = async (id: string) => {
    const { error } = await supabase.from("landing_pages").delete().eq("id", id);
    if (!error) {
      setLandingPages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
              <p className="text-sm text-muted-foreground">Manage your site, landing pages, and links</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setResetEmail(""); setResetStatus("idle"); setResetOpen(true); }}>
            <KeyRound className="h-4 w-4" />
            Reset password
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="landing">
          <TabsList>
            <TabsTrigger value="pages" className="gap-2">
              <Globe className="h-4 w-4" />
              Site Pages
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-2">
              <FileText className="h-4 w-4" />
              Landing Pages
              {landingPages.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {landingPages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <Link2 className="h-4 w-4" />
              Tracked Links
              {redirects.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {redirects.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Site Pages ─────────────────────────────────────────────────── */}
          <TabsContent value="pages" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                All statically-defined routes in your application. Nested pages are indented beneath their parent.
              </p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Path</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SITE_MAP.map((page) => (
                      <StaticPageRow key={page.path} page={page} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Landing Pages ──────────────────────────────────────────────── */}
          <TabsContent value="landing" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                {!lpLoading && landingPages.length > 0 && (
                  <Input
                    placeholder="Search landing pages…"
                    value={lpSearch}
                    onChange={(e) => setLpSearch(e.target.value)}
                    className="max-w-sm"
                  />
                )}
                <Button size="sm" className="gap-1.5 ml-auto" onClick={openNewPage}>
                  <Plus className="h-4 w-4" />
                  New page
                </Button>
              </div>

              {lpLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : landingPages.length === 0 ? (
                <div className="rounded-md border border-dashed flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <p className="font-medium">No landing pages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first landing page to capture leads with a custom URL.
                    </p>
                  </div>
                  <Button size="sm" onClick={openNewPage}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create first page
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLandingPages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                            No results for "{lpSearch}"
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLandingPages.map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium text-sm">
                              {page.title}
                              {page.cloned_from && (
                                <span className="ml-2 text-xs text-muted-foreground">(cloned)</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              /{page.slug}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {page.view_count.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {page.submission_count.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleTogglePublish(page)}
                                className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                              >
                                {page.is_published ? (
                              <>
                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-primary font-medium">Published</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Draft</span>
                                  </>
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatShortDate(page.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 justify-end">
                                {/* AI Edit — opens full editor */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary"
                                  title="Edit page"
                                  onClick={() => navigate(`/admin/create/${page.id}`)}
                                >
                                  <Wand2 className="h-3.5 w-3.5" />
                                </Button>
                                {/* View live */}
                                <a
                                  href={`/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View live page"
                                >
                                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild={false}>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </a>
                                {/* Clone */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Clone"
                                  onClick={() => openClonePage(page)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete "{page.title}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the landing page and all its data. This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleDeletePage(page.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tracked Links ──────────────────────────────────────────────── */}
          <TabsContent value="links" className="mt-4">
            <div className="space-y-4">
              {!redirectsLoading && !redirectsError && redirects.length > 0 && (
                <Input
                  placeholder="Search by path or destination…"
                  value={redirectSearch}
                  onChange={(e) => setRedirectSearch(e.target.value)}
                  className="max-w-sm"
                />
              )}

              {redirectsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : redirectsError ? (
                <div className="text-center py-20">
                  <p className="text-destructive">{redirectsError}</p>
                </div>
              ) : redirects.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-sm">
                    No tracked links yet. Share a link like{" "}
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
                      {filteredRedirects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-10">
                            No results for "{redirectSearch}"
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRedirects.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-sm">
                              <a
                                href={`/l/${r.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
                              >
                                /l/{r.path}
                              </a>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── New / Clone dialog ──────────────────────────────────────────────── */}
      <Dialog open={newPageOpen} onOpenChange={setNewPageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {cloneSource ? `Clone "${cloneSource.title}"` : "New landing page"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="lp-title">Page title</Label>
              <Input
                id="lp-title"
                placeholder="My Awesome Page"
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  if (!cloneSource) {
                    setNewPageSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    );
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-slug">URL slug</Label>
              <Input
                id="lp-slug"
                placeholder="my-awesome-page"
                value={newPageSlug}
                onChange={(e) =>
                  setNewPageSlug(
                    e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                  )
                }
              />
              {newPageSlug && (
                <p className="text-xs text-muted-foreground truncate">
                  {window.location.origin}/{newPageSlug}
                </p>
              )}
            </div>
            {cloneSource && (
              <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                All content, settings, and configuration will be copied. Analytics will start fresh.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewPage}
              disabled={!newPageTitle.trim() || !newPageSlug.trim() || newPageSaving}
            >
              {newPageSaving ? "Creating…" : cloneSource ? "Clone page" : "Create page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password dialog ───────────────────────────────────────── */}
      <Dialog open={resetOpen} onOpenChange={(v) => { setResetOpen(v); if (!v) setResetStatus("idle"); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset admin password</DialogTitle>
          </DialogHeader>
          {resetStatus === "sent" ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-sm font-medium text-primary">Password reset email sent!</p>
              <p className="text-xs text-muted-foreground">
                Check the inbox for <strong>{resetEmail}</strong> and follow the link to set a new password.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Enter the admin email address. We'll send a secure link to reset the password.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
              </div>
              {resetStatus === "error" && (
                <p className="text-xs text-destructive">Failed to send reset email. Check the address and try again.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              {resetStatus === "sent" ? "Close" : "Cancel"}
            </Button>
            {resetStatus !== "sent" && (
              <Button onClick={handleResetPassword} disabled={!resetEmail.trim() || resetSending}>
                {resetSending ? "Sending…" : "Send reset link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── AI Landing Page Editor Sheet ────────────────────────────────── */}
      <Sheet open={!!editPage} onOpenChange={(open) => { if (!open) { setEditPage(null); setEditDraft(null); setEditSummary(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col gap-0 p-0 overflow-hidden">
          <SheetHeader className="px-5 pt-5 pb-3 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-primary" />
              AI Edit: {editPage?.title}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Current fields */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current content</p>
              {[
                { label: "Headline", value: (editDraft ?? editPage)?.headline },
                { label: "Subheadline", value: (editDraft ?? editPage)?.subheadline },
                { label: "Description", value: (editDraft ?? editPage)?.description },
                { label: "CTA", value: (editDraft ?? editPage)?.cta_label },
                { label: "SEO title", value: (editDraft ?? editPage)?.seo_title },
                { label: "SEO description", value: (editDraft ?? editPage)?.seo_description },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="rounded-md border bg-muted/30 px-3 py-2 space-y-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm leading-snug">{value}</p>
                  </div>
                ) : null
              )}
            </div>

            {/* AI response summary */}
            {editSummary && (
              <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 flex items-start gap-2">
                <Wand2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-primary">{editSummary}</p>
              </div>
            )}

            {/* Apply / saved state */}
            {editDraft && !editSaved && (
              <Button className="w-full gap-2" onClick={handleApplyDraft} disabled={editSaving}>
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editSaving ? "Saving…" : "Apply changes"}
              </Button>
            )}
            {editSaved && (
              <div className="flex items-center gap-2 justify-center text-sm text-primary font-medium py-1">
                <Check className="h-4 w-4" />
                Changes saved!
              </div>
            )}
          </div>

          {/* Instruction input */}
          <div className="border-t px-4 py-4 shrink-0 space-y-2 bg-background">
            <p className="text-xs text-muted-foreground">Tell the AI what to change about this landing page…</p>
            <div className="flex gap-2">
              <Textarea
                ref={editTextareaRef}
                placeholder="Make the headline punchier. Add urgency to the CTA. Rewrite the description to focus on the outcome…"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAIEdit();
                  }
                }}
                className="min-h-[72px] resize-none text-sm"
                disabled={editLoading}
              />
              <Button
                size="icon"
                className="h-auto w-10 shrink-0 self-end"
                onClick={handleAIEdit}
                disabled={editLoading || !editInstruction.trim()}
              >
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Admin;
