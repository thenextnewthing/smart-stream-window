import { useState } from "react";

interface LandingPageChatLayoutProps {
  slug?: string;
  headline: string | null;
  subheadline: string | null;
  description: string | null;
  cta_label: string | null;
  hero_image_url: string | null;
  lead_magnet_type: string | null;
  lead_magnet_value: string | null;
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
  editable = false,
  onImageUploadClick,
  onImageRemove,
  imageUploading = false,
}: LandingPageChatLayoutProps) {
  const isEmpty = !headline && !subheadline && !description && !hero_image_url;
  const hasContent = headline || description || hero_image_url;
  const [emailValue, setEmailValue] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const displayUrl = slug
    ? `thenextnew.thing/${slug}`
    : "thenextnew.thing";

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10">
      {isEmpty && !editable && (
        <p className="text-center text-muted-foreground py-20">
          This page is empty.
        </p>
      )}

      {(hasContent || editable) && (
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
              {/* Headline as a chat bubble */}
              {headline && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-md">
                    <p className="text-base text-foreground">{headline}</p>
                  </div>
                </div>
              )}

              {/* Hero image */}
              {hero_image_url && (
                <div className="flex justify-start">
                  <div className="relative group">
                    <img
                      src={hero_image_url}
                      alt="Content"
                      className="rounded-2xl object-cover max-w-[180px]"
                    />
                    {editable && (
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={onImageUploadClick}
                          className="bg-background/80 hover:bg-background border rounded-full p-1.5 text-foreground"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </button>
                        <button
                          onClick={onImageRemove}
                          className="bg-background/80 hover:bg-background border rounded-full p-1.5 text-foreground"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload placeholder when editable and no image */}
              {editable && !hero_image_url && (
                <div className="flex justify-start">
                  <button
                    onClick={onImageUploadClick}
                    disabled={imageUploading}
                    className="border-2 border-dashed rounded-2xl px-6 py-4 flex items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    {imageUploading ? (
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    )}
                    Upload image
                  </button>
                </div>
              )}

              {/* Description as a chat bubble */}
              {description && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-lg">
                    <p className="text-base text-foreground whitespace-pre-line">{description}</p>
                  </div>
                </div>
              )}

              {/* Email capture — as a chat bubble, or submitted email as user message */}
              {hasContent && !submittedEmail && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-4 max-w-lg w-full space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (emailValue.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
                          setSubmittedEmail(emailValue.trim());
                        }
                      }}
                      className="flex gap-3"
                    >
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="flex-1 px-4 py-3.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold whitespace-nowrap hover:bg-primary/90 transition-colors"
                      >
                        {cta_label ?? "Get Access"} →
                      </button>
                    </form>
                    {subheadline && (
                      <p className="text-xs text-muted-foreground">{subheadline}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submitted email — shown as a user message (right-aligned) */}
              {submittedEmail && (
                <>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-5 py-3 max-w-md">
                      <p className="text-base">{submittedEmail}</p>
                    </div>
                  </div>

                  {/* Response based on lead magnet type */}
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-tl-md px-5 py-3 max-w-lg">
                      {(!lead_magnet_type || lead_magnet_type === "email") && (
                        <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                      )}
                      {lead_magnet_type === "url" && lead_magnet_value && (
                        <p className="text-base text-foreground">
                          Here you go! 👉{" "}
                          <a href={lead_magnet_value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Open your link
                          </a>
                        </p>
                      )}
                      {lead_magnet_type === "url" && !lead_magnet_value && (
                        <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                      )}
                      {lead_magnet_type === "file" && lead_magnet_value && (
                        <p className="text-base text-foreground">
                          Here's your download! 📄{" "}
                          <a href={lead_magnet_value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Download file
                          </a>
                        </p>
                      )}
                      {lead_magnet_type === "file" && !lead_magnet_value && (
                        <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                      )}
                      {lead_magnet_type === "content" && lead_magnet_value && (
                        <p className="text-base text-foreground whitespace-pre-line">{lead_magnet_value}</p>
                      )}
                      {lead_magnet_type === "content" && !lead_magnet_value && (
                        <p className="text-base text-foreground">Thanks! You're on the list. 🎉</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
