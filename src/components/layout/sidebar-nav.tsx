
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileWarning, 
  BarChart3, 
  Settings,
  ShieldCheck,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Analytics", href: "/", icon: LayoutDashboard },
  { name: "Audit Lifecycle", href: "/audits", icon: ClipboardCheck },
  { name: "Discrepancies", href: "/discrepancies", icon: FileWarning },
  { name: "Operational View", href: "/operations", icon: BarChart3 },
  { name: "Administration", href: "/admin", icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-[256px] border-r bg-white">
      <div className="p-6 border-b">
        <h1 className="font-headline text-xl tracking-tighter">INVTRACK</h1>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">Audit Systems v1.0</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all",
                isActive 
                  ? "bg-black text-white shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-all"
        >
          <Settings size={18} strokeWidth={1.75} />
          Settings
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-all text-left"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
