import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LandingPageChatLayout } from "@/components/LandingPageChatLayout";
import {
  ArrowLeft,
  Loader2,
  Send,
  Wand2,
  Eye,
  EyeOff,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Link as LinkIcon,
  ChevronDown,
  Settings,
} from "lucide-react";

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
  hero_image_url: string | null;
  is_published: boolean;
  view_count: number;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function LandingPageCreator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [slugValue, setSlugValue] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", id!)
        .single();

      if (error || !data) { navigate("/admin"); return; }
      setPage(data as LandingPage);
      setSlugValue(data.slug);
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  const saveFields = async (fields: Partial<LandingPage>) => {
    if (!page) return;
    setSaving(true);
    const { error } = await supabase
      .from("landing_pages")
      .update(fields)
      .eq("id", page.id);
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    setPage((p) => p ? { ...p, ...fields } : p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSlugSave = async () => {
    if (!page || !slugValue.trim() || slugValue === page.slug) return;
    const clean = slugValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!clean) { toast.error("Invalid slug"); return; }
    setSlugSaving(true);
    const { error } = await supabase
      .from("landing_pages")
      .update({ slug: clean })
      .eq("id", page.id);
    setSlugSaving(false);
    if (error) {
      toast.error("Slug update failed", { description: error.message });
      return;
    }
    setPage((p) => p ? { ...p, slug: clean } : p);
    setSlugValue(clean);
    toast.success("Slug updated");
  };

  const handleAIEdit = async () => {
    if (!page || !instruction.trim() || aiLoading) return;
    setAiLoading(true);
    setAiSummary(null);
    setSaved(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/edit-landing-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ instruction: instruction.trim(), currentPage: page }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error ?? "AI edit failed.");
        return;
      }
      const { summary, ...fields } = json.updates;
      setAiSummary(summary ?? null);
      setInstruction("");
      const updatedFields = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined && v !== null)
      ) as Partial<LandingPage>;
      if (Object.keys(updatedFields).length > 0) {
        setPage((p) => p ? { ...p, ...updatedFields } : p);
        await saveFields(updatedFields);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleTogglePublish = async () => {
    if (!page) return;
    setPublishing(true);
    await saveFields({ is_published: !page.is_published });
    setPublishing(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!page) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${page.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("landing-page-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("landing-page-images")
        .getPublicUrl(path);
      await saveFields({ hero_image_url: publicUrl });
      toast.success("Image uploaded!");
    } catch (e: unknown) {
      toast.error("Upload failed", { description: (e as Error).message });
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) return null;

  const isEmpty = !page.headline && !page.subheadline && !page.description && !page.hero_image_url;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left sidebar */}
      {sidebarOpen && (
        <div className="w-80 shrink-0 border-r border-border bg-muted/50 flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{page.title}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Publish toggle */}
          <div className="px-4 py-3 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {page.is_published ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium">{page.is_published ? "Published" : "Draft"}</span>
              </div>
              <div className="flex items-center gap-2">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {saved && <Check className="h-3.5 w-3.5 text-primary" />}
                <Switch checked={page.is_published} onCheckedChange={handleTogglePublish} disabled={publishing} />
              </div>
            </div>
          </div>

          {/* Details collapsible */}
          <div className="border-b border-border">
            <button
              onClick={() => setDetailsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="h-3 w-3" />
                Details
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
            </button>
            {detailsOpen && (
              <div className="px-4 pb-3 space-y-3">
                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Page URL
                  </label>
                  <div className="flex gap-1.5">
                    <div className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden">
                      <span className="text-[11px] text-muted-foreground pl-2.5 shrink-0 select-none">/</span>
                      <input
                        type="text"
                        value={slugValue}
                        onChange={(e) => setSlugValue(e.target.value)}
                        onBlur={handleSlugSave}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSlugSave(); }}
                        className="flex-1 bg-transparent text-sm px-1 py-1.5 outline-none"
                      />
                    </div>
                    {slugSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />}
                  </div>
                </div>
                {/* Stats */}
                <div className="flex gap-4 text-[11px] text-muted-foreground">
                  <span>{page.view_count} views</span>
                  <span>{page.submission_count} submissions</span>
                </div>
              </div>
            )}
          </div>

          {/* AI chat area — fills remaining space */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Wand2 className="h-3 w-3" />
                AI Editor
              </p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {isEmpty && !aiSummary && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-2 py-8">
                  <Wand2 className="h-8 w-8" />
                  <p className="text-xs text-center">Describe what you want and AI will build it.</p>
                </div>
              )}
              {aiSummary && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 flex items-start gap-2 text-xs text-primary">
                  <Wand2 className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{aiSummary}</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAIEdit();
                    }
                  }}
                  placeholder="Describe what you want…"
                  disabled={aiLoading}
                  rows={3}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground resize-none"
                />
                <button
                  onClick={handleAIEdit}
                  disabled={aiLoading || !instruction.trim()}
                  className="absolute right-2 bottom-2 w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main preview area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Collapse toggle when sidebar is closed */}
        {!sidebarOpen && (
          <div className="absolute top-3 left-3 z-20">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-background" onClick={() => setSidebarOpen(true)}>
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-3">
              <Wand2 className="h-12 w-12" />
              <p className="text-lg font-medium">Start creating</p>
              <p className="text-sm">Use the AI editor on the left to build your page.</p>
            </div>
          ) : (
            <LandingPageChatLayout
              slug={page.slug}
              headline={page.headline}
              subheadline={page.subheadline}
              description={page.description}
              cta_label={page.cta_label}
              hero_image_url={page.hero_image_url}
              lead_magnet_value={page.lead_magnet_value}
              editable
              onImageUploadClick={() => imageInputRef.current?.click()}
              onImageRemove={() => saveFields({ hero_image_url: null })}
              imageUploading={imageUploading}
            />
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
