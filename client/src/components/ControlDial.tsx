import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useRef, useEffect } from "react";

interface ControlDialProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  onChange: (value: any) => void;
  isActive?: boolean;
  lockedOptions?: (string | number)[];
}

export function ControlDial({ label, value, options, onChange, isActive, lockedOptions = [] }: ControlDialProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      const containerWidth = container.offsetWidth;
      const selectedLeft = selected.offsetLeft;
      const selectedWidth = selected.offsetWidth;
      const scrollTo = selectedLeft - (containerWidth / 2) + (selectedWidth / 2);
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center w-full overflow-visible">
      <div className="min-h-6 w-full flex items-center justify-center overflow-visible">
        {isActive && (
          <span className="text-xs uppercase tracking-wider text-primary font-bold animate-in fade-in slide-in-from-bottom-1 whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
      
      <div 
        className={cn(
          "relative h-12 w-full overflow-hidden flex items-center justify-center select-none",
          "bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent"
        )}
      >
        <div className="absolute w-0.5 h-6 bg-primary z-10 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
        
        <div 
          ref={containerRef}
          className="flex gap-8 overflow-x-auto no-scrollbar py-3 w-full scroll-smooth"
          style={{ paddingLeft: '50%', paddingRight: '50%' }}
        >
          {options.map((opt) => {
            const isLocked = lockedOptions.includes(opt);
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                ref={isSelected ? selectedRef : null}
                onClick={() => {
                  if (!isLocked) {
                    onChange(opt);
                  }
                }}
                className={cn(
                  "flex-shrink-0 text-sm font-mono transition-all duration-200 min-w-[24px] text-center flex items-center justify-center gap-1",
                  isSelected 
                    ? "text-white font-bold scale-110" 
                    : isLocked
                    ? "text-zinc-700 font-normal cursor-not-allowed"
                    : "text-zinc-600 font-normal hover:text-zinc-400"
                )}
              >
                {opt}
                {isLocked && <Lock size={10} className="text-primary/60" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
