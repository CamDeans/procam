import { HamburgerMenu } from "@/components/HamburgerMenu";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  CheckCircle2, 
  Smartphone, 
  Share, 
  Plus,
  MoreVertical,
  Chrome,
  Apple
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstallPage() {
  const { canInstall, isInstalled, isIOS, isAndroid, install, installOutcome } = usePwaInstall();

  const handleInstall = async () => {
    await install();
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <h1 className="text-xl font-bold tracking-tight">Install App</h1>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-green-500/20 text-green-500 mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Already Installed</h2>
            <p className="text-muted-foreground">
              ProCam is installed on your device. You can find it on your home screen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <h1 className="text-xl font-bold tracking-tight">Install App</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-2">
            <Smartphone size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold">Add ProCam to Home Screen</h2>
          <p className="text-sm text-muted-foreground">
            Install ProCam for quick access, offline support, and a native app experience.
          </p>
        </div>

        {canInstall && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <Badge className="bg-primary/20 text-primary border-0">One-Click Install</Badge>
              <p className="text-sm text-muted-foreground">
                Your browser supports automatic installation. Just tap the button below!
              </p>
              <Button 
                size="lg"
                onClick={handleInstall}
                disabled={installOutcome === "pending"}
                className="w-full bg-primary text-black font-bold"
                data-testid="button-install-pwa"
              >
                <Download size={20} className="mr-2" />
                {installOutcome === "pending" ? "Installing..." : "Install ProCam"}
              </Button>
              {installOutcome === "dismissed" && (
                <p className="text-xs text-muted-foreground">
                  Installation was cancelled. You can try again anytime.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isIOS && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800">
                  <Apple size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">iPhone / iPad</h3>
                  <p className="text-xs text-muted-foreground">Safari Browser</p>
                </div>
              </div>

              <div className="space-y-3">
                <InstallStep 
                  number={1}
                  title="Tap the Share button"
                  description="Located at the bottom of Safari (square with arrow pointing up)"
                  icon={<Share size={18} />}
                />
                <InstallStep 
                  number={2}
                  title='Scroll and tap "Add to Home Screen"'
                  description="You may need to scroll down in the share menu"
                  icon={<Plus size={18} />}
                />
                <InstallStep 
                  number={3}
                  title='Tap "Add" in the top right'
                  description="ProCam will appear on your home screen"
                  icon={<CheckCircle2 size={18} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {isAndroid && !canInstall && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800">
                  <Chrome size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Android</h3>
                  <p className="text-xs text-muted-foreground">Chrome Browser</p>
                </div>
              </div>

              <div className="space-y-3">
                <InstallStep 
                  number={1}
                  title="Tap the menu button"
                  description="Three dots in the top right corner of Chrome"
                  icon={<MoreVertical size={18} />}
                />
                <InstallStep 
                  number={2}
                  title='Tap "Add to Home screen"'
                  description="Or 'Install app' if available"
                  icon={<Plus size={18} />}
                />
                <InstallStep 
                  number={3}
                  title='Tap "Add" to confirm'
                  description="ProCam will appear on your home screen"
                  icon={<CheckCircle2 size={18} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!isIOS && !isAndroid && !canInstall && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800">
                  <Chrome size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Desktop Browser</h3>
                  <p className="text-xs text-muted-foreground">Chrome, Edge, or other browsers</p>
                </div>
              </div>

              <div className="space-y-3">
                <InstallStep 
                  number={1}
                  title="Look for the install icon"
                  description="In the address bar, there may be an install icon"
                  icon={<Download size={18} />}
                />
                <InstallStep 
                  number={2}
                  title='Or use the menu'
                  description='Click the menu (three dots) and select "Install ProCam"'
                  icon={<MoreVertical size={18} />}
                />
                <InstallStep 
                  number={3}
                  title='Click "Install" to confirm'
                  description="ProCam will open as a standalone app"
                  icon={<CheckCircle2 size={18} />}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Benefits of Installing
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Quick access from your home screen
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Full screen experience without browser UI
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Faster load times with cached resources
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Works like a native camera app
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InstallStep({ 
  number, 
  title, 
  description, 
  icon 
}: { 
  number: number; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold shrink-0">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="text-zinc-500 shrink-0">
        {icon}
      </div>
    </div>
  );
}
