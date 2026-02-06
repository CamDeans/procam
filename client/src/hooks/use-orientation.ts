import { useState, useEffect, useCallback } from "react";

export type Orientation = "portrait" | "landscape";

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === "undefined") return "portrait";
    return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
  });

  const updateOrientation = useCallback(() => {
    const isLandscape = window.innerWidth > window.innerHeight;
    setOrientation(isLandscape ? "landscape" : "portrait");
  }, []);

  useEffect(() => {
    updateOrientation();

    const handleOrientationChange = () => {
      setTimeout(updateOrientation, 100);
    };

    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", handleOrientationChange);
      }
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [updateOrientation]);

  return {
    orientation,
    isLandscape: orientation === "landscape",
    isPortrait: orientation === "portrait",
  };
}
