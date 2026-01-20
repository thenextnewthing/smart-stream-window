import { useEffect } from "react";

const YouTube = () => {
  useEffect(() => {
    window.location.href = "https://youtube.com/@TheNextNewThingAI?sub_confirmation=1";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default YouTube;
