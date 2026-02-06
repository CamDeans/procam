import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FocusPointProps {
  x: number;
  y: number;
  isLocked?: boolean;
  className?: string;
}

export function FocusPoint({ x, y, isLocked = false, className }: FocusPointProps) {
  return (
    <motion.div
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "absolute w-20 h-20 pointer-events-none",
        className
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        animate={isLocked ? { scale: [1, 0.9, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full h-full border-2 rounded-sm transition-colors",
          isLocked ? "border-primary" : "border-white/60"
        )}
      >
        <div className={cn("absolute top-1/2 left-0 w-3 h-0.5 -translate-y-1/2", isLocked ? "bg-primary" : "bg-white/60")} />
        <div className={cn("absolute top-1/2 right-0 w-3 h-0.5 -translate-y-1/2", isLocked ? "bg-primary" : "bg-white/60")} />
        <div className={cn("absolute top-0 left-1/2 w-0.5 h-3 -translate-x-1/2", isLocked ? "bg-primary" : "bg-white/60")} />
        <div className={cn("absolute bottom-0 left-1/2 w-0.5 h-3 -translate-x-1/2", isLocked ? "bg-primary" : "bg-white/60")} />
      </motion.div>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary uppercase tracking-widest"
        >
          AF Lock
        </motion.div>
      )}
    </motion.div>
  );
}
