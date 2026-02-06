import { Link, useLocation } from "wouter";
import { Camera, Image as ImageIcon, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Camera, label: "Camera" },
    { href: "/gallery", icon: ImageIcon, label: "Gallery" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 pb-safe pt-2 px-6">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
              <div
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                    : "text-zinc-500 group-hover:text-zinc-300"
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-zinc-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
