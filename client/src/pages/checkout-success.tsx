import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold">You're Pro!</h1>
        <p className="text-zinc-400">
          Thank you for subscribing. All professional features have been unlocked on your account.
        </p>

        <Button 
          onClick={() => setLocation("/")}
          className="w-full h-12 text-lg bg-white text-black hover:bg-zinc-200 mt-8"
        >
          Start Shooting <ArrowRight className="ml-2" size={18} />
        </Button>
      </motion.div>
    </div>
  );
}
