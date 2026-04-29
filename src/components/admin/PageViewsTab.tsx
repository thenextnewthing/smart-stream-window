import { useEffect, useMemo, useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DateRange } from "react-day-picker";

interface PageViewRow {
  page_path: string;
  views: number;
}

export default function PageViewsTab() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<DateRange | undefined>({
    from: subDays(today, 6),
    to: today,
  });
  const [rows, setRows] = useState<PageViewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!range?.from) return;
      setLoading(true);
      const from = startOfDay(range.from).toISOString();
      const to = endOfDay(range.to ?? range.from).toISOString();

      // Pull all rows in range (RLS allows authenticated SELECT). Page in 1k chunks.
      const all: { page_path: string }[] = [];
      let offset = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("page_views")
          .select("page_path")
          .gte("created_at", from)
          .lte("created_at", to)
          .range(offset, offset + PAGE - 1);
        if (error || !data) break;
        all.push(...data);
        if (data.length < PAGE) break;
        offset += PAGE;
      }

      // Group by path
      const counts = new Map<string, number>();
      for (const r of all) {
        counts.set(r.page_path, (counts.get(r.page_path) || 0) + 1);
      }
      const grouped = Array.from(counts, ([page_path, views]) => ({ page_path, views }))
        .sort((a, b) => b.views - a.views);
      setRows(grouped);
      setLoading(false);
    };
    load();
  }, [range?.from, range?.to]);

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);

  const setQuickRange = (days: number) => {
    setRange({ from: subDays(today, days - 1), to: today });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <p className="text-sm text-muted-foreground">
          Visits to every page on your site (admin and auth pages excluded).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
            Last 30 days
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("gap-1.5", !range && "text-muted-foreground")}
              >
                <CalendarIcon className="h-4 w-4" />
                {range?.from ? (
                  range.to ? (
                    <>
                      {format(range.from, "MMM d")} – {format(range.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(range.from, "MMM d, yyyy")
                  )
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{totalViews.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">
          total view{totalViews === 1 ? "" : "s"} across {rows.length} page{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground inline" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                  No page views in this range.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.page_path}>
                  <TableCell className="font-mono text-sm">{row.page_path}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {row.views.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <a
                      href={row.page_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
