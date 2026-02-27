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

  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col h-screen bg-muted/50 text-foreground">
      {/* Top bar — editor chrome */}
      <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0 bg-muted z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{page.title}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">/{page.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <Check className="h-4 w-4 text-primary" />}
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <div className="flex items-center gap-2">
            {page.is_published ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            <Switch checked={page.is_published} onCheckedChange={handleTogglePublish} disabled={publishing} />
            <span className="text-xs text-muted-foreground">{page.is_published ? "Live" : "Draft"}</span>
          </div>
        </div>
      </div>

      {/* Preview area — page rendered inside a card to distinguish from editor */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-3">
            <Wand2 className="h-12 w-12" />
            <p className="text-lg font-medium">Start creating</p>
            <p className="text-sm">Type what you want below and the AI will build your page.</p>
          </div>
        ) : (
          <LandingPageChatLayout
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

      {/* Floating vibe-coding input */}
      <div className="shrink-0 border-t bg-muted">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
          {aiSummary && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 flex items-start gap-2 text-sm text-primary">
              <Wand2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{aiSummary}</span>
            </div>
          )}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAIEdit();
                }
              }}
              placeholder="Describe what you want on this page…"
              disabled={aiLoading}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground"
            />
            <button
              onClick={handleAIEdit}
              disabled={aiLoading || !instruction.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
