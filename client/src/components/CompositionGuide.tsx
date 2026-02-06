import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

export type GuideType = "none" | "rule-of-thirds" | "golden-ratio" | "center" | "diagonal" | "triangle";
export type GoldenRatioRotation = 0 | 90 | 180 | 270;

interface CompositionGuideProps {
  type: GuideType;
  className?: string;
  goldenRotation?: GoldenRatioRotation;
  onRotateGolden?: () => void;
}

export function CompositionGuide({ type, className, goldenRotation = 0, onRotateGolden }: CompositionGuideProps) {
  if (type === "none") return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden z-[2]", className)}>
      {type === "rule-of-thirds" && <RuleOfThirds />}
      {type === "golden-ratio" && <GoldenRatio rotation={goldenRotation} onRotate={onRotateGolden} />}
      {type === "center" && <CenterGuide />}
      {type === "diagonal" && <DiagonalGuide />}
      {type === "triangle" && <TriangleGuide />}
    </div>
  );
}

function RuleOfThirds() {
  return (
    <>
      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
      <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/25" />
      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/25" />
      <div className="absolute left-1/3 top-1/3 w-3 h-3 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-1/3 top-1/3 w-3 h-3 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute left-1/3 bottom-1/3 w-3 h-3 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-1/3 bottom-1/3 w-3 h-3 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />
    </>
  );
}

function GoldenRatio({ rotation, onRotate }: { rotation: GoldenRatioRotation; onRotate?: () => void }) {
  const strokeColor = "rgba(255,255,255,0.4)";
  const strokeWidth = "0.4";
  
  return (
    <>
      <svg 
        className="absolute inset-0 w-full h-full transition-transform duration-300" 
        viewBox="0 0 100 61.8" 
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <rect x="0" y="0" width="61.8" height="61.8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x="61.8" y="0" width="38.2" height="38.2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x="61.8" y="38.2" width="23.6" height="23.6" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x="85.4" y="38.2" width="14.6" height="14.6" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x="85.4" y="52.8" width="9" height="9" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        <rect x="94.4" y="52.8" width="5.6" height="5.6" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        
        <path
          d="M 0,61.8 
             A 61.8,61.8 0 0,1 61.8,0
             A 38.2,38.2 0 0,1 100,38.2
             A 23.6,23.6 0 0,1 85.4,61.8
             A 14.6,14.6 0 0,1 100,52.8
             A 9,9 0 0,1 94.4,61.8
             A 5.6,5.6 0 0,1 100,58.4"
          fill="none"
          stroke="rgba(255,215,0,0.6)"
          strokeWidth="0.5"
        />
        
        <circle cx="94" cy="56" r="1" fill="rgba(255,215,0,0.8)" />
      </svg>
      
      {onRotate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRotate();
          }}
          className="absolute top-4 left-4 p-3 rounded-full bg-black/70 backdrop-blur-sm text-white pointer-events-auto z-[100] border border-white/20"
          data-testid="button-rotate-golden"
        >
          <RotateCw size={22} />
        </button>
      )}
    </>
  );
}

function CenterGuide() {
  return (
    <>
      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/40 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full" />
    </>
  );
}

function DiagonalGuide() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />
    </svg>
  );
}

function TriangleGuide() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon
        points="50,15 15,85 85,85"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.3"
      />
    </svg>
  );
}

export const GUIDE_OPTIONS: { value: GuideType; label: string }[] = [
  { value: "none", label: "Off" },
  { value: "rule-of-thirds", label: "Rule of Thirds" },
  { value: "golden-ratio", label: "Golden Ratio" },
  { value: "center", label: "Center" },
  { value: "diagonal", label: "Diagonal" },
  { value: "triangle", label: "Triangle" },
];
