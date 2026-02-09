import { useEffect } from "react";

const CalebInterview = () => {
  useEffect(() => {
    window.location.href = "https://your-doc-quest.lovable.app";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default CalebInterview;
