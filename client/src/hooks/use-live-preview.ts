import { useMemo } from "react";

interface LivePreviewSettings {
  aperture: string;
  shutter: string;
  iso: string;
  whiteBalance: number;
  lens: string;
}

interface LivePreviewResult {
  videoFilter: string;
  grainOpacity: number;
  warmthOverlay: string;
  zoomScale: number;
  vignetteIntensity: number;
  motionBlurAmount: number;
}

export function useLivePreview(settings: LivePreviewSettings): LivePreviewResult {
  return useMemo(() => {
    const { aperture, shutter, iso, whiteBalance, lens } = settings;

    const apertureNum = parseFloat(aperture.replace("f/", ""));
    const isoNum = parseInt(iso);
    const shutterNum = parseShutter(shutter);

    let brightness = 1;
    let contrast = 1;
    let saturate = 1;
    let sepia = 0;
    let hueRotate = 0;

    if (apertureNum <= 2.0) {
      brightness *= 1.1;
    } else if (apertureNum >= 8) {
      brightness *= 0.95;
    }

    if (isoNum >= 1600) {
      brightness *= 1.15;
      contrast *= 0.95;
    } else if (isoNum >= 800) {
      brightness *= 1.08;
    } else if (isoNum <= 100) {
      brightness *= 0.98;
      contrast *= 1.02;
    }

    if (shutterNum >= 1) {
      brightness *= 1.2;
    } else if (shutterNum <= 1/500) {
      brightness *= 0.92;
    } else if (shutterNum <= 1/125) {
      brightness *= 0.96;
    }

    if (whiteBalance <= 3200) {
      hueRotate = 15;
      saturate = 0.95;
    } else if (whiteBalance <= 4000) {
      hueRotate = 8;
      saturate = 0.98;
    } else if (whiteBalance >= 7000) {
      sepia = 0.1;
      hueRotate = -8;
      saturate = 1.05;
    } else if (whiteBalance >= 6000) {
      sepia = 0.05;
      hueRotate = -4;
    }

    brightness = Math.max(0.7, Math.min(1.4, brightness));

    const grainOpacity = isoNum >= 3200 ? 0.15 : isoNum >= 1600 ? 0.08 : isoNum >= 800 ? 0.04 : 0;

    let warmthOverlay = "transparent";
    if (whiteBalance <= 3500) {
      warmthOverlay = "rgba(80, 130, 220, 0.06)";
    } else if (whiteBalance >= 6500) {
      warmthOverlay = "rgba(255, 160, 60, 0.06)";
    }

    const videoFilter = [
      `brightness(${brightness.toFixed(2)})`,
      `contrast(${contrast.toFixed(2)})`,
      `saturate(${saturate.toFixed(2)})`,
      sepia > 0 ? `sepia(${sepia.toFixed(2)})` : "",
      hueRotate !== 0 ? `hue-rotate(${hueRotate}deg)` : "",
    ].filter(Boolean).join(" ");

    const lensValue = parseInt(lens.replace("mm", "")) || 35;
    const baseFocal = 35;
    const zoomScale = lensValue > baseFocal ? lensValue / baseFocal : 1;

    const vignetteIntensity = apertureNum < 5.6 
      ? Math.max(0, (5.6 - apertureNum) / 5.6 * 0.4) 
      : 0;

    const motionBlurAmount = shutterNum >= 1/30 
      ? Math.min(8, shutterNum * 12) 
      : 0;

    return {
      videoFilter,
      grainOpacity,
      warmthOverlay,
      zoomScale,
      vignetteIntensity,
      motionBlurAmount,
    };
  }, [settings.aperture, settings.shutter, settings.iso, settings.whiteBalance, settings.lens]);
}

function parseShutter(shutter: string): number {
  if (shutter.includes('"')) {
    return parseFloat(shutter.replace('"', ""));
  }
  if (shutter.includes("/")) {
    const parts = shutter.split("/");
    return 1 / parseInt(parts[1]);
  }
  return 1/125;
}
