import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LandingPageChatLayout } from "@/components/LandingPageChatLayout";
import {
  ArrowLeft,
  Loader2,
  Send,
  Wand2,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Link as LinkIcon,
  ChevronDown,
  Settings,
  Upload,
  RotateCcw,
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
  utm_medium: string | null;
}

function DetailField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
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
  const [leadMagnetUploading, setLeadMagnetUploading] = useState(false);

  const [slugValue, setSlugValue] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
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

          {/* Save indicator */}
          <div className="px-4 py-2 border-b border-border flex items-center gap-2 justify-end">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            {saved && <><Check className="h-3.5 w-3.5 text-primary" /><span className="text-xs text-muted-foreground">Saved</span></>}
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
              <div className="px-4 pb-3 space-y-3 max-h-[50vh] overflow-y-auto">
                {/* Page title */}
                <DetailField label="Page title">
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage((p) => p ? { ...p, title: e.target.value } : p)}
                    onBlur={() => saveFields({ title: page.title })}
                    onKeyDown={(e) => { if (e.key === "Enter") saveFields({ title: page.title }); }}
                    className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors"
                  />
                </DetailField>

                {/* Slug */}
                <DetailField label="Page URL" icon={<LinkIcon className="h-3 w-3" />}>
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
                </DetailField>

                {/* SEO */}
                <DetailField label="SEO title">
                  <input
                    type="text"
                    value={page.seo_title ?? ""}
                    onChange={(e) => setPage((p) => p ? { ...p, seo_title: e.target.value || null } : p)}
                    onBlur={() => saveFields({ seo_title: page.seo_title })}
                    placeholder="Page title for search engines"
                    className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </DetailField>
                <DetailField label="SEO description">
                  <textarea
                    value={page.seo_description ?? ""}
                    onChange={(e) => setPage((p) => p ? { ...p, seo_description: e.target.value || null } : p)}
                    onBlur={() => saveFields({ seo_description: page.seo_description })}
                    placeholder="Short description for search results"
                    rows={2}
                    className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none"
                  />
                </DetailField>

                {/* Lead magnet */}
                <DetailField label="Lead magnet">
                  <select
                    value={page.lead_magnet_type ?? "email"}
                    onChange={(e) => {
                      const type = e.target.value;
                      setPage((p) => p ? { ...p, lead_magnet_type: type, lead_magnet_value: null } : p);
                      saveFields({ lead_magnet_type: type, lead_magnet_value: null });
                    }}
                    className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors"
                  >
                    <option value="email">None (collect email only)</option>
                    <option value="url">URL / Link</option>
                    <option value="file">File upload</option>
                    <option value="content">Text content</option>
                  </select>
                </DetailField>

                {page.lead_magnet_type === "url" && (
                  <DetailField label="Redirect URL">
                    <input
                      type="text"
                      value={page.lead_magnet_value ?? ""}
                      onChange={(e) => setPage((p) => p ? { ...p, lead_magnet_value: e.target.value || null } : p)}
                      onBlur={() => saveFields({ lead_magnet_value: page.lead_magnet_value })}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveFields({ lead_magnet_value: page.lead_magnet_value }); } }}
                      placeholder="https://…"
                      className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                  </DetailField>
                )}

                {page.lead_magnet_type === "file" && (
                  <DetailField label="File">
                    {page.lead_magnet_value ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={page.lead_magnet_value.match(/^https?:\/\//) ? page.lead_magnet_value : `https://${page.lead_magnet_value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline truncate flex-1"
                        >
                          {page.lead_magnet_value.split("/").pop()}
                        </a>
                        <button
                          onClick={() => { setPage((p) => p ? { ...p, lead_magnet_value: null } : p); saveFields({ lead_magnet_value: null }); }}
                          className="text-[11px] text-destructive hover:underline shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        {leadMagnetUploading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>{leadMagnetUploading ? "Uploading…" : "Choose file"}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !page) return;
                            setLeadMagnetUploading(true);
                            try {
                              const ext = file.name.split(".").pop() ?? "bin";
                              const path = `${page.id}/${Date.now()}-${file.name}`;
                              const { error } = await supabase.storage.from("lead-magnet-files").upload(path, file, { upsert: true });
                              if (error) throw error;
                              const { data: { publicUrl } } = supabase.storage.from("lead-magnet-files").getPublicUrl(path);
                              await saveFields({ lead_magnet_value: publicUrl });
                              toast.success("File uploaded");
                            } catch (err: unknown) {
                              toast.error("Upload failed", { description: (err as Error).message });
                            } finally {
                              setLeadMagnetUploading(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    )}
                  </DetailField>
                )}

                {page.lead_magnet_type === "content" && (
                  <DetailField label="Content delivered after signup">
                    <textarea
                      value={page.lead_magnet_value ?? ""}
                      onChange={(e) => setPage((p) => p ? { ...p, lead_magnet_value: e.target.value || null } : p)}
                      onBlur={() => saveFields({ lead_magnet_value: page.lead_magnet_value })}
                      placeholder="The content subscribers will receive…"
                      rows={4}
                      className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none"
                    />
                  </DetailField>
                )}

                {/* UTM medium */}
                <DetailField label="UTM medium">
                  <input
                    type="text"
                    value={page.utm_medium ?? ""}
                    onChange={(e) => setPage((p) => p ? { ...p, utm_medium: e.target.value || null } : p)}
                    onBlur={() => saveFields({ utm_medium: page.utm_medium })}
                    placeholder="e.g. landing-page"
                    className="w-full bg-background border border-border rounded-lg text-sm px-2.5 py-1.5 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </DetailField>

                {/* Stats */}
                <div className="flex gap-4 text-[11px] text-muted-foreground pt-1">
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
              {/* Starter messages */}
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-xs">
                  I am a marketing expert.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-xs">
                  I built you this landing page.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-xs">
                  Just tell me how you'd like me to customize it.
                </div>
              </div>

              {aiSummary && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-xs flex items-start gap-2">
                    <Wand2 className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                    <span>{aiSummary}</span>
                  </div>
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

        {/* Preview toolbar */}
        {!isEmpty && (
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/30 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setPreviewKey((k) => k + 1)}
            >
              <RotateCcw className="h-3 w-3" />
              Refresh
            </Button>
            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className="relative flex items-center h-7 rounded-full border border-border bg-muted p-0.5 text-[11px] font-medium transition-colors disabled:opacity-50"
            >
              <span
                className={`relative z-10 px-3 py-0.5 rounded-full transition-all ${
                  !page.is_published ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Draft
              </span>
              <span
                className={`relative z-10 px-3 py-0.5 rounded-full transition-all ${
                  page.is_published ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Published
              </span>
            </button>
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
              key={previewKey}
              slug={page.slug}
              headline={page.headline}
              subheadline={page.subheadline}
              description={page.description}
              cta_label={page.cta_label}
              hero_image_url={page.hero_image_url}
              lead_magnet_type={page.lead_magnet_type}
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
