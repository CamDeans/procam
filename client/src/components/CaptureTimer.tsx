import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureTimerProps {
  seconds: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function CaptureTimer({ seconds, onComplete, onCancel }: CaptureTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={remaining}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-8xl font-bold text-white drop-shadow-2xl"
        >
          {remaining}
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-32 text-white/60 text-sm">Tap to cancel</div>
    </motion.div>
  );
}

export type TimerOption = 0 | 3 | 5 | 10;

export const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 0, label: "Off" },
  { value: 3, label: "3s" },
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
];
