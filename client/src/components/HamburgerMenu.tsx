import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Camera, Image as ImageIcon, Settings, Lightbulb, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function HamburgerMenu() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Camera, label: "Camera" },
    { href: "/gallery", icon: ImageIcon, label: "Gallery" },
    { href: "/tips", icon: Lightbulb, label: "Tips" },
    { href: "/install", icon: Download, label: "Install App" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          data-testid="button-hamburger-menu"
          className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-zinc-900 border-zinc-800 w-64">
        <SheetHeader>
          <SheetTitle className="text-white font-bold text-xl">ProCam</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
