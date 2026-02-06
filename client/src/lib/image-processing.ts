export interface CameraSettings {
  iso: string;
  shutter: string;
  aperture: string;
  lens: string;
  whiteBalance?: number;
  exposure?: number;
}

export function applyISOGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  iso: string
): void {
  const isoValue = parseInt(iso);
  if (isoValue <= 200) return;

  const grainIntensity = Math.min(0.15, (isoValue - 200) / 12800 * 0.15);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * grainIntensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function applyExposureFromSettings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: CameraSettings
): void {
  const isoValue = parseInt(settings.iso);
  const shutterValue = parseShutterSpeed(settings.shutter);
  const apertureValue = parseFloat(settings.aperture.replace("f/", ""));

  const isoStops = Math.log2(isoValue / 100);
  const shutterStops = Math.log2(shutterValue / (1/125));
  const apertureStops = Math.log2(Math.pow(2.8 / apertureValue, 2));
  
  const totalStops = isoStops + shutterStops + apertureStops;
  const exposureFactor = Math.pow(2, totalStops * 0.3);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] * exposureFactor));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * exposureFactor));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * exposureFactor));
  }

  ctx.putImageData(imageData, 0, 0);
}

function parseShutterSpeed(shutter: string): number {
  if (shutter.includes('"')) {
    return parseFloat(shutter.replace('"', ''));
  }
  if (shutter.includes('/')) {
    const parts = shutter.split('/');
    return parseInt(parts[0]) / parseInt(parts[1]);
  }
  return 1/125;
}

export function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  aperture: string
): void {
  const apertureValue = parseFloat(aperture.replace("f/", ""));
  if (apertureValue >= 5.6) return;

  const intensity = Math.max(0, (5.6 - apertureValue) / 5.6 * 0.4);
  
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.3,
    width / 2, height / 2, width * 0.8
  );
  gradient.addColorStop(0, `rgba(0,0,0,0)`);
  gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function applyDepthOfField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  aperture: string,
  focusX: number,
  focusY: number
): void {
  const apertureValue = parseFloat(aperture.replace("f/", ""));
  if (apertureValue >= 4.0) return;

  const blurAmount = Math.max(1, (4.0 - apertureValue) / 4.0 * 12);

  const originalCanvas = document.createElement("canvas");
  originalCanvas.width = width;
  originalCanvas.height = height;
  const originalCtx = originalCanvas.getContext("2d");
  if (!originalCtx) return;
  originalCtx.drawImage(ctx.canvas, 0, 0);

  const blurredCanvas = document.createElement("canvas");
  blurredCanvas.width = width;
  blurredCanvas.height = height;
  const blurredCtx = blurredCanvas.getContext("2d");
  if (!blurredCtx) return;
  blurredCtx.filter = `blur(${blurAmount}px)`;
  blurredCtx.drawImage(ctx.canvas, 0, 0);

  const focusPxX = focusX / 100 * width;
  const focusPxY = focusY / 100 * height;
  const focusRadius = Math.min(width, height) * 0.2;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(blurredCanvas, 0, 0);

  ctx.save();
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(
    focusPxX, focusPxY, focusRadius * 0.3,
    focusPxX, focusPxY, focusRadius * 1.2
  );
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.8)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(originalCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

export function applyFocalLengthCrop(
  sourceCanvas: HTMLCanvasElement,
  lens: string
): HTMLCanvasElement {
  const lensValue = parseInt(lens.replace("mm", ""));
  const baseFocal = 35;
  
  if (lensValue <= baseFocal) {
    return sourceCanvas;
  }

  const cropFactor = baseFocal / lensValue;
  const newWidth = sourceCanvas.width * cropFactor;
  const newHeight = sourceCanvas.height * cropFactor;
  const offsetX = (sourceCanvas.width - newWidth) / 2;
  const offsetY = (sourceCanvas.height - newHeight) / 2;

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = sourceCanvas.width;
  croppedCanvas.height = sourceCanvas.height;
  const ctx = croppedCanvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  ctx.drawImage(
    sourceCanvas,
    offsetX, offsetY, newWidth, newHeight,
    0, 0, sourceCanvas.width, sourceCanvas.height
  );

  return croppedCanvas;
}

export function applyWhiteBalance(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  temperature: number
): void {
  if (temperature === 5500) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const warmth = (temperature - 5500) / 5500;
  const rAdjust = warmth > 0 ? warmth * 30 : 0;
  const bAdjust = warmth < 0 ? Math.abs(warmth) * 30 : 0;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + rAdjust));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + bAdjust));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function applyMotionBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shutter: string
): void {
  const shutterValue = parseShutterSpeed(shutter);
  if (shutterValue < 1/30) return;

  const blurAmount = Math.min(10, shutterValue * 15);
  if (blurAmount < 1) return;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;

  tempCtx.drawImage(ctx.canvas, 0, 0);

  ctx.globalAlpha = 0.3;
  for (let i = 1; i <= 3; i++) {
    ctx.drawImage(tempCanvas, i * blurAmount * 0.3, 0);
  }
  ctx.globalAlpha = 1.0;
}

