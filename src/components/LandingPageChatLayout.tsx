import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

interface LandingPageChatLayoutProps {
  slug?: string;
  headline: string | null;
  subheadline: string | null;
  description: string | null;
  cta_label: string | null;
  hero_image_url: string | null;
  lead_magnet_type: string | null;
  lead_magnet_value: string | null;
  utm_medium?: string | null;
  editable?: boolean;
  onImageUploadClick?: () => void;
  onImageRemove?: () => void;
  imageUploading?: boolean;
}

export function LandingPageChatLayout({
  slug,
  headline,
  subheadline,
  description,
  cta_label,
  hero_image_url,
  lead_magnet_type,
  lead_magnet_value,
  utm_medium,
  editable = false,
  onImageUploadClick,
  onImageRemove,
  imageUploading = false
}: LandingPageChatLayoutProps) {
  const isEmpty = !headline && !subheadline && !description && !hero_image_url;
  const hasContent = headline || description || hero_image_url;
  const [emailValue, setEmailValue] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [visibleBubbles, setVisibleBubbles] = useState(editable ? 99 : 0);

  // Count how many bubbles we have
  const descParts = description ? description.split('\n\n').filter(Boolean) : [];
  const bubbleCount = (headline ? 1 : 0) + (hero_image_url ? 1 : 0) + (descParts.length > 1 ? descParts.length - 1 : 0) + (hasContent ? 1 : 0);

  useEffect(() => {
    if (editable) return;
    let i = 0;
    const reveal = () => {
      i++;
      setVisibleBubbles(i);
      if (i < bubbleCount) {
        setTimeout(reveal, 1000);
      }
    };
    const t = setTimeout(reveal, 600);
    return () => clearTimeout(t);
  }, [bubbleCount, editable]);

  const displayUrl = slug ?
  `thenextnew.thing/l/${slug}` :
  "thenextnew.thing";

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10">
      {isEmpty && !editable &&
      <p className="text-center text-muted-foreground py-20">
          This page is empty.
        </p>
      }

      {(hasContent || editable) &&
      <>
          {/* Site header — outside the card, on the page background */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧨</span>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                The Next New Thing
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              The Podcast for AI Creators by the Ultra-Pushy Interviewer Andrew Warner
            </p>
          </div>

          {/* Content card */}
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">

            {/* Chat content */}
            <div className="px-8 py-6 space-y-5">
              {(() => {
                let idx = 0;
                const bubble = (visible: boolean) =>
                  visible
                    ? "animate-fade-in"
                    : "opacity-0 pointer-events-none";

                const headlineIdx = headline ? idx++ : -1;
                const imageIdx = hero_image_url ? idx++ : -1;

                const localDescParts = description ? description.split('\n\n').filter(Boolean) : [];
                const standaloneDesc = localDescParts.length > 1 ? localDescParts.slice(0, -1) : localDescParts.length === 1 && hasContent && !submittedEmail ? [] : localDescParts;
                const formPrompt = localDescParts.length > 1 ? localDescParts[localDescParts.length - 1] : null;
                const showDescAsBubble = localDescParts.length === 1 && (submittedEmail || !hasContent);
                const descBubbles = (standaloneDesc.length > 0 || showDescAsBubble) ? (standaloneDesc.length > 0 ? standaloneDesc : localDescParts) : [];
                const descStartIdx = idx;
                idx += descBubbles.length;
                const formIdx = hasContent ? idx++ : -1;

                return (
                  <>
                    {/* Headline */}
                    {headline &&
                      <div className={`flex justify-start ${bubble(visibleBubbles > headlineIdx)}`}>
                        <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-md">
                          <p className="text-base text-foreground">{headline}</p>
                        </div>
                      </div>
                    }

                    {/* Hero image */}
                    {hero_image_url &&
                      <div className={bubble(visibleBubbles > imageIdx)}>
                        <div className="relative group">
                          <img src={hero_image_url} alt="Content" className="rounded-2xl object-cover w-full max-w-48" />
                          {editable &&
                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={onImageUploadClick} className="bg-background/80 hover:bg-background border rounded-full p-1.5 text-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                              </button>
                              <button onClick={onImageRemove} className="bg-background/80 hover:bg-background border rounded-full p-1.5 text-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    {/* Upload placeholder when editable and no image */}
                    {editable && !hero_image_url &&
                      <div className="flex justify-start">
                        <button onClick={onImageUploadClick} disabled={imageUploading} className="border-2 border-dashed rounded-2xl px-6 py-4 flex items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm">
                          {imageUploading ?
                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                          }
                          Upload image
                        </button>
                      </div>
                    }

                    {/* Description bubbles */}
                    {descBubbles.map((part, i) => (
                      <div key={i} className={`flex justify-start ${bubble(visibleBubbles > descStartIdx + i)}`}>
                        <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-lg">
                          <p className="text-base text-foreground whitespace-pre-line">{part}</p>
                        </div>
                      </div>
                    ))}

                    {/* Email capture */}
                    {hasContent && !submittedEmail &&
                      <div className={`flex justify-start ${bubble(visibleBubbles > formIdx)}`}>
                        <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-4 max-w-lg w-full space-y-3">
                          {formPrompt && <p className="text-base text-foreground">{formPrompt}</p>}
                          {!formPrompt && localDescParts.length === 1 && <p className="text-base text-foreground whitespace-pre-line">{localDescParts[0]}</p>}
                          <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const trimmed = emailValue.trim();
                    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                      setSubmittedEmail(trimmed);
                      // Confetti from top
                      const duration = 2500;
                      const end = Date.now() + duration;
                      const frame = () => {
                        confetti({ particleCount: 4, angle: 90, spread: 120, origin: { x: Math.random(), y: -0.05 }, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] });
                        if (Date.now() < end) requestAnimationFrame(frame);
                      };
                      frame();
                      try {
                        await supabase.functions.invoke('subscribe-beehiiv', {
                          body: { email: trimmed, utm_source: 'lovable-landing', utm_medium: utm_medium || (slug ? slug.replace(/\//g, '-') : 'landing-page'), send_welcome_email: false }
                        });
                      } catch (err) {
                        console.error('Failed to subscribe:', err);
                      }
                    }
                  }}
                  className="flex flex-col gap-3 lg:flex-row">
                  
                      <input
                    type="email"
                    placeholder="Enter your email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="min-w-0 flex-1 px-4 py-3.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground" />
                  
                      <button
                    type="submit"
                    className="w-full justify-center px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold whitespace-nowrap hover:bg-primary/90 transition-colors lg:w-auto">
                    
                        {cta_label ?? "Get Access"} →
                      </button>
                    </form>
                    {subheadline &&
                <p className="text-xs text-muted-foreground">{subheadline}</p>
                }
                  </div>
                </div>
            }

              {/* Submitted email — shown as a user message (right-aligned) */}
              {submittedEmail &&
            <>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-5 py-3 max-w-md">
                      <p className="text-base">{submittedEmail}</p>
                    </div>
                  </div>

                  {/* Response based on lead magnet type */}
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-lg">
                      {(!lead_magnet_type || lead_magnet_type === "email") &&
                  <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                  }
                      {lead_magnet_type === "url" && lead_magnet_value &&
                  <p className="text-base text-foreground">
                          Here you go! 👉{" "}
                          <a href={lead_magnet_value.match(/^https?:\/\//) ? lead_magnet_value : `https://${lead_magnet_value}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Open your link
                          </a>
                        </p>
                  }
                      {lead_magnet_type === "url" && !lead_magnet_value &&
                  <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                  }
                      {lead_magnet_type === "file" && lead_magnet_value && (() => {
                        const fileUrl = lead_magnet_value.match(/^https?:\/\//) ? lead_magnet_value : `https://${lead_magnet_value}`;
                        const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
                        return isPdf ? (
                          <div className="space-y-3 w-full">
                            <p className="text-base text-foreground">Here's your file! 📄</p>
                            <div className="rounded-xl overflow-hidden border border-border bg-background">
                              <iframe
                                src={`${fileUrl}#toolbar=0&navpanes=0`}
                                className="w-full"
                                style={{ height: '360px' }}
                                title="PDF preview"
                              />
                              <div className="flex justify-end px-3 py-2 border-t border-border bg-muted/50">
                                <a
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                  Download PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-base text-foreground">
                            Here's your download! 📄{" "}
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                              Download file
                            </a>
                          </p>
                        );
                      })()
                  }
                      {lead_magnet_type === "file" && !lead_magnet_value &&
                  <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                  }
                      {lead_magnet_type === "content" && lead_magnet_value &&
                  <div className="text-base text-foreground whitespace-pre-line">
                          {lead_magnet_value.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                    /^https?:\/\//.test(part) ?
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                                {part}
                              </a> :

                    <span key={i}>{part}</span>

                    )}
                        </div>
                  }
                      {lead_magnet_type === "content" && !lead_magnet_value &&
                  <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                  }
                      {lead_magnet_type === "html" && lead_magnet_value &&
                  <div className="text-base text-foreground" dangerouslySetInnerHTML={{ __html: lead_magnet_value }} />
                  }
                      {lead_magnet_type === "html" && !lead_magnet_value &&
                  <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                  }
                    </div>
                  </div>
                </>
            }
                  </>
                );
              })()}
            </div>
          </div>
        </>
      }
    </div>);

}