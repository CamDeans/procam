import { useState, useRef, useCallback, useEffect } from "react";

export type Resolution = "4K" | "1080p" | "720p";

export const RESOLUTION_CONSTRAINTS: Record<Resolution, { width: number; height: number }> = {
  "4K": { width: 3840, height: 2160 },
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
};

export interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  facingMode: "user" | "environment";
  devices: MediaDeviceInfo[];
  currentDeviceId: string | null;
  isFlashSupported: boolean;
  isFlashOn: boolean;
  resolution: Resolution;
  actualResolution: { width: number; height: number } | null;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    error: null,
    facingMode: "environment",
    devices: [],
    currentDeviceId: null,
    isFlashSupported: false,
    isFlashOn: false,
    resolution: "4K",
    actualResolution: null,
  });

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setState((prev) => ({ ...prev, devices: videoDevices }));
      return videoDevices;
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return [];
    }
  }, []);

  const startCamera = useCallback(
    async (facingMode: "user" | "environment" = "environment", deviceId?: string, resolution?: Resolution) => {
      try {
        if (state.stream) {
          state.stream.getTracks().forEach((track) => track.stop());
        }

        const targetRes = resolution || state.resolution;
        const resConstraints = RESOLUTION_CONSTRAINTS[targetRes];

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { 
                deviceId: { exact: deviceId },
                width: { ideal: resConstraints.width },
                height: { ideal: resConstraints.height },
                frameRate: { ideal: 30 },
              }
            : {
                facingMode: facingMode,
                width: { ideal: resConstraints.width },
                height: { ideal: resConstraints.height },
                frameRate: { ideal: 30 },
              },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities?.();
        const isFlashSupported = !!(capabilities as any)?.torch;
        const settings = videoTrack.getSettings();

        setState((prev) => ({
          ...prev,
          stream,
          isActive: true,
          error: null,
          facingMode,
          currentDeviceId: settings.deviceId || null,
          isFlashSupported,
          isFlashOn: false,
          resolution: targetRes,
          actualResolution: { width: settings.width || 0, height: settings.height || 0 },
        }));

        await getDevices();
      } catch (err: any) {
        let errorMessage = "Could not access camera";
        if (err.name === "NotAllowedError") {
          errorMessage = "Camera permission denied. Please allow camera access.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is in use by another application.";
        }
        setState((prev) => ({ ...prev, error: errorMessage, isActive: false }));
      }
    },
    [state.stream, state.resolution, getDevices]
  );

  const setResolution = useCallback(async (resolution: Resolution) => {
    await startCamera(state.facingMode, state.currentDeviceId || undefined, resolution);
  }, [startCamera, state.facingMode, state.currentDeviceId]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({
      ...prev,
      stream: null,
      isActive: false,
      isFlashOn: false,
    }));
  }, [state.stream]);

  const switchCamera = useCallback(async () => {
    const newFacing = state.facingMode === "user" ? "environment" : "user";
    await startCamera(newFacing);
  }, [state.facingMode, startCamera]);

  const toggleFlash = useCallback(async () => {
    if (!state.stream || !state.isFlashSupported) return;

    const videoTrack = state.stream.getVideoTracks()[0];
    const newFlashState = !state.isFlashOn;

    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState } as any],
      });
      setState((prev) => ({ ...prev, isFlashOn: newFlashState }));
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  }, [state.stream, state.isFlashSupported, state.isFlashOn]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (state.facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.95);
  }, [state.facingMode]);

  const capturePhotoBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      if (state.facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    });
  }, [state.facingMode]);

  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    ...state,
    startCamera,
    stopCamera,
    switchCamera,
    toggleFlash,
    capturePhoto,
    capturePhotoBlob,
    getDevices,
    setResolution,
  };
}
