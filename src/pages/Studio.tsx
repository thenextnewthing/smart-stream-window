import { useEffect } from "react";

const Studio = () => {
  useEffect(() => {
    window.location.href = "https://riverside.com/studio/mixergy-interview?t=6f87e76c2d632e39a11b&redirect_num=1";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default Studio;
