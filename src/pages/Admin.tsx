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
  Send,
  Loader2,
  Check,
  Archive,
  ArchiveRestore,
  Users,
  Download,
  BookOpen,
  GripVertical,
  Image,
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
  redirect_type: string;
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
  deleted_at: string | null;
}

interface StaticPage {
  path: string;
  label: string;
  description: string;
  children?: StaticPage[];
  external?: boolean;
}

interface ResourceLink {
  label: string;
  url: string;
}

interface ResourceCenterItem {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  thumbnail_url: string | null;
  links: ResourceLink[];
  display_order: number;
  is_visible: boolean;
  created_at: string;
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

  // Waitlist state
  interface WaitlistEntry {
    id: string;
    name: string;
    email: string;
    goals: string | null;
    event_slug: string;
    created_at: string;
  }
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(true);

  // Resource center state
  const [resourceItems, setResourceItems] = useState<ResourceCenterItem[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourceEditOpen, setResourceEditOpen] = useState(false);
  const [resourceEditItem, setResourceEditItem] = useState<Partial<ResourceCenterItem> | null>(null);
  const [resourceSaving, setResourceSaving] = useState(false);

  // New redirect state
  const [newRedirectOpen, setNewRedirectOpen] = useState(false);
  const [newRedirectSlug, setNewRedirectSlug] = useState("");
  const [newRedirectDest, setNewRedirectDest] = useState("");
  const [newRedirectSaving, setNewRedirectSaving] = useState(false);

  // Edit redirect state
  const [editRedirect, setEditRedirect] = useState<Redirect | null>(null);
  const [editRedirectSlug, setEditRedirectSlug] = useState("");
  const [editRedirectDest, setEditRedirectDest] = useState("");
  const [editRedirectSaving, setEditRedirectSaving] = useState(false);

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

