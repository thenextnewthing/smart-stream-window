ALTER TABLE landing_pages DROP CONSTRAINT landing_pages_lead_magnet_type_check;
ALTER TABLE landing_pages ADD CONSTRAINT landing_pages_lead_magnet_type_check CHECK (lead_magnet_type = ANY (ARRAY['email','url','file','content','download','redirect','html']));

UPDATE landing_pages SET lead_magnet_type = 'html', lead_magnet_value = '<ol class="space-y-3 list-decimal list-inside">
<li><a href="https://paperclip.ing" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">Go to Paperclip''s website</a></li>
<li>Paste this into your terminal to install Paperclip: <code class="bg-background px-2 py-1 rounded text-sm font-mono">npx paperclipai onboard --yes</code></li>
<li><a href="https://x.com/NickSpisak_/status/2033518072724705437" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">Helpful article on Paperclip</a></li>
<li><a href="https://x.com/NickSpisak_/status/2034635430700679445" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">Suggestions for what you can do with Paperclip</a></li>
<li><a href="https://x.com/cathrynlavery" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">Follow Cathryn on X</a> for more AI agent tool tips.</li>
</ol>' WHERE slug = 'paperclip-data';