export interface EnhancementSettings {
  sharpening: number;      // 0-100
  clarity: number;         // 0-100
  vibrance: number;        // 0-100
  highlights: number;      // -100 to 100
  shadows: number;         // -100 to 100
  noiseReduction: number;  // 0-100
}

export const DEFAULT_ENHANCEMENTS: EnhancementSettings = {
  sharpening: 25,
  clarity: 15,
  vibrance: 20,
  highlights: 0,
  shadows: 0,
  noiseReduction: 0,
};

function applySharpening(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  if (amount <= 0) return;
  
  const strength = amount / 100 * 0.5;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const original = new Uint8ClampedArray(data);
  
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += original[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = Math.max(0, Math.min(255, sum));
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyClarity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  if (amount <= 0) return;
  
  const strength = amount / 100 * 0.4;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const blurred = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      blurred[y * width + x] = lum;
    }
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const lum = blurred[y * width + x];
      
      let avgLum = 0;
      let count = 0;
      const radius = 3;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          avgLum += blurred[ny * width + nx];
          count++;
        }
      }
      avgLum /= count;
      
      const diff = lum - avgLum;
      const boost = diff * strength;
      
      data[idx] = Math.max(0, Math.min(255, data[idx] + boost));
      data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + boost));
      data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + boost));
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyVibrance(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  if (amount <= 0) return;
  
  const strength = amount / 100;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    const boost = (1 - saturation) * strength;
    const avg = (r + g + b) / 3;
    
    data[i] = Math.max(0, Math.min(255, r + (r - avg) * boost));
    data[i + 1] = Math.max(0, Math.min(255, g + (g - avg) * boost));
    data[i + 2] = Math.max(0, Math.min(255, b + (b - avg) * boost));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyHighlightsShadows(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  highlights: number,
  shadows: number
): void {
  if (highlights === 0 && shadows === 0) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const highlightStrength = highlights / 100 * 0.5;
  const shadowStrength = shadows / 100 * 0.5;
  
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    
    let adjustment = 0;
    if (lum > 0.5 && highlights !== 0) {
      const highlightMask = (lum - 0.5) * 2;
      adjustment -= highlightStrength * highlightMask * 60;
    }
    if (lum < 0.5 && shadows !== 0) {
      const shadowMask = (0.5 - lum) * 2;
      adjustment += shadowStrength * shadowMask * 60;
    }
    
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyNoiseReduction(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  if (amount <= 0) return;
  
  const radius = Math.ceil(amount / 100 * 2);
  if (radius < 1) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const original = new Uint8ClampedArray(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const centerLum = original[idx] * 0.299 + original[idx + 1] * 0.587 + original[idx + 2] * 0.114;
      
      let rSum = 0, gSum = 0, bSum = 0, weight = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nLum = original[nIdx] * 0.299 + original[nIdx + 1] * 0.587 + original[nIdx + 2] * 0.114;
          
          const lumDiff = Math.abs(centerLum - nLum);
          const w = lumDiff < 30 ? 1 : 0.1;
          
          rSum += original[nIdx] * w;
          gSum += original[nIdx + 1] * w;
          bSum += original[nIdx + 2] * w;
          weight += w;
        }
      }
      
      const blend = amount / 100 * 0.7;
      data[idx] = original[idx] * (1 - blend) + (rSum / weight) * blend;
      data[idx + 1] = original[idx + 1] * (1 - blend) + (gSum / weight) * blend;
      data[idx + 2] = original[idx + 2] * (1 - blend) + (bSum / weight) * blend;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

export function applyEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: EnhancementSettings
): void {
  applyHighlightsShadows(ctx, width, height, settings.highlights, settings.shadows);
  applyNoiseReduction(ctx, width, height, settings.noiseReduction);
  applyClarity(ctx, width, height, settings.clarity);
  applyVibrance(ctx, width, height, settings.vibrance);
  applySharpening(ctx, width, height, settings.sharpening);
}

export function processImage(
  canvas: HTMLCanvasElement,
  settings: CameraSettings,
  focusPoint: { x: number; y: number },
  enhancements?: EnhancementSettings
): string {
  let workCanvas = applyFocalLengthCrop(canvas, settings.lens);
  const ctx = workCanvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/jpeg", 0.95);

  const width = workCanvas.width;
  const height = workCanvas.height;

  applyExposureFromSettings(ctx, width, height, settings);
  
  if (settings.whiteBalance) {
    applyWhiteBalance(ctx, width, height, settings.whiteBalance);
  }

  applyDepthOfField(ctx, width, height, settings.aperture, focusPoint.x, focusPoint.y);
  applyVignette(ctx, width, height, settings.aperture);
  applyMotionBlur(ctx, width, height, settings.shutter);
  applyISOGrain(ctx, width, height, settings.iso);

  if (enhancements) {
    applyEnhancements(ctx, width, height, enhancements);
  }

  return workCanvas.toDataURL("image/jpeg", 0.95);
}