      // Load waitlist
      const { data: wl } = await supabase
        .from("event_waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (wl) setWaitlist(wl);
      setWaitlistLoading(false);

      // Load resource center items
      const { data: rcItems } = await supabase
        .from("resource_center_items")
        .select("*")
        .order("display_order", { ascending: true });
      if (rcItems) setResourceItems(rcItems.map((r: any) => ({ ...r, links: r.links || [] })));
      setResourcesLoading(false);
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
  const activePages = useMemo(() => landingPages.filter((p) => !p.deleted_at), [landingPages]);
  const archivedPages = useMemo(() => landingPages.filter((p) => !!p.deleted_at), [landingPages]);

  const filteredLandingPages = useMemo(() => {
    const q = lpSearch.toLowerCase().trim();
    if (!q) return activePages;
    return activePages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [activePages, lpSearch]);

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

    if (error) {
      if (error.code === "23505") {
        alert(`A page with the slug "${newPageSlug.trim()}" already exists. Please choose a different URL.`);
      } else {
        alert(`Error creating page: ${error.message}`);
      }
      return;
    }

    if (data) {
      setLandingPages((prev) => [data as LandingPage, ...prev]);
      setNewPageOpen(false);
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

  // ── Soft-delete landing page ──────────────────────────────────────────────────
  const handleDeletePage = async (id: string) => {
    const { error } = await supabase
      .from("landing_pages")
      .update({ deleted_at: new Date().toISOString(), is_published: false } as any)
      .eq("id", id);
    if (!error) {
      setLandingPages((prev) =>
        prev.map((p) => p.id === id ? { ...p, deleted_at: new Date().toISOString(), is_published: false } : p)
      );
    }
  };

  // ── Restore landing page ────────────────────────────────────────────────────
  const handleRestorePage = async (id: string) => {
    const { error } = await supabase
      .from("landing_pages")
      .update({ deleted_at: null } as any)
      .eq("id", id);
    if (!error) {
      setLandingPages((prev) =>
        prev.map((p) => p.id === id ? { ...p, deleted_at: null } : p)
      );
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
              {activePages.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {activePages.length}
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
            <TabsTrigger value="waitlist" className="gap-2">
              <Users className="h-4 w-4" />
              Waitlist
              {waitlist.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {waitlist.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
              {resourceItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {resourceItems.length}
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
                {!lpLoading && activePages.length > 0 && (
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
              ) : activePages.length === 0 ? (
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
                                  <Pencil className="h-3.5 w-3.5" />
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
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      title="Archive"
                                    >
                                      <Archive className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Archive "{page.title}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will unpublish the page and move it to the archive. You can restore it anytime.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeletePage(page.id)}
                                      >
                                        Archive
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

              {/* ── Archived pages ────────────────────────────────────────── */}
              {archivedPages.length > 0 && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archived ({archivedPages.length})
                  </summary>
                  <div className="rounded-md border mt-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Archived</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedPages.map((page) => (
                          <TableRow key={page.id} className="text-muted-foreground">
                            <TableCell className="text-sm">{page.title}</TableCell>
                            <TableCell className="font-mono text-sm">/{page.slug}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(page.deleted_at!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                                onClick={() => handleRestorePage(page.id)}
                              >
                                <ArchiveRestore className="h-3.5 w-3.5" />
                                Restore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </details>
              )}
            </div>
          </TabsContent>

          {/* ── Tracked Links ──────────────────────────────────────────────── */}
          <TabsContent value="links" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                {!redirectsLoading && !redirectsError && redirects.length > 0 && (
                  <Input
                    placeholder="Search by path or destination…"
                    value={redirectSearch}
                    onChange={(e) => setRedirectSearch(e.target.value)}
                    className="max-w-sm"
                  />
                )}
                <Button size="sm" className="gap-1.5 ml-auto" onClick={() => { setNewRedirectSlug(""); setNewRedirectDest(""); setNewRedirectOpen(true); }}>
                  <Plus className="h-4 w-4" />
                  New redirect
                </Button>
              </div>

              {redirectsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : redirectsError ? (
                <div className="text-center py-20">
                  <p className="text-destructive">{redirectsError}</p>
                </div>
              ) : redirects.length === 0 ? (
                <div className="rounded-md border border-dashed flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <Link2 className="h-10 w-10 text-muted-foreground/40" />
                  <div>
                    <p className="font-medium">No redirects yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first redirect to start tracking link visits.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => { setNewRedirectSlug(""); setNewRedirectDest(""); setNewRedirectOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create first redirect
                  </Button>
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
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRedirects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-10">
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
                            <TableCell className="font-mono text-sm text-muted-foreground max-w-[300px] truncate">
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
                            <TableCell>
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary"
                                  title="Edit redirect"
                                  onClick={() => {
                                    setEditRedirect(r);
                                    setEditRedirectSlug(r.path);
                                    setEditRedirectDest(r.destination);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      title="Delete redirect"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete redirect "/l/{r.path}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove this redirect. Anyone visiting this link will see a "not found" page.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          const { error } = await supabase.from("link_redirects").delete().eq("id", r.id);
                                          if (!error) setRedirects((prev) => prev.filter((x) => x.id !== r.id));
                                        }}
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

          {/* ── Waitlist ───────────────────────────────────────────────────── */}
          <TabsContent value="waitlist" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  People who signed up for the waitlist across your events.
                </p>
                {waitlist.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const headers = ["Name", "Email", "Event", "Goals", "Signed Up"];
                      const rows = waitlist.map((e) => [
                        e.name,
                        e.email,
                        e.event_slug,
                        e.goals || "",
                        new Date(e.created_at).toLocaleDateString(),
                      ]);
                      const csv = [headers, ...rows]
                        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                        .join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "waitlist.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                )}
              </div>
              {waitlistLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : waitlist.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No waitlist entries yet.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Goals</TableHead>
                        <TableHead>Signed Up</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium text-sm">{entry.name}</TableCell>
                          <TableCell className="text-sm">{entry.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{entry.event_slug}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {entry.goals || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatShortDate(entry.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Resources ──────────────────────────────────────────────────── */}
          <TabsContent value="resources" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Manage items shown in the <a href="/resources" target="_blank" className="text-primary underline">Resource Vault</a>.
                </p>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setResourceEditItem({ title: "", description: "", tag: "Resource", links: [], display_order: resourceItems.length + 1, is_visible: true });
                    setResourceEditOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add resource
                </Button>
              </div>

              {resourcesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : resourceItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No resources yet.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Visible</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm text-muted-foreground tabular-nums">{item.display_order}</TableCell>
                          <TableCell className="font-medium text-sm">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.tag || "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.links.length} link{item.links.length !== 1 ? "s" : ""}</TableCell>
                          <TableCell>
                            <button
                              onClick={async () => {
                                const { error } = await supabase
                                  .from("resource_center_items")
                                  .update({ is_visible: !item.is_visible })
                                  .eq("id", item.id);
                                if (!error) setResourceItems(prev => prev.map(r => r.id === item.id ? { ...r, is_visible: !r.is_visible } : r));
                              }}
                              className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                            >
                              {item.is_visible ? (
                                <><Eye className="h-3.5 w-3.5 text-primary" /><span className="text-primary font-medium">Visible</span></>
                              ) : (
                                <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Hidden</span></>
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary"
                                title="Edit"
                                onClick={() => {
                                  setResourceEditItem({ ...item });
                                  setResourceEditOpen(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently remove this resource from the vault.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => {
                                      const { error } = await supabase.from("resource_center_items").delete().eq("id", item.id);
                                      if (!error) setResourceItems(prev => prev.filter(r => r.id !== item.id));
                                    }}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
        <DialogContent className="sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {cloneSource ? `Clone "${cloneSource.title}"` : "New landing page"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 min-w-0 overflow-hidden">
            <div className="space-y-1.5">
              <Label htmlFor="lp-title">Page title</Label>
              <Input
                id="lp-title"
                placeholder=""
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
              <Label htmlFor="lp-slug">URL</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                <span className="pl-3 pr-1 text-sm font-medium text-foreground whitespace-nowrap select-none">TheNextNewThing.ai/l/</span>
                <input
                  id="lp-slug"
                  className="flex h-10 w-full bg-transparent py-2 pr-3 text-sm text-foreground/40 placeholder:text-foreground/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="my-page"
                  value={newPageSlug}
                  onChange={(e) =>
                    setNewPageSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    )
                  }
                />
              </div>
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
              <Pencil className="h-4 w-4 text-primary" />
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
                <Pencil className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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

      {/* ── New Redirect dialog ─────────────────────────────────────────── */}
      <Dialog open={newRedirectOpen} onOpenChange={setNewRedirectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New redirect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="redir-slug">Link path</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                <span className="pl-3 pr-1 text-sm font-medium text-foreground whitespace-nowrap select-none">TheNextNewThing.ai/l/</span>
                <input
                  id="redir-slug"
                  className="flex h-10 w-full bg-transparent py-2 pr-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="youtube"
                  value={newRedirectSlug}
                  onChange={(e) =>
                    setNewRedirectSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="redir-dest">Destination URL</Label>
              <Input
                id="redir-dest"
                placeholder="https://example.com/page"
                value={newRedirectDest}
                onChange={(e) => setNewRedirectDest(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRedirectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newRedirectSlug.trim() || !newRedirectDest.trim()) return;
                setNewRedirectSaving(true);
                const { data, error } = await supabase
                  .from("link_redirects")
                  .insert({
                    path: newRedirectSlug.trim(),
                    destination: newRedirectDest.trim(),
                    visit_count: 0,
                  })
                  .select()
                  .single();
                setNewRedirectSaving(false);
                if (error) {
                  if (error.code === "23505") {
                    alert(`A redirect with the slug "${newRedirectSlug.trim()}" already exists.`);
                  } else {
                    alert(`Error: ${error.message}`);
                  }
                  return;
                }
                if (data) {
                  setRedirects((prev) => [data as Redirect, ...prev]);
                  setNewRedirectOpen(false);
                }
              }}
              disabled={!newRedirectSlug.trim() || !newRedirectDest.trim() || newRedirectSaving}
            >
              {newRedirectSaving ? "Creating…" : "Create redirect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Redirect dialog ────────────────────────────────────────── */}
      <Dialog open={!!editRedirect} onOpenChange={(v) => { if (!v) setEditRedirect(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit redirect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-redir-slug">Link path</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                <span className="pl-3 pr-1 text-sm font-medium text-foreground whitespace-nowrap select-none">TheNextNewThing.ai/l/</span>
                <input
                  id="edit-redir-slug"
                  className="flex h-10 w-full bg-transparent py-2 pr-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={editRedirectSlug}
                  onChange={(e) =>
                    setEditRedirectSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-redir-dest">Destination URL</Label>
              <Input
                id="edit-redir-dest"
                value={editRedirectDest}
                onChange={(e) => setEditRedirectDest(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRedirect(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editRedirect || !editRedirectSlug.trim() || !editRedirectDest.trim()) return;
                setEditRedirectSaving(true);
                const { error } = await supabase
                  .from("link_redirects")
                  .update({
                    path: editRedirectSlug.trim(),
                    destination: editRedirectDest.trim(),
                  })
                  .eq("id", editRedirect.id);
                setEditRedirectSaving(false);
                if (error) {
                  alert(`Error: ${error.message}`);
                  return;
                }
                setRedirects((prev) =>
                  prev.map((r) =>
                    r.id === editRedirect.id
                      ? { ...r, path: editRedirectSlug.trim(), destination: editRedirectDest.trim() }
                      : r
                  )
                );
                setEditRedirect(null);
              }}
              disabled={!editRedirectSlug.trim() || !editRedirectDest.trim() || editRedirectSaving}
            >
              {editRedirectSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
