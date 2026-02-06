import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mountain, Sunset, User, Building, Sparkles, Moon, Droplets, Flower2 } from "lucide-react";

interface TipSection {
  title: string;
  icon: typeof Mountain;
  description: string;
  settings: {
    label: string;
    value: string;
    reason: string;
  }[];
  extraTips: string[];
}

const tipSections: TipSection[] = [
  {
    title: "Landscape & Nature",
    icon: Mountain,
    description: "Capture sweeping vistas and natural beauty with maximum sharpness and depth.",
    settings: [
      { label: "Aperture", value: "f/8 - f/11", reason: "Maximum sharpness across the entire scene" },
      { label: "ISO", value: "100-200", reason: "Cleanest image with minimal noise" },
      { label: "Shutter", value: "1/125 - 1/250", reason: "Fast enough to avoid camera shake" },
      { label: "White Balance", value: "5500-6000K", reason: "Natural daylight colors" },
      { label: "Lens", value: "24mm or 35mm", reason: "Wide angle captures more of the scene" },
    ],
    extraTips: [
      "Use the rule of thirds guide to place the horizon",
      "Shoot during golden hour for warm, dramatic light",
      "Enable RAW mode to preserve detail in shadows and highlights",
    ],
  },
  {
    title: "Golden Hour & Sunset",
    icon: Sunset,
    description: "Make the most of the warm, soft light during sunrise and sunset.",
    settings: [
      { label: "Aperture", value: "f/5.6 - f/8", reason: "Good depth while allowing more light" },
      { label: "ISO", value: "200-400", reason: "Slightly higher for lower light conditions" },
      { label: "Shutter", value: "1/60 - 1/125", reason: "Balance exposure as light fades" },
      { label: "White Balance", value: "6500-7500K", reason: "Enhance warm tones" },
      { label: "Lens", value: "35mm or 50mm", reason: "Versatile for various compositions" },
    ],
    extraTips: [
      "Arrive 30 minutes before sunset for best colors",
      "Include silhouettes of trees or people for interest",
      "Watch for changing colors even after the sun sets",
    ],
  },
  {
    title: "Portraits",
    icon: User,
    description: "Create flattering images of people with beautiful background blur.",
    settings: [
      { label: "Aperture", value: "f/1.8 - f/2.8", reason: "Creates creamy background blur (bokeh)" },
      { label: "ISO", value: "100-400", reason: "Keep it low for smooth skin tones" },
      { label: "Shutter", value: "1/125 - 1/250", reason: "Fast enough to freeze movement" },
      { label: "White Balance", value: "5000-5500K", reason: "Natural skin tones" },
      { label: "Lens", value: "50mm or 85mm", reason: "Flattering perspective for faces" },
    ],
    extraTips: [
      "Focus on the eyes for sharp, engaging portraits",
      "Use open shade to avoid harsh shadows",
      "Position subjects with light coming from the side",
    ],
  },
  {
    title: "Architecture & Urban",
    icon: Building,
    description: "Capture buildings and city scenes with crisp lines and detail.",
    settings: [
      { label: "Aperture", value: "f/8 - f/11", reason: "Sharp details from front to back" },
      { label: "ISO", value: "100-200", reason: "Maximum detail and clarity" },
      { label: "Shutter", value: "1/60 - 1/250", reason: "Depends on lighting conditions" },
      { label: "White Balance", value: "5500K", reason: "Neutral, accurate colors" },
      { label: "Lens", value: "24mm or 35mm", reason: "Wide enough for large structures" },
    ],
    extraTips: [
      "Look for leading lines to guide the viewer",
      "Shoot at blue hour for dramatic city lights",
      "Use the grid guide to keep lines straight",
    ],
  },
  {
    title: "Night & Low Light",
    icon: Moon,
    description: "Handle challenging low-light situations effectively.",
    settings: [
      { label: "Aperture", value: "f/1.8 - f/2.8", reason: "Let in as much light as possible" },
      { label: "ISO", value: "1600-3200", reason: "Higher ISO for adequate exposure" },
      { label: "Shutter", value: "1/30 - 1/60", reason: "Slow but still hand-holdable" },
      { label: "White Balance", value: "3200-4000K", reason: "Compensate for artificial lighting" },
      { label: "Lens", value: "35mm or 50mm", reason: "Fast lenses work best" },
    ],
    extraTips: [
      "Brace yourself against a wall for stability",
      "Use the timer to avoid camera shake",
      "Enable RAW to recover shadow detail later",
    ],
  },
  {
    title: "Macro & Close-up",
    icon: Flower2,
    description: "Get stunning detail shots of small subjects like flowers and insects.",
    settings: [
      { label: "Aperture", value: "f/5.6 - f/8", reason: "Balance depth of field in close-ups" },
      { label: "ISO", value: "200-400", reason: "Keep noise low for fine detail" },
      { label: "Shutter", value: "1/250+", reason: "Fast to freeze subject movement" },
      { label: "White Balance", value: "5500K", reason: "Natural colors" },
      { label: "Lens", value: "50mm or 85mm", reason: "Good working distance from subject" },
    ],
    extraTips: [
      "Use manual focus and lock the focus point",
      "Shoot in open shade for soft, even lighting",
      "Get low and shoot at subject level",
    ],
  },
  {
    title: "Water & Motion",
    icon: Droplets,
    description: "Capture moving water as silky smooth or frozen in action.",
    settings: [
      { label: "Aperture", value: "f/11 - f/16", reason: "For silky water, use small aperture" },
      { label: "ISO", value: "100", reason: "Lowest setting allows longer exposures" },
      { label: "Shutter", value: "1/4 - 1\" (smooth) or 1/500+ (freeze)", reason: "Depends on desired effect" },
      { label: "White Balance", value: "5500-6000K", reason: "Natural outdoor tones" },
      { label: "Lens", value: "24mm or 35mm", reason: "Wide for waterfalls and seascapes" },
    ],
    extraTips: [
      "Use the timer to avoid shake during long exposures",
      "Cloudy days work great for waterfall shots",
      "RAW mode helps recover highlight detail in water",
    ],
  },
  {
    title: "Action & Sports",
    icon: Sparkles,
    description: "Freeze fast-moving subjects with perfect sharpness.",
    settings: [
      { label: "Aperture", value: "f/2.8 - f/4", reason: "Wide open for faster shutter speeds" },
      { label: "ISO", value: "400-1600", reason: "Higher to enable fast shutter" },
      { label: "Shutter", value: "1/500 - 1/1000+", reason: "Freeze the action completely" },
      { label: "White Balance", value: "5500K", reason: "Neutral for most conditions" },
      { label: "Lens", value: "50mm or 85mm", reason: "Tighter framing on subjects" },
    ],
    extraTips: [
      "Anticipate the action and pre-focus",
      "Capture peak moments like jumps or catches",
      "Use burst mode with the timer set to continuous",
    ],
  },
];

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Photography Tips</h1>
            <p className="text-xs text-zinc-500">
              Get the best results from your shots
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        <p className="text-sm text-muted-foreground mb-6">
          Select settings based on what you're shooting. These recommendations will help you capture 
          stunning images in various conditions.
        </p>

        {tipSections.map((section) => (
          <Card key={section.title} className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <section.icon size={20} className="text-primary" />
                </div>
                {section.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {section.settings.map((setting) => (
                  <div 
                    key={setting.label} 
                    className="flex items-start gap-3 p-2 rounded-lg bg-zinc-800/50"
                  >
                    <Badge variant="outline" className="shrink-0 bg-zinc-900 border-zinc-700 font-mono">
                      {setting.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-primary">{setting.value}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{setting.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Pro Tips
                </p>
                <ul className="space-y-1">
                  {section.extraTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">-</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
