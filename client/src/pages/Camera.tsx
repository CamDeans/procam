import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-subscription";
import { useOrientation } from "@/hooks/use-orientation";
import { useLivePreview } from "@/hooks/use-live-preview";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ControlDial } from "@/components/ControlDial";
import { useAddToGallery } from "@/hooks/use-gallery";
import { useCamera, Resolution } from "@/hooks/use-camera";
import { CompositionGuide, GuideType, GoldenRatioRotation, GUIDE_OPTIONS } from "@/components/CompositionGuide";
import { FocusPoint } from "@/components/FocusPoint";
import { ExposureHistogram } from "@/components/ExposureHistogram";
import { CaptureTimer, TimerOption, TIMER_OPTIONS } from "@/components/CaptureTimer";
import { processImage } from "@/lib/image-processing";
import { 
  Settings2, 
  Grid3X3, 
  Zap,
  ZapOff,
  Thermometer,
  Timer,
  Maximize2,
  Minimize2,
  RotateCcw,
  Camera as CameraIcon,
  X,
  Check,
  Sun,
  ChevronDown,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LENSES = ["14mm", "24mm", "35mm", "50mm", "85mm"];
const APERTURES = ["f/1.2", "f/1.4", "f/2.0", "f/2.8", "f/4.0", "f/5.6", "f/8", "f/11", "f/16", "f/22"];
const SHUTTER_SPEEDS = ["1/8000", "1/4000", "1/1000", "1/500", "1/250", "1/125", "1/60", "1/30", "1/15", "1/8", "1\"", "30\""];
const ISOS = ["50", "100", "200", "400", "800", "1600", "3200", "6400", "12800"];
const WHITE_BALANCE_PRESETS = [
  { value: 2800, label: "Tungsten" },
  { value: 3200, label: "Incandescent" },
  { value: 4000, label: "Fluorescent" },
  { value: 5500, label: "Daylight" },
  { value: 6500, label: "Cloudy" },
  { value: 7500, label: "Shade" },
];

export default function CameraPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const features = useFeatureAccess();
  const addToGallery = useAddToGallery();
  const camera = useCamera();

  const [lens, setLens] = useState(() => localStorage.getItem("procam-lens") || "35mm");
  const [aperture, setAperture] = useState("f/4.0");
  const [shutter, setShutter] = useState("1/125");
  const [iso, setIso] = useState("100");
  const [whiteBalance, setWhiteBalance] = useState(5500);
  
  const [guideType, setGuideType] = useState<GuideType>(() => 
    (localStorage.getItem("procam-guide") as GuideType) || "rule-of-thirds"
  );
  const [goldenRotation, setGoldenRotation] = useState<GoldenRatioRotation>(0);
  
  const handleRotateGolden = useCallback(() => {
    setGoldenRotation(prev => {
      const rotations: GoldenRatioRotation[] = [0, 90, 180, 270];
      const currentIndex = rotations.indexOf(prev);
      return rotations[(currentIndex + 1) % 4];
    });
  }, []);
  const [showHistogram, setShowHistogram] = useState(() => 
    localStorage.getItem("procam-histogram") === "true"
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeControl, setActiveControl] = useState<"lens" | "aperture" | "shutter" | "iso" | "wb">("lens");
  const [timerDuration, setTimerDuration] = useState<TimerOption>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50, locked: false });
  const [showSettings, setShowSettings] = useState(false);
  const [rawMode, setRawMode] = useState(() => 
    localStorage.getItem("procam-raw") === "true"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userExitedFullscreen, setUserExitedFullscreen] = useState(false);
  const { isLandscape } = useOrientation();

  const livePreview = useLivePreview({
    aperture,
    shutter,
    iso,
    whiteBalance,
    lens,
  });

  useEffect(() => {
    if (isLandscape && !userExitedFullscreen) {
      setIsFullscreen(true);
    } else if (!isLandscape) {
      setUserExitedFullscreen(false);
    }
  }, [isLandscape, userExitedFullscreen]);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (isLandscape) {
      setUserExitedFullscreen(true);
    }
  }, [isLandscape]);

  const handleToggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      handleExitFullscreen();
    } else {
      setIsFullscreen(true);
      setUserExitedFullscreen(false);
    }
  }, [isFullscreen, handleExitFullscreen]);

  useEffect(() => {
    localStorage.setItem("procam-raw", String(rawMode));
  }, [rawMode]);

  const RESOLUTIONS: Resolution[] = ["4K", "1080p", "720p"];

  useEffect(() => {
    camera.startCamera("environment");
    return () => camera.stopCamera();
  }, []);

  useEffect(() => {
    localStorage.setItem("procam-lens", lens);
  }, [lens]);

  useEffect(() => {
    localStorage.setItem("procam-guide", guideType);
  }, [guideType]);

  useEffect(() => {
    localStorage.setItem("procam-histogram", String(showHistogram));
  }, [showHistogram]);

  useEffect(() => {
    if (!features.isLoading) {
      if (!features.availableLenses.includes(lens)) {
        setLens("35mm");
        localStorage.setItem("procam-lens", "35mm");
      }
      if (!features.availableGuides.includes(guideType)) {
        setGuideType("rule-of-thirds");
        localStorage.setItem("procam-guide", "rule-of-thirds");
      }
      if (rawMode && !features.canUseRaw) {
        setRawMode(false);
        localStorage.setItem("procam-raw", "false");
      }
    }
  }, [features.isLoading, features.availableLenses, features.availableGuides, features.canUseRaw]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCapturing || addToGallery.isPending) {
        e.preventDefault();
        e.returnValue = "Your photo is still being saved. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCapturing, addToGallery.isPending]);

  const retryAttemptedRef = useRef(false);
  
  useEffect(() => {
    if (retryAttemptedRef.current) return;
    if (!user?.id) return;
    
    retryAttemptedRef.current = true;
    
    const retryPendingSaves = async () => {
      const pendingKeys = Object.keys(localStorage).filter(k => k.startsWith("procam-pending-"));
      if (pendingKeys.length === 0) return;
      
      for (const key of pendingKeys) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || "");
          if (item && item.url) {
            item.userId = user.id;
            await addToGallery.mutateAsync(item);
            localStorage.removeItem(key);
            toast({
              title: "Photo Recovered",
              description: "A previously unsaved photo was successfully saved.",
              duration: 3000,
            });
          }
        } catch {
        }
      }
    };
    
    const timer = setTimeout(retryPendingSaves, 2000);
    return () => clearTimeout(timer);
  }, [user?.id]);

  const handleViewfinderTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocusPoint({ x, y, locked: true });
    setTimeout(() => setFocusPoint((prev) => ({ ...prev, locked: false })), 1500);
  }, []);

  const handleCapture = useCallback(async () => {
    if (timerDuration > 0 && !isTimerActive) {
      setIsTimerActive(true);
      return;
    }

    setIsCapturing(true);
    await new Promise((r) => setTimeout(r, 100));

    try {
      if (!camera.canvasRef.current || !camera.videoRef.current) {
        throw new Error("Camera not ready");
      }

      const video = camera.videoRef.current;
      const canvas = camera.canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      if (camera.facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);

      const effectiveRawMode = rawMode && features.canUseRaw;
      const effectiveLens = features.availableLenses.includes(lens) ? lens : "35mm";
      
      const originalImageUrl = effectiveRawMode 
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 0.95);

      const settings = {
        iso,
        shutter,
        aperture,
        lens: effectiveLens,
        whiteBalance,
      };

      const processedImageUrl = processImage(canvas, settings, { x: focusPoint.x, y: focusPoint.y });

      const galleryItem = {
        userId: user?.id || "anon",
        url: processedImageUrl,
        originalUrl: effectiveRawMode ? originalImageUrl : undefined,
        thumbnailUrl: processedImageUrl,
        metadata: { 
          lens: effectiveLens, 
          aperture, 
          shutter, 
          iso, 
          whiteBalance,
          rawMode: effectiveRawMode,
          resolution: camera.resolution,
          capturedAt: new Date().toISOString() 
        },
      };

      console.log('[Camera] Saving gallery item, user:', user?.id);
      console.log('[Camera] Gallery item url length:', galleryItem.url?.length);
      
      try {
        const result = await addToGallery.mutateAsync(galleryItem);
        console.log('[Camera] Save result:', result);

        toast({
          title: effectiveRawMode ? "RAW Captured" : "Captured",
          description: `${camera.resolution} | ${effectiveLens} | ${aperture} | ${shutter} | ISO ${iso}`,
          duration: 2000,
        });
      } catch (saveErr) {
        const backupKey = `procam-pending-${Date.now()}`;
        try {
          localStorage.setItem(backupKey, JSON.stringify(galleryItem));
        } catch {
        }
        toast({
          title: "Error",
          description: "Failed to save image. It has been saved locally and will retry.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to capture image.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setIsTimerActive(false);
    }
  }, [camera, user, lens, aperture, shutter, iso, whiteBalance, focusPoint, addToGallery, toast, timerDuration, isTimerActive, rawMode, features.canUseRaw, features.availableLenses]);

  const handleTimerComplete = useCallback(() => {
    handleCapture();
  }, [handleCapture]);

  const handleTimerCancel = useCallback(() => {
    setIsTimerActive(false);
  }, []);

  if (camera.error) {
    return (
      <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
        <CameraIcon size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
        <p className="text-zinc-500 text-center mb-6">{camera.error}</p>
        <Button onClick={() => camera.startCamera("environment")} data-testid="button-retry-camera">
          Try Again
        </Button>
        <div className="absolute left-4 p-4 pwa-safe-top-absolute">
          <HamburgerMenu />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden overflow-x-hidden flex flex-col relative">
      <div className={cn(
        "absolute left-0 right-0 z-30 p-4 pwa-safe-top-absolute flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent",
        isFullscreen && "hidden"
      )}>
        <div className="flex gap-2 items-center">
          <HamburgerMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-grid-guide"
                className={cn(
                  "p-2 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1",
                  guideType !== "none" ? "bg-white/20 text-white" : "text-white/60"
                )}
              >
                <Grid3X3 size={20} />
                <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
              {GUIDE_OPTIONS.map((opt) => {
                const isLocked = opt.value === "golden-ratio" && !features.canUseGoldenRatio;
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => {
                      if (isLocked) {
                        toast({
                          title: "ProCam+ Feature",
                          description: "Golden Ratio guide requires ProCam+ subscription",
                        });
                        return;
                      }
                      setGuideType(opt.value);
                    }}
                    className={cn(
                      "text-white cursor-pointer flex items-center gap-2",
                      guideType === opt.value && "text-primary",
                      isLocked && "text-zinc-600"
                    )}
                  >
                    {guideType === opt.value && <Check size={14} className="mr-2" />}
                    {opt.label}
                    {isLocked && <Lock size={12} className="text-primary/60 ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            data-testid="button-flash"
            onClick={camera.toggleFlash}
            disabled={!camera.isFlashSupported}
            className={cn(
              "p-2 rounded-full transition-colors",
              camera.isFlashOn ? "bg-primary/20 text-primary" : "text-white/60",
              !camera.isFlashSupported && "opacity-30"
            )}
          >
            {camera.isFlashOn ? <Zap size={20} /> : <ZapOff size={20} />}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            data-testid="button-raw-toggle"
            onClick={() => {
              if (!features.canUseRaw) {
                toast({
                  title: "ProCam+ Feature",
                  description: "RAW capture requires ProCam+ subscription",
                });
                return;
              }
              setRawMode(!rawMode);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors flex items-center gap-1",
              rawMode && features.canUseRaw
                ? "bg-primary/20 text-primary border-primary/30" 
                : "bg-zinc-800/80 text-zinc-500 border-white/10"
            )}
          >
            RAW
            {!features.canUseRaw && <Lock size={10} className="text-primary/60" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-resolution"
                className="bg-zinc-800/80 text-zinc-300 px-3 py-1 rounded-full text-xs font-mono border border-white/10 flex items-center gap-1"
              >
                {camera.isActive ? camera.resolution : "---"}
                <ChevronDown size={10} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
              {RESOLUTIONS.map((res) => (
                <DropdownMenuItem
                  key={res}
                  onClick={() => camera.setResolution(res)}
                  className={cn(
                    "text-white cursor-pointer",
                    camera.resolution === res && "text-primary"
                  )}
                >
                  {camera.resolution === res && <Check size={14} className="mr-2" />}
                  {res}
                  {res === "4K" && <span className="ml-2 text-zinc-500 text-xs">3840x2160</span>}
                  {res === "1080p" && <span className="ml-2 text-zinc-500 text-xs">1920x1080</span>}
                  {res === "720p" && <span className="ml-2 text-zinc-500 text-xs">1280x720</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="button-timer"
                className={cn(
                  "p-2 rounded-full transition-colors flex items-center gap-1",
                  timerDuration > 0 ? "bg-primary/20 text-primary" : "text-white/60"
                )}
              >
                <Timer size={20} />
                {timerDuration > 0 && <span className="text-xs">{timerDuration}s</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
              {TIMER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setTimerDuration(opt.value)}
                  className={cn(
                    "text-white cursor-pointer",
                    timerDuration === opt.value && "text-primary"
                  )}
                >
                  {timerDuration === opt.value && <Check size={14} className="mr-2" />}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            data-testid="button-histogram"
            onClick={() => setShowHistogram(!showHistogram)}
            className={cn(
              "p-2 rounded-full transition-colors",
              showHistogram ? "bg-white/20 text-white" : "text-white/60"
            )}
          >
            <Settings2 size={20} />
          </button>

          <button
            data-testid="button-fullscreen"
            onClick={handleToggleFullscreen}
            className={cn(
              "p-2 rounded-full transition-colors",
              isFullscreen ? "bg-white/20 text-white" : "text-white/60"
            )}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative bg-zinc-900 overflow-hidden transition-all duration-300",
          isFullscreen 
            ? "fixed inset-0 z-40 rounded-none m-0" 
            : "flex-1 mt-16 mb-4 rounded-3xl mx-4 sm:mx-auto sm:max-w-2xl border border-white/5 shadow-2xl"
        )}
        style={isFullscreen ? undefined : { width: 'calc(100% - 2rem)' }}
        onClick={handleViewfinderTap}
      >
        <video
          ref={camera.videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ 
            filter: livePreview.videoFilter,
            transform: [
              livePreview.zoomScale > 1 ? `scale(${livePreview.zoomScale})` : null,
              camera.facingMode === "user" ? "scaleX(-1)" : null,
            ].filter(Boolean).join(" ") || undefined,
          }}
        />
        <canvas ref={camera.canvasRef} className="hidden" />
        
        {livePreview.grainOpacity > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              opacity: livePreview.grainOpacity,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        
        {livePreview.warmthOverlay !== "transparent" && (
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ 
              backgroundColor: livePreview.warmthOverlay,
              mixBlendMode: 'color',
            }}
          />
        )}

        {livePreview.vignetteIntensity > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${livePreview.vignetteIntensity}) 100%)`,
            }}
          />
        )}

        {livePreview.motionBlurAmount > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backdropFilter: `blur(${livePreview.motionBlurAmount}px)`,
              WebkitBackdropFilter: `blur(${livePreview.motionBlurAmount}px)`,
              opacity: 0.3,
            }}
          />
        )}

        <CompositionGuide 
          type={guideType} 
          goldenRotation={goldenRotation}
          onRotateGolden={handleRotateGolden}
        />

        <FocusPoint x={focusPoint.x} y={focusPoint.y} isLocked={focusPoint.locked} />

        {showHistogram && camera.isActive && (
          <div className="absolute top-4 right-4">
            <ExposureHistogram videoRef={camera.videoRef} isActive={camera.isActive} />
          </div>
        )}

        <AnimatePresence>
          {isTimerActive && (
            <CaptureTimer
              seconds={timerDuration}
              onComplete={handleTimerComplete}
              onCancel={handleTimerCancel}
            />
          )}
        </AnimatePresence>

        {!camera.isActive && !camera.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="animate-pulse text-zinc-500 font-mono text-sm">INITIALIZING CAMERA...</div>
          </div>
        )}

        {isFullscreen && (
          <>
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pt-safe landscape:pt-8">
              <button
                data-testid="button-exit-fullscreen"
                onClick={handleExitFullscreen}
                className="p-3 rounded-full bg-black/60 backdrop-blur-sm text-white"
              >
                <Minimize2 size={24} />
              </button>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button data-testid="button-fs-guide" className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/60 flex items-center gap-1">
                      <Grid3X3 size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                    {GUIDE_OPTIONS.map((opt) => {
                      const isLocked = opt.value === "golden-ratio" && !features.canUseGoldenRatio;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => !isLocked && setGuideType(opt.value)}
                          className={cn("text-white cursor-pointer", guideType === opt.value && "text-primary", isLocked && "text-zinc-600")}
                        >
                          {guideType === opt.value && <Check size={14} className="mr-2" />}
                          {opt.label}
                          {isLocked && <Lock size={12} className="text-primary/60 ml-auto" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  data-testid="button-fs-flash"
                  onClick={camera.toggleFlash}
                  disabled={!camera.isFlashSupported}
                  className={cn(
                    "p-3 rounded-full bg-black/60 backdrop-blur-sm",
                    camera.isFlashOn ? "text-primary" : "text-white/60",
                    !camera.isFlashSupported && "opacity-30"
                  )}
                >
                  {camera.isFlashOn ? <Zap size={24} /> : <ZapOff size={24} />}
                </button>
                <button
                  data-testid="button-fs-switch-camera"
                  onClick={() => camera.switchCamera()}
                  className="p-3 rounded-full bg-black/60 backdrop-blur-sm text-white/60"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-50 pb-safe bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <div className="flex justify-center gap-2 mb-2 flex-wrap px-4">
                <button data-testid="button-fs-lens" onClick={() => setActiveControl("lens")} className={cn("px-3 py-1 rounded-full text-xs font-mono bg-black/60", activeControl === "lens" ? "text-primary" : "text-white/60")}>
                  {lens}
                </button>
                <button data-testid="button-fs-aperture" onClick={() => setActiveControl("aperture")} className={cn("px-3 py-1 rounded-full text-xs font-mono bg-black/60", activeControl === "aperture" ? "text-primary" : "text-white/60")}>
                  {aperture}
                </button>
                <button data-testid="button-fs-shutter" onClick={() => setActiveControl("shutter")} className={cn("px-3 py-1 rounded-full text-xs font-mono bg-black/60", activeControl === "shutter" ? "text-primary" : "text-white/60")}>
                  {shutter}
                </button>
                <button data-testid="button-fs-iso" onClick={() => setActiveControl("iso")} className={cn("px-3 py-1 rounded-full text-xs font-mono bg-black/60", activeControl === "iso" ? "text-primary" : "text-white/60")}>
                  ISO {iso}
                </button>
                <button data-testid="button-fs-wb" onClick={() => setActiveControl("wb")} className={cn("px-3 py-1 rounded-full text-xs font-mono bg-black/60", activeControl === "wb" ? "text-primary" : "text-white/60")}>
                  {whiteBalance}K
                </button>
              </div>
              
              <div className="h-12 mb-2 w-full">
                {activeControl === "lens" && (
                  <ControlDial label="" value={lens} options={LENSES} onChange={(v) => { if (v !== "85mm" || features.canUse85mm) setLens(v); }} isActive lockedOptions={features.isPro ? [] : ["85mm"]} />
                )}
                {activeControl === "aperture" && (
                  <ControlDial label="" value={aperture} options={APERTURES} onChange={setAperture} isActive />
                )}
                {activeControl === "shutter" && (
                  <ControlDial label="" value={shutter} options={SHUTTER_SPEEDS} onChange={setShutter} isActive />
                )}
                {activeControl === "iso" && (
                  <ControlDial label="" value={iso} options={ISOS} onChange={setIso} isActive />
                )}
                {activeControl === "wb" && (
                  <ControlDial label="" value={`${whiteBalance}K`} options={WHITE_BALANCE_PRESETS.map(p => `${p.value}K`)} onChange={(v) => setWhiteBalance(parseInt(v.replace("K", "")))} isActive />
                )}
              </div>
              
              <div className="flex justify-center items-center gap-4 pb-2">
                <button
                  data-testid="button-fs-raw"
                  onClick={() => {
                    if (!features.canUseRaw) return;
                    setRawMode(!rawMode);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs font-bold bg-black/60 flex items-center gap-1",
                    rawMode && features.canUseRaw ? "text-primary" : "text-white/40"
                  )}
                >
                  RAW
                  {!features.canUseRaw && <Lock size={10} className="text-primary/60" />}
                </button>
                <button
                  data-testid="button-capture-fullscreen"
                  onClick={handleCapture}
                  disabled={isCapturing || !camera.isActive}
                  className={cn(
                    "w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all",
                    isCapturing ? "bg-white/50" : "bg-white/10 active:bg-white/30"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-full bg-white transition-transform", isCapturing && "scale-90")} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button data-testid="button-fs-resolution" className="px-3 py-2 rounded-full text-xs font-mono bg-black/60 text-white/60">
                      {camera.resolution}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                    {RESOLUTIONS.map((res) => (
                      <DropdownMenuItem key={res} onClick={() => camera.setResolution(res)} className={cn("text-white cursor-pointer", camera.resolution === res && "text-primary")}>
                        {res}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}
      </div>

      <div 
        className={cn(
          "flex-shrink-0 bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl pb-safe",
          isFullscreen && "hidden"
        )}
      >
        <div className="min-h-16 border-b border-white/5 flex items-center overflow-visible">
          {activeControl === "lens" && (
            <ControlDial 
              label="Focal Length" 
              value={lens} 
              options={LENSES} 
              onChange={(newLens) => {
                if (newLens === "85mm" && !features.canUse85mm) {
                  toast({
                    title: "ProCam+ Feature",
                    description: "85mm Portrait lens requires ProCam+ subscription",
                  });
                  return;
                }
                setLens(newLens);
              }} 
              isActive
              lockedOptions={features.isPro ? [] : ["85mm"]}
            />
          )}
          {activeControl === "aperture" && (
            <ControlDial label="Aperture" value={aperture} options={APERTURES} onChange={setAperture} isActive />
          )}
          {activeControl === "shutter" && (
            <ControlDial label="Shutter Speed" value={shutter} options={SHUTTER_SPEEDS} onChange={setShutter} isActive />
          )}
          {activeControl === "iso" && (
            <ControlDial label="ISO" value={iso} options={ISOS} onChange={setIso} isActive />
          )}
          {activeControl === "wb" && (
            <ControlDial 
              label="White Balance" 
              value={`${whiteBalance}K`} 
              options={WHITE_BALANCE_PRESETS.map(p => `${p.value}K`)} 
              onChange={(v) => setWhiteBalance(parseInt(v.replace("K", "")))} 
              isActive 
            />
          )}
        </div>

        <div className="flex justify-around items-center px-2 py-2 border-b border-white/5">
          <button
            data-testid="button-lens"
            onClick={() => setActiveControl("lens")}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors px-3 py-1",
              activeControl === "lens" ? "text-primary" : "text-zinc-500"
            )}
          >
            <Maximize2 size={16} />
            <span className="text-[9px] font-bold tracking-wide uppercase">{lens}</span>
          </button>
          <button
            data-testid="button-aperture"
            onClick={() => setActiveControl("aperture")}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors px-3 py-1",
              activeControl === "aperture" ? "text-primary" : "text-zinc-500"
            )}
          >
            <span className="text-[10px] font-bold">F/</span>
            <span className="text-xs font-mono">{aperture.replace("f/", "")}</span>
          </button>
          <button
            data-testid="button-shutter"
            onClick={() => setActiveControl("shutter")}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors px-3 py-1",
              activeControl === "shutter" ? "text-primary" : "text-zinc-500"
            )}
          >
            <span className="text-[10px] font-bold">SS</span>
            <span className="text-xs font-mono">{shutter}</span>
          </button>
          <button
            data-testid="button-iso"
            onClick={() => setActiveControl("iso")}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors px-3 py-1",
              activeControl === "iso" ? "text-primary" : "text-zinc-500"
            )}
          >
            <span className="text-[10px] font-bold">ISO</span>
            <span className="text-xs font-mono">{iso}</span>
          </button>
          <button
            data-testid="button-wb"
            onClick={() => setActiveControl("wb")}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors px-3 py-1",
              activeControl === "wb" ? "text-primary" : "text-zinc-500"
            )}
          >
            <Sun size={16} />
            <span className="text-[9px] font-bold tracking-wide">{whiteBalance}K</span>
          </button>
        </div>

        <div className="flex justify-center items-center py-3 gap-6">
          <button
            data-testid="button-switch-camera"
            onClick={camera.switchCamera}
            className="p-3 rounded-full bg-zinc-800/50 text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw size={22} />
          </button>

          <motion.button
            data-testid="button-capture"
            whileTap={{ scale: 0.95 }}
            onClick={handleCapture}
            disabled={!camera.isActive || isTimerActive}
            className="w-18 h-18 rounded-full border-4 border-white/20 p-1 relative flex items-center justify-center group disabled:opacity-50"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-full h-full bg-white rounded-full group-hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
          </motion.button>

          <div className="w-12" />
        </div>
      </div>

      <AnimatePresence>
        {(isCapturing || addToGallery.isPending) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex flex-col items-center justify-center"
          >
            <Loader2 size={56} className="text-white animate-spin mb-4" />
            <span className="text-white font-mono text-base tracking-wider">
              {addToGallery.isPending ? "SAVING..." : "PROCESSING..."}
            </span>
            <span className="text-white/50 font-mono text-xs mt-2">
              Please wait...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
