import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send,
  Loader2,
  Check,
  ArrowLeft,
  Wand2,
  ImagePlus,
  Eye,
  EyeOff,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

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

// ── Inline live preview ───────────────────────────────────────────────────────
function PagePreview({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-full bg-background text-foreground flex flex-col items-center justify-start px-6 py-12 overflow-y-auto">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Hero image */}
        {page.hero_image_url && (
          <img
            src={page.hero_image_url}
            alt="Hero"
            className="w-full rounded-xl object-cover max-h-64"
          />
        )}

        {page.headline && (
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-center">
            {page.headline}
          </h1>
        )}
        {page.subheadline && (
          <p className="text-lg text-muted-foreground text-center">
            {page.subheadline}
          </p>
        )}
        {page.description && (
          <p className="text-base text-muted-foreground whitespace-pre-line text-center">
            {page.description}
          </p>
        )}

        {/* CTA preview */}
        <div className="flex justify-center">
          <div className="flex gap-3 w-full max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              disabled
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground"
            />
            <button
              disabled
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium opacity-80"
            >
              {page.cta_label ?? "Get Access"}
            </button>
          </div>
        </div>

        {/* SEO note */}
        {(page.seo_title || page.seo_description) && (
          <div className="rounded-md border border-dashed p-3 space-y-1 opacity-60">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">SEO preview</p>
            {page.seo_title && <p className="text-sm font-medium text-primary">{page.seo_title}</p>}
            {page.seo_description && <p className="text-xs text-muted-foreground">{page.seo_description}</p>}
          </div>
        )}

        {/* Empty state hint */}
        {!page.headline && !page.subheadline && !page.description && !page.hero_image_url && (
          <div className="text-center py-20 text-muted-foreground/50 space-y-2">
            <Wand2 className="h-10 w-10 mx-auto" />
            <p className="text-sm">Your page preview will appear here as you edit.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function LandingPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  // AI editing
  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Image upload
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Publish toggle
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", id!)
        .single();

      if (error || !data) {
        navigate("/admin");
        return;
      }
      setPage(data as LandingPage);
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  // ── Persist changes ─────────────────────────────────────────────────────────
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

  // ── AI Edit ─────────────────────────────────────────────────────────────────
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
      // Apply immediately and save
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
    }
  };

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!page) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
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

  const handleRemoveImage = async () => {
    await saveFields({ hero_image_url: null });
  };

  // ── Publish toggle ──────────────────────────────────────────────────────────
  const handleTogglePublish = async () => {
    if (!page) return;
    setPublishing(true);
    await saveFields({ is_published: !page.is_published });
    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── Left: Editor panel ──────────────────────────────────────────────── */}
      <div className="w-[400px] shrink-0 flex flex-col border-r">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{page.title}</p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">/{page.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <Check className="h-4 w-4 text-primary" />}
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button
              variant={page.is_published ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleTogglePublish}
              disabled={publishing}
            >
              {publishing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : page.is_published ? (
                <><Eye className="h-3 w-3" /> Live</>
              ) : (
                <><EyeOff className="h-3 w-3" /> Draft</>
              )}
            </Button>
          </div>
        </div>

        {/* Fields (inline editable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* Hero image */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Hero image</Label>
            {page.hero_image_url ? (
              <div className="relative group rounded-lg overflow-hidden border">
                <img src={page.hero_image_url} alt="Hero" className="w-full object-cover max-h-40" />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
                className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {imageUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <><Upload className="h-5 w-5" /><span className="text-xs">Upload image</span></>
                )}
              </button>
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
            {page.hero_image_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Replace image
              </Button>
            )}
          </div>

          {/* Editable text fields */}
          {(
            [
              { key: "headline", label: "Headline", multiline: true },
              { key: "subheadline", label: "Subheadline", multiline: true },
              { key: "description", label: "Description", multiline: true },
              { key: "cta_label", label: "CTA button text", multiline: false },
              { key: "seo_title", label: "SEO title", multiline: false },
              { key: "seo_description", label: "SEO description", multiline: true },
            ] as const
          ).map(({ key, label, multiline }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
              {multiline ? (
                <Textarea
                  value={(page[key] as string) ?? ""}
                  onChange={(e) => setPage((p) => p ? { ...p, [key]: e.target.value } : p)}
                  onBlur={() => saveFields({ [key]: page[key] })}
                  className="resize-none text-sm min-h-[60px]"
                  placeholder={`Add ${label.toLowerCase()}…`}
                />
              ) : (
                <Input
                  value={(page[key] as string) ?? ""}
                  onChange={(e) => setPage((p) => p ? { ...p, [key]: e.target.value } : p)}
                  onBlur={() => saveFields({ [key]: page[key] })}
                  className="text-sm"
                  placeholder={`Add ${label.toLowerCase()}…`}
                />
              )}
            </div>
          ))}
        </div>

        {/* AI chat area */}
        <div className="border-t flex flex-col shrink-0 bg-muted/20">
          {/* Chat messages */}
          <div className="px-4 pt-4 pb-2 space-y-2 max-h-[200px] overflow-y-auto">
            {/* Starter messages */}
            <div className="flex justify-start">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-sm">
                I am a marketing expert.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-sm">
                I built you this landing page.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-sm">
                Just tell me how you'd like me to customize it.
              </div>
            </div>

            {/* AI summary response */}
            {aiSummary && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-chat-assistant border border-chat-border text-foreground text-sm flex items-start gap-2">
                  <Wand2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                  <span>{aiSummary}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-1">
            <div className="flex gap-2">
              <Textarea
                placeholder="Make the headline punchier. Add urgency. Rewrite for a mobile audience…"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAIEdit();
                  }
                }}
                className="min-h-[64px] resize-none text-sm"
                disabled={aiLoading}
              />
              <Button
                size="icon"
                className="h-auto w-10 shrink-0 self-end"
                onClick={handleAIEdit}
                disabled={aiLoading || !instruction.trim()}
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Live preview ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0 bg-muted/30">
          <p className="text-xs text-muted-foreground font-medium">Live preview</p>
          {page.is_published && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-2 hover:opacity-70"
            >
              Open published page ↗
            </a>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <PagePreview page={page} />
        </div>
      </div>
    </div>
  );
}
