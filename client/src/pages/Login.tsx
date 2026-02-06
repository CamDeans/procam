import { Button } from "@/components/ui/button";
import { Camera, Aperture } from "lucide-react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50 pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center gap-8 max-w-sm px-6 text-center">
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative bg-zinc-900 p-6 rounded-3xl border border-white/10 shadow-2xl">
            <Aperture size={48} className="text-primary animate-spin-slow" style={{ animationDuration: '20s' }} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            ProCam
          </h1>
          <p className="text-zinc-500">
            Professional mobile photography for serious creators.
          </p>
        </div>

        <div className="w-full space-y-4 pt-8">
          <Button 
            onClick={handleLogin}
            data-testid="button-sign-in"
            className="w-full h-12 text-lg font-semibold bg-white text-black hover:bg-zinc-200 rounded-xl"
          >
            Sign In
          </Button>
          <a
            href="/admin"
            className="block text-center text-sm text-zinc-500 hover:text-zinc-400 underline"
          >
            Admin Portal
          </a>
          <p className="text-xs text-zinc-700">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
      
      {/* Footer: support + version */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-xs font-mono text-zinc-800 space-y-1">
        <p><a href="mailto:support@procam.cloud" className="text-zinc-600 hover:text-zinc-500 underline">support@procam.cloud</a></p>
        <p>v2.0.4 • PRO CAMERA SYSTEM</p>
      </div>
    </div>
  );
}
