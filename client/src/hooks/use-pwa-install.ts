import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePwaInstallResult {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  install: () => Promise<boolean>;
  installOutcome: "pending" | "accepted" | "dismissed" | null;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<"pending" | "accepted" | "dismissed" | null>(null);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallOutcome("accepted");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    setInstallOutcome("pending");
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setInstallOutcome(outcome);
      setDeferredPrompt(null);
      
      return outcome === "accepted";
    } catch (error) {
      console.error("Install prompt error:", error);
      setInstallOutcome("dismissed");
      return false;
    }
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    install,
    installOutcome,
  };
}
