import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 3 seconds
    const timer = setTimeout(() => {
      setIsFading(true);
      // Wait for the fade transition to complete before unmounting
      setTimeout(onFinish, 2700);
    }, 2700);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-400 transition-opacity duration-700 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex animate-pulse items-center justify-center gap-4">
        {/* TechItik Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-50">
          <img
            src="/app_logo.png"
            alt="TechItik Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>
      <div className="loader2 mt-8"></div>
    </div>
  );
}
