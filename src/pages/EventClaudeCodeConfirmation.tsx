import { CheckCircle, Calendar, Clock, MapPin, Video, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ZOOM_LINK = "http://link.bootstrappedgiants.com/live";

const sessions = [
  {
    day: "Day 1",
    title: "Lovable",
    date: "April 2, 2025",
    time: "12:00 – 1:00 PM CT",
    zoomLink: ZOOM_LINK,
    gcalStart: "20250402T170000Z", // 12 PM CT = 5 PM UTC
    gcalEnd: "20250402T180000Z",
    icsStart: "20250402T170000Z",
    icsEnd: "20250402T180000Z",
  },
  {
    day: "Day 2",
    title: "Claude Code",
    date: "April 3, 2025",
    time: "12:00 – 1:00 PM CT",
    zoomLink: ZOOM_LINK,
    gcalStart: "20250403T170000Z",
    gcalEnd: "20250403T180000Z",
    icsStart: "20250403T170000Z",
    icsEnd: "20250403T180000Z",
  },
];

const generateGoogleCalendarUrl = (session: (typeof sessions)[0]) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Live with Claude Code — ${session.day}: ${session.title}`,
    dates: `${session.gcalStart}/${session.gcalEnd}`,
    details: `Join live on Zoom: ${session.zoomLink}\n\nPart of the "Live with Claude Code" 2-day training series.`,
    location: session.zoomLink,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const generateIcsFile = (session: (typeof sessions)[0]) => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Live with Claude Code//EN",
    "BEGIN:VEVENT",
    `DTSTART:${session.icsStart}`,
    `DTEND:${session.icsEnd}`,
    `SUMMARY:Live with Claude Code — ${session.day}: ${session.title}`,
    `DESCRIPTION:Join live on Zoom: ${session.zoomLink}\\n\\nPart of the "Live with Claude Code" 2-day training series.`,
    `LOCATION:${session.zoomLink}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `claude-code-${session.day.toLowerCase().replace(" ", "")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

const EventClaudeCodeConfirmation = () => {
  return (
    <>
      <title>You're In — Live with Claude Code</title>
      <meta
        name="description"
        content="Your registration is confirmed for the Live with Claude Code 2-day training series."
      />

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-6 py-20">
          {/* Confirmation Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold mb-3">
              You're in!
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's everything you need for the training.
            </p>
          </div>

          {/* Session Cards */}
          <div className="space-y-6">
            {sessions.map((session) => (
              <Card key={session.day} className="border-border/60">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary mb-1">
                      {session.day}
                    </span>
                    <h2 className="font-serif text-xl font-semibold">
                      {session.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {session.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {session.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Live on Zoom
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="rounded-xl">
                      <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-2" />
                        Join Zoom
                      </a>
                    </Button>
                    <Button variant="outline" className="rounded-xl" asChild>
                      <a
                        href={generateGoogleCalendarUrl(session)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Google Calendar
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => generateIcsFile(session)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Apple / Outlook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-muted-foreground mt-10">
            We'll also email you a reminder before each session. See you there! 🎉
          </p>
        </div>
      </div>
    </>
  );
};

export default EventClaudeCodeConfirmation;
