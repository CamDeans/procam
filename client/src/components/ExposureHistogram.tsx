import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ExposureHistogramProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  className?: string;
}

export function ExposureHistogram({ videoRef, isActive, className }: ExposureHistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [histogram, setHistogram] = useState<number[]>(new Array(64).fill(0));

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationId: number;

    const updateHistogram = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationId = requestAnimationFrame(updateHistogram);
        return;
      }

      canvas.width = 64;
      canvas.height = 48;
      ctx.drawImage(video, 0, 0, 64, 48);

      const imageData = ctx.getImageData(0, 0, 64, 48);
      const data = imageData.data;

      const bins = new Array(64).fill(0);
      const binWidth = 256 / 64;

      for (let i = 0; i < data.length; i += 4) {
        const luminance = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const binIndex = Math.min(63, Math.floor(luminance / binWidth));
        bins[binIndex]++;
      }

      const maxValue = Math.max(...bins);
      const normalized = bins.map((v) => (maxValue > 0 ? v / maxValue : 0));
      setHistogram(normalized);

      animationId = requestAnimationFrame(updateHistogram);
    };

    updateHistogram();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isActive, videoRef]);

  return (
    <div className={cn("bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10", className)}>
      <div className="flex items-end gap-px h-12 w-32">
        {histogram.map((value, i) => (
          <div
            key={i}
            className="flex-1 bg-white/70 rounded-t-sm transition-all duration-75"
            style={{ height: `${value * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-zinc-500 font-mono">
        <span>0</span>
        <span>128</span>
        <span>255</span>
      </div>
    </div>
  );
}
