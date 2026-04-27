import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SourcePage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  lead_magnet_type: string | null;
  lead_magnet_value: string | null;
}

interface Props {
  page: SourcePage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

function deriveLink(page: SourcePage): { label: string; url: string } {
  const type = (page.lead_magnet_type ?? "").toLowerCase();
  const val = (page.lead_magnet_value ?? "").trim();

  if (type === "url" && val) {
    const url = /^https?:\/\//i.test(val) ? val : `https://${val}`;
    return { label: "Open Resource", url };
  }
  if (type === "file" && val) {
    return { label: "Download File", url: val };
  }
  // text/html/none → link back to the landing page itself
  return { label: "View Resource", url: `${SITE_ORIGIN}/l/${page.slug}` };
}

export function AddToVaultDialog({ page, open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Resource");
  const [thumbnail, setThumbnail] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page && open) {
      setTitle(page.title || "");
      setDescription(page.description || "");
      setTag("Resource");
      setThumbnail(page.hero_image_url || "");
      const link = deriveLink(page);
      setLinkLabel(link.label);
      setLinkUrl(link.url);
    }
  }, [page, open]);

  if (!page) return null;

  const handleSave = async () => {
    if (!title || !linkUrl) {
      toast.error("Title and link URL are required");
      return;
    }
    setSaving(true);
    try {
      // Get max display_order
      const { data: maxRow } = await supabase
        .from("resource_center_items")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder = (maxRow?.display_order ?? 0) + 1;

      const { error } = await supabase.from("resource_center_items").insert({
        title,
        description: description || null,
        tag: tag || "Resource",
        thumbnail_url: thumbnail || null,
        links: [{ label: linkLabel || "View Resource", url: linkUrl }],
        display_order: nextOrder,
        is_visible: true,
      });
      if (error) throw error;
      toast.success("Added to Resource Vault!");
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to add", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Add this to the Resource Vault?
          </DialogTitle>
          <DialogDescription>
            You just published a page with a giveaway. Drop it into{" "}
            <span className="font-medium text-foreground">/resources</span> so subscribers can find it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tag</Label>
              <Input value={tag} onChange={(e) => setTag(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Link Label</Label>
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Link URL</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thumbnail URL</Label>
            <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
            {thumbnail && (
              <img
                src={thumbnail}
                alt="preview"
                className="mt-2 w-full h-32 object-cover rounded-md border"
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Skip
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Vault"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
