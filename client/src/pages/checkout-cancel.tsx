import { useLocation } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold">Cancelled</h1>
        <p className="text-zinc-400">
          The checkout process was cancelled. No charges were made.
        </p>

        <Button 
          onClick={() => setLocation("/settings")}
          variant="outline"
          className="w-full h-12 text-lg border-zinc-800 text-white hover:bg-zinc-900 mt-8"
        >
          <ArrowLeft className="mr-2" size={18} /> Back to Settings
        </Button>
      </div>
    </div>
  );
}
